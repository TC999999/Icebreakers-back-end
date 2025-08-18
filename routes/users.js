const express = require("express");
const { getUserProfile, getAllUsers } = require("../controllers/users");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/:username", ensureCorrectUser, getUserProfile);

router.get("/search/get", ensureLoggedIn, getAllUsers);

module.exports = router;
