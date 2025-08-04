const { UnauthorizedError, UnacceptableError } = require("../expressError");

function ensureLoggedIn(req, res, next) {
  try {
    if (!req.session.user) {
      throw new UnacceptableError("Your must be logged in to access.");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    if (
      !req.session.user ||
      req.params.username !== req.session.user.username
    ) {
      throw new UnauthorizedError("This is not your information.");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { ensureLoggedIn, ensureCorrectUser };
