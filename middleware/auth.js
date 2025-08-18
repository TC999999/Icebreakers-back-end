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

function ensureCorrectUserForRequest(req, res, next) {
  try {
    if (
      !req.session.user ||
      req.body.requester_user !== req.session.user.username
    ) {
      throw new UnauthorizedError("Cannot make a request for another user!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUserForReponse(req, res, next) {
  try {
    if (
      !req.session.user ||
      req.body.requested_user !== req.session.user.username
    ) {
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
