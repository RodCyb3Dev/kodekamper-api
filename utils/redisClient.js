const { createClient } = require('redis');

let redisClient;
let isConnecting = false;

const buildRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || '6379';
  const user = process.env.REDIS_USERNAME;
  const pass = process.env.REDIS_PASSWORD;

  if (user && pass) {
    return `redis://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }

  return `redis://${host}:${port}`;
};

const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
  }

  const url = buildRedisUrl();
  if (!url) {
    return null;
  }

  if (isConnecting) {
    return redisClient || null;
  }

  isConnecting = true;
  redisClient = createClient({ url });

  redisClient.on('error', err => {
    console.error(`Redis Error: ${err.message}`.red.underline);
  });

  await redisClient.connect();
  isConnecting = false;

  return redisClient;
};

module.exports = getRedisClient;
