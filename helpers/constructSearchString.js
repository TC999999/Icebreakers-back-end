// constructs esql query string to return filtered list users based on input parameters
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

// constructs sql query string to return filtered list groups based on input parameters
const constructGroupSearchString = (
  username,
  title = "",
  host = "",
  user = "",
  newGroups = false,
  interests = []
) => {
  let filterString = "";
  let values = [];
  let count = 1;

  if (title || host || user || interests.length || newGroups) {
    filterString += "WHERE ";
  }

  if (title) {
    filterString += `title ILIKE $${count} `;
    values = [...values, title];
    count += 1;
  }

  if (title && (host || user || interests.length || newGroups)) {
    filterString += "AND ";
  }

  if (host) {
    filterString += `host ILIKE $${count} `;
    values = [...values, host];
    count += 1;
  }

  if (host && (user || interests.length || newGroups)) {
    filterString += "AND ";
  }

  if (user) {
    filterString += `users @> $${count} `;
    values = [...values, `[{"username":"${user}"}]`];
    count += 1;
  }

  if (user && (interests.length || newGroups)) {
    filterString += "AND ";
  }

  if (newGroups) {
    filterString += `NOT users @> $${count} `;
    values = [...values, `[{"username":"${username}"}]`];
    count += 1;
  }

  if (newGroups && interests.length) {
    filterString += "AND ";
  }

  if (interests.length) {
    filterString += `interests ?| $${count} `;
    values = [...values, interests];
  }

  return { filterString, values };
};

module.exports = {
  constructGroupSearchString,
  constructSearchString,
};
