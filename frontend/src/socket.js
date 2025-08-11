// src/socket.js
import { io } from "socket.io-client";

// Make sure this matches your backend port (5001)
const socket = io("http://localhost:5001");

export default socket;
