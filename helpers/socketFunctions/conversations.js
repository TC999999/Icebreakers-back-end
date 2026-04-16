const { getIO } = require("../../socket");
const users = require("../../socketStore");
const {
  constructToastMessageEditConversation,
} = require("../constructToastMessage");

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

// when user emits signal, increases recipients unread message count, sends message to be added to list
// of messages on client side, sends them a notification that they received a message, and increases
// recipient's unread message count in their express session
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

// when server emits signal, sends updated conversation data and toast notification message to recipient user
const editConversationSocket = (username, newTitle, to, id, lastUpdatedAt) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;
    if (recipientUID) {
      io.to(recipientUID).emit("editConversation", {
        title: newTitle,
        cID: id,
        lastUpdatedAt,
      });
      io.to(recipientUID).emit("notify", {
        from: "Icebreakers",
        message: constructToastMessageEditConversation(username, newTitle),
        pathname: "",
      });
    }
  }
};

module.exports = {
  addConversationSocket,
  newConversationMessageSocket,
  editConversationSocket,
};
