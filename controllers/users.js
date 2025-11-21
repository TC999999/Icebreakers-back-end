const User = require("../models/users");
const Interests = require("../models/interests");
const DirectRequests = require("../models/directRequests");
const { ForbiddenError } = require("../expressError");

// checks database if a direct conversation between two users already exists
const userCheck = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUser = req.session.user.username;
    const user = await User.userCheck(username);

    if (user && currentUser !== username) {
      conversationExists = await DirectRequests.checkConversationExists(
        currentUser,
        username
      );
      if (conversationExists)
        throw new ForbiddenError("Conversation already exists");
    }

    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

// retrieves data about a single user from database and returns it to the client-side; additionally, returns
// all of that user's interests and whether the current user has sent the username in the params a direct
// request and whether a conversation exists between the current user and the other user, but only if the
// names don't match
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUser = req.session.user.username;
    const userRes = await User.getUserProfile(username);
    const userInterests = await Interests.getUserInterests(username);
    let conversationExists;
    let requestSent;
    if (currentUser !== username) {
      requestSent = await DirectRequests.checkRequests(
        username,
        currentUser,
        false,
        true
      );
      conversationExists = await DirectRequests.checkConversationExists(
        currentUser,
        username
      );
    }
    const user = {
      ...userRes,
      interests: userInterests,
      requestSent,
      conversationExists,
    };
    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

// returns a list of all users and their information except for the current user saved in express session
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers(req.session.user.username);
    return res.status(200).send({ users });
  } catch (err) {
    return next(err);
  }
};

// returns a filtered list of users based on the search query parameters in the request; if the
// findSimilarInterests parameter is in the body, also retrieves a list of the current user's interests
// and filters out users with no similar interests to their own
const searchForUsers = async (req, res, next) => {
  try {
    const { username, findSimilarInterests } = req.query;
    const interests = await User.getSingleUserInterests(
      req.session.user.username,
      findSimilarInterests
    );
    const users = await User.searchForUsers(
      req.session.user.username,
      username,
      interests
    );
    return res.status(200).send({ users });
  } catch (err) {
    return next(err);
  }
};

// retrieves a single user's information that will be edited on the client-side, including their email address,
// biography, and interest list
const getUserForEdit = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.getUserForEdit(username);
    const interests = await Interests.getInterestsAsMap();
    return res.status(200).send({ user, interests });
  } catch (err) {
    return next(err);
  }
};

// updates a user's profile information in the database and returns their new favorite color to update their
// user profile button styling on the client-side
const editUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { emailAddress, biography, favoriteColor, interests } = req.body;
    const { newFavoriteColor } = await User.editUser({
      username,
      emailAddress,
      biography,
      favoriteColor,
      interests,
    });
    return res.status(200).send({ newFavoriteColor });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  userCheck,
  getUserProfile,
  getAllUsers,
  searchForUsers,
  getUserForEdit,
  editUser,
};
