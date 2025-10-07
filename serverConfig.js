const session = require("express-session");
const cors = require("cors");
const redisStore = require("./redis");
const { SESSION_SECRET_KEY, ORIGIN_DOMAIN } = require("./config");

const sessionMiddleware = session({
  store: redisStore,
  secret: SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 3000,
  },
});

const corsOptions = {
  origin: ORIGIN_DOMAIN,
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

module.exports = { sessionMiddleware, corsMiddleware, corsOptions };
