import bcrypt from 'bcrypt';
import emailService from '../services/emailService.js';
import { findUserByEmail, findUserById } from '../models/userModel.js';
import {
  createVerificationToken,
  createPasswordResetToken,
  findVerificationToken,
  findPasswordResetToken,
  markEmailAsVerified,
  updatePasswordWithToken,
  cleanupExpiredTokens
} from '../models/emailVerificationModel.js';
import { logger } from '../middleware/loggingMiddleware.js';

// Email verification gönder
export const sendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email zaten doğrulanmış' });
    }
    
    // Token oluştur (24 saat geçerli)
    const token = emailService.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
    
    await createVerificationToken(userId, token, expiresAt);
    
    // Email gönder
    const emailResult = await emailService.sendVerificationEmail(
      user.email,
      user.username,
      token
    );
    
    if (emailResult.success) {
      logger.info('Verification email sent', { 
        userId: user.id, 
        email: user.email 
      });
      
      res.status(200).json({
        message: 'Doğrulama e-postası gönderildi',
        expiresAt: expiresAt.toISOString()
      });
    } else {
      res.status(500).json({
        message: 'E-posta gönderilemedi',
        error: emailResult.message
      });
    }
  } catch (error) {
    logger.error('Send verification email error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      message: 'İç sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Email doğrulama
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Token gerekli' });
    }
    
    const tokenData = await findVerificationToken(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        message: 'Geçersiz veya süresi dolmuş token' 
      });
    }
    
    if (tokenData.email_verified) {
      return res.status(400).json({ 
        message: 'Email zaten doğrulanmış' 
      });
    }
    
    // Email'i doğrulanmış olarak işaretle
    await markEmailAsVerified(tokenData.user_id, tokenData.id);
    
    // Hoş geldin emaili gönder
    await emailService.sendWelcomeEmail(tokenData.email, tokenData.username);
    
    logger.info('Email verified successfully', { 
      userId: tokenData.user_id,
      email: tokenData.email 
    });
    
    res.status(200).json({
      message: 'Email başarıyla doğrulandı',
      user: {
        id: tokenData.user_id,
        email: tokenData.email,
        username: tokenData.username,
        emailVerified: true
      }
    });
  } catch (error) {
    logger.error('Email verification error', { 
      error: error.message,
      token: req.query.token?.substring(0, 10) + '...' 
    });
    
    res.status(500).json({ 
      message: 'İç sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Şifre sıfırlama talebi
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email gerekli' });
    }
    
    const user = await findUserByEmail(email);
    
    if (!user) {
      // Güvenlik nedeniyle aynı response döndür
      return res.status(200).json({
        message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderildi'
      });
    }
    
    // Token oluştur (1 saat geçerli)
    const token = emailService.generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
    
    await createPasswordResetToken(user.id, token, expiresAt);
    
    // Email gönder
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      user.username,
      token
    );
    
    logger.info('Password reset requested', { 
      userId: user.id,
      email: user.email,
      emailSent: emailResult.success 
    });
    
    // Güvenlik nedeniyle her zaman aynı response
    res.status(200).json({
      message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderildi',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    logger.error('Password reset request error', { 
      error: error.message,
      email: req.body.email 
    });
    
    res.status(500).json({ 
      message: 'İç sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Şifre sıfırlama token doğrulama
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Token gerekli' });
    }
    
    const tokenData = await findPasswordResetToken(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        message: 'Geçersiz veya süresi dolmuş token' 
      });
    }
    
    res.status(200).json({
      message: 'Token geçerli',
      email: tokenData.email,
      username: tokenData.username
    });
  } catch (error) {
    logger.error('Reset token validation error', { 
      error: error.message,
      token: req.query.token?.substring(0, 10) + '...' 
    });
    
    res.status(500).json({ 
      message: 'İç sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Şifre sıfırlama
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token ve şifre gerekli' });
    }
    
    // Şifre güçlülüğü kontrolü
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Şifre en az 8 karakter olmalıdır' 
      });
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ 
        message: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir' 
      });
    }
    
    const tokenData = await findPasswordResetToken(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        message: 'Geçersiz veya süresi dolmuş token' 
      });
    }
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Şifreyi güncelle ve token'ı kullanılmış olarak işaretle
    await updatePasswordWithToken(tokenData.user_id, hashedPassword, tokenData.id);
    
    logger.info('Password reset successful', { 
      userId: tokenData.user_id,
      email: tokenData.email 
    });
    
    res.status(200).json({
      message: 'Şifre başarıyla sıfırlandı',
      user: {
        email: tokenData.email,
        username: tokenData.username
      }
    });
  } catch (error) {
    logger.error('Password reset error', { 
      error: error.message,
      token: req.body.token?.substring(0, 10) + '...' 
    });
    
    res.status(500).json({ 
      message: 'İç sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Token temizleme (cron job için)
export const cleanupTokens = async (req, res) => {
  try {
    const result = await cleanupExpiredTokens();
    
    logger.info('Token cleanup completed', result);
    
    res.status(200).json({
      message: 'Token temizleme tamamlandı',
      ...result
    });
  } catch (error) {
    logger.error('Token cleanup error', { error: error.message });
    
    res.status(500).json({ 
      message: 'Token temizleme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 