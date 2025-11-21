const DirectRequests = require("../models/directRequests");
const DirectConversations = require("../models/directConversations");

// adds a new request to the direct requests table using data sent from the client-side and then sends the
// new request data back to the client side
const makeRequest = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { to, content } = req.body;
    await DirectRequests.checkRequests(username, to, true);
    await DirectRequests.checkConversationExists(username, to, true);
    const request = await DirectRequests.makeRequest(to, username, content);
    return res.status(201).send({ request });
  } catch (err) {
    return next(err);
  }
};

// updates a direct request so the recipient user is either no longer able to view this request or is
// able to see it again and return the request to the client side; throws an error if user is not involved
// in the request
const removeRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    await DirectRequests.checkUserToDirectRequest(id, username, true);
    const { remove } = req.body;

    const request = await DirectRequests.removeRequest(remove, id);

    return res.status(200).send({ request });
  } catch (err) {
    return next(err);
  }
};

// deletes a direct request; throws an error if user is not involved in the request
const deleteRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    await DirectRequests.checkUserToDirectRequest(id, username, true);
    const { to } = req.body;

    await DirectRequests.deleteRequest(id, to, username);

    return res.status(200).send({ message: "request deleted successfully" });
  } catch (err) {
    return next(err);
  }
};

// deletes the correct direct request from the respective table and if the receiving user accepted the
// request, creates a new direct conversation in the database and returns the new conversation data to
// the client-side; throws an error if user is not involved in the request
const respondToRequest = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    await DirectRequests.checkUserToDirectRequest(id, username);
    const { from, accepted } = req.body;

    await DirectRequests.deleteRequest(id, username, from);

    if (accepted) {
      const conversation = await DirectConversations.createNewConversation(
        username,
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

// checks if two users already have a direct conversation between them; used for profile pages so users
// don't make duplicate requests
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

module.exports = {
  checkConversationExists,
  makeRequest,
  removeRequest,
  deleteRequest,
  respondToRequest,
};
