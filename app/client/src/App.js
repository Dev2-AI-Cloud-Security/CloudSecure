import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import ThreatDash from "./components/ThreatDash";

const App = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const sendMessage = async () => {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { sender: "You", text: message }]);
    input.value = "";

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "Bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "Error contacting chatbot server." },
      ]);
      console.error("Chatbot error:", error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/threatDash" element={<ThreatDash />} />
      </Routes>

      {/* Floating Chatbot */}
      <div
        id="chatbot-toggle"
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#007bff",
          color: "white",
          padding: "10px",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        💬
      </div>

      {showChat && (
        <div
          id="chatbot-container"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "300px",
            maxHeight: "400px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            overflow: "auto",
            zIndex: 1000,
            padding: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            id="chatbox"
            style={{ height: "300px", overflowY: "scroll", marginBottom: "10px" }}
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                <b>{msg.sender}:</b> {msg.text}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              id="userInput"
              placeholder="Ask something..."
              style={{ flex: 1 }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
