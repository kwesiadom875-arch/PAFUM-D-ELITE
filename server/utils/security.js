const argon2 = require('argon2');
const crypto = require('crypto');

/**
 * Hash password using Argon2id (OWASP recommended)
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,        // 3 iterations
    parallelism: 4      // 4 threads
  });
}

/**
 * Verify password against Argon2 hash
 * @param {string} hash - Stored password hash
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

/**
 * Generate secure random token for email verification
 * @returns {string} 64-character hex token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate password strength (NIST guidelines adapted)
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validatePassword(password) {
  // Minimum length check
  if (password.length < 12) {
    return { 
      valid: false, 
      message: 'Password must be at least 12 characters long' 
    };
  }
  
  // Check against common passwords (basic list - expand in production)
  const commonPasswords = [
    'password123', '123456789012', 'qwertyuiop12', 
    'password1234', 'admin1234567', 'welcome12345',
    'letmein12345', 'monkey123456', 'dragon123456'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { 
      valid: false, 
      message: 'Password is too common. Please choose a stronger password.' 
    };
  }
  
  return { valid: true };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateVerificationToken,
  validatePassword
};
