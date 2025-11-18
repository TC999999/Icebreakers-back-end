const express = require("express");
const {
  createNewMessage,
  getAllConversations,
  getConversationMessages,
  editConversation,
} = require("../controllers/directConversations");
const { ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

router.get("/:username/conversation", ensureCorrectUser, getAllConversations);

router.post(
  "/:username/conversation/:id/message",
  ensureCorrectUser,
  createNewMessage
);

router.get(
  "/:username/conversation/:id/message",
  ensureCorrectUser,
  getConversationMessages
);

router.patch(
  "/:username/conversation/:id",
  ensureCorrectUser,
  editConversation
);

module.exports = router;
