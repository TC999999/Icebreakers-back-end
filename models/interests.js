const db = require("../db");
const { insertMultipleSQL } = require("../helpers/insertMultipleSQL");

class Interests {
  static async getInterests() {
    const res = await db.query("SELECT * FROM interests");
    return res.rows;
  }

  static async getInterestsAsMap() {
    const res = await db.query(
      `SELECT 
        JSONB_OBJECT_AGG(
          i.id, JSONB_BUILD_OBJECT(
            'id', i.id,
            'topic', i.topic
          )
          ) AS "interests" 
      FROM 
        interests AS i`
    );

    return res.rows[0].interests;
  }

  static async addInterestsForUser(username, interests) {
    let values = insertMultipleSQL(username, interests);

    await db.query(
      `INSERT INTO interests_to_users (topic_id, username) VALUES ${values}`
    );
  }

  static async addInterestsForGroup(id, interests) {
    let interestsArr = Object.values(interests).map((i) => {
      return i.id;
    });

    let values = insertMultipleSQL(id, interestsArr);

    await db.query(
      `INSERT INTO interests_to_group_conversations (topic_id, group_conversation_id) VALUES ${values}`
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
