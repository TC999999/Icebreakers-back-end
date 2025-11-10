const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { sessionMiddleware, corsOptions } = require("./serverConfig");
const DirectConversations = require("./models/directConversations");
const GroupConversations = require("./models/groupConversations");

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
  pingInterval: 25000,
  pingTimeout: 60000,
});

// for storing user socket ids
const users = new Map();

// allows socket.io to access express-session middleware
io.engine.use(sessionMiddleware);

// socket.io connection and session access
io.on("connection", async (socket) => {
  const session = socket.request.session;
  const username = session.user.username;

  // sets username in user map above for sending and receiving private messages
  users.set(username, { id: socket.id, socket });
  console.log("*****User " + username + " Connected*****");

  socket.broadcast.emit("isOnline", { user: username, isOnline: true });

  socket.on("isOnline", (user, callback) => {
    const isOnline = users.has(user);
    callback(isOnline);
  });

  // joins/creates rooms for sending and receiving group messages
  const groups = await GroupConversations.getAllGroupsSocket(username);
  socket.join(
    groups.map((id) => {
      return "group:" + id;
    })
  );

  socket.on("addRequest", ({ requestType, countType, request, to }) => {
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
      recipientSocket.request.session.user.unansweredRequests += 1;
      recipientSocket.request.session.save();
    }
  });

  socket.on("removeRequest", ({ requestType, countType, request, to }) => {
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
      recipientSocket.request.session.user.unansweredRequests += -1;
      recipientSocket.request.session.save();
    }
  });

  socket.on("updateFavoriteColor", ({ favoriteColor }) => {
    session.user.favoriteColor = favoriteColor;
    session.save();
  });

  socket.on("clearTotalUnreadMessages", ({ unreadMessages }) => {
    session.user.unreadMessages -= unreadMessages;
    session.save();
  });

  socket.on("isTyping", ({ otherUser, id, to, isTyping }) => {
    let recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("isTyping", {
        otherUser,
        id,
        isTyping,
      });
    }
  });

  socket.on("addConversation", ({ conversation, to }) => {
    let recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("addConversation", {
        conversation,
      });
    }
  });

  socket.on("response", ({ response, to, requestType, countType }) => {
    let recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("removeRequest", {
        request: response,
        requestType,
        countType,
      });
    }
  });

  socket.on("directMessage", ({ message, id, to }) => {
    let recipientUID = users.get(to).id;
    let recipientSocket = users.get(to).socket;
    if (recipientUID && recipientSocket) {
      io.to(recipientUID).emit("increaseUnreadMessages");
      io.to(recipientUID).emit("directMessage", {
        message,
        id,
      });
      recipientSocket.request.session.user.unreadMessages += 1;
      recipientSocket.request.session.save();
    }
  });

  socket.on("decreaseUnreadMessages", async ({ id }) => {
    await DirectConversations.clearUnreadMessages(id, session.user.username);
    session.user.unreadMessages -= 1;
    session.save();
  });

  socket.on("editConversation", ({ conversation, to }) => {
    let recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("editConversation", {
        conversation,
      });
    }
  });

  socket.on("joinGroup", ({ group }) => {
    socket.join("group:" + group.id);
  });

  socket.on("bringIntoGroup", ({ to, group }) => {
    let recipientSocket = users.get(to).socket;
    if (recipientSocket) {
      recipientSocket.join("group:" + group.id);
    }
  });

  socket.on("addUserToGroup", ({ groupID, user }) => {
    socket.to("group:" + groupID).emit("addUserToGroup", {
      groupID,
      user,
    });
  });

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
