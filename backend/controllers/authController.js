import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  findUserById,
} from "../models/userModel.js";
import { securityLogger } from "../middleware/loggingMiddleware.js";
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Güvenlik kontrolü
if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET ve REFRESH_TOKEN_SECRET environment variables tanımlanmalıdır!');
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const isProduction = process.env.NODE_ENV === "production";
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('Register request:', { username, email, passwordLength: password?.length });
  
  try {
    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Tüm alanlar zorunludur",
        details: {
          username: !username ? "Kullanıcı adı gerekli" : null,
          email: !email ? "Email gerekli" : null,
          password: !password ? "Şifre gerekli" : null
        }
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Bu email adresi zaten kayıtlı" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({ username, email, hashedPassword });
    
    console.log('User created successfully:', { id: newUser.id, username: newUser.username });
    
    // Email verification token oluştur ve gönder
    try {
      const emailService = (await import('../services/emailService.js')).default;
      const { createVerificationToken } = await import('../models/emailVerificationModel.js');
      
      const token = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
      
      await createVerificationToken(newUser.id, token, expiresAt);
      
      const emailResult = await emailService.sendVerificationEmail(
        newUser.email,
        newUser.username,
        token
      );
      
      if (emailResult.success) {
        securityLogger.loginAttempt(email, true, req);
        
        res.status(201).json({
          message: "Kayıt başarılı! E-mail adresinize doğrulama linki gönderildi.",
          user: { 
            id: newUser.id, 
            email: newUser.email, 
            username: newUser.username,
            role: newUser.role,
            emailVerified: false
          },
          emailSent: true
        });
      } else {
        // Email gönderilmese bile kayıt başarılı
        res.status(201).json({
          message: "Kayıt başarılı ancak doğrulama e-postası gönderilemedi. Daha sonra tekrar deneyebilirsiniz.",
          user: { 
            id: newUser.id, 
            email: newUser.email, 
            username: newUser.username,
            role: newUser.role,
            emailVerified: false
          },
          emailSent: false
        });
      }
    } catch (emailError) {
      console.warn("Email verification setup failed:", emailError.message);
      
      // Email sistemi çalışmasa bile kayıt başarılı
      res.status(201).json({
        message: "Kayıt başarılı",
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          username: newUser.username,
          role: newUser.role,
          emailVerified: false
        },
        emailSent: false
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ 
      message: "Kayıt sırasında bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      securityLogger.loginAttempt(email, false, req);
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      securityLogger.loginAttempt(email, false, req);
      return res.status(400).json({ message: "Hatalı şifre" });
    }
    
    // Email verification kontrolü
    if (!user.email_verified) {
      securityLogger.loginAttempt(email, false, req, 'Email not verified');
      return res.status(403).json({ 
        message: "Email adresinizi doğrulamanız gerekiyor. Lütfen email'inizdeki doğrulama linkine tıklayın.",
        code: "EMAIL_NOT_VERIFIED",
        resendVerification: true
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    // Başarılı giriş logla
    securityLogger.loginAttempt(email, true, req);
    
    res.status(200).json({
      message: "Giriş başarılı",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newAccessToken = generateAccessToken(user);
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProduction,
      maxAge: 15 * 60 * 1000, // 15 dakika
    });
    res.status(200).json({
      message: "Token yenilendi",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
  });
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
  });
  res.json({ message: "Logout successful" });
};

export const checkAuth = (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
};
