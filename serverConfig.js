const session = require("express-session");
const cors = require("cors");
const redisStore = require("./redis");
const { SESSION_SECRET_KEY, ORIGIN_DOMAIN, IS_SECURE } = require("./config");

const sessionOptions = {
  store: redisStore,
  secret: SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: IS_SECURE,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 10000,
  },
  rolling: true,
};

const corsOptions = {
  origin: ORIGIN_DOMAIN,
  credentials: true,
};

const sessionMiddleware = session(sessionOptions);

const corsMiddleware = cors(corsOptions);

module.exports = { sessionMiddleware, corsMiddleware, corsOptions };
