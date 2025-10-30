const db = require("../db");
const constructRequestString = require("../helpers/constructRequestString");

class AllRequests {
  static async getAllRequests(username, params) {
    const res = await db.query(constructRequestString(params), [username]);

    return res.rows;
  }

  static async getAllRequestCount(username) {
    // direct requests
    const receivedDirectRequestCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            direct_conversation_requests 
        WHERE 
            requested_user=$1
        AND
            is_removed=false`,
      [username]
    );

    const sentDirectRequestCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            direct_conversation_requests 
        WHERE 
            requester_user=$1 
        AND 
            is_removed=false`,
      [username]
    );

    const removedDirectRequestCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            direct_conversation_requests 
        WHERE 
            requester_user=$1 
        AND 
            is_removed=true`,
      [username]
    );

    // group invitations
    const receivedGroupInvitationCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            group_conversation_invitations 
        WHERE 
            invited_user=$1 
        AND 
            is_removed=false`,
      [username]
    );

    const sentGroupInvitationCountRes = await db.query(
      `SELECT 
              COUNT(*)
          FROM 
              group_conversation_invitations 
          WHERE 
              inviter_user=$1 
          AND 
              is_removed=false`,
      [username]
    );

    const removedGroupInvitationCountRes = await db.query(
      `SELECT 
              COUNT(*) 
          FROM 
              group_conversation_invitations 
          WHERE 
              inviter_user=$1 
          AND 
              is_removed=true`,
      [username]
    );

    // group requests
    const receivedGroupRequestCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            group_conversation_requests AS r 
        JOIN 
            group_conversations AS g 
        ON 
            r.group_conversation_id=g.id 
        WHERE 
            g.host_user=$1 
        AND 
            r.is_removed=false`,
      [username]
    );

    const sentGroupRequestCountRes = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            group_conversation_requests
        WHERE 
            requester_user=$1 
        AND 
            is_removed=false`,
      [username]
    );

    const removedGroupRequestCountRes = await db.query(
      `SELECT 
            COUNT(*) 
        FROM 
            group_conversation_requests
        WHERE 
            requester_user=$1 
        AND 
            is_removed=true`,
      [username]
    );

    return {
      receivedDirectRequestCount: parseFloat(
        receivedDirectRequestCountRes.rows[0].count
      ),
      sentDirectRequestCount: parseFloat(
        sentDirectRequestCountRes.rows[0].count
      ),
      removedDirectRequestCount: parseFloat(
        removedDirectRequestCountRes.rows[0].count
      ),

      receivedGroupInvitationCount: parseFloat(
        receivedGroupInvitationCountRes.rows[0].count
      ),
      sentGroupInvitationCount: parseFloat(
        sentGroupInvitationCountRes.rows[0].count
      ),
      removedGroupInvitationCount: parseFloat(
        removedGroupInvitationCountRes.rows[0].count
      ),

      receivedGroupRequestCount: parseFloat(
        receivedGroupRequestCountRes.rows[0].count
      ),
      sentGroupRequestCount: parseFloat(sentGroupRequestCountRes.rows[0].count),
      removedGroupRequestCount: parseFloat(
        removedGroupRequestCountRes.rows[0].count
      ),
    };
  }

  static async getUnansweredRequestCount(username) {
    const unansweredDirectRequests = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            direct_conversation_requests 
        WHERE 
            requested_user=$1
        AND
            is_removed=false`,
      [username]
    );

    const unansweredGroupRequests = await db.query(
      `SELECT 
            COUNT(*)
        FROM 
            group_conversation_requests AS r
        JOIN
            group_conversations AS gc
        ON
            r.group_conversation_id=gc.id
        WHERE 
            gc.host_user=$1
        AND
            is_removed=false`,
      [username]
    );

    const unansweredGroupInvitations = await db.query(
      `SELECT 
              COUNT(*)
          FROM 
              group_conversation_invitations
          WHERE 
              invited_user=$1
          AND
              is_removed=false`,
      [username]
    );

    const unansweredRequests =
      parseFloat(unansweredDirectRequests.rows[0].count) +
      parseFloat(unansweredGroupRequests.rows[0].count) +
      parseFloat(unansweredGroupInvitations.rows[0].count);

    return { unansweredRequests };
  }
}

module.exports = AllRequests;
