const messageTemplate = require("./requestTypeMap");

const constructToastRequestMessage = (username, content, requestType, key) => {
  let returnString = username + messageTemplate.get(requestType)[key].message;

  if (content.groupTitle) returnString += " " + content.groupTitle;

  return returnString;
};

const constructToastMessage = (
  username,
  content,
  requestType = "",
  key = ""
) => {
  return constructToastRequestMessage(username, content, requestType, key);
};

module.exports = constructToastMessage;
