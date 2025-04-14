import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import ThreatDash from "./components/ThreatDash";

const App = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);

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

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("userInput").value = transcript;
      sendMessage();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
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
            <button
              onClick={startListening}
              title="Speak"
              style={{
                padding: "0 10px",
                backgroundColor: isListening ? "#28a745" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              🎤
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
