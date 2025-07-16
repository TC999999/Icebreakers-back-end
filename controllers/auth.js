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

    return res.status(200).json({ newUser });
  } catch (err) {
    return next(err);
  }
};

module.exports = { registerUser };
