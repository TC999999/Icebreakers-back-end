const GroupConversations = require("../models/groupConversations");
const GroupRequests = require("../models/groupRequests");
const Interests = require("../models/interests");
const User = require("../models/users");

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

const getAllGroupNames = async (req, res, next) => {
  try {
    const groups = await GroupConversations.getAllGroupNames();
    return res.status(200).send({ groups });
  } catch (err) {
    return next(err);
  }
};

const searchGroups = async (req, res, next) => {
  try {
    const { title, host, user, similarInterests, newGroups } = req.query;

    const username = req.session.user.username;

    const interests = await User.getSingleUserInterests(
      username,
      similarInterests
    );

    const groups = await GroupConversations.searchGroups(
      username,
      title,
      host,
      user,
      interests,
      newGroups
    );
    return res.status(200).send({ groups });
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
    const { getSimple } = req.query;
    if (getSimple === "true") {
      const group = await GroupConversations.getSimpleGroupInfo(id);
      return res.status(200).send({ group });
    } else {
      const isInGroup = await GroupConversations.checkGroup(
        req.session.user.username,
        id
      );
      const requestPending = await GroupRequests.checkRequest(
        id,
        req.session.user.username
      );
      const group = await GroupConversations.getGroupInfo(id);
      return res.status(200).send({ group, isInGroup, requestPending });
    }
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

const getSimpleGroupInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await GroupConversations.getSimpleGroupInfo(id);
    return res.status(200).send({ group });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createNewConversation,
  getAllGroupNames,
  getAllGroups,
  createNewMessage,
  getGroup,
  searchGroups,
  getSimpleGroupInfo,
};
