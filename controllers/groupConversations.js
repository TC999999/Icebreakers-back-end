const GroupConversations = require("../models/groupConversations");
const Interests = require("../models/interests");

const createNewConversation = async (req, res, next) => {
  try {
    const { title, host, description, interests } = req.body;
    const conversation = await GroupConversations.createNewConversation(
      title,
      host,
      description
    );

    await GroupConversations.addNewUser(
      req.session.user.username,
      conversation.id
    );

    const newInterests = await Interests.addInterestsForGroup(
      conversation.id,
      interests
    );

    return res.status(201).send({ conversation, newInterests });
  } catch (err) {
    return next(err);
  }
};

const getAllGroups = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { getSingle } = req.query;
    let groups;

    if (getSingle) {
      groups = await GroupConversations.getAllGroupsSingleList(username);
    } else {
      groups = await GroupConversations.getAllGroups(username);
    }

    return res.status(200).send({ groups });
  } catch (err) {
    return next(err);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isInGroup = await GroupConversations.checkGroup(
      req.session.user.username,
      id
    );
    const group = await GroupConversations.getGroupInfo(id);
    return res.status(200).send({ group, isInGroup });
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

module.exports = {
  createNewConversation,
  getAllGroups,
  createNewMessage,
  getGroup,
};
