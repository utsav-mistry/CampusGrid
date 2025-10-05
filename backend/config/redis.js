import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('Redis not configured - caching disabled');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Redis reconnection failed');
          }
          return retries * 100; // Exponential backoff
        }
      }
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('Redis Connected'));
    redisClient.on('reconnecting', () => console.log('Redis Reconnecting...'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    return null;
  }
};

export const getRedisClient = () => redisClient;

// Cache middleware
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json
      res.json = (data) => {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data)).catch(console.error);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default { connectRedis, getRedisClient, cacheMiddleware };
