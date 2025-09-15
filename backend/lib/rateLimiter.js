const RateLimiterRedis = require("rate-limiter-flexible").RateLimiterRedis;
const redisClient = require("./redis");

/** User-specific rate limiter */
const userRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl_user",
  points: 20,
  duration: 30 * 60, // Duration: 30 minutes
});

/** Global rate limiter - this limits the total number of requests across all users */
const globalRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl_global",
  points: 100,
  duration: 60 * 60, // Duration: 1 hour
});

module.exports = {
  userRateLimiter,
  globalRateLimiter,
};
