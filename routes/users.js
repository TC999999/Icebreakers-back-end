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

router.get("/:username", getUserProfile);

router.get("/:username/edit", ensureCorrectUser, getUserForEdit);

router.patch("/:username/edit", ensureCorrectUser, editUser);

router.get("/check/:username", ensureLoggedIn, userCheck);

router.get("/search/get", ensureLoggedIn, getAllUsers);

router.all("/search/all", ensureLoggedIn, searchForUsers);

module.exports = router;
