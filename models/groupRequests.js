const db = require("../db");
const { UnauthorizedError } = require("../expressError");

class GroupRequests {
  static async createInvitation(from, to, content, group) {
    const res = await db.query(
      `
      INSERT INTO 
        group_conversation_invitations 
          (inviter_user, 
          invited_user, 
          content,
          group_conversation_id) 
      VALUES 
        ($1, $2, $3, $4) 
      RETURNING
        id,
        invited_user AS "to",
        inviter_user AS "from",
        content,
        group_conversation_id AS "group",
        is_approved AS "isApproved",
        created_at AS "createdAt"
        `,
      [from, to, content, group]
    );

    return res.rows[0];
  }

  static async getReceivedInvitations(username) {
    const res = await db.query(
      `SELECT 
            i.id AS "invitationID", 
            i.inviter_user AS "from", 
            gc.title AS "groupTitle", 
            gc.id AS "groupID", 
            i.content AS "message",
            gc.created_at AS "createdAt" 
        FROM 
            group_conversation_invitations AS i 
        JOIN 
            group_conversations AS gc 
        ON 
            gc.id=i.group_conversation_id 
        WHERE 
            i.invited_user=$1
        AND 
            i.is_approved=true 
        AND 
            i.is_removed=false
        `,
      [username]
    );

    return res.rows;
  }

  static async getSentRequests(username) {
    const res = await db.query(
      `SELECT 
            r.id AS "requestID", 
            gc.host_user AS "to", 
            gc.title AS "groupTitle", 
            gc.id AS "groupID", 
            r.content AS "message", 
            r.created_at AS "createdAt" 
        FROM 
            group_conversation_requests AS r 
        JOIN 
            group_conversations AS gc 
        ON 
            r.group_conversation_id=gc.id
        WHERE
            r.requester_user=$1
        AND
            r.is_removed=false`,
      [username]
    );

    return res.rows;
  }
}
module.exports = GroupRequests;
