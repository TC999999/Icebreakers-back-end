const db = require("../db");
const { ForbiddenError, NotFoundError } = require("../expressError");

// class of functions that handle CRUD operations for the group requests table and group invitations table
// in the database
class GroupRequests {
  // finds a single row in the group conversation invitations table that contains the inputted group id
  // and username; either returns an error or a boolean depending on optional returnError parameter
  static async checkInvitation(id, username, returnError = false) {
    const res = await db.query(
      `
      SELECT 
        id
      FROM 
        group_conversation_invitations
      WHERE
        group_conversation_id=$1 AND invited_user=$2`,
      [id, username]
    );
    if (returnError && res.rows[0]) {
      throw new ForbiddenError(
        `${username} has already received an invitation to join this group!`
      );
    }

    return res.rows.length > 0;
  }

  // finds a single row in the group conversations invitations table that contains the matching id and
  // username; changes whether it matches the sender's username or the recipient's username depending
  // on the optional parameter; if no row is found, throws an error
  static async checkUserToGroupInvitation(id, username, sender = false) {
    const res = await db.query(
      `
      SELECT 
        id
      FROM 
        group_conversation_invitations
      WHERE
        id=$1 
      AND 
        ${sender ? "inviter_user" : "invited_user"}=$2 `,
      [id, username]
    );

    if (!res.rows[0]) {
      throw new ForbiddenError(
        `You are not the ${sender ? "sender" : "recipient"} of this invitation!`
      );
    }
  }

  // finds a single row in the group conversations requests table that contains the matching group
  // conversation id and sender username; either throws an error or returns a boolean depending on
  // optional returnError paramter;
  static async checkRequest(id, username, returnError = false) {
    const res = await db.query(
      `
    SELECT 
      requester_user AS "username"
    FROM 
      group_conversation_requests 
    WHERE 
      group_conversation_id=$1 AND requester_user=$2`,
      [id, username]
    );

    if (returnError && res.rows[0]) {
      throw new ForbiddenError(
        `${username} has already sent a request to join this group!`
      );
    } else {
      return res.rows.length > 0;
    }
  }

  // finds a single row in the group conversation requests table that contains the matching id and sender
  // username; returns an error if no row is found
  static async checkUserToGroupRequest(id, username) {
    const res = await db.query(
      `
      SELECT 
        id
      FROM 
        group_conversation_requests
      WHERE
       id=$1 AND requester_user=$2`,
      [id, username]
    );

    if (!res.rows[0]) {
      throw new ForbiddenError("You are not the sender of this request!");
    }
  }

  // finds a single row in the group conversation requests table joined with the group conversations table
  // that contains the matching id and host username; returns an error if no row is found
  static async checkHostToGroupRequest(id, groupID, username) {
    const res = await db.query(
      `
      SELECT 
        r.id AS requests, 
        gc.id AS group, 
        gc.host_user 
      FROM 
        group_conversation_requests AS r 
      JOIN 
        group_conversations AS gc 
      ON 
        r.group_conversation_id=gc.id 
      WHERE 
        r.id=$1 
      AND 
        gc.id=$2 
      AND 
        gc.host_user=$3`,
      [id, groupID, username]
    );

    if (!res.rows[0]) {
      throw new ForbiddenError(
        "You are not the host of the group this request was made for!"
      );
    }
  }

  // adds a new row to the group conversation requests table with the inputted sender username, message
  // contain and group id; returns that new made row along with additional information from the joined
  // group conversations table with the matching group id;
  static async createRequest(from, content, group) {
    const r = await db.query(
      `INSERT INTO
        group_conversation_requests
        (requester_user,
        content,
        group_conversation_id)
      VALUES
        ($1, $2, $3)
      RETURNING
        id`,
      [from, content, group]
    );

    const res = await db.query(
      `SELECT
        r.id,
        gc.host_user AS "to",
        r.requester_user AS "from",
        r.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        r.created_at AS "createdAt"
      FROM
        group_conversation_requests AS r
      JOIN
        group_conversations AS gc
      ON
        gc.id=r.group_conversation_id
      WHERE
        r.id=$1`,
      [r.rows[0].id]
    );

    return res.rows[0];
  }

