//Selectors
// map of selectors for direct requests
const directSelectorMap = new Map([
  ["sent", `requested_user AS "to"`],
  ["removed", `requested_user AS "to"`],
  ["received", `requester_user AS "from"`],
]);

// map of selectors for group invitations
const groupInvitationsSelectorMap = new Map([
  ["sent", `i.invited_user AS "to"`],
  ["removed", `i.invited_user AS "to"`],
  ["received", `i.inviter_user AS "from"`],
]);

// map of selectors for group requests
const groupRequestsSelectorMap = new Map([
  ["sent", `gc.host_user AS "to"`],
  ["removed", `gc.host_user AS "to"`],
  ["received", `r.requester_user AS "from"`],
]);

//Parameters
// map of username params for direct requests
const directUsernameParams = new Map([
  ["sent", "requester_user=$1"],
  ["removed", "requester_user=$1"],
  ["received", "requested_user=$1"],
]);

// map of username params for group invitations
const groupInvitationsUsernameParams = new Map([
  ["sent", "i.inviter_user=$1"],
  ["removed", "i.inviter_user=$1"],
  ["received", "i.invited_user=$1"],
]);

// map of username params for group requests
const groupRequestsUsernameParams = new Map([
  ["sent", "r.requester_user=$1"],
  ["removed", "r.requester_user=$1"],
  ["received", "gc.host_user=$1"],
]);

// get selectors for either group invitations or requests
const getGroupSelectors = (requestOrInvitation, type) => {
  const as = requestOrInvitation === "invitations" ? "i" : "r";
  let selectors = `${as}.id, ${as}.content, ${as}.created_at AS "createdAt", `;
  let otherUser = "";

  switch (requestOrInvitation) {
    case "requests":
      otherUser = groupRequestsSelectorMap.get(type);
      break;

    case "invitations":
      otherUser = groupInvitationsSelectorMap.get(type);
      break;
  }

  return selectors + otherUser;
};

// get selectors and labels
const getSelectors = (params) => {
  switch (params.directOrGroup) {
    case "direct":
      return (
        'id, content, created_at AS "createdAt", ' +
        directSelectorMap.get(params.type)
      );

    case "group":
      return (
        'gc.title AS "groupTitle", gc.id AS "groupID", ' +
        getGroupSelectors(params.requestOrInvitation, params.type)
      );
  }
};

//constructs correct join statement for query string
const getJoinStatement = (params) => {
  let joinStatement = "";

  if (params.directOrGroup === "group") {
    joinStatement = `JOIN group_conversations AS gc ON gc.id=${
      params.requestOrInvitation === "invitations" ? "i" : "r"
    }.group_conversation_id`;
  }

  return joinStatement;
};

// get the name of the table to retrieve data from
const getTableName = (params) => {
  let asName = "";
  if (params.directOrGroup === "group") {
    switch (params.requestOrInvitation) {
      case "requests":
        asName = " AS r ";
        break;
      case "invitations":
        asName = " AS i ";
        break;
    }
  }

  let initialString =
    params.directOrGroup + "_conversation_" + params.requestOrInvitation;
  return initialString + asName + getJoinStatement(params);
};

// get correct username paramter for group requests or invitation
const getGroupUsernameParams = (requestOrInvitation, type) => {
  switch (requestOrInvitation) {
    case "requests":
      return groupRequestsUsernameParams.get(type);

    case "invitations":
      return groupInvitationsUsernameParams.get(type);
  }
};

// get parameters for query string
const getParams = (params) => {
  let usernameParam;
  let isRemoved = "is_removed";

  switch (params.directOrGroup) {
    case "direct":
      usernameParam = directUsernameParams.get(params.type);
      break;

    case "group":
      usernameParam = getGroupUsernameParams(
        params.requestOrInvitation,
        params.type
      );
      isRemoved =
        (params.requestOrInvitation === "invitations" ? "i." : "r.") +
        isRemoved;
      break;
  }

  return `WHERE ${usernameParam} AND ${isRemoved}=${params.type === "removed"}`;
};

const constructSearchString = (params) => {
  const selectors = getSelectors(params);
  const table = getTableName(params);

  const inlineParams = getParams(params);

  return `SELECT ${selectors} FROM ${table} ${inlineParams}`;
};

module.exports = constructSearchString;
