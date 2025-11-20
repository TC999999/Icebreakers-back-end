const AllRequests = require("../models/requests");

// returns a map that with request type strings as keys and a total count of that type of request
// for a single user as keys from database
const getAllRequestCount = async (req, res, next) => {
  try {
    const { username } = req.params;

    const count = await AllRequests.getAllRequestCount(username);

    return res.status(200).send(count);
  } catch (err) {
    return next(err);
  }
};

// returns a filtered list of all requests a user has based on the request query params from database
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
