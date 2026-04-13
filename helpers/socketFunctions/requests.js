const { getIO } = require("../../socket");
const users = require("../../socketStore");
const constructToastMessage = require("../constructToastMessage");

const addRequestSocket = (requestType, to, request, username) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;
    const recipientSocket = users.get(to).socket;
    if (recipientUID && recipientSocket) {
      io.to(recipientUID).emit("addRequest", { request, requestType });
      io.to(recipientUID).emit("updateUnansweredRequests", {
        change: 1,
      });
      io.to(recipientUID).emit("notify", {
        from: "Icebreakers",
        message: constructToastMessage(username, request, requestType, "add"),
        pathname: "",
      });
      recipientSocket.request.session.reload(() => {
        recipientSocket.request.session.user.unansweredRequests += 1;
        recipientSocket.request.session.save();
      });
    }
  }
};

const removeRequestSocket = (requestType, to, request, username) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;
    const recipientSocket = users.get(to).socket;
    if (recipientUID && recipientSocket) {
      io.to(recipientUID).emit("removeRequest", { request, requestType });
      io.to(recipientUID).emit("updateUnansweredRequests", {
        change: -1,
      });
      io.to(recipientUID).emit("notify", {
        from: "Icebreakers",
        message: constructToastMessage(
          username,
          request,
          requestType,
          "remove",
        ),
        pathname: "",
      });
      recipientSocket.request.session.user.unansweredRequests += -1;
      recipientSocket.request.session.save();
    }
  }
};

const requestResponseSocket = (response, to, requestType, username) => {
  const io = getIO();
  if (users.has(to)) {
    const recipientUID = users.get(to).id;

    if (recipientUID) {
      io.to(recipientUID).emit("removeRequest", { response, requestType });

      const responseKey = response.accepted ? "accepted" : "declined";

      io.to(recipientUID).emit("notify", {
        from: "Icebreakers",
        message: constructToastMessage(
          username,
          response,
          requestType,
          responseKey,
        ),
        pathname: "",
      });
    }
  }
};

module.exports = {
  addRequestSocket,
  removeRequestSocket,
  requestResponseSocket,
};
