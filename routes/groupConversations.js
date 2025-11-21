const express = require("express");
const {
  createNewConversation,
  getAllGroups,
  getGroup,
  searchGroups,
  getAllGroupNames,
} = require("../controllers/groupConversations");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

// route for creating a new group conversation hosted by the user in the url params
router.post("/new/:username", ensureLoggedIn, createNewConversation);

// route for getting the names of all rows in the groups table
router.get("/getNames", ensureLoggedIn, getAllGroupNames);

// route for getting a filtered list of groups based on inputted search parameters
router.get("/search", ensureLoggedIn, searchGroups);

// route for getting all rows from the groups table that include the current user
router.get("/:username", ensureCorrectUser, getAllGroups);

// route for getting a single group with the matching id
router.get("/id/:id", ensureLoggedIn, getGroup);

module.exports = router;
