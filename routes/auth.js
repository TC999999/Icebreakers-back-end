const express = require("express");
const { registerUser } = require("../controllers/auth");

const router = express.Router();

// auth route for registering a new user
router.post("/register", registerUser);

module.exports = router;
