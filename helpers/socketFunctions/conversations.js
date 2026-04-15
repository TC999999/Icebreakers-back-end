const { getIO } = require("../../socket");
const users = require("../../socketStore");

const addConversationSocket = (conversation, to) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("addConversation", {
        conversation,
      });
    }
  }
};

const newConversationMessageSocket = (message, to, id) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;
    const recipientSocket = users.get(to).socket;
    if (recipientUID && recipientSocket) {
      io.to(recipientUID).emit("directMessage", {
        message,
        id,
      });

      io.to(recipientUID).emit("increaseUnreadDirectMessages");

      io.to(recipientUID).emit("notify", {
        from: message.username,
        message: message.content,
        pathname: "/conversations",
      });

      recipientSocket.request.session.reload(() => {
        recipientSocket.request.session.unreadDirectMessages += 1;
        recipientSocket.request.session.save();
      });
    }
  }
};

module.exports = { addConversationSocket, newConversationMessageSocket };
