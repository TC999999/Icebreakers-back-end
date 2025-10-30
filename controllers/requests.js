const AllRequests = require("../models/requests");

const getAllRequestCount = async (req, res, next) => {
  try {
    const { username } = req.params;

    const count = await AllRequests.getAllRequestCount(username);

    return res.status(200).send(count);
  } catch (err) {
    return next(err);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const { username } = req.params;
    const params = req.query;

    const requests = await AllRequests.getAllRequests(username, params);

    return res.status(200).send({ requests });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAllRequestCount, getAllRequests };
