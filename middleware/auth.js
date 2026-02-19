const { UnauthorizedError, ForbiddenError } = require("../expressError");

// middleware that ensures that the user cannot access a route without first being logged in
function ensureLoggedIn(req, res, next) {
  try {
    if (!req.session.user) {
      throw new UnauthorizedError(
        "Your session has expired. Please refresh the page and log back in.",
      );
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// middleware that ensures that the user cannot access a route if the username in express session
// does not match the username in the url parameters
function ensureCorrectUser(req, res, next) {
  try {
    if (!req.session.user) {
      throw new UnauthorizedError(
        "Your session has expired. Please refresh the page and log back in.",
      );
    } else if (req.params.username !== req.session.user.username) {
      throw new ForbiddenError("This is not your information.");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// middleware that ensures that the user cannot make a chat request or send a group invitation for
// another user
function ensureCorrectUserForRequest(req, res, next) {
  try {
    if (!req.session.user || req.body.from !== req.session.user.username) {
      throw new ForbiddenError("Cannot make a request for another user!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// middleware that ensures that the user cannot respond a chat request or group invitation for another user
function ensureCorrectUserForReponse(req, res, next) {
  try {
    if (!req.session.user || req.body.to !== req.session.user.username) {
      throw new ForbiddenError("Cannot repond to a request for another user!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
};
