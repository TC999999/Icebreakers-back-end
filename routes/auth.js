const express = require("express");
const {
  registerUser,
  logOutUser,
  getCurrentUser,
  logInUser,
} = require("../controllers/auth");
const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

// auth route for registering a new user
router.post("/register", registerUser);

// auth route for logging an existing user in
router.post("/login", logInUser);

// auth route for retrieving user in session
router.get("/currentUser", getCurrentUser);

// auth route for logging a user out
router.get("/logout", logOutUser);

module.exports = router;
