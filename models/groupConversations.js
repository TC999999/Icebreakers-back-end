const db = require("../db");
const { insertMultipleUsers } = require("../helpers/insertMultipleSQL");

class GroupConversations {
  static async addNewUser(username, group_conversation_id) {
    await db.query(
      `INSERT INTO user_to_group_conversations
            (username,
            group_conversation_id)
        VALUES ($1, $2)`,
      [username, group_conversation_id]
    );
  }

  static async addMultipleUsers(users, group_conversation_id) {
    await db.query(
      `INSERT INTO user_to_group_conversations
            (username,
            group_conversation_id)
        VALUES ${insertMultipleUsers(users, group_conversation_id)}`
    );
  }

  static async createNewConversation(title, host) {
    const res = await db.query(
      `INSERT INTO group_conversations
            (title, 
            host)
        VALUES ($1, $2)
        RETURNING
            id,
            title,
            host,
            created_at AS "createdAt"`,
      [title, host]
    );

    return res.rows[0];
  }

  static async createNewMessage(content, username, group_conversation_id) {
    const res = await db.query(
      `INSERT INTO group_conversations_messages
            (content,
            username,
            group_conversation_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            content,
            username
            created_at AS "createdAt"`,
      [content, username, group_conversation_id]
    );

    return res.rows[0];
  }
}

module.exports = GroupConversations;
