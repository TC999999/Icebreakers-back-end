const Interests = require("../models/interests");

const getInitialInterests = async (req, res, next) => {
  try {
    const interests = await Interests.getInterests();
    return res.status(200).send({ interests });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getInitialInterests };
