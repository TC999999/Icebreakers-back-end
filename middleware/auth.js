const { UnauthorizedError, UnacceptableError } = require("../expressError");
const DirectRequests = require("../models/directRequests");

// middleware that ensures that the user cannot access a route without first being logged in
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

// middleware that ensures that the user cannot access a route if the username in express session
// does not match the username in the url parameters
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

// middleware that ensures that the user cannot make a chat request or send a group invitation for
// another user
function ensureCorrectUserForRequest(req, res, next) {
  try {
    if (!req.session.user || req.body.from !== req.session.user.username) {
      throw new UnauthorizedError("Cannot make a request for another user!");
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
      throw new UnauthorizedError(
        "Cannot reponse to a request for another user!"
      );
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
