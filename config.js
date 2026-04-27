require("dotenv").config();

// server port
const PORT = +process.env.PORT || 3001;

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;

const ORIGIN_DOMAIN = process.env.ORIGIN_DOMAIN;

const REDIS_URL = process.env.REDIS_URL;

const IS_SECURE = process.env.IS_SECURE || false;

// returns PostgreSQL url
function getDBUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///messages_test"
    : process.env.DATABASE_URL || "postgresql:///messages";
}

module.exports = {
  PORT,
  BCRYPT_WORK_FACTOR,
  SESSION_SECRET_KEY,
  ORIGIN_DOMAIN,
  REDIS_URL,
  IS_SECURE,
  getDBUri,
};
