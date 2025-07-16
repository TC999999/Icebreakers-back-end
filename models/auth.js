const bcrypt = require("bcrypt");
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
        flagged AS "isFlagged"`,
      [username, hashedPassword, emailAddress, favoriteColor]
    );

    return res.rows[0];
  }
}

module.exports = Authorization;
