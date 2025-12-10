const BlockedUsersToUsers = require("../models/blockedUsersToUsers");

// adds to user to blocked user table  and returns data to client-side
const addBlockedUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { blockedUser } = req.body;

    const blockedData = await BlockedUsersToUsers.addBlockedUser(
      username,
      blockedUser
    );

    return res.status(201).send({ blockedData });
  } catch (err) {
    return next(err);
  }
};

module.exports = { addBlockedUser };
