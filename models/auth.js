const bcrypt = require("bcrypt");
const { UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

class Authorization {
  static async register({ username, password, emailAddress, favoriteColor }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const res = await db.query(
      `INSERT INTO users 
        (username, 
        password, 
        email_address, 
        favorite_color) 
      VALUES ($1, $2, $3, $4) 
      RETURNING 
        username, 
        favorite_color AS "favoriteColor", 
        is_admin AS "isAdmin", 
        is_flagged AS "isFlagged"`,
      [username, hashedPassword, emailAddress, favoriteColor]
    );

    return res.rows[0];
  }

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
