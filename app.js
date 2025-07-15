const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("tiny"));

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
