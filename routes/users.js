const express = require("express");
const {
  getUserProfile,
  getAllUsers,
  searchForUsers,
} = require("../controllers/users");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/:username", getUserProfile);

router.get("/search/get", ensureLoggedIn, getAllUsers);

router.all("/search/all", ensureLoggedIn, searchForUsers);

module.exports = router;
