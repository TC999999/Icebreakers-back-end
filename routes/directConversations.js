const express = require("express");
const {
  createNewMessage,
  getConversationID,
  getAllConversations,
  getConversationMessages,
  editConversation,
} = require("../controllers/directConversations");
const { ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

// route for getting all direct conversations belonging to a single user
router.get("/:username/conversation", ensureCorrectUser, getAllConversations);

// route for getting the direct conversation id that two users share
router.get(
  "/:username/conversation/:otherUser",
  ensureCorrectUser,
  getConversationID
);

// route for a user adding a single message to a direct conversation they are a part of
router.post(
  "/:username/conversation/:id/message",
  ensureCorrectUser,
  createNewMessage
);

// route for a user getting all messages in a direct conversation they are a part of
router.get(
  "/:username/conversation/:id/message",
  ensureCorrectUser,
  getConversationMessages
);

// route for a user editing a single direct conversation they are a part of
router.patch(
  "/:username/conversation/:id",
  ensureCorrectUser,
  editConversation
);

module.exports = router;
