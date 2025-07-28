const Authorization = require("../models/auth");

const registerUser = async (req, res, next) => {
  try {
    let { username, password, emailAddress, favoriteColor } = req.body;
    let user = await Authorization.register({
      username,
      password,
      emailAddress,
      favoriteColor,
    });

    req.session.user = {
      username: user.username,
      favoriteColor: user.favoriteColor,
      isAdmin: user.isAdmin,
      isFlagged: user.isFlagged,
    };

    return res.status(200).send({ user });
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

    req.session.user = {
      username: user.username,
      favoriteColor: user.favoriteColor,
      isAdmin: user.isAdmin,
      isFlagged: user.isFlagged,
    };

    return res.status(200).send({ user });
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
