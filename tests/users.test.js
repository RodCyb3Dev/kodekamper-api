const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

let adminToken;
let adminId;
let testUserId;

describe('Users API (Admin Only)', () => {
  beforeAll(async () => {
    // Create an admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id;

    // Login as admin
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    adminToken = res.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /admin|testuser/i } });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res.status).toBe(401);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should support field selection', async () => {
      const res = await request(app)
        .get('/api/v1/users?select=name,email')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user as admin', async () => {
      const userData = {
        name: 'Test User Created',
        email: 'testusercreated@test.com',
        password: 'password123',
        role: 'publisher',
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Test User Created');
      expect(res.body.data).toHaveProperty('role', 'publisher');

      testUserId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/v1/users').send({
        name: 'Unauthorized User',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete User',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Email User',
          email: 'testusercreated@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get a single user by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', testUserId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get(`/api/v1/users/${testUserId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user as admin', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test User',
          role: 'user',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Updated Test User');
      expect(res.body.data).toHaveProperty('role', 'user');
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put(`/api/v1/users/${testUserId}`).send({
        name: 'Unauthorized Update',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await User.findById(testUserId);
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      const res = await request(app).delete(`/api/v1/users/${testUserId}`);

      expect(res.status).toBe(401);
    });
  });
});
