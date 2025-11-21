const express = require("express");
const {
  getInitialInterests,
  getInterestsAsMap,
} = require("../controllers/interests");

const router = express.Router();

//route for getting initial interests before registration
router.get("/initial", getInitialInterests);

//route for getting initial interests before group creation
router.get("/map", getInterestsAsMap);

module.exports = router;
