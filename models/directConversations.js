const db = require("../db");

class DirectConversations {
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
        last_updated_at AS "lastUpdatedAt",
        users_to_direct_conversations.unread_messages AS "unreadMessages"
      FROM
        direct_conversations
      JOIN
        users_to_direct_conversations
      ON
        direct_conversations.id=users_to_direct_conversations.direct_conversation_id
      WHERE
        username=$1`,
      [username]
    );

    return res.rows;
  }

  static async updateUnreadMessages(id, username) {
    const res = await db.query(
      `UPDATE 
        users_to_direct_conversations 
      SET 
        unread_messages=unread_messages+1
      WHERE 
        direct_conversation_id=$1 
      AND 
        username=$2
      RETURNING
        unread_messages AS "unreadMessages"`,
      [id, username]
    );

    return res.rows[0];
  }

  static async clearUnreadMessages(id, username) {
    const res = await db.query(
      `UPDATE 
        users_to_direct_conversations 
      SET 
        unread_messages=0 
      WHERE 
        direct_conversation_id=$1 
      AND 
        username=$2
      RETURNING
        unread_messages AS "unreadMessages"`,
      [id, username]
    );

    return res.rows[0];
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

  static async getAllUnreadMessageCount(username) {
    const res = await db.query(
      `SELECT 
        SUM(unread_messages) AS "unreadMessages" 
      FROM 
        users_to_direct_conversations 
      WHERE 
        username=$1`,
      [username]
    );

    return res.rows[0];
  }
}

module.exports = DirectConversations;
