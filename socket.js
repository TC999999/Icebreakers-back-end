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
    session.user.unansweredRequests = unansweredRequests.unansweredRequests;
    session.save();
  });

  socket.on("remove direct request", ({ to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("remove direct request", {
        from: username,
      });
    }
  });

  socket.on("direct response", ({ response, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("direct response", {
        response,
        from: username,
        to: to,
      });
    }
  });

  socket.on("direct message", ({ message, to }) => {
    let recipientUID = users.get(to);
    if (recipientUID) {
      io.to(recipientUID).emit("direct message", {
        message,
        from: username,
        to: to,
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
