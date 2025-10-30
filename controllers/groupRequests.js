const GroupRequests = require("../models/groupRequests");

const createInvitation = async (req, res, next) => {
  try {
    const { from, to, content, group } = req.body;

    const invitation = await GroupRequests.createInvitation(
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

const removeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remove } = req.body;
    const invitation = await GroupRequests.removeInvitation(remove, id);
    return res.status(200).send({ invitation });
  } catch (err) {
    return next(err);
  }
};

const createRequest = async (req, res, next) => {
  try {
  } catch (err) {
    return next(err);
  }
};

module.exports = { createInvitation, removeInvitation };
