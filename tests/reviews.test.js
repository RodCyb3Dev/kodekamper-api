const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');

let userToken;
let publisherToken;
let _userId; // eslint-disable-line no-unused-vars
let publisherId;
let bootcampId;
let reviewId;

describe('Reviews API', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      name: 'Test Reviewer',
      email: 'reviewer@test.com',
      password: 'password123',
      role: 'user',
    });
    _userId = user._id;

    // Create a publisher
    const publisher = await User.create({
      name: 'Review Publisher',
      email: 'reviewpub@test.com',
      password: 'password123',
      role: 'publisher',
    });
    publisherId = publisher._id;

    // Login users
    const userRes = await request(app).post('/api/v1/auth/login').send({
      email: 'reviewer@test.com',
      password: 'password123',
    });
    userToken = userRes.body.token;

    const pubRes = await request(app).post('/api/v1/auth/login').send({
      email: 'reviewpub@test.com',
      password: 'password123',
    });
    publisherToken = pubRes.body.token;

    // Create a test bootcamp
    const bootcamp = await Bootcamp.create({
      name: 'Test Bootcamp for Reviews',
      description: 'Test bootcamp description that is long enough to pass validation requirements',
      website: 'https://reviewtest.com',
      phone: '(555) 555-5555',
      email: 'contact@reviewtest.com',
      address: '123 Test St, Boston, MA 02111',
      careers: ['Web Development'],
      user: publisherId,
    });
    bootcampId = bootcamp._id;
  });

  afterAll(async () => {
    // Clean up test data
    await Review.deleteMany({ bootcamp: bootcampId });
    await Bootcamp.deleteMany({ _id: bootcampId });
    await User.deleteMany({ email: { $in: ['reviewer@test.com', 'reviewpub@test.com'] } });
  });

  describe('GET /api/v1/reviews', () => {
    it('should get all reviews', async () => {
      const res = await request(app).get('/api/v1/reviews');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/v1/reviews?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/bootcamps/:bootcampId/reviews', () => {
    it('should get reviews for specific bootcamp', async () => {
      const res = await request(app).get(`/api/v1/bootcamps/${bootcampId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/bootcamps/:bootcampId/reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        title: 'Great Bootcamp',
        text: 'This bootcamp was amazing and I learned so much!',
        rating: 9,
      };

      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', 'Great Bootcamp');
      expect(res.body.data).toHaveProperty('rating', 9);

      reviewId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post(`/api/v1/bootcamps/${bootcampId}/reviews`).send({
        title: 'Unauthorized Review',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Incomplete Review',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Rating',
          text: 'Testing invalid rating',
          rating: 11,
        });

      expect(res.status).toBe(400);
    });

    it('should prevent user from submitting multiple reviews for same bootcamp', async () => {
      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Duplicate Review',
          text: 'Trying to submit another review',
          rating: 8,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('should get a single review by ID', async () => {
      const res = await request(app).get(`/api/v1/reviews/${reviewId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', reviewId);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/reviews/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should populate bootcamp and user data', async () => {
      const res = await request(app).get(`/api/v1/reviews/${reviewId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('bootcamp');
      expect(res.body.data).toHaveProperty('user');
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    it('should update own review', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Great Bootcamp',
          rating: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('title', 'Updated Great Bootcamp');
      expect(res.body.data).toHaveProperty('rating', 10);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put(`/api/v1/reviews/${reviewId}`).send({
        title: 'Unauthorized Update',
      });

      expect(res.status).toBe(401);
    });

    it('should fail when updating someone elses review', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${publisherToken}`)
        .send({
          title: 'Not My Review',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('should delete own review', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await Review.findById(reviewId);
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      const res = await request(app).delete(`/api/v1/reviews/${reviewId}`);

      expect(res.status).toBe(401);
    });
  });
});
