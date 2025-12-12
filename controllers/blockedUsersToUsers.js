const BlockedUsersToUsers = require("../models/blockedUsersToUsers");

// adds to user to blocked user table, but only if a row containing both username does
// not already exist, and returns data to client-side
const addBlockedUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { blockedUser } = req.body;
    await BlockedUsersToUsers.checkBlockedStatus(username, blockedUser);

    const blockedData = await BlockedUsersToUsers.addBlockedUser(
      username,
      blockedUser
    );

    return res.status(201).send({ blockedData });
  } catch (err) {
    return next(err);
  }
};

// retrieves a list of users that belong to a single user and returns them to the
// client-side; throws an error if username in params does not match username saved
// in session
const getBlockedUsers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const blockedUsers = await BlockedUsersToUsers.getBlockedUsers(username);
    return res.status(200).send({ blockedUsers });
  } catch (err) {
    return next(err);
  }
};

// delete data where a single user has blocked another user and returns that
// data to the client side
const unblockUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { blockedUser } = req.body;

    const unblockData = await BlockedUsersToUsers.unblockUser(
      username,
      blockedUser
    );

    return res.status(200).send({ unblockData });
  } catch (err) {
    return next(err);
  }
};

module.exports = { addBlockedUser, getBlockedUsers, unblockUser };
