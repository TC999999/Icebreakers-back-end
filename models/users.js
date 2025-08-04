const db = require("../db");

class User {
  static async getUserProfile(username) {
    const res = await db.query(
      `SELECT 
            username, 
            biography, 
            created_at AS "createdAt"
        FROM 
            users
        WHERE
            username=$1`,
      [username]
    );

    return res.rows[0];
  }
}

module.exports = User;
