const DirectRequests = require("../models/directRequests");

const makeRequest = async (req, res, next) => {
  try {
    const { requestedUser, requesterUser, content } = req.body;
    const request = await DirectRequests.makeRequest(
      requestedUser,
      requesterUser,
      content
    );
    const { unansweredRequests } =
      await DirectRequests.getUnansweredRequestCount(requestedUser);
    return res.status(201).send({ request, unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const checkConversationExists = async (req, res, next) => {
  try {
    const { username, username2 } = req.params;
    const conversationExists = await DirectRequests.checkConversationExists(
      username,
      username2
    );
    return res.status(200).send({ conversationExists });
  } catch (err) {
    return next(err);
  }
};

const removeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestedUser } = await DirectRequests.removeRequest(id);
    const { unansweredRequests } =
      await DirectRequests.getUnansweredRequestCount(requestedUser);
    return res.status(200).send({ unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const resendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestedUser } = await DirectRequests.resendRequest(id);
    const { unansweredRequests } =
      await DirectRequests.getUnansweredRequestCount(requestedUser);
    return res.status(200).send({ resentRequest, unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const getDirectMessageRequests = async (req, res, next) => {
  try {
    const { username } = req.params;
    const requests = await DirectRequests.getDirectMessageRequests(username);
    return res.status(200).send({ requests });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  checkConversationExists,
  removeRequest,
  resendRequest,
  getDirectMessageRequests,
  makeRequest,
};
