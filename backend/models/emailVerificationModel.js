import { db } from '../config/db.js';

// Email verification tokens table
export const createEmailVerificationTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      used_at TIMESTAMP DEFAULT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at);
  `;
  
  await db.query(query);
};

// Password reset tokens table
export const createPasswordResetTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      used_at TIMESTAMP DEFAULT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
  `;
  
  await db.query(query);
};

// Users tablosuna email_verified kolonu ekle
export const addEmailVerificationToUsers = async () => {
  const query = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP DEFAULT NULL;
  `;
  
  await db.query(query);
};

// Email verification token oluştur
export const createVerificationToken = async (userId, token, expiresAt) => {
  // Önce eski token'ları sil
  await db.query(
    'DELETE FROM email_verification_tokens WHERE user_id = $1',
    [userId]
  );
  
  const result = await db.query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, token, expiresAt]
  );
  
  return result.rows[0];
};

// Password reset token oluştur
export const createPasswordResetToken = async (userId, token, expiresAt) => {
  // Önce eski token'ları sil
  await db.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1',
    [userId]
  );
  
  const result = await db.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, token, expiresAt]
  );
  
  return result.rows[0];
};

// Verification token'ı bul ve doğrula
export const findVerificationToken = async (token) => {
  const result = await db.query(
    `SELECT evt.*, u.id as user_id, u.email, u.username, u.email_verified 
     FROM email_verification_tokens evt 
     JOIN users u ON evt.user_id = u.id 
     WHERE evt.token = $1 AND evt.used_at IS NULL AND evt.expires_at > NOW()`,
    [token]
  );
  
  return result.rows[0];
};

// Password reset token'ı bul ve doğrula
export const findPasswordResetToken = async (token) => {
  const result = await db.query(
    `SELECT prt.*, u.id as user_id, u.email, u.username 
     FROM password_reset_tokens prt 
     JOIN users u ON prt.user_id = u.id 
     WHERE prt.token = $1 AND prt.used_at IS NULL AND prt.expires_at > NOW()`,
    [token]
  );
  
  return result.rows[0];
};

// Email'i verified olarak işaretle
export const markEmailAsVerified = async (userId, tokenId) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // User'ı verified olarak işaretle
    await client.query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1',
      [userId]
    );
    
    // Token'ı kullanılmış olarak işaretle
    await client.query(
      'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1',
      [tokenId]
    );
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Şifreyi güncelle ve token'ı kullanılmış olarak işaretle
export const updatePasswordWithToken = async (userId, hashedPassword, tokenId) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Şifreyi güncelle
    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    // Token'ı kullanılmış olarak işaretle
    await client.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [tokenId]
    );
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Expired token'ları temizle
export const cleanupExpiredTokens = async () => {
  const verificationResult = await db.query(
    'DELETE FROM email_verification_tokens WHERE expires_at < NOW()'
  );
  
  const resetResult = await db.query(
    'DELETE FROM password_reset_tokens WHERE expires_at < NOW()'
  );
  
  return {
    verificationTokensDeleted: verificationResult.rowCount,
    resetTokensDeleted: resetResult.rowCount
  };
};

// Kullanıcının email verification durumunu kontrol et
export const checkEmailVerificationStatus = async (userId) => {
  const result = await db.query(
    'SELECT email_verified, email_verified_at FROM users WHERE id = $1',
    [userId]
  );
  
  return result.rows[0];
}; 