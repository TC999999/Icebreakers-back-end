const Interests = require("../models/interests");

// returns an array of interest topic titles from the db
const getInitialInterests = async (req, res, next) => {
  try {
    const interests = await Interests.getInterests();
    return res.status(200).send({ interests });
  } catch (err) {
    return next(err);
  }
};

// returns a hash map of interests with ids as keys and titles as values
const getInterestsAsMap = async (req, res, next) => {
  try {
    const interests = await Interests.getInterestsAsMap();
    return res.status(200).send({ interests });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getInitialInterests, getInterestsAsMap };
