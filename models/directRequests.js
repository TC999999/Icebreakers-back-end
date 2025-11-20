const db = require("../db");
const {
  NotFoundError,
  UnacceptableError,
  ForbiddenError,
} = require("../expressError");

class DirectRequests {
  // checks the direct conversation requests table to see if there is a row in which either user has created
  // a request to the other user; used to prevent duplicate requests; contains optional paramters for
  // whether to throw an error or a boolean if request already exists or if the user is searching if a request
  // is pending on the front end user profile page
  static async checkRequests(
    username1,
    username2,
    returnError = false,
    forProfile = false
  ) {
    if (username1 !== username2) {
      const res = await db.query(
        `SELECT 
            requested_user AS "requestedUser",
            requester_user AS "requesterUser"
        FROM
            direct_conversation_requests
        WHERE
            requested_user=$1 
        AND
            requester_user=$2
        OR
            requested_user=$2 
        AND
            requester_user=$1`,
        [username1, username2]
      );

      if (returnError && res.rows[0]) {
        throw new ForbiddenError(
          "Request already exists! Please check your inbox!"
        );
      }

      return res.rows[0] !== undefined;
    }
    if (!forProfile) {
      throw new ForbiddenError("Cannot make a conversation with yourself");
    }
  }

  // returns a matching row in the direct conversation requests where the inputted username matches the
  // either the requester username or requested username and the uuid matches the inputted id; used to
  // protect direct conversation requests from being edited by anybody other than the request's sender
  // or responded to by anybody other than the request's recipient
  static async checkUserToDirectRequest(id, username, sender = false) {
    const res = await db.query(
      `SELECT 
            id
        FROM
            direct_conversation_requests
        WHERE
            id=$1
        AND
            ${sender ? "requester_user" : "requested_user"}=$2`,
      [id, username]
    );

    if (!res.rows[0]) {
      throw new ForbiddenError(
        `You are not the ${sender ? "sender" : "recipient"} of this request`
      );
    }
  }

  // returns a count of the number of rows in the users to direct conversations table where two users have
  // the same direct conversation id; if the returning rows have at least one value, then the users have
  // a conversation between the two of them; used to prevent duplicate conversations; contains optional
  // paramters for whether to throw an error or return a boolean if conversation already exists
  static async checkConversationExists(
    username1,
    username2,
    returnError = false
  ) {
    const res = await db.query(
      `SELECT 
        COUNT(*) AS "conversationExists"
      FROM 
        users_to_direct_conversations 
      WHERE 
        username=$1 
      OR 
        username=$2
      GROUP BY 
        direct_conversation_id 
      HAVING 
      COUNT(*)>=2`,
      [username1, username2]
    );

    if (returnError && res.rows[0]) {
      throw new ForbiddenError(
        "Conversation already exist between these two users!"
      );
    }

    return res.rows[0] !== undefined;
  }

  // adds a new row to direct requests table while inserting inputted fields
  static async makeRequest(to, from, content) {
    const res = await db.query(
      `INSERT INTO direct_conversation_requests
            (requested_user,
            requester_user,
            content)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            requested_user AS "to",
            requester_user AS "from",
            content,
            created_at AS "createdAt"`,
      [to, from, content]
    );

    return res.rows[0];
  }

  // returns the total number of rows in the direct requests table where the username matches the
  // requested user column and and requests have not been removed
  static async getUnansweredRequestCount(username) {
    const res = await db.query(
      `SELECT 
            COUNT(*) AS "unansweredRequests"
        FROM 
            direct_conversation_requests 
        WHERE 
            requested_user=$1
        AND
            is_removed=false`,
      [username]
    );

    return res.rows[0];
  }

  // updates and returns a single row in the direct requests table; updates column that allows the recipient
  // to be able to see request
  static async removeRequest(remove, id) {
    const res = await db.query(
      `UPDATE 
            direct_conversation_requests 
        SET 
            is_removed=$1 
        WHERE 
            id=$2 
        RETURNING 
            id,
            requester_user AS "from",
            requested_user AS "to",
            content,
            created_at AS "createdAt"`,
      [remove, id]
    );

    return res.rows[0];
  }

  // checks if a row in the direct requests table matches the inputted parameters; if there is none, throws
  // an error, otherwise deletes the row
  static async deleteRequest(id, to, from) {
    const requestCheck = await db.query(
      `SELECT 
            id,
            requested_user,
            requester_user
        FROM
            direct_conversation_requests
        WHERE
            id=$1
        AND
            requested_user=$2
        AND
            requester_user=$3`,
      [id, to, from]
    );

    if (!requestCheck.rows[0]) {
      throw new NotFoundError("Request not found");
    }

    await db.query(
      `DELETE FROM
            direct_conversation_requests
          WHERE
            id=$1 
          AND 
            requester_user=$2`,
      [id, from]
    );
  }
}

module.exports = DirectRequests;
