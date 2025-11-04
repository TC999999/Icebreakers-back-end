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

const constructGroupSearchString = (
  title = "",
  host = "",
  user = "",
  interests = []
) => {
  let filterString = "";
  let values = [];
  let count = 1;

  if (title || host || user || interests.length) {
    filterString += "WHERE ";
  }

  if (title) {
    filterString += `gc.title ILIKE $${count} `;
    values = [...values, title];
    count += 1;
  }

  if (title && (host || user || interests.length)) {
    filterString += "AND ";
  }

  if (host) {
    filterString += `gc.host_user ILIKE $${count} `;
    values = [...values, host];
    count += 1;
  }

  if (host && (user || interests.length)) {
    filterString += "AND ";
  }

  if (user) {
    filterString += `ugc.username ILIKE $${count} `;
    values = [...values, user];
    count += 1;
  }

  if (user && interests.length) {
    filterString += "AND ";
  }

  if (interests.length) {
    let iS = interests.reduce((acc, cv, i) => {
      if (i === interests.length - 1) {
        return (acc += "igc.topic_id=" + `$${i + count}`);
      } else {
        return (acc += "igc.topic_id=" + `$${i + count}` + " OR ");
      }
    }, "");

    filterString += "(" + iS + ") ";
    values = [...values, ...interests];
  }

  return { filterString, values };
};

module.exports = { constructGroupSearchString, constructSearchString };
