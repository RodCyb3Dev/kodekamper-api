const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');

let authToken;
let userId;
let bootcampId;

describe('Bootcamps API', () => {
  beforeAll(async () => {
    // Create a test user and get auth token
    const user = await User.create({
      name: 'Test Publisher',
      email: 'publisher@test.com',
      password: 'password123',
      role: 'publisher',
    });
    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'publisher@test.com',
      password: 'password123',
    });
    authToken = res.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await Bootcamp.deleteMany({ user: userId });
    await User.deleteMany({ email: 'publisher@test.com' });
  });

  describe('GET /api/v1/bootcamps', () => {
    it('should get all bootcamps', async () => {
      const res = await request(app).get('/api/v1/bootcamps');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/v1/bootcamps?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should support field selection', async () => {
      const res = await request(app).get('/api/v1/bootcamps?select=name,description');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support sorting', async () => {
      const res = await request(app).get('/api/v1/bootcamps?sort=-createdAt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/bootcamps', () => {
    it('should create a new bootcamp with valid data', async () => {
      const bootcampData = {
        name: 'Test Bootcamp',
        description:
          'Test bootcamp description that is long enough to pass validation requirements',
        website: 'https://testbootcamp.com',
        phone: '(555) 555-5555',
        email: 'contact@testbootcamp.com',
        address: '123 Test St, Boston, MA 02111',
        careers: ['Web Development', 'UI/UX'],
        housing: true,
        jobAssistance: true,
        jobGuarantee: false,
        acceptGi: true,
      };

      const res = await request(app)
        .post('/api/v1/bootcamps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bootcampData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Test Bootcamp');
      expect(res.body.data).toHaveProperty('slug', 'test-bootcamp');

      bootcampId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/v1/bootcamps').send({
        name: 'Unauthorized Bootcamp',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/bootcamps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Bootcamp',
        });

      expect(res.status).toBe(400);
    });

    it('should prevent publisher from creating multiple bootcamps', async () => {
      const bootcampData = {
        name: 'Second Bootcamp',
        description:
          'Second bootcamp description that is long enough to pass validation requirements',
        website: 'https://secondbootcamp.com',
        phone: '(555) 555-5556',
        email: 'contact@secondbootcamp.com',
        address: '456 Test Ave, Boston, MA 02112',
        careers: ['Mobile Development'],
        housing: false,
        jobAssistance: true,
      };

      const res = await request(app)
        .post('/api/v1/bootcamps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bootcampData);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already published');
    });
  });

  describe('GET /api/v1/bootcamps/:id', () => {
    it('should get a single bootcamp by ID', async () => {
      const res = await request(app).get(`/api/v1/bootcamps/${bootcampId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', bootcampId);
    });

    it('should return 404 for non-existent bootcamp', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/bootcamps/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/v1/bootcamps/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/v1/bootcamps/:id', () => {
    it('should update bootcamp with valid data', async () => {
      const res = await request(app)
        .put(`/api/v1/bootcamps/${bootcampId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Bootcamp',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Updated Test Bootcamp');
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put(`/api/v1/bootcamps/${bootcampId}`).send({
        name: 'Unauthorized Update',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/bootcamps/:id', () => {
    it('should delete bootcamp', async () => {
      const res = await request(app)
        .delete(`/api/v1/bootcamps/${bootcampId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await Bootcamp.findById(bootcampId);
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      const res = await request(app).delete(`/api/v1/bootcamps/${bootcampId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/bootcamps/radius/:zipcode/:distance', () => {
    it('should get bootcamps within radius', async () => {
      const res = await request(app).get('/api/v1/bootcamps/radius/02118/10');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app).get('/api/v1/bootcamps/radius/99999/1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
