const bcrypt = require("bcrypt");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

// Authorization model: handles all postgresql queries that involve creating a new account or retrieving
// an existing account
class Authorization {
  // creates a new user row in users table in db; throws an error if either inputted username or email
  // address are used in a different row; uses bcrypt to encrypt password before saving it; returns new user
  // information
  static async register({
    username,
    password,
    emailAddress,
    biography,
    favoriteColor,
  }) {
    const userCheck = await db.query(
      `SELECT
        username
      FROM 
        users 
      WHERE
        username=$1`,
      [username]
    );

    if (userCheck.rows[0]) {
      throw new ForbiddenError("Username already taken!");
    }

    const emailCheck = await db.query(
      `SELECT
        email_address
      FROM 
        users 
      WHERE
        email_address=$1`,
      [emailAddress]
    );

    if (emailCheck.rows[0]) {
      throw new ForbiddenError("Email Address already taken!");
    }

    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const res = await db.query(
      `INSERT INTO users 
        (username, 
        password, 
        email_address, 
        biography,
        favorite_color) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING 
        username, 
        favorite_color AS "favoriteColor", 
        is_admin AS "isAdmin", 
        is_flagged AS "isFlagged"`,
      [username, hashedPassword, emailAddress, biography, favoriteColor]
    );

    return res.rows[0];
  }

  // retrieves user information that match username and password provided; throws an error if either is
  // incorrect
  static async logIn({ username, password }) {
    const res = await db.query(
      `SELECT 
            username, 
            password, 
            favorite_color AS "favoriteColor", 
            is_admin AS "isAdmin", 
            is_flagged AS "isFlagged"
        FROM 
            users 
        WHERE 
            username=$1`,
      [username]
    );

    const user = res.rows[0];

    if (user) {
      if (user.isFlagged) {
        throw new UnauthorizedError("THIS ACCOUNT HAS BEEN FLAGGED!");
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }
}

module.exports = Authorization;
