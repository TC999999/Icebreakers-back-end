const db = require("../db");
const {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../expressError");

// Direct Messages model: handles all postgresql queries that involve direct message conversations, including
// creating a new conversation, creating a new message for an existing conversation, retrieving all conversations
// a single user is a part of, and editing a conversation
class DirectConversations {
  // adds new row to direct conversations table and adds two rows to users to direct conversations for
  // each user
  static async createNewConversation(user_1, user_2) {
    const res = await db.query(
      `INSERT INTO 
          direct_conversations 
       DEFAULT VALUES
       RETURNING
          id,
          title,
          last_updated_at AS "lastUpdatedAt"`
    );

    const conversation = res.rows[0];

    await db.query(
      `INSERT INTO users_to_direct_conversations 
      (username, 
       direct_conversation_id)
     VALUES
        ($2,$1),
        ($3,$1)`,
      [conversation.id, user_1, user_2]
    );

    return conversation;
  }

  // checks if a conversation row with matching id exists in the direct conversations table;
  // throws an error if it does not
  static async conversationExists(id) {
    const res = await db.query(
      `SELECT id FROM direct_conversations WHERE id=$1`,
      [id]
    );

    if (!res.rows[0]) {
      throw new NotFoundError("Conversation does not exist!");
    }
  }

  // finds two rows with two distinct usernames in the users to direct conversations table that have the same direct conversation id and
  // returns that id
  static async getConversationID(username1, username2) {
    if (username1 === username2) {
      throw new ForbiddenError("Cannot make a conversation with yourself");
    }
    const res = await db.query(
      `
      SELECT 
        udc.direct_conversation_id AS id 
      FROM 
        users_to_direct_conversations AS udc 
      JOIN 
        (SELECT 
          direct_conversation_id 
        FROM 
          users_to_direct_conversations 
        WHERE username=$1) AS udc2 
      ON 
        udc.direct_conversation_id=udc2.direct_conversation_id 
      WHERE 
        udc.username=$2`,
      [username1, username2]
    );

    return res.rows[0];
  }

  // checks if a user to direct conversation row with matching conversation id and username exist
  // simultaneously in the users to direct conversations table; throws an error if it does not
  static async userConversationCheck(id, username) {
    const res = await db.query(
      `SELECT
        username,
        direct_conversation_id
      FROM
        users_to_direct_conversations
      WHERE
        direct_conversation_id=$1
      AND
        username=$2
      `,
      [id, username]
    );

    if (!res.rows[0]) {
      throw new UnauthorizedError("You are not involved in this conversation!");
    }
  }

  // creates a new message in direct conversation messages table: adds the user who created the message and
  // the conversation it was made for
  static async createNewMessage(content, username, id) {
    const messageRes = await db.query(
      `INSERT INTO direct_conversations_messages
            (content,
            username,
            direct_conversation_id)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            content,
            username,
            created_at AS "createdAt"`,
      [content, username, id]
    );

    const message = messageRes.rows[0];

    await db.query(
      `UPDATE 
        direct_conversations 
      SET 
        last_updated_at=$1 
      WHERE 
        id=$2`,
      [message.createdAt, id]
    );

    const otherUserRes = await db.query(
      `SELECT
        username
      FROM
        users_to_direct_conversations
      WHERE
        direct_conversation_id=$1
      AND
        username!=$2`,
      [id, username]
    );

    const otherUser = otherUserRes.rows[0];

    return { message, otherUser };
  }

  // returns a list of all conversations that a user is a part of, includes title, the other user, the
  // total count of unread messages, and the latest message from that conversation, which is shortened if
  // longer than 30 characters
  static async getAllConversations(username) {
    const res = await db.query(
      `SELECT 
        dc.id, 
        dc.title, 
        dc.last_updated_at AS "lastUpdatedAt", 
        ou.other_user AS "otherUser", 
        udc.unread_messages AS "unreadMessages", 
        CASE WHEN CHAR_LENGTH(lm.latest_message) > 30
        THEN CONCAT(SUBSTRING(lm.latest_message, 1, 30), '...') 
        ELSE lm.latest_message END AS "latestMessage" 
      FROM 
        direct_conversations AS dc 
      LEFT JOIN LATERAL 
        (SELECT 
          content AS latest_message 
        FROM 
          direct_conversations_messages 
        WHERE 
          direct_conversation_id=dc.id 
        ORDER BY 
          created_at 
        DESC 
        LIMIT 
          1) AS lm 
        ON TRUE 
        JOIN 
          users_to_direct_conversations AS udc 
        ON 
          dc.id=udc.direct_conversation_id 
        JOIN 
          (SELECT 
            dc.id, 
            udc.username AS "other_user" 
          FROM 
            direct_conversations AS dc 
          JOIN 
            users_to_direct_conversations AS udc 
          ON 
            dc.id=udc.direct_conversation_id 
          WHERE 
            dc.id 
          IN 
            (SELECT 
              udc2.direct_conversation_id 
            FROM 
              users_to_direct_conversations AS udc2 
            WHERE 
              username=$1) 
          AND 
            username!=$1) AS ou 
        ON 
          ou.id=dc.id 
        WHERE 
          udc.username=$1
        ORDER BY
          dc.last_updated_at
        DESC`,
      [username]
    );
    return res.rows;
  }

  // retrieves the saved number of unread messages a user has in a single user to direct conversation row
  static async getUnreadMessages(id, username) {
    const res = await db.query(
      `SELECT
        unread_messages AS "unreadMessages"
      FROM
        users_to_direct_conversations 
      WHERE 
        direct_conversation_id=$1 
      AND 
        username=$2`,
      [id, username]
    );

    return res.rows[0];
  }

  // increases the saved number of unread messages a user has in a single user to direct conversation row
  // by one
  static async updateUnreadMessages(id, username) {
    const res = await db.query(
      `UPDATE 
        users_to_direct_conversations 
      SET 
        unread_messages=unread_messages+1
      WHERE 
        direct_conversation_id=$1 
      AND 
        username=$2
      RETURNING
        unread_messages AS "unreadMessages"`,
      [id, username]
    );

    return res.rows[0];
  }

  // reduces the saved number of unread messages a user has in a user to single direct conversation to zero
  static async clearUnreadMessages(id, username) {
    const res = await db.query(
      `UPDATE 
        users_to_direct_conversations 
      SET 
        unread_messages=0 
      WHERE 
        direct_conversation_id=$1 
      AND 
        username=$2
      RETURNING
        unread_messages AS "unreadMessages"`,
      [id, username]
    );

    return res.rows[0];
  }

  // retrieves all rows from messages table that have the same direct conversation id
  static async getMessages(id) {
    const res = await db.query(
      `SELECT
            id,
            content,
            username,
            created_at AS "createdAt"
        FROM
            direct_conversations_messages
        WHERE
            direct_conversation_id=$1`,
      [id]
    );

    return res.rows;
  }

  // retrives the row in user to direct conversations table that contains a specified direct conversation
  // id and does not contain a specified username
  static async getOtherConversationUser(id, username) {
    const res = await db.query(
      `SELECT 
        username AS "recipient", 
        direct_conversations.id AS "id",
        title 
      FROM 
        users_to_direct_conversations 
      JOIN
        direct_conversations
      ON
        users_to_direct_conversations.direct_conversation_id=direct_conversations.id
      WHERE 
        username!=$1 
      AND 
        direct_conversation_id=$2`,
      [username, id]
    );

    return res.rows[0];
  }

  // sums the total number of unread messages in ever row in the user to direct conversations table that
  // contains the specfied username
  static async getAllUnreadMessageCount(username) {
    const res = await db.query(
      `SELECT 
        SUM(unread_messages) AS "unreadMessages" 
      FROM 
        users_to_direct_conversations 
      WHERE 
        username=$1`,
      [username]
    );

    return res.rows[0];
  }

  // updates the title and updated at timestamp of a single row in the direct conversations table that
  // contains a specified id
  static async editConversation(id, title) {
    const res = await db.query(
      `UPDATE
        direct_conversations
      SET
        title=$1,
        last_updated_at=CURRENT_TIMESTAMP
      WHERE
        id=$2
      RETURNING
        id,
        title,
        last_updated_at AS "lastUpdatedAt"`,
      [title, id]
    );

    return res.rows[0];
  }
}

module.exports = DirectConversations;
