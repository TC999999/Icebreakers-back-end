const express = require("express");
const {
  createNewConversation,
  getAllGroups,
  getGroup,
  searchGroups,
  getAllGroupNames,
} = require("../controllers/groupConversations");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

router.post("/new", ensureLoggedIn, createNewConversation);

router.get("/getNames", ensureLoggedIn, getAllGroupNames);

router.get("/search", ensureLoggedIn, searchGroups);

router.get("/:username", ensureCorrectUser, getAllGroups);

router.get("/id/:id", ensureLoggedIn, getGroup);

module.exports = router;
