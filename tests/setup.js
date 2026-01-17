const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const Review = require('../models/Review');
const User = require('../models/User');

let mongoServer;

// Increase timeout for tests
jest.setTimeout(30000);

// Provide safe defaults for local test runs
// (CI sets these explicitly in the workflow env)
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_SECRET ||= `ci-test-${Math.random().toString(16).slice(2)}${Date.now()}`;
  process.env.JWT_EXPIRE ||= '30d';
  process.env.JWT_COOKIE_EXPIRE ||= '30';
  process.env.CSRF_SECRET ||= `ci-test-${Math.random().toString(16).slice(2)}${Date.now()}`;
  process.env.APP_BASE_URL ||= 'http://localhost:5000';
  process.env.GEOCODER_PROVIDER ||= 'mapquest';
  process.env.GEOCODER_API_KEY ||= 'ci-test-key';
}

// Connect to database before all tests
beforeAll(async () => {
  // Close any existing connections
  await mongoose.disconnect();

  // In CI, use the MongoDB service container.
  // Locally, ALWAYS use in-memory MongoDB so any exported env vars from deploy tooling
  // (like MONGODB_HOST pointing at docker-internal hostnames) cannot break tests.
  if (process.env.CI) {
    const host = process.env.MONGODB_HOST || 'localhost:27017';
    const db = process.env.MONGODB_DB || 'kodekamper_test';
    const mongoUri = `mongodb://${host}/${db}`;
    await mongoose.connect(mongoUri);
  } else {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }

  // Each test file starts from a clean database, but we do NOT wipe between tests
  // because many suites create auth users/tokens in beforeAll and reuse them.
  await mongoose.connection.dropDatabase();

  // Ensure indexes exist (unique constraints, etc.)
  await Promise.all([
    Bootcamp.syncIndexes(),
    Course.syncIndexes(),
    Review.syncIndexes(),
    User.syncIndexes(),
  ]);
});

// Disconnect and close database after all tests
afterAll(async () => {
  // Close Redis client if it was created (prevents Jest open-handle hangs)
  try {
    const getRedisClient = require('../utils/redisClient');
    if (typeof getRedisClient?.close === 'function') {
      await getRedisClient.close();
    }
  } catch (_err) {
    // Ignore
  }

  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
