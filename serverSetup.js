const app = require("./app");
const { createServer } = require("http");

const server = createServer(app);

module.exports = server;
