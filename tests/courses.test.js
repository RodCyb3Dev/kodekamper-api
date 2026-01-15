const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');

let authToken;
let userId;
let bootcampId;
let courseId;

describe('Courses API', () => {
  beforeAll(async () => {
    // Create a test publisher user
    const user = await User.create({
      name: 'Course Publisher',
      email: 'coursepub@test.com',
      password: 'password123',
      role: 'publisher',
    });
    userId = user._id;

    // Login to get auth token
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'coursepub@test.com',
      password: 'password123',
    });
    authToken = res.body.token;

    // Create a test bootcamp
    const bootcamp = await Bootcamp.create({
      name: 'Test Bootcamp for Courses',
      description:
        'Test bootcamp description that is long enough to pass validation requirements',
      website: 'https://testbootcamp.com',
      phone: '(555) 555-5555',
      email: 'contact@testbootcamp.com',
      address: '123 Test St, Boston, MA 02111',
      careers: ['Web Development'],
      user: userId,
    });
    bootcampId = bootcamp._id;
  });

  afterAll(async () => {
    // Clean up test data
    await Course.deleteMany({ bootcamp: bootcampId });
    await Bootcamp.deleteMany({ _id: bootcampId });
    await User.deleteMany({ email: 'coursepub@test.com' });
  });

  describe('GET /api/v1/courses', () => {
    it('should get all courses', async () => {
      const res = await request(app).get('/api/v1/courses');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/v1/courses?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/bootcamps/:bootcampId/courses', () => {
    it('should get courses for specific bootcamp', async () => {
      const res = await request(app).get(`/api/v1/bootcamps/${bootcampId}/courses`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/bootcamps/:bootcampId/courses', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'Full Stack Web Development',
        description: 'Learn full stack web development with modern technologies',
        weeks: 12,
        tuition: 10000,
        minimumSkill: 'beginner',
        scholarshipsAvailable: true,
      };

      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/courses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', 'Full Stack Web Development');
      expect(res.body.data).toHaveProperty('bootcamp', bootcampId.toString());

      courseId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post(`/api/v1/bootcamps/${bootcampId}/courses`).send({
        title: 'Unauthorized Course',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/courses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Incomplete Course',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid minimum skill level', async () => {
      const res = await request(app)
        .post(`/api/v1/bootcamps/${bootcampId}/courses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Skill Course',
          description: 'Course with invalid skill level',
          weeks: 10,
          tuition: 5000,
          minimumSkill: 'expert',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should get a single course by ID', async () => {
      const res = await request(app).get(`/api/v1/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/courses/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should populate bootcamp data', async () => {
      const res = await request(app).get(`/api/v1/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('bootcamp');
      expect(res.body.data.bootcamp).toHaveProperty('name');
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    it('should update course', async () => {
      const res = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Full Stack Development',
          tuition: 12000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('title', 'Updated Full Stack Development');
      expect(res.body.data).toHaveProperty('tuition', 12000);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put(`/api/v1/courses/${courseId}`).send({
        title: 'Unauthorized Update',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should delete course', async () => {
      const res = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await Course.findById(courseId);
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      const res = await request(app).delete(`/api/v1/courses/${courseId}`);

      expect(res.status).toBe(401);
    });
  });
});
