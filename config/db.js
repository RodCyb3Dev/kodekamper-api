const mongoose = require('mongoose');

const buildMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const host = process.env.MONGODB_HOST || '127.0.0.1:27017';
  const db = process.env.MONGODB_DB || 'kodekamper';
  const user = process.env.MONGODB_USERNAME;
  const pass = process.env.MONGODB_PASSWORD;

  if (user && pass) {
    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${db}`;
  }

  return `mongodb://${host}/${db}`;
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(buildMongoUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (err) {
    console.error(`Error: ${err.message}`.red.underline.bold);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
