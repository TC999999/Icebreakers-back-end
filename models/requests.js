const db = require("../db");
const constructRequestString = require("../helpers/constructRequestString");
const returnCountString = require("../helpers/returnCountString");

// class of functions that handle retrieval of any request or invitation in the database
class AllRequests {
  // gets a list of filtered rows from either the direct requests table, group requests table, or group
  // invitations table that contain the inputted username; filter depends on inputted parameters
  static async getAllRequests(username, params) {
    const res = await db.query(constructRequestString(params), [username]);

    return res.rows;
  }

  // returns a total count of all rows from all requests/invitations tables
  static async getAllRequestCount(username) {
    const res = await db.query(
      `SELECT 
            ${returnCountString("receivedDirectRequestCount")}, 
            ${returnCountString("sentDirectRequestCount")}, 
            ${returnCountString("removedDirectRequestCount")},
            ${returnCountString("receivedGroupInvitationCount")},
            ${returnCountString("sentGroupInvitationCount")},
            ${returnCountString("removedGroupInvitationCount")},
            ${returnCountString("receivedGroupRequestCount")},
            ${returnCountString("sentGroupRequestCount")}, 
            ${returnCountString("removedGroupRequestCount")}`,
      [username]
    );

    return Object.keys(res.rows[0]).reduce((acc, c) => {
      acc[c] = parseFloat(res.rows[0][c]);

      return acc;
    }, {});
  }

  // returns a total count of all rows of requests/invitations recieved by the user from all three
  // requests/invitations tables
  static async getUnansweredRequestCount(username) {
    const res = await db.query(
      `
        SELECT 
            (
                ${returnCountString("receivedDirectRequestCount", false)}
            + 
                ${returnCountString("receivedGroupInvitationCount", false)}
            + 
                ${returnCountString("receivedGroupRequestCount", false)}
            ) AS "unansweredRequests"`,
      [username]
    );

    let unansweredRequests = parseFloat(res.rows[0].unansweredRequests);

    return { unansweredRequests };
  }
}

module.exports = AllRequests;
