const Authorization = require("../models/auth");

const registerUser = async (req, res, next) => {
  try {
    let { username, password, emailAddress, favoriteColor } = req.body;
    let newUser = await Authorization.register({
      username,
      password,
      emailAddress,
      favoriteColor,
    });

    req.session.user = {
      username: newUser.username,
      isAdmin: newUser.isAdmin,
      isFlagged: newUser.isFlagged,
    };

    return res.status(200).json({ newUser });
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
      isAdmin: user.isAdmin,
      isFlagged: user.isFlagged,
    };

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

const logOutUser = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("error:", err);
      return res.status(200).json({ message: "Error while logging out" });
    } else {
      return res.status(200).json({ message: "Successfully logged out" });
    }
  });
};

module.exports = { registerUser, logInUser, logOutUser };
