const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const redisStore = require("./redis");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
const { ORIGIN_DOMAIN, SESSION_SECRET_KEY } = require("./config");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ORIGIN_DOMAIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("tiny"));

app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    },
  })
);

//Routes
app.use("/auth", authRoutes);

// 404 Error Handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

// General Error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
