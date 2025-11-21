const express = require("express");
const {
  getAllRequests,
  getAllRequestCount,
} = require("../controllers/requests");
const {
  removeRequest,
  makeRequest,
  deleteRequest,
  respondToRequest,
} = require("../controllers/directRequests");
const {
  createInvitation,
  removeInvitation,
  deleteGroupInvitation,
  respondToInvitation,
  createGroupRequest,
  removeGroupRequest,
  deleteGroupRequest,
  respondToGroupRequest,
} = require("../controllers/groupRequests");
const { ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

// general requests
router.get("/:username", ensureCorrectUser, getAllRequests);

router.get("/count/:username", ensureCorrectUser, getAllRequestCount);

// direct conversation requests and responses
// route for creating a new direct request
router.post("/direct/new/:username", ensureCorrectUser, makeRequest);

// route for updating an already existing direct request
router.patch("/direct/update/:id/:username", ensureCorrectUser, removeRequest);

// route for deleting an already existing direct request
router.delete("/direct/delete/:id/:username", ensureCorrectUser, deleteRequest);

// route for responding to a received direct request
router.post(
  "/direct/response/:id/:username",
  ensureCorrectUser,
  respondToRequest
);

// group conversation requests
router.post("/group/:id/new/:username", ensureCorrectUser, createGroupRequest);

router.patch(
  "/group/update/:id/:username",
  ensureCorrectUser,
  removeGroupRequest
);

// route for deleting an already existing group request
router.delete(
  "/group/delete/:id/:username",
  ensureCorrectUser,
  deleteGroupRequest
);

router.post(
  "/group/response/:id/:username",
  ensureCorrectUser,
  respondToGroupRequest
);

// group conversation invitations
// route to create new invitation for group with id
router.post(
  "/group/:id/invitation/new/:username",
  ensureCorrectUser,
  createInvitation
);

// route to update existing invitation for group with id
router.patch(
  "/group/invitation/update/:id/:username",
  ensureCorrectUser,
  removeInvitation
);

// route for deleting an already existing group invitation
router.delete(
  "/group/invitation/delete/:id/:username",
  ensureCorrectUser,
  deleteGroupInvitation
);

// route to update existing invitation for group with id
router.post(
  "/group/invitation/response/:id/:username",
  ensureCorrectUser,
  respondToInvitation
);

module.exports = router;
