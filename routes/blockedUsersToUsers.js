const {
  addBlockedUser,
  getBlockedUsers,
  unblockUser,
} = require("../controllers/blockedUsersToUsers");
const { ensureCorrectUser } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

// route for getting a list of all users blocked by the current user
router.get("/users/:username", ensureCorrectUser, getBlockedUsers);

// route for blocking another user from contacting the current user directly
router.post("/users/:username/new", ensureCorrectUser, addBlockedUser);

// route for unblocking another user from contacting the current user directly
router.delete("/users/:username", ensureCorrectUser, unblockUser);

module.exports = router;
