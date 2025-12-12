const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { sessionMiddleware, corsOptions } = require("./serverConfig");
const DirectConversations = require("./models/directConversations");
const GroupConversations = require("./models/groupConversations");
const constructToastMessage = require("./helpers/constructToastMessage");
const users = require("./socketStore");

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
  pingInterval: 25000,
  pingTimeout: 60000,
});

// allows socket.io to access express-session middleware
io.engine.use(sessionMiddleware);

// socket.io connection and session access
io.on("connection", async (socket) => {
  const session = socket.request.session;
  const username = session.user.username;

  // sets username in user map above for sending and receiving private messages
  users.set(username, { id: socket.id, socket });
  console.log("*****User " + username + " Connected*****");

  // broadcasts to all other users that the current user is online
  socket.broadcast.emit("isOnline", { user: username, isOnline: true });

  // checks if users map stored in server memory contains inputted username, and performs a callback
  // function with result
  socket.on("isOnline", (user, callback) => {
    const isOnline = users.has(user);
    callback(isOnline);
  });

  // checks if a group of usernames is stored in the users map stored in server memory, and performs a
  // callback function with results
  socket.on("isOnlineGroup", (user, callback) => {
    let newUsers = user.map((u) => {
      return { ...u, isOnline: users.has(u.username) };
    });

    callback(newUsers);
  });

  // joins/creates rooms for sending and receiving group messages
  const groups = await GroupConversations.getAllGroupsSocket(username);
  const rooms = groups.map((id) => {
    return "group:" + id;
  });

  // for each group a user in in, on connection, the user joins/creates the socket room
  // and emits to others in that room hat they are online
  rooms.forEach((room) => {
    socket.join(room);
    socket.to(room).emit("isOnline", { user: username, isOnline: true });
  });

  // when user emits "addRequest" signal, sends request, updated unanswered request count, and notification
  // message to recipient user client side; also updates the unanswered request count in the recipient
  // express session
  socket.on("addRequest", ({ requestType, countType, request, to }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      let recipientSocket = users.get(to).socket;
      if (recipientUID && recipientSocket) {
        io.to(recipientUID).emit("addRequest", {
          request,
          requestType,
          countType,
        });
        io.to(recipientUID).emit("updateUnansweredRequests", {
          change: 1,
        });
        io.to(recipientUID).emit("notify", {
          from: "Icebreakers",
          message: constructToastMessage(username, request, requestType, "add"),
          pathname: "/request",
        });
        recipientSocket.request.session.user.unansweredRequests += 1;
        recipientSocket.request.session.save();
      }
    }
  });

  // when user emits "requestRequest" signal, sends request, updated unanswered request count, and
  // notification message to recipient user client side; also updates the unanswered request count in
  // the recipient express session
  socket.on("removeRequest", ({ requestType, countType, request, to }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      let recipientSocket = users.get(to).socket;
      if (recipientUID && recipientSocket) {
        io.to(recipientUID).emit("removeRequest", {
          request,
          requestType,
          countType,
        });
        io.to(recipientUID).emit("updateUnansweredRequests", {
          change: -1,
        });
        io.to(recipientUID).emit("notify", {
          from: "Icebreakers",
          message: constructToastMessage(
            username,
            request,
            requestType,
            "remove"
          ),
          pathname: "",
        });
        recipientSocket.request.session.user.unansweredRequests += -1;
        recipientSocket.request.session.save();
      }
    }
  });

  // updates the current user's favorite color in express session
  socket.on("updateFavoriteColor", ({ favoriteColor }) => {
    session.user.favoriteColor = favoriteColor;
    session.save();
  });

  // reduces the current user's unread direct message count in express session
  socket.on("clearTotalUnreadDirectMessages", ({ unreadMessages }) => {
    session.user.unreadDirectMessages -= unreadMessages;
    session.save();
  });

  // reduces the current user's unread group message count in express session
  socket.on("clearTotalUnreadGroupMessages", ({ unreadMessages }) => {
    session.user.unreadGroupMessages -= unreadMessages;
    session.save();
  });

  // when user emits signal, sends information about whether the user is typing a message to the recipient
  // user or not
  socket.on("isTyping", ({ otherUser, id, to, isTyping }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      if (recipientUID) {
        io.to(recipientUID).emit("isTyping", {
          otherUser,
          id,
          isTyping,
        });
      }
    }
  });

  // when user emits signal, sends information about whether the user is typing a message to a specific
  // group or not
  socket.on("isGroupTyping", ({ id, isTyping }) => {
    socket.to("group:" + id).emit("isGroupTyping", { id, username, isTyping });
  });

  // when user emits signal, sends new conversation to be added to recipient user's client side
  // conversation list
  socket.on("addConversation", ({ conversation, to }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      if (recipientUID) {
        io.to(recipientUID).emit("addConversation", {
          conversation,
        });
      }
    }
  });

  // when user emits signal, sends both a signal to remove the request component from the recipient's request
  // inbox and send them a notification about whether they accecpted the request; also updates user's
  // unanswered requests count in session
  socket.on("response", ({ response, to, requestType, countType }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      if (recipientUID) {
        io.to(recipientUID).emit("removeRequest", {
          request: response,
          requestType,
          countType,
        });

        let responseKey = response.accepted ? "accepted" : "declined";

        io.to(recipientUID).emit("notify", {
          from: "Icebreakers",
          message: constructToastMessage(
            username,
            response,
            requestType,
            responseKey
          ),
          pathname: "",
        });

        session.user.unansweredRequests += -1;
        session.save();
      }
    }
  });

  // when user emits signal, increases recipients unread message count, sends message to be added to list
  // of messages on client side, sends them a notification that they received a message, and increases
  // recipient's unread message count in their express session
  socket.on("directMessage", ({ message, id, to }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      let recipientSocket = users.get(to).socket;
      if (recipientUID && recipientSocket) {
        io.to(recipientUID).emit("increaseUnreadDirectMessages");
        io.to(recipientUID).emit("directMessage", {
          message,
          id,
        });
        io.to(recipientUID).emit("notify", {
          from: username,
          message: message.content,
          pathname: "/conversations",
        });
        recipientSocket.request.session.user.unreadDirectMessages += 1;
        recipientSocket.request.session.save();
      }
    }
  });

  // decreases the current user's unread message count in express session and clears the total number of
  // unread messages in the database
  socket.on("decreaseUnreadDirectMessages", async ({ id }) => {
    await DirectConversations.clearUnreadMessages(id, username);
    session.user.unreadDirectMessages -= 1;
    session.save();
  });

  // decreases the current user's unread message count in express session and clears the total number of
  // unread messages in the database
  socket.on("decreaseUnreadGroupMessages", async ({ id }) => {
    await GroupConversations.clearUnreadMessages(id, username);
    session.user.unreadGroupMessages -= 1;
    session.save();
  });

  // when user emits signal, sends updated conversation data to recipient user
  socket.on("editConversation", ({ conversation, to }) => {
    if (users.has(to)) {
      let recipientUID = users.get(to).id;
      if (recipientUID) {
        io.to(recipientUID).emit("editConversation", {
          conversation,
        });
      }
    }
  });

  // lets current user join group socket room
  socket.on("joinGroup", ({ group }) => {
    socket.join("group:" + group.id);
  });

  // lets current user bring another user into a group socket room
  socket.on("bringIntoGroup", ({ to, group }) => {
    if (users.has(to)) {
      let recipientSocket = users.get(to).socket;
      if (recipientSocket) {
        recipientSocket.join("group:" + group.id);
      }
    }
  });

  // when user emits signal, adds new user info to all group members' client side group user list
  socket.on("addUserToGroup", ({ groupID, user }) => {
    const isOnline = users.has(user.username);
    socket.to("group:" + groupID).emit("addUserToGroup", {
      groupID,
      user,
      isOnline,
    });
  });

  // when user emits signal, sends new message to everyone in room with specified group id, also updates
  // unread message count in session for each user in the group
  socket.on("groupMessage", ({ message, group, id, userList }) => {
    socket.to("group:" + id).emit("groupMessage", { message, id });
    socket.to("group:" + id).emit("increaseUnreadGroupMessages");
    socket.to("group:" + id).emit("notify", {
      from: username,
      message: message.content,
      group,
      pathname: "/conversations/groups",
    });

    userList.forEach((u) => {
      if (users.has(u.username)) {
        let recipientSocket = users.get(u.username).socket;
        recipientSocket.request.session.user.unreadGroupMessages += 1;
        recipientSocket.request.session.save();
      }
    });
  });

  // when a user disconnects from socket, removes their data from users map, and broadcasts to all other users
  // that they are no longer online
  socket.on("disconnect", (reason) => {
    users.delete(username);
    io.emit("isOnline", { user: username, isOnline: false });
    console.log(
      "*****User " +
        socket.request.session.user.username +
        " Disconnected: " +
        reason +
        "*****"
    );
  });
});

module.exports = server;
