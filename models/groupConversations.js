const db = require("../db");
const { ForbiddenError } = require("../expressError");
const {
  constructGroupSearchString,
} = require("../helpers/constructSearchString");
const { insertMultipleUsers } = require("../helpers/insertMultipleSQL");

// class of static functions that handle the database logic for the group conversations table and users to
// group conversations table
class GroupConversations {
  // finds a single row in the users to group conversations table that contains the inputted group id and
  // username and returns something different depending on optional parameters; if inGroupProfile is true,
  // simply returns if row exists, used for checking on client side group page if current user is a member
  // of the group; if we want to know if the user is in the group but they are not found OR if we want to
  // know if the user is not in the group but they are found, throws an error
  static async checkGroup(
    id,
    username,
    inGroupProfile = false,
    isInGroup = false,
    inGroupMessages = false
  ) {
    const res = await db.query(
      `
      SELECT 
        username
      FROM 
        users_to_group_conversations 
      WHERE 
        group_conversation_id=$1 
      AND 
        username=$2`,
      [id, username]
    );
    if (inGroupProfile) {
      return res.rows[0] !== undefined;
    } else if (
      !inGroupProfile &&
      !res.rows[0] &&
      isInGroup &&
      !inGroupMessages
    ) {
      throw new ForbiddenError(
        `You cannot make an invitation for a group you are not a part of`
      );
    } else if (
      !inGroupProfile &&
      res.rows[0] &&
      !isInGroup &&
      !inGroupMessages
    ) {
      throw new ForbiddenError(`${username} is already in this group`);
    } else if (
      !inGroupProfile &&
      !res.rows[0] &&
      !isInGroup &&
      inGroupMessages
    ) {
      throw new ForbiddenError(`${username} is not a member of this group`);
    }
  }

  // adds new row to users to group table with the inputted username and group conversation ID; returns
  // both the new username and their favorite color to be used in a socket emitter
  static async addNewUser(username, group_conversation_id) {
    await db.query(
      `INSERT INTO users_to_group_conversations
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

  // adds and returns a new row to the group conversations table with the inputted title, host username, and
  // description string
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

  // returns a list of titles and host usernames from all rows in the group conversations table; to be used
  // for dropdown search results
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

  // returns a filtered list of group information based on the input parameters seen below; used for group
  // search results
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
              users_to_group_conversations AS ugc 
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

  // returns an array of group ids from all rows in the users to group conversations table that contain the
  // inputted username; to be used for a user joining their socket rooms upon connection
  static async getAllGroupsSocket(username) {
    const res = await db.query(
      `
      SELECT 
        JSON_AGG(ugc.group_conversation_id) AS groups 
      FROM 
        users_to_group_conversations AS ugc 
      WHERE 
        username=$1 
      GROUP BY 
        ugc.username`,
      [username]
    );

    return res.rows[0] ? res.rows[0].groups : [];
  }

  // returns two lists from the group conversations table: one with groups where the host user matches the
  // inputted username, and one where they don't match
  static async getAllGroups(username) {
    const res = await db.query(
      `SELECT 
        (SELECT 
          COALESCE(JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', gc.id, 
              'title', gc.title, 
              'createdAt', gc.created_at)
            ), '[]'::jsonb)
        FROM 
          group_conversations AS gc 
        WHERE 
          host_user=$1) AS "hostedGroups", 
        (SELECT 
          COALESCE(JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', gc.id, 
              'title', gc.title, 
              'host', gc.host_user, 
              'createdAt', gc.created_at)
            ), '[]'::jsonb) 
        FROM 
          group_conversations AS gc 
        JOIN 
          users_to_group_conversations AS ugc 
        ON 
          gc.id=ugc.group_conversation_id 
        WHERE 
          gc.host_user!=$1 AND ugc.username=$1) AS "nonHostedGroups"`,
      [username]
    );

    return res.rows[0];
  }

  // returns the total number of unread messages from the users to group conversations table that contain
  // the inputted username; used upon logging in
  static async getAllUnreadMessageCount(username) {
    const res = await db.query(
      `SELECT 
        SUM(ugc.unread_messages) AS "unreadGroupMessages" 
      FROM 
        users_to_group_conversations AS ugc
      WHERE 
        ugc.username=$1`,
      [username]
    );

    return res.rows[0];
  }

  // returns a list of rows from the group conversations table joined with the users to group
  // conversations where the usernames match; used for tabs in group conversation messages page
  static async getAllGroupTabs(username) {
    const res = await db.query(
      `SELECT 
        gc.id, 
        gc.title,
        ugc.unread_messages AS unreadMessages
      FROM 
        group_conversations AS gc 
      JOIN 
        users_to_group_conversations AS ugc 
      ON 
        gc.id=ugc.group_conversation_id 
      WHERE 
        ugc.username=$1;`,
      [username]
    );
    return res.rows;
  }

  // returns a simpler list of rows from the group conversations table joined with the users to group
  // conversations where the usernames match; used for inviting another user into a group
  static async getAllGroupsSingleList(username) {
    const res = await db.query(
      `SELECT 
        gc.id, 
        gc.title 
      FROM 
        group_conversations AS gc 
      JOIN 
        users_to_group_conversations AS ugc 
      ON 
        gc.id=ugc.group_conversation_id 
      WHERE 
        username=$1;`,
      [username]
    );
    return res.rows;
  }

  // returns a smaller amount of data about a single row from the group conversations table where the ids
  // match; used for requesting to join a new group
  static async getSimpleGroupInfo(id) {
    const res = await db.query(
      `SELECT
        title,
        host_user AS "host"
      FROM 
        group_conversations
      WHERE 
        id=$1`,
      [id]
    );

    return res.rows[0];
  }

  // returns a single row grom the group conversations table that has the matching id; also gets a list of
  // users in that group and the interests that group has
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
          users_to_group_conversations AS ugc 
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

  // returns all rows from the users to group conversations table that contain the inputted group
  // conversation id and do not include the inputted username
  static async getGroupUsers(id, username) {
    const res = await db.query(
      `SELECT 
        ugc.username,
        u.favorite_color AS "favoriteColor"
      FROM 
        users_to_group_conversations AS ugc
      JOIN
        users AS u
      ON
        u.username=ugc.username
      WHERE 
        ugc.group_conversation_id=$1 
      AND 
        u.username!=$2`,
      [id, username]
    );

    return res.rows.map((user) => {
      return { ...user, isOnline: false };
    });
  }

  // returns all rows from the group conversations messages table that contain the inputted group
  // conversation id
  static async getAllGroupMessages(id) {
    const res = await db.query(
      `
      SELECT 
        id,
        content,
        username,
        created_at AS "createdAt"
      FROM 
        group_conversations_messages
      WHERE
        group_conversation_id=$1`,
      [id]
    );

    return res.rows;
  }

  // adds a single row to the group conversation messages table for the group with the inputted id and from
  // the inputted username
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
            username,
            created_at AS "createdAt"`,
      [content, username, group_conversation_id]
    );

    return res.rows[0];
  }
}

module.exports = GroupConversations;
