const express = require("express");
const morgan = require("morgan");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const interestsRoutes = require("./routes/interests");
const directMessagesRoutes = require("./routes/directConversations");
const groupMessagesRoutes = require("./routes/groupConversations");
const { sessionMiddleware, corsMiddleware } = require("./serverConfig");
const app = express();

// Middleware
// app.use(cookieParser());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(sessionMiddleware);

//Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/interests", interestsRoutes);
app.use("/directMessage", directMessagesRoutes);
app.use("/groupMessage", groupMessagesRoutes);

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
