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

  static async makeRequest(requestedUser, requesterUser, content) {
    if (requestedUser === requesterUser) {
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
      [requestedUser, requesterUser]
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
            requested_user AS "requestedUser",
            requester_user AS "requesterUser",
            content,
            created_at AS "createdAt"`,
      [requestedUser, requesterUser, content]
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

  static async getDirectMessageRequests(username) {
    const sentRequests = await db.query(
      `SELECT
            id,
            requested_user AS "requestedUser",
            content,
            created_at AS "createdAt"
        FROM
            direct_conversation_requests
        WHERE
            requester_user=$1
        AND
            is_removed=false`,
      [username]
    );

    const sentRequestList = sentRequests.rows;

    const removedRequests = await db.query(
      `SELECT
            id,
            requested_user AS "requestedUser",
            content,
            created_at AS "createdAt"
        FROM
            direct_conversation_requests
        WHERE
            requester_user=$1
        AND
            is_removed=true`,
      [username]
    );

    const removedRequestList = removedRequests.rows;

    const receivedRequests = await db.query(
      `SELECT
            id,
            requester_user AS "requesterUser",
            content,
            created_at AS "createdAt"
        FROM
            direct_conversation_requests
        WHERE
            requested_user=$1
        AND 
            is_removed=false`,
      [username]
    );

    const receivedRequestList = receivedRequests.rows;

    return { sentRequestList, receivedRequestList, removedRequestList };
  }

  static async removeRequest(id) {
    const res = await db.query(
      `UPDATE 
            direct_conversation_requests 
        SET 
            is_removed=true 
        WHERE 
            id=$1 
        RETURNING 
            requested_user AS "requestedUser"`,
      [id]
    );

    return res.rows[0];
  }

  static async resendRequest(id) {
    const res = await db.query(
      `UPDATE 
            direct_conversation_requests 
        SET 
            is_removed=false
        WHERE 
            id=$1 
        RETURNING 
            id,
            requester_user AS "requesterUser",
            requested_user AS "requestedUser",
            content,
            created_at AS "createdAt"`,
      [id]
    );

    return res.rows[0];
  }

  static async respondToRequest(id, requestedUser, requesterUser) {
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
      [id, requestedUser, requesterUser]
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
