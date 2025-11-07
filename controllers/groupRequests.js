const { ForbiddenError } = require("../expressError");
const GroupConversations = require("../models/groupConversations");
const GroupRequests = require("../models/groupRequests");

const createInvitation = async (req, res, next) => {
  try {
    const { from, to, content, group } = req.body;
    await GroupRequests.checkGroup(group, to);

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

const removeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remove } = req.body;
    const invitation = await GroupRequests.removeInvitation(remove, id);
    return res.status(200).send({ invitation });
  } catch (err) {
    return next(err);
  }
};

const respondToInvitation = async (req, res, next) => {
  try {
    const { id, to, from, groupID, accepted } = req.body;

    await GroupRequests.respondToInvitation(id, to, from, groupID);
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

const createGroupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const username = req.session.user.username;
    const { content } = req.body;

    await GroupRequests.checkGroup(id, username);

    if (await GroupRequests.checkRequest(id, username))
      throw new ForbiddenError(`${username} request is already pending`);

    const request = await GroupRequests.createRequest(username, content, id);

    return res.status(201).send({ request });
  } catch (err) {
    return next(err);
  }
};

const removeGroupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remove } = req.body;
    const request = await GroupRequests.removeRequest(remove, id);
    return res.status(200).send({ request });
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
};
