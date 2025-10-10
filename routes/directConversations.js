const express = require("express");
const {
  respondToRequest,
  createNewMessage,
  getAllConversations,
  getConversationMessages,
  makeRequest,
  removeRequest,
  resendRequest,
  getDirectMessageRequests,
} = require("../controllers/directConversations");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  checkRequestAuth,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
} = require("../middleware/auth");

const router = express.Router();

// router.post("/new", ensureLoggedIn, createNewConversation);
router.post("/request", ensureCorrectUserForRequest, makeRequest);

router.get("/request/:username", ensureCorrectUser, getDirectMessageRequests);

router.patch("/request/remove/:id", removeRequest);

router.patch("/request/resend/:id", checkRequestAuth, resendRequest);

router.post("/response", ensureCorrectUserForReponse, respondToRequest);

router.get("/conversations/:username", ensureCorrectUser, getAllConversations);

router.post(
  "/:username/conversation/:id/message",
  ensureCorrectUser,
  createNewMessage
);

router.get(
  "/:username/conversation/:id/messages",
  ensureCorrectUser,
  getConversationMessages
);

module.exports = router;
