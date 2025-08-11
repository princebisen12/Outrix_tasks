import React, { useState, useEffect, useRef } from "react";
import Chat from "./chat";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const joinRoom = () => {
    if (!username.trim() || !room.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    socket.emit("join_room", { username, room, password }, (response) => {
      if (response.success) {
        setChatHistory(response.history || []);
        setJoined(true);
      } else {
        alert(response.error || "Failed to join room");
        setPassword("");
      }
    });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="w-full">
        {!joined ? (
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">
              CHAT-NeST
            </h1>
            <input
              ref={usernameRef}
              type="text"
              placeholder="Username"
              className="w-full mb-3 px-4 py-2 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room"
              className="w-full mb-3 px-4 py-2 border rounded-md"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <input
              type="password"
              placeholder="Room Password"
              className="w-full mb-4 px-4 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={joinRoom}
              disabled={!username || !room || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50"
            >
              Join
            </button>
          </div>
        ) : (
          <Chat
            socket={socket}
            username={username}
            room={room}
            initialHistory={chatHistory}
          />
        )}
      </div>
    </div>
  );
}

export default App;
