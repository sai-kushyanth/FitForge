import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import "./Chat.css"; // Make sure to import the CSS file!

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setError("");

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", { message: userText });
      setMessages((prev) => [...prev, { from: "ai", text: res.data?.reply || "No response." }]);
    } catch (err) {
      setError("Coach connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🏃‍♂️ AI Fitness Coach</h2>
        <p>Expert workout and nutrition guidance</p>
      </div>

      <div className="chat-window">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
            <p>Start your journey! Ask me about form, diet, or routines.</p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`message-row ${m.from === "user" ? "user-row" : "ai-row"}`}>
            <div className={`bubble ${m.from === "user" ? "user-bubble" : "ai-bubble"}`}>
              <div className="bubble-label">{m.from === "user" ? "You" : "Coach"}</div>
              {m.text}
            </div>
          </div>
        ))}
        
        {loading && <div className="ai-row"><div className="bubble ai-bubble" style={{opacity: 0.6}}>Coach is typing...</div></div>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={sendMessage} className="chat-input-area">
        <input
          className="chat-input-field"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading} className="send-button">
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}