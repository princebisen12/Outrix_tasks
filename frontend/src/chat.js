// src/chat.js
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react"; // ✅ Added import

export default function Chat({ socket, username, room, initialHistory = [] }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialHistory || []);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ Added state
  const messageListRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket || !username || !room) return;
    const onReceive = (data) => setMessages((prev) => [...prev, data]);
    const onSystem = (text) => {
      const sys = { username: "System", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, sys]);
    };
    const onActive = (users) => {
      if (!users) return;
      const arr = users.map(u => (typeof u === "string" ? u : u.username || u.name));
      setActiveUsers(arr);
    };
    socket.on("receiveMessage", onReceive);
    socket.on("systemMessage", onSystem);
    socket.on("active_users", onActive);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("systemMessage", onSystem);
      socket.off("active_users", onActive);
    };
  }, [socket, username, room]);

  useEffect(() => {
    messageListRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text || !socket) return;
    const payload = {
      username,
      room,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socket.emit("sendMessage", payload);
    setMessage("");
    setMessages(prev => [...prev, payload]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onAttachClick = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      const payload = {
        username,
        room,
        text: `[file] ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      socket.emit("sendMessage", payload);
      setMessages(prev => [...prev, payload]);
      setIsUploading(false);
    }, 800);
    e.target.value = "";
  };

  // ✅ Handle emoji selection
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const MessageBubble = ({ m }) => {
    const isSystem = m.username === "System";
    const isSelf = m.username === username;
    return (
      <div className={`flex ${isSystem ? "justify-center" : isSelf ? "justify-end" : "justify-start"}`}>
        <div
          role="article"
          aria-label={isSystem ? "system message" : `${m.username} message`}
          className={`max-w-[70%] p-3 rounded-xl break-words shadow-sm transform transition-all duration-150
            ${isSystem ? "bg-transparent text-gray-200 italic" : isSelf ? "bg-blue-500 text-white" : "bg-white/80 text-gray-900"}`}
        >
          {!isSystem && (
            <div className="text-xs font-semibold mb-1 opacity-90">
              {isSelf ? "You" : m.username}{" "}
              <span className="text-[10px] text-gray-400 font-normal ml-2">{m.time}</span>
            </div>
          )}
          <div className={`${isSystem ? "text-sm" : "text-base"}`}>{m.text}</div>
          {isSystem && <div className="text-xs text-gray-300 mt-1">{m.time}</div>}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative flex"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
      <div className="relative z-10 m-6 rounded-2xl w-full max-w-6xl flex shadow-2xl overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/10 backdrop-blur-md text-white p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold truncate">Fab-Room</h3>
            <span className="text-sm opacity-80">{room}</span>
          </div>
          <div>
            <div className="text-xs text-gray-200/80 mb-2">Active ({activeUsers.length})</div>
            <ul className="flex flex-col gap-2">
              {activeUsers.length === 0 && <li className="text-sm text-gray-300">No one else</li>}
              {activeUsers.map((u, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">
                    {String(u).charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm truncate">{u}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto text-xs text-gray-300">
            <div>Logged in as</div>
            <div className="font-semibold">{username}</div>
          </div>
        </aside>

        {/* Chat column */}
        <main className="flex-1 flex flex-col bg-white/5">
          {/* header */}
          <header className="py-3 px-4 bg-white/5 border-b border-white/6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {room?.charAt(0)?.toUpperCase() || "R"}
              </div>
              <div>
                <div className="text-lg font-bold">{room}</div>
                <div className="text-xs text-gray-300">CHAT-NeST</div>
              </div>
            </div>
            <div className="text-xs text-gray-300">Connected</div>
          </header>

          {/* messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-transparent to-white/5">
            <div className="space-y-3 max-w-3xl mx-auto">
              {messages.map((m, idx) => <MessageBubble key={idx} m={m} />)}
              <div ref={messageListRef} />
            </div>
          </div>

          {/* composer */}
          <div className="p-3 border-t bg-white/6 flex items-center gap-3 relative">
            <button
              type="button"
              title="Attach file"
              onClick={onAttachClick}
              className="p-2 rounded-md hover:bg-white/10 transition"
            >
              📎
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} />

            {/* ✅ Emoji picker toggle button */}
            <button
              type="button"
              title="Emoji"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 rounded-md hover:bg-white/10 transition"
            >
              😀
            </button>

            {/* ✅ Emoji picker panel */}
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-14 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message — Enter to send, Shift+Enter for newline"
              className="flex-1 resize-none rounded-xl px-4 py-2 bg-white/90 text-black placeholder:text-gray-500 min-h-[44px] max-h-36"
              aria-label="Message input"
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim() && !isUploading}
              className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg px-4 py-2 transition"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
