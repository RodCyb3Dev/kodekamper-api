const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication API', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'user',
  };

  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({ email: { $regex: /test/i } });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Incomplete User',
      });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bad Email User',
        email: 'notanemail',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('should fail with short password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Short Password User',
        email: 'shortpass@test.com',
        password: '12345',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should fail with missing email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email and password');
    });

    it('should fail with missing password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email and password');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = res.body.token;
    });

    it('should get current logged in user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('name', testUser.name);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/updatedetails', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = res.body.token;
    });

    it('should update user details', async () => {
      const res = await request(app)
        .put('/api/v1/auth/updatedetails')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test User',
          email: 'updated@test.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Updated Test User');
      expect(res.body.data).toHaveProperty('email', 'updated@test.com');

      // Update testUser for cleanup
      testUser.email = 'updated@test.com';
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put('/api/v1/auth/updatedetails').send({
        name: 'Unauthorized Update',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/updatepassword', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = res.body.token;
    });

    it('should update password with correct current password', async () => {
      const res = await request(app)
        .put('/api/v1/auth/updatepassword')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');

      // Update testUser password for cleanup
      testUser.password = 'newpassword123';
    });

    it('should fail with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/v1/auth/updatepassword')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(401);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put('/api/v1/auth/updatepassword').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('should logout user', async () => {
      const res = await request(app).get('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });
});
