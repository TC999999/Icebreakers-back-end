const db = require("../db");

class DirectConversations {
  static async createNewConversation({ title, user_1, user_2 }) {
    const res = await db.query(
      `INSERT INTO direct_conversations
            (title,
            user_1,
            user_2)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            title,
            created_at AS "createdAt"`,
      [title, user_1, user_2]
    );

    return res.rows[0];
  }

  static async createNewMessage({ content, username, direct_conversation_id }) {
    const res = await db.query(
      `INSERT INTO direct_conversations_messages
            (content,
            username,
            direct_conversation_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            content,
            username
            created_at AS "createdAt"`,
      [content, username, direct_conversation_id]
    );

    return res.rows[0];
  }

  static async getMessages(direct_conversation_id) {
    const res = await db.query(
      `SELECT
            id,
            content,
            username,
            created_as AS "createdAt"
        FROM
            direct_conversations_messages
        WHERE
            direct_conversation_id=$1`,
      [direct_conversation_id]
    );

    return res.rows;
  }
}

module.exports = DirectConversations;
