const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Increase timeout for tests
jest.setTimeout(30000);

// Connect to database before all tests
beforeAll(async () => {
  // Close any existing connections
  await mongoose.disconnect();

  // Use MongoDB service in CI, or in-memory server locally
  if (process.env.CI || process.env.MONGODB_HOST) {
    // In CI environment, use the MongoDB service
    const host = process.env.MONGODB_HOST || 'localhost:27017';
    const db = process.env.MONGODB_DB || 'kodekamper_test';
    const mongoUri = `mongodb://${host}/${db}`;
    await mongoose.connect(mongoUri);
  } else {
    // Locally, use in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }
});

// Clear database between each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
