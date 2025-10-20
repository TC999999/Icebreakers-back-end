const express = require("express");
const {
  respondToRequest,
  createNewMessage,
  getAllConversations,
  getConversationMessages,
  editConversation,
} = require("../controllers/directConversations");
const {
  checkConversationExists,
  removeRequest,
  resendRequest,
  getDirectMessageRequests,
  makeRequest,
} = require("../controllers/directRequests");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  checkRequestAuth,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
} = require("../middleware/auth");

const router = express.Router();

router.post("/request", ensureCorrectUserForRequest, makeRequest);

router.post(
  "/request/check/:username/with/:username2",
  ensureCorrectUserForRequest,
  makeRequest
);

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

router.patch(
  "/:username/conversation/:id",
  ensureCorrectUser,
  editConversation
);

module.exports = router;
