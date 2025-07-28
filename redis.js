const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");
const { REDIS_URL } = require("./config");

const redisClient = createClient({ url: REDIS_URL });

redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
});

module.exports = redisStore;
