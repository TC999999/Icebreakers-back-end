const GroupConversations = require("../models/groupConversations");

const createNewConversation = async (req, res, next) => {
  try {
    const { title, host, users } = req.body;
    const conversation = await GroupConversations.createNewConversation(
      title,
      host
    );
    await GroupConversations.addMultipleUsers(users, conversation.id);

    return res.status(201).send({ conversation });
  } catch (err) {
    return next(err);
  }
};

const createNewMessage = async (req, res, next) => {
  try {
    const { content, username, group_conversation_id } = req.body;
    const message = await GroupConversations.createNewMessage(
      content,
      username,
      group_conversation_id
    );
    return res.status(201).send({ message });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createNewConversation, createNewMessage };
