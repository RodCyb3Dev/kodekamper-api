const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const getRedisClient = require('../utils/redisClient');

const pingRedis = async () => {
  const client = await getRedisClient();
  if (!client) {
    return { ok: false, message: 'Redis not configured' };
  }

  try {
    const pong = await Promise.race([
      client.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 1500)
      )
    ]);

    return { ok: pong === 'PONG' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};

exports.getHealth = asyncHandler(async (req, res) => {
  const mongoState = mongoose.connection.readyState; // 1 = connected
  const redisStatus = await pingRedis();

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      mongo: mongoState === 1 ? 'connected' : 'disconnected',
      redis: redisStatus.ok ? 'connected' : 'disconnected',
      redisMessage: redisStatus.message || undefined,
      uptimeSeconds: process.uptime()
    }
  });
});
