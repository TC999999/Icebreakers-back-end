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
}

module.exports = Interests;
