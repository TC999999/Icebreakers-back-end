const server = require("./serverSetup");
const { initializeSocket } = require("./socket");
const { PORT } = require("./config");

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`**********SERVER STARTED ON PORT ${PORT}**********`);
});
