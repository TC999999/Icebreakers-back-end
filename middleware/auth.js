const { UnauthorizedError, UnacceptableError } = require("../expressError");
const DirectConversations = require("../models/directConversations");

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
      req.body.requesterUser !== req.session.user.username
    ) {
      throw new UnauthorizedError("Cannot make a request for another user!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

async function checkRequestAuth(req, res, next) {
  try {
    let check = await DirectConversations.getRequestById(req.params.id);
    if (!check || check.requesterUser !== req.session.user.username) {
      throw new UnauthorizedError("Cannot change a request for another user!");
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
  checkRequestAuth,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
};
