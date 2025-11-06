const tableAsMap = new Map([
  [
    "receivedDirectRequestCount",
    {
      userCol: "requested_user",
      isRemoved: false,
      table: "direct_conversation_requests",
    },
  ],
  [
    "sentDirectRequestCount",
    {
      userCol: "requester_user",
      isRemoved: false,
      table: "direct_conversation_requests",
    },
  ],
  [
    "removedDirectRequestCount",
    {
      userCol: "requester_user",
      isRemoved: true,
      table: "direct_conversation_requests",
    },
  ],

  [
    "receivedGroupInvitationCount",
    {
      userCol: "invited_user",
      isRemoved: false,
      table: "group_conversation_invitations",
    },
  ],
  [
    "sentGroupInvitationCount",
    {
      userCol: "inviter_user",
      isRemoved: false,
      table: "group_conversation_invitations",
    },
  ],
  [
    "removedGroupInvitationCount",
    {
      userCol: "inviter_user",
      isRemoved: true,
      table: "group_conversation_invitations",
    },
  ],

  [
    "receivedGroupRequestCount",
    {
      userCol: "g.host_user",
      isRemoved: false,
      table: "group_conversation_requests AS r",
      join: "JOIN group_conversations AS g ON r.group_conversation_id=g.id",
    },
  ],
  [
    "sentGroupRequestCount",
    {
      userCol: "requester_user",
      isRemoved: false,
      table: "group_conversation_requests",
    },
  ],
  [
    "removedGroupRequestCount",
    {
      userCol: "requester_user",
      isRemoved: true,
      table: "group_conversation_requests",
    },
  ],
]);

const returnCountString = (queryFor, as = true) => {
  return `
    (SELECT 
        COUNT(*) 
    FROM 
        ${tableAsMap.get(queryFor).table} 
        ${tableAsMap.get(queryFor).join || ""}
    WHERE 
        ${tableAsMap.get(queryFor).userCol}=$1 
    AND 
        is_removed=${tableAsMap.get(queryFor).isRemoved})${
    as ? `AS "${queryFor}"` : ""
  }`;
};

module.exports = returnCountString;
