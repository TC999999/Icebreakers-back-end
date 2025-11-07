const db = require("../db");
const { ForbiddenError } = require("../expressError");

class GroupRequests {
  static async checkGroup(groupID, to) {
    const res = await db.query(
      `
      SELECT 
        username
      FROM 
        user_to_group_conversations 
      WHERE 
        group_conversation_id=$1 
      AND 
        username=$2`,
      [groupID, to]
    );

    if (res.rows[0]) {
      throw new ForbiddenError("This user is already in this group");
    }
  }

  static async createRequest(from, content, group) {
    const r = await db.query(
      `INSERT INTO
        group_conversation_requests
        (requester_user,
        content,
        group_conversation_id)
      VALUES
        ($1, $2, $3)
      RETURNING
        id`,
      [from, content, group]
    );

    const res = await db.query(
      `SELECT
        r.id,
        gc.host_user AS "to",
        r.requester_user AS "from",
        r.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        r.created_at AS "createdAt"
      FROM
        group_conversation_requests AS r
      JOIN
        group_conversations AS gc
      ON
        gc.id=r.group_conversation_id
      WHERE
        r.id=$1`,
      [r.rows[0].id]
    );

    return res.rows[0];
  }

  static async removeRequest(remove, id) {
    await db.query(
      `UPDATE 
          group_conversation_requests
        SET 
          is_removed=$1 
        WHERE 
          id=$2
            `,
      [remove, id]
    );

    const res = await db.query(
      `SELECT 
        r.id,
        gc.host_user AS "to",
        r.requester_user AS "from",
        r.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        r.created_at AS "createdAt"
      FROM 
        group_conversation_requests AS r
      JOIN 
        group_conversations AS gc
      ON 
        r.group_conversation_id=gc.id
      WHERE 
        r.id=$1
            `,
      [id]
    );

    return res.rows[0];
  }

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

  static async respondToInvitation(id, to, from, groupID) {
    const userCheck = await db.query(
      `SELECT 
            id,
            invited_user,
            inviter_user,
            group_conversation_id
        FROM
            group_conversation_invitations
        WHERE
            id=$1
        AND
            invited_user=$2
        AND
            inviter_user=$3
        AND
            group_conversation_id=$4`,
      [id, to, from, groupID]
    );

    if (!userCheck.rows[0]) {
      throw new NotFoundError("Request not found");
    }

    await db.query(
      `DELETE FROM 
        group_conversation_invitations 
      WHERE 
        id=$1`,
      [id]
    );
  }
}
module.exports = GroupRequests;
