const express = require("express");
const {
  createNewConversation,
  createNewMessage,
  getConversationMessages,
  makeRequest,
  getDirectMessageRequests,
} = require("../controllers/directConversations");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
} = require("../middleware/auth");

const router = express.Router();

// router.post("/new", ensureLoggedIn, createNewConversation);
router.post("/request", ensureCorrectUserForRequest, makeRequest);

router.get("/request/:username", ensureCorrectUser, getDirectMessageRequests);

router.post("/response", ensureCorrectUserForReponse, createNewConversation);

router.post(
  "/:direct_conversation_id/newMessage",
  ensureLoggedIn,
  createNewMessage
);

router.get(
  "/:direct_conversation_id/messages",
  ensureLoggedIn,
  getConversationMessages
);

module.exports = router;
