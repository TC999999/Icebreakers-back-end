const messageTemplate = require("./requestTypeMap");

// construct message to send to the client-side that will appear in toast notification message
const constructToastMessage = (
  username,
  content,
  requestType = "",
  key = ""
) => {
  let returnString = username + messageTemplate.get(requestType)[key].message;

  if (content.groupTitle) returnString += " " + content.groupTitle;

  return returnString;
};

module.exports = constructToastMessage;
