require("dotenv").config();

// server port
const PORT = +process.env.port || 3001;

module.exports = { PORT };