  // updates a single row in the group conversation requests table with the matching id:
  // changes the is_removed column boolean value to the opposite boolean; returns the updated group request
  // row along with additional information from the joined group conversations table
  static async removeRequest(remove, id) {
    await db.query(
      `UPDATE 
          group_conversation_requests
        SET 
          is_removed=$1 
        WHERE 
          id=$2
            `,
      [remove, id]
    );

    const res = await db.query(
      `SELECT 
        r.id,
        gc.host_user AS "to",
        r.requester_user AS "from",
        r.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        r.created_at AS "createdAt"
      FROM 
        group_conversation_requests AS r
      JOIN 
        group_conversations AS gc
      ON 
        r.group_conversation_id=gc.id
      WHERE 
        r.id=$1
            `,
      [id]
    );

    return res.rows[0];
  }

  // deletes a single row from the group conversation requests table that contains the matching id; if
  // the row does not exist, throws an error
  static async deleteRequest(id, from, groupID) {
    const requestCheck = await db.query(
      `SELECT 
            id,
            requester_user,
            group_conversation_id
        FROM
            group_conversation_requests
        WHERE
            id=$1
        AND
            requester_user=$2
        AND
            group_conversation_id=$3`,
      [id, from, groupID]
    );

    if (!requestCheck.rows[0]) {
      throw new NotFoundError("Request not found");
    }

    await db.query(
      `
        DELETE FROM 
          group_conversation_requests 
        WHERE 
          id=$1`,
      [id]
    );
  }

  // adds a single row to the group conversations invitations table with the inputted sender username,
  // recipient username, message content, and group id; returns the newly made row along with additional
  // data from the joined group conversations table where the group ids match
  static async createInvitation(from, to, content, group) {
    const i = await db.query(
      `INSERT INTO 
        group_conversation_invitations 
          (inviter_user, 
          invited_user, 
          content,
          group_conversation_id) 
      VALUES 
        ($1, $2, $3, $4)
      RETURNING
        id`,
      [from, to, content, group]
    );

    const res = await db.query(
      `SELECT 
        i.id,
        i.invited_user AS "to",
        i.inviter_user AS "from",
        i.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        i.created_at AS "createdAt"
      FROM
        group_conversation_invitations AS i
      JOIN
        group_conversations AS gc
      ON
        i.group_conversation_id=gc.id
      WHERE
        i.id=$1`,
      [i.rows[0].id]
    );

    return res.rows[0];
  }

  // updates a single row in the group conversation invitations table with the matching id: changes
  // the is_removed column boolean value to the opposite boolean; returns the updated group invitations
  // row along with additional information from the joined group conversations table
  static async removeInvitation(remove, id) {
    await db.query(
      `UPDATE 
          group_conversation_invitations
        SET 
          is_removed=$1 
        WHERE 
          id=$2
            `,
      [remove, id]
    );

    const res = await db.query(
      `SELECT 
        i.id,
        i.invited_user AS "to",
        i.inviter_user AS "from",
        i.content,
        gc.title AS "groupTitle",
        gc.id AS "groupID",
        i.created_at AS "createdAt"
      FROM 
        group_conversation_invitations AS i
      JOIN 
        group_conversations AS gc
      ON 
        i.group_conversation_id=gc.id
      WHERE 
        i.id=$1
            `,
      [id]
    );

    return res.rows[0];
  }

  // deletes a single row from the group conversation invitations table that contains the matching id; if
  // the row does not exist, throws an error
  static async deleteInvitation(id, to, from, groupID) {
    const userCheck = await db.query(
      `SELECT 
            id,
            invited_user,
            inviter_user,
            group_conversation_id
        FROM
            group_conversation_invitations
        WHERE
            id=$1
        AND
            invited_user=$2
        AND
            inviter_user=$3
        AND
            group_conversation_id=$4`,
      [id, to, from, groupID]
    );

    if (!userCheck.rows[0]) {
      throw new NotFoundError("Invitation not found");
    }

    await db.query(
      `DELETE FROM 
        group_conversation_invitations 
      WHERE 
        id=$1`,
      [id]
    );
  }
}
module.exports = GroupRequests;
