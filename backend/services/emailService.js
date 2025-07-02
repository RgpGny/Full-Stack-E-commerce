import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { logger } from '../middleware/loggingMiddleware.js';

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.isConfigured = this.checkConfiguration();
  }

  createTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email configuration not found. Email features disabled.');
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  checkConfiguration() {
    return !!(this.transporter && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  createVerificationEmailTemplate(username, token, baseUrl) {
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    return {
      subject: 'E-mail Adresinizi Doğrulayın',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Doğrulama</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ E-Ticaret Hoş Geldiniz!</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${username}!</h2>
              <p>Hesabınızı oluşturduğunuz için teşekkürler. E-mail adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">E-mail Adresimi Doğrula</a>
              </div>
              
              <p>Veya aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
                ${verificationUrl}
              </p>
              
              <p><strong>Not:</strong> Bu link 24 saat geçerlidir.</p>
              <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>© 2024 E-Ticaret Platformu. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Merhaba ${username}!
        
        Hesabınızı oluşturduğunuz için teşekkürler. E-mail adresinizi doğrulamak için aşağıdaki linke tıklayın:
        
        ${verificationUrl}
        
        Bu link 24 saat geçerlidir.
        
        Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        
        © 2024 E-Ticaret Platformu
      `
    };
  }

  createPasswordResetTemplate(username, token, baseUrl) {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    return {
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Şifre Sıfırlama</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Şifre Sıfırlama</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${username}!</h2>
              <p>Şifre sıfırlama talebinizi aldık. Yeni şifre oluşturmak için aşağıdaki butona tıklayın:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
              </div>
              
              <p>Veya aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Güvenlik Uyarısı:</strong>
                <ul>
                  <li>Bu link sadece 1 saat geçerlidir</li>
                  <li>Link sadece bir kez kullanılabilir</li>
                  <li>Eğer bu talebi siz yapmadıysanız derhal bizimle iletişime geçin</li>
                </ul>
              </div>
              
              <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle silebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>© 2024 E-Ticaret Platformu. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Merhaba ${username}!
        
        Şifre sıfırlama talebinizi aldık. Yeni şifre oluşturmak için aşağıdaki linke tıklayın:
        
        ${resetUrl}
        
        UYARI: Bu link sadece 1 saat geçerlidir ve sadece bir kez kullanılabilir.
        
        Eğer bu talebi siz yapmadıysanız, bu e-postayı güvenle silebilirsiniz.
        
        © 2024 E-Ticaret Platformu
      `
    };
  }

  async sendVerificationEmail(email, username, token) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured. Verification email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const emailTemplate = this.createVerificationEmailTemplate(username, token, baseUrl);
      
      const mailOptions = {
        from: `"E-Ticaret Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Verification email sent successfully', { 
        email, 
        username,
        tokenLength: token.length 
      });
      
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      logger.error('Failed to send verification email', { 
        email, 
        error: error.message 
      });
      
      return { success: false, message: 'Failed to send email' };
    }
  }

  async sendPasswordResetEmail(email, username, token) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured. Password reset email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const emailTemplate = this.createPasswordResetTemplate(username, token, baseUrl);
      
      const mailOptions = {
        from: `"E-Ticaret Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Password reset email sent successfully', { 
        email, 
        username,
        tokenLength: token.length 
      });
      
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      logger.error('Failed to send password reset email', { 
        email, 
        error: error.message 
      });
      
      return { success: false, message: 'Failed to send email' };
    }
  }

  async sendWelcomeEmail(email, username) {
    if (!this.isConfigured) return { success: false };

    try {
      const mailOptions = {
        from: `"E-Ticaret Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Hoş Geldiniz! 🎉',
        html: `
          <h2>Hoş geldin ${username}!</h2>
          <p>E-ticaret platformumuza katıldığın için teşekkürler!</p>
          <p>Artık alışverişe başlayabilirsin. 🛍️</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      logger.error('Failed to send welcome email', { email, error: error.message });
      return { success: false };
    }
  }
}

export default new EmailService(); 