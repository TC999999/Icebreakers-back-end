const User = require("../models/users");
const Interests = require("../models/interests");

const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const userRes = await User.getUserProfile(username);
    const userInterests = await Interests.getUserInterests(username);
    const user = { ...userRes, interests: userInterests };
    return res.status(200).send({ user });
  } catch (err) {
    return next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    return res.status(200).send({ users });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUserProfile, getAllUsers };
