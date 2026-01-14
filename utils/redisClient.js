const { createClient } = require('redis');

let redisClient;
let isConnecting = false;

const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.REDIS_URL;
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
