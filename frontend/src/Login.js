import React, { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !room.trim()) {
      setError("Username and room are required");
      return;
    }

    onLogin({ username: username.trim(), room: room.trim(), password });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Join Chat Room</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: "10px", display: "block" }}
        />
        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ marginBottom: "10px", display: "block" }}
        />
        <input
          type="password"
          placeholder="Room Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "10px", display: "block" }}
        />
        <button onClick={handleLogin}>Join</button>
      </div>
    </div>
  );
}

export default Login;
