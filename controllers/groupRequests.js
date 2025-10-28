const GroupRequests = require("../models/groupRequests");

const createInvitation = async (req, res, next) => {
  try {
    const { from, to, content, group } = req.body;

    const invitation = await GroupConversations.createInvitation(
      from,
      to,
      content,
      group
    );
    return res.status(201).send({ invitation });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createInvitation };
