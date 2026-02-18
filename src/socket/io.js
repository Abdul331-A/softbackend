import { Server } from "socket.io";

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Setup
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    // Join Chat Room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    // New Message
    socket.on("new message", (newMessageRecieved) => {
      const chat = newMessageRecieved.chat;

      if (!chat?.users) {
        console.log("chat.users not defined");
        return;
      }

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;

        socket.to(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });
};

export default initializeSocket;