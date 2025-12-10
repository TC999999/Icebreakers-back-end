const { addBlockedUser } = require("../controllers/blockedUsersToUsers");
const { ensureCorrectUser } = require("../middleware/auth");

const express = require("express");
const router = express.Router();

router.post("/users/:username/new", ensureCorrectUser, addBlockedUser);

module.exports = router;
