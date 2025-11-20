const GroupConversations = require("../models/groupConversations");
const GroupRequests = require("../models/groupRequests");

// if recipient user has not already received an invitation, sent a request, or is already a member of
// this group, creates new invitation using data from client side, adds it to the database, and returns it
// to the client-side
const createInvitation = async (req, res, next) => {
  try {
    const { from, to, content, group } = req.body;
    await GroupConversations.checkGroup(group, from, false, true);
    await GroupConversations.checkGroup(group, to);
    await GroupRequests.checkRequest(group, to, true);
    await GroupRequests.checkInvitation(group, to, true);

    const invitation = await GroupRequests.createInvitation(
      from,
      to,
      content,
      group
    );
    return res.status(201).send({ invitation });
  } catch (err) {
    return next(err);
  }
};

// updates a single existing group invitation so that the recipient user can no longer see it
// or is able to see it again and returns the invitation data to the client side
const removeInvitation = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    const { remove } = req.body;
    await GroupRequests.checkUserToGroupInvitation(id, username, true);
    const invitation = await GroupRequests.removeInvitation(remove, id);
    return res.status(200).send({ invitation });
  } catch (err) {
    return next(err);
  }
};

// deletes invitation from database and if the recipient accepted the invitation, adds that user to the
// group and returns user data to client-side
const respondToInvitation = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    const { to, from, groupID, accepted } = req.body;
    await GroupRequests.checkUserToGroupInvitation(id, username);

    await GroupRequests.deleteInvitation(id, to, from, groupID);
    let message = "Invitation was declined";
    let user;

    if (accepted) {
      user = await GroupConversations.addNewUser(to, groupID);
      message = "Invitation was accepted";
    }

    res.status(201).send({ message, user, invitationID: id });
  } catch (err) {
    return next(err);
  }
};

// if the current user not already part of the group of the corresponding id, has not sent a request
// to join, or has not received an invitation to join, adds a new group request to the database and
// returns that data to the client-side
const createGroupRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;

    const { content } = req.body;

    await GroupConversations.checkGroup(id, username);
    await GroupRequests.checkRequest(id, username, true);
    await GroupRequests.checkInvitation(id, username, true);

    const request = await GroupRequests.createRequest(username, content, id);

    return res.status(201).send({ request });
  } catch (err) {
    return next(err);
  }
};

// updates a group request in the database to make it to its recipient can either no longer view it or allow
// them to view it once again, returns request data to client-side
const removeGroupRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    await GroupRequests.checkUserToGroupRequest(id, username);
    const { remove } = req.body;

    const request = await GroupRequests.removeRequest(remove, id);
    return res.status(200).send({ request });
  } catch (err) {
    return next(err);
  }
};

// deletes request from database and if the recipient accepted the request, adds that user to the
// group and returns user data to client-side
const respondToGroupRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    const { from, groupID, accepted } = req.body;
    await GroupRequests.checkHostToGroupRequest(id, groupID, username);
    await GroupRequests.deleteRequest(id, from, groupID);

    if (accepted) {
      let user = await GroupConversations.addNewUser(from, groupID);

      return res.status(200).send({ user, message: "invitation accepted" });
    }
    return res.status(200).send({ message: "invitation declined" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createInvitation,
  removeInvitation,
  respondToInvitation,
  createGroupRequest,
  removeGroupRequest,
  respondToGroupRequest,
};
