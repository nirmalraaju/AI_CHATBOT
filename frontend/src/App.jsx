import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const currentMsg = input;
    setChatHistory(prev => [...prev, { role: "user", parts: [{ text: currentMsg }] }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "user_1", message: currentMsg }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: data.response }] }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Error: Could not connect to the server." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport">
      {/* Professional Top-Left Branding */}
      <header className="brand-header">
        <svg className="brand-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <h1>Assistant</h1>
      </header>

      {/* Centered Chat Container */}
      <div className="center-container">
        <main className="chat-content">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="bubble">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.parts[0].text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-row model">
              <div className="loader">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </main>

        {/* Sticky Input Area */}
        <footer className="input-sticky">
          <div className="input-bar">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Send a message..."
              disabled={loading}
            />
            <button onClick={handleChat} disabled={loading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;