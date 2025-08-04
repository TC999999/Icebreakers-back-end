const db = require("../db");
const insertMultipleSQL = require("../helpers/insertMultipleSQL");

class Interests {
  static async getInterests() {
    const res = await db.query("SELECT * FROM interests");
    return res.rows;
  }

  static async addInterestsForUser(username, interests) {
    let values = insertMultipleSQL(username, interests);

    await db.query(
      `INSERT INTO interests_to_users (topic_id, username) VALUES ${values}`
    );
  }

  static async getUserInterests(username) {
    let res = await db.query(
      `SELECT 
        topic 
      FROM 
        interests_to_users 
      JOIN 
        interests 
      ON 
        topic_id=interests.id 
      WHERE 
        username=$1
      `,
      [username]
    );

    return res.rows.map((t) => {
      return t.topic;
    });
  }
}

module.exports = Interests;
