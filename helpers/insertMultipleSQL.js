// constructs the insert values portion of as sql query string used to adds multiple interests
// to users rows
const insertMultipleSQL = (username, topicIDArr) => {
  let returnStr = "";

  for (i = 0; i < topicIDArr.length - 1; i++) {
    returnStr += `(${topicIDArr[i]}, '${username}'), `;
  }

  returnStr += `(${topicIDArr[topicIDArr.length - 1]}, '${username}')`;

  return returnStr;
};

const insertMultipleUsers = (usersArr, group_conversation_id) => {
  let returnStr = "";

  for (i = 0; i < usersArr - 1; i++) {
    returnStr += `(${usersArr[i]},${group_conversation_id})`;
  }

  returnStr += `('${usersArr[usersArr.length - 1]}', ${group_conversation_id})`;
};

module.exports = { insertMultipleSQL, insertMultipleUsers };
