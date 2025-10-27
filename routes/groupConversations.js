const express = require("express");
const {
  createNewConversation,
  getAllGroups,
  getGroup,
} = require("../controllers/groupConversations");

const {
  ensureLoggedIn,
  ensureCorrectUser,
  checkRequestAuth,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
} = require("../middleware/auth");

const router = express.Router();

router.post("/new", ensureLoggedIn, createNewConversation);

router.get("/:username", ensureCorrectUser, getAllGroups);

router.get("/id/:id", ensureLoggedIn, getGroup);

module.exports = router;
