const Message = require("../models/message");

function setupChat(io) {
  io.on("connection", (socket) => {
    const { id, username } = socket.user;
    console.log(`[socket] ${username} connected (socket ${socket.id})`);

    // Send recent message history to the newly connected client
    const history = Message.getRecent(50);
    socket.emit("history", history);

    // Handle incoming messages
    socket.on("message", (data) => {
      if (!data || !data.content || typeof data.content !== "string") {
        return socket.emit("error", { message: "Message content is required" });
      }

      const content = data.content.trim();
      if (content.length === 0 || content.length > 2000) {
        return socket.emit("error", { message: "Message must be between 1 and 2000 characters" });
      }

      const message = Message.create(id, content);
      console.log(`[socket] ${username}: ${content.substring(0, 80)}`);

      // Broadcast to all connected clients including sender
      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] ${username} disconnected`);
    });
  });
}

module.exports = setupChat;
