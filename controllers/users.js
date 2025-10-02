const User = require("../models/users");
const Interests = require("../models/interests");

const userCheck = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.userCheck(username);

    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUser = req.session.user.username;
    const userRes = await User.getUserProfile(username, currentUser);
    const userInterests = await Interests.getUserInterests(username);
    const user = { ...userRes, interests: userInterests };
    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers(req.session.user.username);
    return res.status(200).send({ users });
  } catch (err) {
    return next(err);
  }
};

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

module.exports = { userCheck, getUserProfile, getAllUsers, searchForUsers };
