const db = require("../db");

class GroupRequests {
  static async createInvitation(from, to, content, group) {
    const i = await db.query(
      `INSERT INTO 
        group_conversation_invitations 
          (inviter_user, 
          invited_user, 
          content,
          group_conversation_id) 
      VALUES 
        ($1, $2, $3, $4)
      RETURNING
        id`,
      [from, to, content, group]
    );

    const res = await db.query(
      `SELECT 
        i.id,
        i.invited_user AS "to",
        i.inviter_user AS "from",
        i.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        i.created_at AS "createdAt"
      FROM
        group_conversation_invitations AS i
      JOIN
        group_conversations AS gc
      ON
        i.group_conversation_id=gc.id
      WHERE
        i.id=$1`,
      [i.rows[0].id]
    );

    return res.rows[0];
  }

  static async removeInvitation(remove, id) {
    const i = await db.query(
      `UPDATE 
          group_conversation_invitations
        SET 
          is_removed=$1 
        WHERE 
          id=$2
            `,
      [remove, id]
    );

    const res = await db.query(
      `SELECT 
        i.id,
        i.invited_user AS "to",
        i.inviter_user AS "from",
        i.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        i.created_at AS "createdAt"
      FROM 
        group_conversation_invitations AS i
      JOIN 
        group_conversations AS gc
      ON 
        i.group_conversation_id=gc.id
      WHERE 
        i.id=$1
            `,
      [id]
    );

    return res.rows[0];
  }
}
module.exports = GroupRequests;
