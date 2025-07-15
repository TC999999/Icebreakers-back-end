require("dotenv").config();

// server port
const PORT = +process.env.port || 3001;

// returns PostgreSQL url
function getDBUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///messages_test"
    : process.env.DATABASE_URL || "postgresql:///messages";
}

module.exports = { PORT, getDBUri };
