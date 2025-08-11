// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"],
  },
});

// Store chat history for each room
const chatHistory = {};
// Store room passwords in memory (not secure for production)
const roomPasswords = {};

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // Join room (matches frontend's event name and format)
  socket.on("join_room", ({ username, room, password }, callback) => {
    if (!username || !room || !password) {
      return callback({ success: false, error: "All fields are required." });
    }

    // Check if room exists
    if (roomPasswords[room]) {
      // Validate password
      if (roomPasswords[room] !== password) {
        return callback({ success: false, error: "Incorrect password" });
      }
    } else {
      // New room — set its password
      roomPasswords[room] = password;
    }

    socket.join(room);
    console.log(`📥 ${username} joined room: ${room}`);

    // Send existing chat history back in callback
    callback({
      success: true,
      history: chatHistory[room] || [],
    });

    // Notify others
    socket.to(room).emit("systemMessage", `${username} has joined the room.`);
  });

  // Handle messages
  socket.on("sendMessage", ({ username, room, text, time }) => {
    if (!username || !room || !text) return;

    const message = {
      username,
      text,
      time:
        time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    if (!chatHistory[room]) {
      chatHistory[room] = [];
    }
    chatHistory[room].push(message);

    io.to(room).emit("receiveMessage", message);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
