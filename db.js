const { Client } = require("pg");
const { getDBUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDBUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDBUri(),
  });
}

db.connect();

module.exports = db;
