const getRedisClient = require('../utils/redisClient');

const cacheResponse = (ttlSeconds = 60) => async (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return next();
  }

  try {
    const client = await getRedisClient();
    if (!client) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = async body => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await client.setEx(key, ttlSeconds, JSON.stringify(body));
      }
      return originalJson(body);
    };

    return next();
  } catch (err) {
    return next();
  }
};

module.exports = cacheResponse;
