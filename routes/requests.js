const express = require("express");
const {
  getAllRequests,
  getAllRequestCount,
} = require("../controllers/requests");
const {
  removeRequest,
  makeRequest,
  respondToRequest,
} = require("../controllers/directRequests");
const {
  createInvitation,
  removeInvitation,
  respondToInvitation,
  createGroupRequest,
  removeGroupRequest,
  respondToGroupRequest,
} = require("../controllers/groupRequests");
const {
  ensureCorrectUser,
  ensureCorrectUserForRequest,
  ensureCorrectUserForReponse,
  ensureLoggedIn,
} = require("../middleware/auth");

const router = express.Router();

// general requests
router.get("/:username", ensureCorrectUser, getAllRequests);

router.get("/count/:username", ensureCorrectUser, getAllRequestCount);

// direct conversation requests and responses
router.post("/direct", ensureCorrectUserForRequest, makeRequest);

router.post(
  "/direct/check/:username/with/:username2",
  ensureCorrectUserForRequest,
  makeRequest
);

router.patch("/direct/update/:id", ensureLoggedIn, removeRequest);

router.post("/direct/response", ensureCorrectUserForReponse, respondToRequest);

// group conversation requests
router.post("/group/:id", ensureLoggedIn, createGroupRequest);

router.patch("/group/update/:id", ensureLoggedIn, removeGroupRequest);

router.post("/group/new/response", ensureLoggedIn, respondToGroupRequest);

// group conversation invitations
router.post("/group/invitation/:username", ensureCorrectUser, createInvitation);

router.patch("/group/invitation/update/:id", ensureLoggedIn, removeInvitation);

router.post(
  "/group/invitation/new/response",
  ensureCorrectUserForReponse,
  respondToInvitation
);

module.exports = router;
