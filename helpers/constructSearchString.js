const constructSearchString = (username = "", interests = []) => {
  let filterString = "";
  let values = [];

  if (username) {
    filterString += "AND users.username ILIKE $2 ";
    values = [...values, username];
  }

  if (interests.length) {
    let indexAcc = username ? 3 : 2;
    let iS = interests.reduce((acc, cv, i) => {
      if (i === interests.length - 1) {
        return (acc += "interests.topic=" + `$${i + indexAcc}`);
      } else {
        return (acc += "interests.topic=" + `$${i + indexAcc}` + " OR ");
      }
    }, "");

    filterString += "AND (" + iS + ") ";
    values = [...values, ...interests];
  }

  return { filterString, values };
};

module.exports = constructSearchString;
