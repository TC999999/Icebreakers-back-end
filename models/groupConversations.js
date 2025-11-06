const db = require("../db");
const { UnauthorizedError } = require("../expressError");
const {
  constructGroupSearchString,
} = require("../helpers/constructSearchString");
const { insertMultipleUsers } = require("../helpers/insertMultipleSQL");

class GroupConversations {
  static async checkGroupError(username, id) {
    const res = await db.query(
      `SELECT 
        username 
      FROM 
        user_to_group_conversations 
      WHERE 
        username=$1 
      AND 
        group_conversation_id=$2`,
      [username, id]
    );

    if (!res.rows[0]) {
      throw new UnauthorizedError("NOT a part of this group!");
    }
  }

  static async checkGroup(username, id) {
    const res = await db.query(
      `SELECT 
        username 
      FROM 
        user_to_group_conversations 
      WHERE 
        username=$1 
      AND 
        group_conversation_id=$2`,
      [username, id]
    );

    if (!res.rows[0]) {
      return false;
    }
    return true;
  }

  static async addNewUser(username, group_conversation_id) {
    await db.query(
      `INSERT INTO user_to_group_conversations
            (username,
            group_conversation_id)
        VALUES ($1, $2)`,
      [username, group_conversation_id]
    );

    let res = await db.query(
      `
      SELECT 
        username, 
        favorite_color AS "favoriteColor" 
      FROM 
        users 
      WHERE 
        username=$1`,
      [username]
    );

    return res.rows[0];
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

  static async getAllGroupNames() {
    const res = await db.query(
      `
    SELECT
      gc.title,
      gc.host_user AS "host"
    FROM
      group_conversations AS gc`
    );

    return res.rows;
  }

  static async searchGroups(username, title, host, user, interests, newGroups) {
    const { filterString, values } = constructGroupSearchString(
      username,
      title,
      host,
      user,
      newGroups,
      interests
    );
    const res = await db.query(
      `
      WITH 
        group_data AS 
          (SELECT 
            gc.id, 
            gc.title, 
            gc.host_user AS "host", 
            gc.created_at AS "createdAt", 
            (SELECT 
              JSONB_AGG(i.topic) 
            FROM 
              interests AS i 
            JOIN 
              interests_to_group_conversations AS igc 
            ON 
              igc.topic_id=i.id 
            WHERE 
              igc.group_conversation_id=gc.id 
            GROUP BY 
              gc.id) AS "interests", 
            (SELECT 
              JSONB_AGG(
                JSONB_BUILD_OBJECT(
                'username', u.username, 
                'favoriteColor', u.favorite_color)
              ) 
            FROM 
              users AS u 
            JOIN 
              user_to_group_conversations AS ugc 
            ON 
              u.username=ugc.username 
            WHERE 
              ugc.group_conversation_id=gc.id 
            GROUP BY 
              gc.id) AS "users" 
          FROM 
            group_conversations AS gc) 
      SELECT
        * 
      FROM 
        group_data
        ${filterString}
       `,
      values
    );

    return res.rows;
  }

  static async getAllGroupsSocket(username) {
    const res = await db.query(
      `
      SELECT 
        JSON_AGG(ugc.group_conversation_id) AS groups 
      FROM 
        user_to_group_conversations AS ugc 
      WHERE 
        username=$1 
      GROUP BY 
        ugc.username`,
      [username]
    );

    return res.rows[0] ? res.rows[0].groups : [];
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

  static async getAllGroupsSingleList(username) {
    const res = await db.query(
      `SELECT 
        gc.id, 
        gc.title 
      FROM 
        group_conversations AS gc 
      JOIN 
        user_to_group_conversations AS ugc 
      ON 
        gc.id=ugc.group_conversation_id 
      WHERE 
        username=$1;`,
      [username]
    );
    return res.rows;
  }

  static async getGroupInfo(id) {
    const res = await db.query(
      `SELECT 
        gc.id, 
        gc.title, 
        gc.description,
        gc.host_user AS "host", 
        gc.created_at AS "createdAt", 
        (SELECT 
            JSONB_AGG(i.topic) 
        FROM 
          interests AS i 
        JOIN 
          interests_to_group_conversations AS igc 
        ON 
          igc.topic_id=i.id 
        WHERE 
          igc.group_conversation_id=gc.id 
        GROUP BY 
          gc.id) AS "interests",
        (SELECT 
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'username', u.username, 
              'favoriteColor', u.favorite_color)
            ) 
        FROM 
          users AS u 
        JOIN 
          user_to_group_conversations AS ugc 
        ON 
          u.username=ugc.username 
        WHERE 
          ugc.group_conversation_id=gc.id 
        GROUP BY 
          gc.id) AS "users" 
      FROM 
        group_conversations AS gc
      WHERE 
        gc.id=$1`,
      [id]
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
