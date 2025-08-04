const express = require("express");
const { getUserProfile } = require("../controllers/users");
const { ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

router.get("/:username", ensureCorrectUser, getUserProfile);

module.exports = router;
