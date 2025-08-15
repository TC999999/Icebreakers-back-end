const express = require("express");
const {
  createNewConversation,
  createNewMessage,
  getConversationMessages,
} = require("../controllers/directConversations");

const router = express.Router();

router.post("/new", createNewConversation);

router.post("/:direct_conversation_id/newMessage", createNewMessage);

router.get("/:direct_conversation_id/messages", getConversationMessages);

module.exports = router;
