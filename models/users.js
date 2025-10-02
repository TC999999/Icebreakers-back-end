const db = require("../db");
const constructSearchString = require("../helpers/constructSearchString");
const { NotFoundError } = require("../expressError");
const DirectConversations = require("./directConversations");

class User {
  static async userCheck(username) {
    const res = await db.query(
      `SELECT 
            username
        FROM 
            users
        WHERE
            username=$1`,
      [username]
    );

    let user = res.rows[0];
    if (user) {
      return user;
    } else {
      throw new NotFoundError("User does not exist!");
    }
  }

  static async getUserProfile(username, currentUser) {
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

    let user = res.rows[0];
    if (user) {
      user = {
        ...user,
        requestSent: await DirectConversations.checkRequests(
          username,
          currentUser
        ),
      };

      return user;
    } else {
      throw new NotFoundError("User does not exist!");
    }
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

  static async getAllUsers(username) {
    const users = await db.query(
      `SELECT 
        users.username 
      FROM 
        users 
      WHERE
        users.username!=$1`,
      [username]
    );

    return users.rows.map((user) => {
      return user.username;
    });
  }

  static async getSingleUserInterests(username, findSimilarInterests) {
    if (findSimilarInterests) {
      const res = await db.query(
        `SELECT 
        JSON_AGG(interests.topic) 
      AS 
        interests 
      FROM 
        users 
      JOIN 
        interests_to_users 
      ON 
        users.username=interests_to_users.username 
      JOIN 
        interests 
      ON 
        interests_to_users.topic_id=interests.id 
      WHERE 
        users.username=$1`,
        [username]
      );

      return res.rows[0].interests;
    }
    return [];
  }

  static async searchForUsers(currentUsername, username, interests) {
    const { filterString, values } = constructSearchString(username, interests);

    const users = await db.query(
      `SELECT 
        users.username, 
        users.favorite_color AS favoriteColor,
        JSON_AGG(interests.topic) AS interests 
      FROM 
        users 
      JOIN 
        interests_to_users 
      ON 
        users.username=interests_to_users.username 
      JOIN 
        interests 
      ON 
        interests_to_users.topic_id=interests.id 
      WHERE
        users.username!=$1
      ${filterString}
      GROUP BY 
        users.username
      ORDER BY
        JSON_ARRAY_LENGTH(JSON_AGG(interests.topic))
      DESC`,
      [currentUsername, ...values]
    );

    return users.rows;
  }
}

module.exports = User;
