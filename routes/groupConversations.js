const express = require("express");
const {
  createNewConversation,
  getAllGroups,
  getGroup,
} = require("../controllers/groupConversations");
const { createInvitation } = require("../controllers/groupRequests");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

router.post("/new", ensureLoggedIn, createNewConversation);

router.get("/:username", ensureCorrectUser, getAllGroups);

router.get("/id/:id", ensureLoggedIn, getGroup);

router.post("/invitation/:username", ensureCorrectUser, createInvitation);

module.exports = router;
