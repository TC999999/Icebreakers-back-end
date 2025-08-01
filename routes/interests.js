const express = require("express");
const { getInitialInterests } = require("../controllers/interests");

const router = express.Router();

//route for getting initial interests before registration
router.get("/initial", getInitialInterests);

module.exports = router;
