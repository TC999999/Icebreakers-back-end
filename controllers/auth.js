const Authorization = require("../models/auth");
const DirectConversations = require("../models/directConversations");
const DirectRequests = require("../models/directRequests");
const Interests = require("../models/interests");

const registerUser = async (req, res, next) => {
  try {
    let {
      username,
      password,
      emailAddress,
      biography,
      favoriteColor,
      interests,
    } = req.body;
    let user = await Authorization.register({
      username,
      password,
      emailAddress,
      biography,
      favoriteColor,
    });

    if (interests.length)
      await Interests.addInterestsForUser(username, interests);

    let userSession = {
      username: user.username,
      favoriteColor: user.favoriteColor,
      isAdmin: user.isAdmin,
      isFlagged: user.isFlagged,
      unansweredRequests: 0,
      unreadMessages: 0,
    };

    req.session.user = userSession;

    return res.status(201).send({ user: userSession });
  } catch (err) {
    return next(err);
  }
};

const logInUser = async (req, res, next) => {
  try {
    let { username, password } = req.body;

    let user = await Authorization.logIn({
      username,
      password,
    });

    const { unansweredRequests } =
      await DirectRequests.getUnansweredRequestCount(username);

    const { unreadMessages } =
      await DirectConversations.getAllUnreadMessageCount(username);

    let userSession = {
      username: user.username,
      favoriteColor: user.favoriteColor,
      isAdmin: user.isAdmin,
      isFlagged: user.isFlagged,
      unansweredRequests: parseFloat(unansweredRequests),
      unreadMessages: parseFloat(unreadMessages) || 0,
    };

    req.session.user = userSession;

    return res.status(200).send({ user: userSession });
  } catch (err) {
    return next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    let user;
    if (req.session.user) {
      user = req.session.user;
    } else {
      user = null;
    }
    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

const logOutUser = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("error:", err);
      return res.status(200).send({ message: "Error while logging out" });
    } else {
      res.clearCookie("connect.sid");
      return res.status(200).send({ message: "Successfully logged out" });
    }
  });
};

module.exports = { registerUser, logInUser, getCurrentUser, logOutUser };
