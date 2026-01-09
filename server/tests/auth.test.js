const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Mock the email service
jest.mock('../services/emailService');

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and send a verification email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('Registration successful. Please check your email to verify your account.');

      // Verify user was created with a verification token
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).not.toBeNull();
      expect(user.username).toBe('testuser');
      expect(user.verificationToken).toBeDefined();

      // Verify that the email function was called
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        user.verificationToken
      );
    });

    it('should not register a user with an existing email', async () => {
      // First, create a user
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      // Then, try to create another user with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'test@example.com',
          password: 'password456',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Username or Email already exists');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify a user with a valid token and return a JWT', async () => {
      // First, register a user to get a token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'verifyuser',
          email: 'verify@example.com',
          password: 'password123',
        });
      
      const user = await User.findOne({ email: 'verify@example.com' });
      const { verificationToken } = user;

      // Now, verify the email
      const verifyRes = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken });

      expect(verifyRes.statusCode).toEqual(200);
      expect(verifyRes.body).toHaveProperty('token');

      // Verify user is updated in the database
      const updatedUser = await User.findOne({ email: 'verify@example.com' });
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.verificationToken).toBeUndefined();
    });

    it('should not verify a user with an invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalidtoken' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid or expired verification token.');
    });
  });
});
