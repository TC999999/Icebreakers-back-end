const db = require("../db");
const { UnauthorizedError } = require("../expressError");

class BlockedUsersToUsers {
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
}

module.exports = BlockedUsersToUsers;
