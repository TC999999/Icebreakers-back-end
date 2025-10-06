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

const createNewConversation = async (req, res, next) => {
  try {
    const { direct_request_id, requested_user, accepted } = req.body;
    const response = await DirectConversations.respondToRequest(
      direct_request_id,
      requested_user,
      accepted
    );

    if (response.isAccepted) {
      const conversation = await DirectConversations.createNewConversation({
        title,
        user_1: response.user_1,
        user_2: response.user_2,
      });
      return res.status(201).send({ conversation });
    } else {
      return res.status(201).send({ message: "Request not accepted" });
    }
  } catch (err) {
    return next(err);
  }
};

const createNewMessage = async (req, res, next) => {
  try {
    const { direct_conversation_id } = req.params;
    const { content, username } = req.body;
    const message = await DirectConversations.createNewMessage({
      content,
      username,
      direct_conversation_id,
    });
    return res.status(201).send({ message });
  } catch (err) {
    return next(err);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { direct_conversation_id } = req.params;
    const messages = await DirectConversations.getMessages(
      direct_conversation_id
    );
    return res.status(200).send({ messages });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createNewConversation,
  createNewMessage,
  getDirectMessageRequests,
  getConversationMessages,
  makeRequest,
};
