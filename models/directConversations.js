const db = require("../db");
const { NotFoundError, UnacceptableError } = require("../expressError");

class DirectConversations {
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

  static async makeRequest(requester_user, requested_user, content) {
    if (requester_user === requested_user) {
      throw new UnacceptableError("Cannot make conversation with yourself");
    }

    const doublesCheck = await db.query(
      `SELECT 
            requester_user AS 'requesterUser',
            requested_user AS 'requestedUser'
        FROM
            direct_conversation_requests
        WHERE
            requester_user=$1 
        AND
            requested_user=$2
        OR
            requester_user=$2 
        AND
            requested_user=$1`,
      [requester_user, requested_user]
    );

    if (doublesCheck.rows[0]) {
      throw new UnacceptableError("Request has already been made");
    }

    const res = await db.query(
      `INSERT INTO direct_conversation_requests
            (requester_user,
            requested_user,
            content)
        VALUES ($1, $2)
        RETURNING
            id,
            requester_user AS 'requesterUser',
            requested_user AS 'requestedUser',
            content,
            created_at AS 'createdAt'`,
      [requester_user, requested_user]
    );

    return res.rows[0];
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
