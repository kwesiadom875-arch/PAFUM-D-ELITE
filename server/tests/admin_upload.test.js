const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}));

describe('Admin File Upload Security', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    jest.clearAllMocks();

    try {
        adminUser = await User.create({
        username: `admin_upload_test_${Date.now()}`,
        email: `admin_${Date.now()}@example.com`,
        password: 'password123',
        isAdmin: true,
        isVerified: true,
        verificationToken: 'dummy'
        });

        adminToken = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET || "parfum_delite_secret_key_123",
            { expiresIn: '1h' }
        );
    } catch (e) {
        console.error("Error creating admin user:", e);
    }
  });

  // afterEach is handled by setup.js which clears DB

  it('should reject non-video files', async () => {
    const filePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(filePath, 'This is a test text file, not a video.');

    const res = await request(app)
      .post('/api/admin/upload-hero-video')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('video', filePath);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Invalid file type. Only video files are allowed.');
    expect(spawn).not.toHaveBeenCalled();
  });

  it('should accept valid video files', async () => {
    // Mock spawn to simulate success
    const mockProcess = {
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          setImmediate(() => callback(0));
        }
      }),
      stderr: {
        on: jest.fn()
      }
    };
    spawn.mockReturnValue(mockProcess);

    const filePath = path.join(__dirname, 'test.mp4');
    // Create a dummy file with mp4 extension
    fs.writeFileSync(filePath, 'dummy video content');

    const res = await request(app)
      .post('/api/admin/upload-hero-video')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('video', filePath);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Video uploaded and processed successfully');
    expect(spawn).toHaveBeenCalled();
  });
});
