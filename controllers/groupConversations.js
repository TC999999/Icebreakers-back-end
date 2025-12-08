const GroupConversations = require("../models/groupConversations");
const GroupRequests = require("../models/groupRequests");
const Interests = require("../models/interests");
const User = require("../models/users");

// creates a new group conversation using data sent from the client-side, adds the host user to a many-to-many
// users to groups table, and adds the interest list to the many-to-many interests to groups table, returns
// new group data to client-side
const createNewConversation = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { title, description, interests } = req.body;
    const conversation = await GroupConversations.createNewConversation(
      title,
      username,
      description
    );

    await GroupConversations.addNewUser(username, conversation.id);

    const newInterests = await Interests.addInterestsForGroup(
      conversation.id,
      interests
    );

    return res.status(201).send({ conversation, newInterests });
  } catch (err) {
    return next(err);
  }
};

// returns a list of all group conversation names
const getAllGroupNames = async (req, res, next) => {
  try {
    const groups = await GroupConversations.getAllGroupNames();
    return res.status(200).send({ groups });
  } catch (err) {
    return next(err);
  }
};

// returns a list of filtered group information using data sent from client side, as well retrieving a
// list of the user's interests if there is a similarInterests parameter in the request query
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

// returns all groups that a single user is a part of; returns a either a simpler or more complex list based
// on getSingle query parameter
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

// gets information for a single group from db, if getSimple query paramter is true, sends simpler group info,
// else retrieves more complex group information, including if user is included in group, has sent a request
// to join this group, or and received an invitation to join the group
const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { getSimple } = req.query;

    const username = req.session.user.username;
    if (getSimple === "true") {
      const group = await GroupConversations.getSimpleGroupInfo(id);
      return res.status(200).send({ group });
    } else {
      const isInGroup = await GroupConversations.checkGroup(id, username, true);
      const requestPending = await GroupRequests.checkRequest(id, username);
      const invitationPending = await GroupRequests.checkInvitation(
        id,
        username
      );
      const group = await GroupConversations.getGroupInfo(id);
      return res
        .status(200)
        .send({ group, isInGroup, requestPending, invitationPending });
    }
  } catch (err) {
    return next(err);
  }
};

// retrieves a list of group id, names, and unread message count that a single user is a part of and returns
// it to the client side
const getGroupTabList = async (req, res, next) => {
  try {
    const { username } = req.params;
    const groups = await GroupConversations.getAllGroupTabs(username);
    return res.status(200).send({ groups });
  } catch (err) {
    return next(err);
  }
};

// retrieves a list of users in a single group and a list of messages in a single group and returns
// both to the client side
const getGroupMessageInformation = async (req, res, next) => {
  try {
    const { username, id } = req.params;

    await GroupConversations.checkGroup(id, username, false, false, true);
    const { unreadGroupMessages } = req.query;
    const { title, host } = await GroupConversations.getSimpleGroupInfo(id);
    const users = await GroupConversations.getGroupUsers(id, username);
    const messages = await GroupConversations.getAllGroupMessages(id);

    if (unreadGroupMessages > 0) {
      await GroupConversations.clearUnreadMessages(id, username);
    }
    console.log(host);

    return res.status(200).send({ users, messages, title, host });
  } catch (err) {
    return next(err);
  }
};

// retrives a small amount of data about a single group conversation
const getSimpleGroupInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await GroupConversations.getSimpleGroupInfo(id);
    return res.status(200).send({ group });
  } catch (err) {
    return next(err);
  }
};

// adds a new message to the group conversation message table and returns message to be sent to client side,
// if user is not in group, throws an error
const createGroupMessage = async (req, res, next) => {
  try {
    const { id, username } = req.params;
    await GroupConversations.checkGroup(id, username, false, false, true);
    const { content } = req.body;
    const message = await GroupConversations.createNewMessage(
      content,
      username,
      id
    );

    const users = await GroupConversations.updateUnreadMessages(id, username);

    return res.status(200).send({ message, users });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createNewConversation,
  getAllGroupNames,
  getGroupTabList,
  getAllGroups,
  getGroup,
  searchGroups,
  getSimpleGroupInfo,
  getGroupMessageInformation,
  createGroupMessage,
};
