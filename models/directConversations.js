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

  static async createNewConversation(user_1, user_2) {
    const res = await db.query(
      `INSERT INTO 
          direct_conversations 
       DEFAULT VALUES
       RETURNING
          id,
          title,
          last_updated_at AS "lastUpdatedAt",
          created_at AS "createdAt"`
    );

    const conversation = res.rows[0];

    await db.query(
      `INSERT INTO users_to_direct_conversations 
      (username, 
       direct_conversation_id)
     VALUES
        ($2,$1),
        ($3,$1)`,
      [conversation.id, user_1, user_2]
    );

    return conversation;
  }

  static async createNewMessage(content, username, id) {
    const messageRes = await db.query(
      `INSERT INTO direct_conversations_messages
            (content,
            username,
            direct_conversation_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            content,
            username,
            created_at AS "createdAt"`,
      [content, username, id]
    );

    const message = messageRes.rows[0];

    const otherUserRes = await db.query(
      `SELECT
        username
      FROM
        users_to_direct_conversations
      WHERE
        direct_conversation_id=$1
      AND
        username!=$2`,
      [id, username]
    );

    const otherUser = otherUserRes.rows[0];

    return { message, otherUser };
  }

  static async getAllConversations(username) {
    const res = await db.query(
      `SELECT 
        direct_conversations.id,
        title,
        last_updated_at AS "lastUpdatedAt"
      FROM
        direct_conversations
      JOIN
        users_to_direct_conversations
      ON
        username=$1`,
      [username]
    );

    return res.rows;
  }

  static async getMessages(id) {
    const res = await db.query(
      `SELECT
            id,
            content,
            username,
            created_at AS "createdAt"
        FROM
            direct_conversations_messages
        WHERE
            direct_conversation_id=$1`,
      [id]
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
    const requestedUserRes = await db.query(
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

    const requestedUser = requestedUserRes.rows[0];

    const unansweredRequestsRes = await db.query(
      `UPDATE 
        users 
      SET
        unanswered_requests = unanswered_requests - 1
      WHERE
        username=$1
      RETURNING
        unanswered_requests AS "unansweredRequests"`,
      [requestedUser.requestedUser]
    );

    const unansweredRequests = unansweredRequestsRes.rows[0];

    return { unansweredRequests };
  }

  static async resendRequest(id) {
    const resentRequestRes = await db.query(
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

    const resentRequest = resentRequestRes.rows[0];

    const unansweredRequestsRes = await db.query(
      `UPDATE 
        users 
      SET
        unanswered_requests = unanswered_requests + 1
      WHERE
        username=$1
      RETURNING
        unanswered_requests AS "unansweredRequests"`,
      [resentRequest.requestedUser]
    );

    const unansweredRequests = unansweredRequestsRes.rows[0];

    return { resentRequest, unansweredRequests };
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

    const unansweredRequestsRes = await db.query(
      `UPDATE 
        users 
      SET
        unanswered_requests = unanswered_requests - 1
      WHERE
        username=$1
      RETURNING
        unanswered_requests AS "unansweredRequests"`,
      [requestedUser]
    );

    const unansweredRequests = unansweredRequestsRes.rows[0];

    return { unansweredRequests };
  }
}

module.exports = DirectConversations;
