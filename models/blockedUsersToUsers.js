const db = require("../db");
const { UnauthorizedError } = require("../expressError");

class BlockedUsersToUsers {
  // checks if there are any rows that contain the inputted usernames as either the
  // blocker user and the blocked user respectively or vice versa, returns a different
  // error message if a row is found
  static async checkBlockedStatus(username, otherUser) {
    const res = await db.query(
      `SELECT 
            blocked_user AS "blockedUser", 
            blocked_user AS "blockerUser" 
        FROM 
            blocker_user_to_blocked_user 
        WHERE 
            blocked_user=$1 
        AND 
            blocker_user=$2`,
      [username, otherUser]
    );

    if (res.rows[0]) {
      throw new UnauthorizedError("You have been blocked by this user!");
    }

    const res2 = await db.query(
      `SELECT 
            blocked_user AS "blockedUser", 
            blocked_user AS "blockerUser" 
        FROM 
            blocker_user_to_blocked_user 
        WHERE 
            blocked_user=$1 
        AND 
            blocker_user=$2`,
      [otherUser, username]
    );

    if (res2.rows[0]) {
      throw new UnauthorizedError("You have blocked this user!");
    }
  }

  // returns a boolean that a single row exists where the blocked user column contains the
  // inputted username and the blocker user column contains the other username
  static async checkBlockedByOtherUser(username, otherUser) {
    const res = await db.query(
      `SELECT 
            blocked_user AS "blockedUser", 
            blocked_user AS "blockerUser" 
        FROM 
            blocker_user_to_blocked_user 
        WHERE 
            blocked_user=$1 
        AND 
            blocker_user=$2`,
      [username, otherUser]
    );

    return res.rows[0] !== undefined;
  }

  // returns a boolean that a single row exists where the blocker user column contains the
  // inputted username and the blocked user column contains the other username
  static async checkBlockedOtherUser(username, otherUser) {
    const res = await db.query(
      `SELECT 
            blocked_user AS "blockedUser", 
            blocked_user AS "blockerUser" 
        FROM 
            blocker_user_to_blocked_user 
        WHERE 
            blocked_user=$1 
        AND 
            blocker_user=$2`,
      [otherUser, username]
    );

    return res.rows[0] !== undefined;
  }

  // returns all rows in the blocker user to blocked user table in which the blocker user
  // column contains the inputted username
  static async getBlockedUsers(username) {
    const res = await db.query(
      `SELECT 
        bu.blocked_user AS "username", 
        bu.created_at AS "blockedAt",
        u.favorite_color AS "favoriteColor"
      FROM 
        blocker_user_to_blocked_user AS bu
      JOIN
        users AS u
      ON
        bu.blocked_user=u.username
      WHERE
        bu.blocker_user=$1`,
      [username]
    );

    return res.rows;
  }

  // adds and returns a single row to the blocker user to blocked user table where the current
  // username is the blocker user and the other username is the blocked user
  static async addBlockedUser(blockerUser, blockedUser) {
    const res = await db.query(
      `INSERT INTO 
            blocker_user_to_blocked_user 
        (blocker_user, blocked_user) 
        VALUES 
            ($1, $2) 
        RETURNING 
            blocker_user AS "blockerUser", 
            blocked_user AS "blockedUser"`,
      [blockerUser, blockedUser]
    );

    return res.rows[0];
  }

  // deletes and returns a single row to the blocker user to blocked user table where the
  // current username is the blocker user and the other username is the blocked user
  static async unblockUser(blockerUser, blockedUser) {
    const res = await db.query(
      `DELETE FROM 
        blocker_user_to_blocked_user 
      WHERE 
        blocker_user=$1 
      AND 
        blocked_user=$2`,
      [blockerUser, blockedUser]
    );

    return res.rows[0];
  }
}

module.exports = BlockedUsersToUsers;
