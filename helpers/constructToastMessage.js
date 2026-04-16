const messageTemplate = require("./requestTypeMap");

// construct message to send to the client-side that will appear in toast notification message
const constructToastMessageRequest = (
  username,
  content,
  requestType = "",
  key = "",
) => {
  let returnString = username + messageTemplate.get(requestType)[key].message;

  if (content.groupTitle) returnString += " " + content.groupTitle;

  return returnString;
};

const constructToastMessageEditConversation = (username, newTitle) => {
  return newTitle
    ? `${username} has updated your personal chatroom title to ${newTitle}.`
    : `${username} has removed the title from your personal chat room.`;
};

module.exports = {
  constructToastMessageRequest,
  constructToastMessageEditConversation,
};
