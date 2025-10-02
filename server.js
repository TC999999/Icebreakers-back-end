const server = require("./socket");
const { PORT } = require("./config");

server.listen(PORT, () => {
  console.log(`**********SERVER STARTED ON PORT ${PORT}**********`);
});
