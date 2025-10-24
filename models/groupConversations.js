const db = require("../db");
const {
  insertMultipleUsers,
  insertMultipleSQL,
} = require("../helpers/insertMultipleSQL");

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

  static async createNewConversation(title, host, description) {
    const res = await db.query(
      `INSERT INTO group_conversations
            (title, 
            host_user,
            description)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            title,
            host_user AS "host",
            created_at AS "createdAt"`,
      [title, host, description]
    );

    return res.rows[0];
  }

  static async getAllGroups(username) {
    const hostedGroupsRes = await db.query(
      `SELECT 
        id,
        title,
        created_at AS "createdAt"
      FROM
        group_conversations
      WHERE
        host_user=$1`,
      [username]
    );

    const hostedGroups = hostedGroupsRes.rows;

    const nonHostedGroupsRes = await db.query(
      `SELECT 
        gc.id, 
        gc.title, 
        gc.host_user AS "host", 
        gc.created_at AS "createdAt"
      FROM 
        group_conversations AS gc 
      JOIN 
        user_to_group_conversations AS ugc 
      ON 
        gc.id=ugc.group_conversation_id 
      WHERE 
        host_user!=$1 
      AND 
        username=$1`,
      [username]
    );

    const nonHostedGroups = nonHostedGroupsRes.rows;

    return { hostedGroups, nonHostedGroups };
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
