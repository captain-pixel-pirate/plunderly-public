const Redis = require("ioredis");
require("dotenv").config();

const url = process.env.REDIS_URL;

console.log({
  NODE_ENV: process.env.NODE_ENV,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_URL: process.env.REDIS_URL ? "<present>" : "<missing>",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ? "<present>" : "<missing>",
});

const redisClient = url
  ? new Redis(`${url}?family=0`, {
      connectTimeout: 10000,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })
  : new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 10000,
      maxRetriesPerRequest: 2,
      family: 0,
    });

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("🚨 Redis error", err));

module.exports = redisClient;
