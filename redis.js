const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");
const { REDIS_URL } = require("./config");

const sessionClient = createClient({ url: REDIS_URL });
sessionClient.on("error", (err) => console.log("Session Client Error: ", err));
sessionClient.connect().catch(console.error);

const OTPClient = createClient({ url: REDIS_URL });
OTPClient.on("error", (err) =>
  console.log("One-Time Code Client Error: ", err),
);
OTPClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: sessionClient,
  prefix: "session: ",
});

module.exports = redisStore;
