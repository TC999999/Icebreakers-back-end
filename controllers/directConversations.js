const DirectConversations = require("../models/directConversations");

const createNewConversation = async (req, res, next) => {
  try {
    const { title, user_1, user_2 } = req.body;
    const conversation = await DirectConversations.createNewConversation({
      title,
      user_1,
      user_2,
    });
    return res.status(201).send({ conversation });
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
  getConversationMessages,
};
