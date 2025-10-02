const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { sessionMiddleware, corsOptions } = require("./serverConfig");

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// allows socket.io to access express-session middleware
io.engine.use(sessionMiddleware);

// socket.io connection and session access
io.on("connection", (socket) => {
  const session = socket.request.session;
  console.log(
    "*****User " + socket.request.session.user.username + " Connected*****"
  );

  socket.on("session", () => {
    console.log("Test Socket", socket.request.session);
  });

  socket.on("disconnect", () => {
    console.log(
      "*****User " + socket.request.session.user.username + " Disconnected*****"
    );
  });
});

module.exports = server;
