const express = require("express");
const {
  userCheck,
  getUserProfile,
  getAllUsers,
  searchForUsers,
  getUserForEdit,
  editUser,
} = require("../controllers/users");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

// route for retrieving an existing user profile
router.get("/:username", ensureLoggedIn, getUserProfile);

// route for getting information to be edited for a single user's own profile
router.get("/:username/edit", ensureCorrectUser, getUserForEdit);

// route for editing a single user's own profile
router.patch("/:username/edit", ensureCorrectUser, editUser);

// route for checking if a user exists
router.get("/check/:username", ensureLoggedIn, userCheck);

// route for getting a list of all users based on inputted search params
router.get("/search/get", ensureLoggedIn, getAllUsers);

// route for getting a list of all usernames from users table
router.all("/search/all", ensureLoggedIn, searchForUsers);

module.exports = router;
