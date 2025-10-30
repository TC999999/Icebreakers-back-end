const DirectConversations = require("../models/directConversations");

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
