const db = require("../db");

class User {
  static async getUserProfile(username) {
    const res = await db.query(
      `SELECT 
            username, 
            biography, 
            favorite_color AS "favoriteColor",
            created_at AS "createdAt"
        FROM 
            users
        WHERE
            username=$1`,
      [username]
    );

    return res.rows[0];
  }

  static async getAllUserConversations(username) {
    const directConversations = await db.query(
      `SELECT 
            id,
            title,
            created_at AS "createdAt"
        FROM
            direct_conversations
        WHERE
            user_1=$1
        OR
            user_2=$1`,
      [username]
    );

    const groupConversations = await db.query(
      `SELECT
            group_conversations.id,
            group_conversations.title,
            group_conversations.created_at AS "createdAt"
        FROM
            group_conversations
        JOIN
            user_to_group_conversations
        ON
            group_conversations.id=user_to_group_conversations.id
        WHERE
            user_to_group_conversations.username=$1`,
      [username]
    );

    return [...directConversations.rows, ...groupConversations.rows];
  }
}

module.exports = User;
