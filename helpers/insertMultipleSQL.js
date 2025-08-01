const insertMultipleSQL = (username, topicIDArr) => {
  let returnStr = "";

  for (i = 0; i < topicIDArr.length - 1; i++) {
    returnStr += `(${topicIDArr[i]}, '${username}'), `;
  }

  returnStr += `(${topicIDArr[topicIDArr.length - 1]}, '${username}')`;

  return returnStr;
};

module.exports = insertMultipleSQL;
