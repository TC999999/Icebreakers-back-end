const DirectConversations = require("../models/directConversations");

const makeRequest = async (req, res, next) => {
  try {
    const { requestedUser, requesterUser, content } = req.body;
    const { request, unansweredRequests } =
      await DirectConversations.makeRequest(
        requestedUser,
        requesterUser,
        content
      );
    return res.status(201).send({ request, unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const removeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { unansweredRequests } = await DirectConversations.removeRequest(id);
    return res.status(200).send({ unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const resendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resentRequest, unansweredRequests } =
      await DirectConversations.resendRequest(id);
    return res.status(200).send({ resentRequest, unansweredRequests });
  } catch (err) {
    return next(err);
  }
};

const getDirectMessageRequests = async (req, res, next) => {
  try {
    const { username } = req.params;
    const requests = await DirectConversations.getDirectMessageRequests(
      username
    );
    return res.status(200).send({ requests });
  } catch (err) {
    return next(err);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { id, requesterUser, requestedUser, accepted } = req.body;

    const { unansweredRequests } = await DirectConversations.respondToRequest(
      id,
      requestedUser,
      requesterUser
    );

    req.session.user.unansweredRequests = unansweredRequests.unansweredRequests;

    if (accepted) {
      const conversation = await DirectConversations.createNewConversation(
        requestedUser,
        requesterUser
      );
      return res.status(201).send({
        requestResponse: {
          conversation,
          requestID: id,
          unansweredRequests: unansweredRequests.unansweredRequests,
        },
      });
    } else {
      return res.status(201).send({
        requestResponse: {
          message: "Request not accepted",
          requestID: id,
          unansweredRequests: unansweredRequests.unansweredRequests,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
};

const getAllConversations = async (req, res, next) => {
  try {
    const { username } = req.params;
    const conversations = await DirectConversations.getAllConversations(
      username
    );
    return res.status(200).send({ conversations });
  } catch (err) {
    return next(err);
  }
};

const createNewMessage = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    const { content } = req.body;
    const { message, otherUser } = await DirectConversations.createNewMessage(
      content,
      username,
      id
    );
    return res.status(201).send({ message, otherUser });
  } catch (err) {
    return next(err);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await DirectConversations.getMessages(id);
    return res.status(200).send({ messages });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  respondToRequest,
  createNewMessage,
  removeRequest,
  resendRequest,
  getDirectMessageRequests,
  getAllConversations,
  getConversationMessages,
  makeRequest,
};
