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

// creates a new message made by single user that belongs to a single direct conversation and returns it
// to the client-side
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
    return res.status(201).send({ message });
  } catch (err) {
    return next(err);
  }
};

// retrieves a list of all messages that belong to a single direct conversation that the current user
// is a part of as well as the other user in the conversation and returns it to the client-side;
// additionally, if the user has unread messages, then the count is cleared for that conversation alone
const getConversationMessages = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    const { unreadMessages } = req.query;
    const messages = await DirectConversations.getMessages(id);
    const conversationData = await DirectConversations.getOtherConversationUser(
      id,
      username
    );
    if (unreadMessages > 0) {
      await DirectConversations.clearUnreadMessages(id, username);
    }
    return res.status(200).send({ messages, conversationData });
  } catch (err) {
    return next(err);
  }
};

// updates a direct conversation title that the current user is a part of and returns the updated conversation
// data to the client-side
const editConversation = async (req, res, next) => {
  try {
    const { username, id } = req.params;
    const { title } = req.body;
    const updatedConversation = await DirectConversations.editConversation(
      username,
      id,
      title
    );
    return res.status(200).send({ updatedConversation });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createNewMessage,
  getAllConversations,
  getConversationMessages,
  editConversation,
};
