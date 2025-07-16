const express = require("express");
const { registerUser, logOutUser, logInUser } = require("../controllers/auth");

const router = express.Router();

// auth route for registering a new user
router.post("/register", registerUser);

// auth route for logging an existing user in
router.get("/login", logInUser);

// auth route for logging a user out
router.post("/logout", logOutUser);

module.exports = router;
