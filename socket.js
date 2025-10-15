const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { sessionMiddleware, corsOptions } = require("./serverConfig");
const DirectConversations = require("./models/directConversations");

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// for storing user socket ids
const users = new Map();

// allows socket.io to access express-session middleware
io.engine.use(sessionMiddleware);

// socket.io connection and session access
io.on("connection", (socket) => {
  const session = socket.request.session;
  const username = session.user.username;

  users.set(username, socket.id);
  console.log("*****User " + username + " Connected*****");

  socket.on("addToDirectRequestList", ({ request, unansweredRequests, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("addToDirectRequestList", {
        request,
      });
      io.to(recipientUID).emit("updateUnansweredRequests", {
        unansweredRequests,
      });
    }
  });

  socket.on("updateUnansweredRequests", ({ unansweredRequests }) => {
    session.user.unansweredRequests = unansweredRequests;
    session.save();
  });

  socket.on("increaseUnreadMessages", () => {
    session.user.unreadMessages += 1;
    session.save();
  });

  socket.on("clearTotalUnreadMessages", ({ unreadMessages }) => {
    session.user.unreadMessages -= unreadMessages;
    session.save();
  });

  socket.on("decreaseUnreadMessages", ({ id }) => {
    const clearUnreadMessages = async () => {
      await DirectConversations.clearUnreadMessages(id, session.user.username);
    };

    clearUnreadMessages();

    session.user.unreadMessages -= 1;
    session.save();
  });

  socket.on("removeDirectRequest", ({ unansweredRequests, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("removeDirectRequest", {
        from: username,
      });
      io.to(recipientUID).emit("updateUnansweredRequests", {
        unansweredRequests,
      });
    }
  });

  socket.on("directResponse", ({ response, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("directResponse", {
        response,
        from: username,
      });
      io.to(recipientUID).emit("removeSentRequest", { id: response.requestID });
    }
  });

  socket.on("directMessage", ({ message, id, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("increaseUnreadMessages");
      io.to(recipientUID).emit("directMessage", {
        message,
        id,
      });
    }
  });

  socket.on("disconnect", () => {
    users.delete(username);
    console.log(
      "*****User " + socket.request.session.user.username + " Disconnected*****"
    );
  });
});

module.exports = server;
