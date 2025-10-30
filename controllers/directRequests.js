const DirectRequests = require("../models/directRequests");
const DirectConversations = require("../models/directConversations");

const makeRequest = async (req, res, next) => {
  try {
    const { to, from, content } = req.body;
    const request = await DirectRequests.makeRequest(to, from, content);
    // const { unansweredRequests } =
    //   await DirectRequests.getUnansweredRequestCount(requestedUser);
    return res.status(201).send({ request });
  } catch (err) {
    return next(err);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { id, to, from, accepted } = req.body;

    await DirectRequests.respondToRequest(id, to, from);

    if (accepted) {
      const conversation = await DirectConversations.createNewConversation(
        to,
        from
      );
      return res.status(201).send({
        requestResponse: {
          conversation,
          requestID: id,
        },
      });
    } else {
      return res.status(201).send({
        requestResponse: {
          message: "Request not accepted",
          requestID: id,
        },
      });
    }
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
    const { remove } = req.body;
    const request = await DirectRequests.removeRequest(remove, id);

    return res.status(200).send({ request });
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
  getDirectMessageRequests,
  makeRequest,
  respondToRequest,
};
