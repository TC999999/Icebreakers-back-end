const DirectConversations = require("../models/directConversations");

// retrieves a list of all direct conversations that belong to a single user and returns them to the
// client-side
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

// retrieves the direct conversation id that two users share (may or may not exist) and returns them to the client-side
const getConversationID = async (req, res, next) => {
  try {
    const { username, otherUser } = req.params;
    const directConversation = await DirectConversations.getConversationID(
      username,
      otherUser
    );
    return res.status(200).send(directConversation);
  } catch (err) {
    return next(err);
  }
};

// creates a new message made by single user that belongs to a single direct conversation and returns it
// to the client-side; throws error if conversation does not exist or user is not involved in conversation
const createNewMessage = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    await DirectConversations.conversationExists(id);
    await DirectConversations.userConversationCheck(id, username);
    const { content } = req.body;
    const { message, otherUser } = await DirectConversations.createNewMessage(
      content,
      username,
      id
    );
    await DirectConversations.updateUnreadMessages(id, otherUser.username);
    return res.status(201).send({ message });
  } catch (err) {
    return next(err);
  }
};

// retrieves a list of all messages that belong to a single direct conversation that the current user
// is a part of as well as the other user in the conversation and returns it to the client-side;
// additionally, if the user has unread messages, then the count is cleared for that conversation alone;
// throws error if conversation does not exist or user is not involved in conversation
const getConversationMessages = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    await DirectConversations.conversationExists(id);
    await DirectConversations.userConversationCheck(id, username);

    const messages = await DirectConversations.getMessages(id);
    const conversationData = await DirectConversations.getOtherConversationUser(
      id,
      username
    );
    const { unreadMessages } = await DirectConversations.getUnreadMessages(
      id,
      username
    );

    if (unreadMessages > 0) {
      await DirectConversations.clearUnreadMessages(id, username);
    }
    return res.status(200).send({ messages, conversationData, unreadMessages });
  } catch (err) {
    return next(err);
  }
};

// updates a direct conversation title that the current user is a part of and returns the updated
// conversation data to the client-side; throws error if conversation does not exist or user is
// not involved in conversation
const editConversation = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    await DirectConversations.conversationExists(id);
    await DirectConversations.userConversationCheck(id, username);
    const { title } = req.body;
    const updatedConversation = await DirectConversations.editConversation(
      id,
      title
    );
    return res.status(200).send({ updatedConversation });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getConversationID,
  createNewMessage,
  getAllConversations,
  getConversationMessages,
  editConversation,
};
