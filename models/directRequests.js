const db = require("../db");
const { NotFoundError, UnacceptableError } = require("../expressError");

class DirectRequests {
  static async checkRequests(username1, username2) {
    if (username1 !== username2) {
      const requestCheck = await db.query(
        `SELECT 
            requested_user AS "requestedUser",
            requester_user AS "requesterUser"
        FROM
            direct_conversation_requests
        WHERE
            requested_user=$1 
        AND
            requester_user=$2
        OR
            requested_user=$2 
        AND
            requester_user=$1`,
        [username1, username2]
      );

      return requestCheck.rows[0] !== undefined;
    }
  }

  static async checkConversationExists(username1, username2) {
    const res = await db.query(
      `SELECT 
        COUNT(*) AS "conversationExists"
      FROM 
        users_to_direct_conversations 
      WHERE 
        username=$1 
      OR 
        username=$2
      GROUP BY 
        direct_conversation_id 
      HAVING 
      COUNT(*)>=2`,
      [username1, username2]
    );

    return res.rows[0] !== undefined;
  }

  static async getRequestById(id) {
    const requestCheck = await db.query(
      `SELECT 
            requester_user AS "requesterUser"
        FROM
            direct_conversation_requests
        WHERE
            id=$1`,
      [id]
    );

    return requestCheck.rows[0];
  }

  static async makeRequest(to, from, content) {
    if (to === from) {
      throw new UnacceptableError("Cannot make conversation with yourself");
    }

    const doublesCheck = await db.query(
      `SELECT 
            requested_user AS "requestedUser",
            requester_user AS "requesterUser"
        FROM
            direct_conversation_requests
        WHERE
            requested_user=$1 
        AND
            requester_user=$2
        OR
            requested_user=$2 
        AND
            requester_user=$1`,
      [to, from]
    );

    if (doublesCheck.rows[0]) {
      throw new UnacceptableError("Request has already been made");
    }

    const res = await db.query(
      `INSERT INTO direct_conversation_requests
            (requested_user,
            requester_user,
            content)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            requested_user AS "to",
            requester_user AS "from",
            content,
            created_at AS "createdAt"`,
      [to, from, content]
    );

    return res.rows[0];
  }

  static async getUnansweredRequestCount(username) {
    const res = await db.query(
      `SELECT 
            COUNT(*) AS "unansweredRequests"
        FROM 
            direct_conversation_requests 
        WHERE 
            requested_user=$1
        AND
            is_removed=false`,
      [username]
    );

    return res.rows[0];
  }

  static async removeRequest(remove, id) {
    const res = await db.query(
      `UPDATE 
            direct_conversation_requests 
        SET 
            is_removed=$1 
        WHERE 
            id=$2 
        RETURNING 
            id,
            requester_user AS "from",
            requested_user AS "to",
            content,
            created_at AS "createdAt"`,
      [remove, id]
    );

    return res.rows[0];
  }

  static async respondToRequest(id, to, from) {
    const userCheck = await db.query(
      `SELECT 
            id,
            requested_user,
            requester_user
        FROM
            direct_conversation_requests
        WHERE
            id=$1
        AND
            requested_user=$2
        AND
            requester_user=$3`,
      [id, to, from]
    );

    if (!userCheck.rows[0]) {
      throw new NotFoundError("Request not found");
    }

    await db.query(
      `DELETE FROM
            direct_conversation_requests
          WHERE
            id=$1`,
      [id]
    );
  }
}

module.exports = DirectRequests;
