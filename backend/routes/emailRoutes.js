import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { createRateLimit } from '../middleware/rateLimitMiddleware.js';
import {
  sendVerificationEmail,
  verifyEmail,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  cleanupTokens
} from '../controllers/emailController.js';

const router = express.Router();

const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiting için özel konfigürasyonlar
const emailRateLimit = createRateLimit({
  maxRequests: isDevelopment ? 100 : 3, // Geliştirmede 100, production'da 3
  windowSize: 15 * 60 * 1000,
  message: 'Çok fazla email gönderme isteği. Lütfen 15 dakika bekleyin.'
});

const resetRateLimit = createRateLimit({
  maxRequests: isDevelopment ? 100 : 5, // Geliştirmede 100, production'da 5
  windowSize: 15 * 60 * 1000,
  message: 'Çok fazla şifre sıfırlama talebi. Lütfen 15 dakika bekleyin.'
});

// Email verification routes
router.post('/send-verification', authMiddleware, emailRateLimit, sendVerificationEmail);
router.get('/verify', verifyEmail); // Public endpoint for email links

// Password reset routes
router.post('/request-reset', resetRateLimit, requestPasswordReset); // Public endpoint
router.get('/validate-reset-token', validateResetToken); // Public endpoint
router.post('/reset-password', resetPassword); // Public endpoint

// Admin routes
router.post('/cleanup-tokens', authMiddleware, roleMiddleware('admin'), cleanupTokens);

export default router; 