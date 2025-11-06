const db = require("../db");
const constructRequestString = require("../helpers/constructRequestString");
const returnCountString = require("../helpers/returnCountString");

class AllRequests {
  static async getAllRequests(username, params) {
    const res = await db.query(constructRequestString(params), [username]);

    return res.rows;
  }

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
