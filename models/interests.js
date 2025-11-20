const db = require("../db");
const { insertMultipleSQL } = require("../helpers/insertMultipleSQL");

class Interests {
  // returns all rows from the interests table
  static async getInterests() {
    const res = await db.query("SELECT * FROM interests");
    return res.rows;
  }

  // returns all rows from the interests table as a map with the id as a key and an object with
  // its id and topic as its key
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

  // adds multiple rows to the interests to users table for the inputted username
  static async addInterestsForUser(username, interests) {
    let values = insertMultipleSQL(username, interests);

    await db.query(
      `INSERT INTO interests_to_users (topic_id, username) VALUES ${values}`
    );
  }

  // adds multiple rows to the interests togroups table for the inputted group id
  static async addInterestsForGroup(id, interests) {
    let values = insertMultipleSQL(id, interests);

    await db.query(
      `INSERT INTO interests_to_group_conversations (topic_id, group_conversation_id) VALUES ${values}`
    );
  }

  // returns an multiple rows from the interests table joined with the interests to users table with the
  // matching username as an array of interests topics
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
