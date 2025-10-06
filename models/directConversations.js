const db = require("../db");
const { NotFoundError, UnacceptableError } = require("../expressError");

class DirectConversations {
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
  static async createNewConversation({ title, user_1, user_2 }) {
    const doublesCheck = await db.query(
      `SELECT 
            id
        FROM
            direct_conversations
        WHERE
            user_1=$1 
        AND
            user_2=$2
        OR
            user_1=$2 
        AND
            user_2=$1`,
      [user_1, user_2]
    );

    if (doublesCheck.rows[0]) {
      throw new UnacceptableError("Conversation already exists");
    }

    const res = await db.query(
      `INSERT INTO direct_conversations
            (title,
            user_1,
            user_2)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            title,
            user_1 AS 'user1',
            user_2 AS 'user2',
            created_at AS 'createdAt'`,
      [title, user_1, user_2]
    );

    return res.rows[0];
  }

  static async createNewMessage({ content, username, direct_conversation_id }) {
    const userCheck = await db.query(
      `SELECT
            user_1,
            user_2
        FROM
            direct_conversations
        WHERE
            id=$1
        AND
            user_1=$2
        OR
            user_2=$2`,
      [direct_conversation_id, username]
    );

    if (!userCheck.rows[0]) {
      throw new UnacceptableError(
        "Cannot create messages for a conversation you are not a part of"
      );
    }

    const res = await db.query(
      `INSERT INTO direct_conversations_messages
            (content,
            username,
            direct_conversation_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            content,
            username,
            created_at AS 'createdAt'`,
      [content, username, direct_conversation_id]
    );

    return res.rows[0];
  }

  static async getMessages(direct_conversation_id, username) {
    const userCheck = await db.query(
      `SELECT
            user_1,
            user_2
        FROM
            direct_conversations
        WHERE
            id=$1
        AND
            user_1=$2
        OR
            user_2=$2`,
      [direct_conversation_id, username]
    );

    if (!userCheck.rows[0]) {
      throw new UnacceptableError("Cannot view another user's messages");
    }

    const res = await db.query(
      `SELECT
            id,
            content,
            username,
            created_as AS 'createdAt'
        FROM
            direct_conversations_messages
        WHERE
            direct_conversation_id=$1`,
      [direct_conversation_id]
    );

    return res.rows;
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

    const requestRes = await db.query(
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

    const request = requestRes.rows[0];

    const unansweredRequestsRes = await db.query(
      `UPDATE 
        users 
      SET
        unanswered_requests = unanswered_requests + 1
      WHERE
        username=$1
      RETURNING
        unanswered_requests AS "unansweredRequests"`,
      [requestedUser]
    );

    const unansweredRequests = unansweredRequestsRes.rows[0];

    return { request, unansweredRequests };
  }

  static async getDirectMessageRequests(username) {
    const sentRequests = await db.query(
      `SELECT
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
        requester_user AS "requesterUser",
        content,
        created_at AS "createdAt"
      FROM
        direct_conversation_requests
      WHERE
        requested_user=$1`,
      [username]
    );

    const receivedRequestList = receivedRequests.rows;

    return { sentRequestList, receivedRequestList, removedRequestList };
  }

  static async respondToRequest(id, requested_user, accepted) {
    const userCheck = await db.query(
      `SELECT 
            requested_user AS 'requestedUser',
            is_accepted AS 'isAccepted',
            is_seen AS 'isSeen'
        FROM
            direct_conversation_requests
        WHERE
            requested_user=$1`,
      [requested_user]
    );

    if (!userCheck.rows[0]) {
      throw new NotFoundError("Request not found");
    }

    const res = await db.query(
      `UPDATE
            direct_conversation_requests
        SET
            is_seen=TRUE,
            is_accepted=${accepted ? "TRUE" : "FALSE"}
        WHERE
            id=$1
        RETURNING
            requester_user AS 'user_1',
            requested_user AS 'user_2',
            is_accecpted AS 'isAccepted'
        `,
      [id]
    );

    return res.rows[0];
  }
}

module.exports = DirectConversations;
