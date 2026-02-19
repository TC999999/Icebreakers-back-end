// const io = require("../../socket");
// const users = require("../../socketStore");

// const addConversationSocket = (conversation, to) => {
//   if (users.has(to)) {
//     const recipientUID = users.get(to).id;
//     if (recipientUID) {
//       io.to(recipientUID).emit("addConversation", {
//         conversation,
//       });
//     }
//   }
// };

// module.exports = { addConversationSocket };
