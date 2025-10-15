const DirectConversations = require("../models/directConversations");
const DirectRequests = require("../models/directRequests");

const respondToRequest = async (req, res, next) => {
  try {
    const { id, requesterUser, requestedUser, accepted } = req.body;

    await DirectRequests.respondToRequest(id, requestedUser, requesterUser);

    const { unansweredRequests } =
      await DirectRequests.getUnansweredRequestCount(requestedUser);

    req.session.user.unansweredRequests = unansweredRequests;

    if (accepted) {
      const conversation = await DirectConversations.createNewConversation(
        requestedUser,
        requesterUser
      );
      return res.status(201).send({
        requestResponse: {
          conversation,
          requestID: id,
          unansweredRequests: unansweredRequests,
        },
      });
    } else {
      return res.status(201).send({
        requestResponse: {
          message: "Request not accepted",
          requestID: id,
          unansweredRequests: unansweredRequests,
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
    await DirectConversations.updateUnreadMessages(id, otherUser.username);
    return res.status(201).send({ message, otherUser });
  } catch (err) {
    return next(err);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    const { unreadMessages } = req.query;
    const messages = await DirectConversations.getMessages(id);

    if (unreadMessages > 0) {
      await DirectConversations.clearUnreadMessages(id, username);
      req.session.user.unreadMessages -= unreadMessages;
    }
    return res.status(200).send({ messages });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  respondToRequest,
  createNewMessage,
  getAllConversations,
  getConversationMessages,
};
