const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`**********SERVER STARTED ON PORT ${PORT}**********`);
});
