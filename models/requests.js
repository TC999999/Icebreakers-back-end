const db = require("../db");
const constructRequestString = require("../helpers/constructRequestString");

class AllRequests {
  static async getAllRequests(username, params) {
    const res = await db.query(constructRequestString(params), [username]);

    return res.rows;
  }

  static async getAllRequestCount(username) {
    const res = await db.query(
      `
        SELECT 
            (SELECT 
                COUNT(*) 
            FROM 
                direct_conversation_requests 
            WHERE 
                requested_user=$1 AND is_removed=false) AS "receivedDirectRequestCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                direct_conversation_requests 
            WHERE 
                requester_user=$1 AND is_removed=false) AS "sentDirectRequestCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                direct_conversation_requests 
            WHERE 
                requester_user=$1 AND is_removed=true) AS "removedDirectRequestCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_invitations 
            WHERE 
                invited_user=$1 AND is_removed=false) AS "receivedGroupInvitationCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_invitations 
            WHERE 
                inviter_user=$1 AND is_removed=false) AS "sentGroupInvitationCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_invitations 
            WHERE 
                inviter_user=$1 AND is_removed=true) AS "removedGroupInvitationCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_requests AS r 
            JOIN 
                group_conversations AS g 
            ON 
                r.group_conversation_id=g.id 
            WHERE 
                g.host_user=$1 AND r.is_removed=false) AS "receivedGroupRequestCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_requests 
            WHERE 
                requester_user=$1 AND is_removed=false) AS "sentGroupRequestCount", 
            (SELECT 
                COUNT(*) 
            FROM 
                group_conversation_requests 
            WHERE 
                requester_user=$1 AND is_removed=true) AS "removedGroupRequestCount"`,
      [username]
    );

    return Object.keys(res.rows[0]).reduce((acc, c) => {
      acc[c] = parseFloat(res.rows[0][c]);

      return acc;
    }, {});
  }

  static async getUnansweredRequestCount(username) {
    const res = await db.query(
      `
        SELECT 
            (
                (SELECT 
                    COUNT(*) 
                FROM 
                    direct_conversation_requests 
                WHERE 
                    requested_user=$1 AND is_removed=false) 
            + 
                (SELECT 
                    COUNT(*) 
                FROM 
                    group_conversation_requests AS r 
                JOIN 
                    group_conversations AS gc 
                ON 
                    r.group_conversation_id=gc.id 
                WHERE 
                    gc.host_user=$1 AND is_removed=false) 
            + 
                (SELECT 
                    COUNT(*) 
                FROM 
                    group_conversation_invitations 
                WHERE 
                    invited_user=$1 AND is_removed=false)
            ) AS "unansweredRequests"`,
      [username]
    );

    let unansweredRequests = parseFloat(res.rows[0].unansweredRequests);

    return { unansweredRequests };
  }
}

module.exports = AllRequests;
