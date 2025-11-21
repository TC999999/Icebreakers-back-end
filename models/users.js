const db = require("../db");
const { constructSearchString } = require("../helpers/constructSearchString");
const { NotFoundError, ForbiddenError } = require("../expressError");
const DirectRequests = require("./directRequests");
const { insertMultipleSQL } = require("../helpers/insertMultipleSQL");

// class of functions for CRUD operations to the users table in the database
class User {
  // finds and returns a single row in the users table where the inputted username matches the username
  // column; throws an error if no row is found
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

  // returns user's profile information from a single row in the user's table where the username column
  // matches the inputted username; throws an error if user does not exist
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

    let user = res.rows[0];
    if (user) {
      return user;
    } else {
      throw new NotFoundError("User does not exist!");
    }
  }

  // retreives all rows from the users table except the row with the matching inputted username and returns
  // it as an array of username strings
  static async getAllUsers(username) {
    const users = await db.query(
      `
      SELECT 
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

  // returns on all interests in the users to interests table where the username column value matches the
  // inputted username if the findSimilarInterests value is truthy, otherwise return an empty array
  static async getSingleUserInterests(username, findSimilarInterests) {
    if (findSimilarInterests) {
      const res = await db.query(
        `
      SELECT 
        JSON_AGG(i.topic) AS interests
      FROM 
        users AS u
      JOIN 
        interests_to_users AS iu
      ON 
        u.username=iu.username 
      JOIN 
        interests AS i
      ON 
        iu.topic_id=i.id 
      WHERE 
        u.username=$1`,
        [username]
      );

      return res.rows[0].interests;
    }
    return [];
  }

  // returns a list of all rows from the users table jojned with the interests table that have been
  // filtered by the username and/or interests array parameters
  static async searchForUsers(currentUsername, username, interests) {
    const { filterString, values } = constructSearchString(username, interests);

    const users = await db.query(
      `
      SELECT 
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

  // selects and returns a single row of information from the users table to edit
  static async getUserForEdit(username) {
    const res = await db.query(
      `
      SELECT 
        email_address AS "emailAddress", 
        biography, 
        favorite_color AS "favoriteColor", 
        JSONB_AGG(i.id) AS "interests" 
      FROM 
        users AS u 
      JOIN 
        interests_to_users AS iu 
      ON 
        u.username=iu.username 
      JOIN 
        interests AS i 
      ON 
        iu.topic_id=i.id 
      WHERE 
        u.username=$1 
      GROUP BY 
        u.username`,
      [username]
    );

    return res.rows[0];
  }

  // updates and returns a single row in the users table with the inputted information that contains a
  // matching username to the inputted username; throws an email if another user has already taken the
  // inputted email address; also deletes all rows from the user's to interests table that contain the
  // matching inputted username and replaces them with new interests
  static async editUser({
    username,
    emailAddress,
    biography,
    favoriteColor,
    interests,
  }) {
    const emailCheck = await db.query(
      `SELECT
        email_address
      FROM 
        users 
      WHERE
        email_address=$1
      AND
        username!=$2`,
      [emailAddress, username]
    );

    if (emailCheck.rows[0]) {
      throw new ForbiddenError("Email Address already taken!");
    }

    let updateRes = await db.query(
      `
      UPDATE 
        users 
      SET 
        email_address=$1, 
        biography=$2, 
        favorite_color=$3
      WHERE
        username=$4
      RETURNING
        favorite_color AS "newFavoriteColor"`,
      [emailAddress, biography, favoriteColor, username]
    );

    await db.query(
      `
      DELETE FROM
        interests_to_users
      WHERE
        username=$1`,
      [username]
    );

    await db.query(
      `INSERT INTO interests_to_users (topic_id, username) VALUES ${insertMultipleSQL(
        username,
        interests
      )}`
    );

    return updateRes.rows[0];
  }
}

module.exports = User;
