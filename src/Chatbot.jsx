import React, { useEffect, useRef, useState } from "react";
import {
  getCrops,
  getFarms,
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
} from "./api.js";

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    setFarms(getFarms(user.id));
    setCrops(getCrops(user.id));

    const loadHistory = async () => {
      try {
        const data = await getChatHistory();

        if (data.history && data.history.length > 0) {
          setMessages(
            data.history.map((msg) => ({
              id: msg.id,
              sender: msg.sender,
              text: msg.text,
            }))
          );
        } else {
          setMessages([
            {
              id: 1,
              sender: "assistant",
              text: `Hello ${user?.name?.split(" ")[0] || "Farmer"}! I am your Farmverse AI Assistant. Ask me about your crops, weather, irrigation, harvest planning, or farm records.`,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([
          {
            id: 1,
            sender: "assistant",
            text: `Hello ${user?.name?.split(" ")[0] || "Farmer"}! I am your Farmverse AI Assistant. Ask me about your crops, weather, irrigation, harvest planning, or farm records.`,
          },
        ]);
      }
    };

    loadHistory();
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmedMessage = input.trim();
    if (!trimmedMessage || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(trimmedMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: data.reply,
        },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: err.message || "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([
        {
          id: Date.now(),
          sender: "assistant",
          text: `Chat cleared. Hello ${user?.name?.split(" ")[0] || "Farmer"}! Ask me anything about your farm.`,
        },
      ]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const suggestedQuestions = [
    "Show my active crops",
    "When is my next harvest?",
    "How can I save water?",
    "What fertilizer guidance do you have?",
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              FARMVERSE AI ASSISTANT
            </p>
            <h1 style={styles.title}>Ask your farm questions.</h1>
            <p style={styles.subtitle}>
              Get simple guidance about farm records, crops, irrigation,
              harvest planning, and weather.
            </p>
          </div>
          <div style={styles.aiBadge}>
            <span style={styles.aiDot} />
            AI assistant online
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.chatCard}>
            <div style={styles.chatHeader}>
              <div style={styles.botAvatar}>✦</div>
              <div>
                <strong style={styles.botName}>Farmverse Assistant</strong>
                <p style={styles.botStatus}>Powered by Gemini AI</p>
              </div>
              <button
                onClick={handleClearChat}
                style={styles.clearButton}
                title="Clear chat history"
              >
                Clear
              </button>
            </div>

            <div style={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={
                    message.sender === "user"
                      ? styles.userMessageWrap
                      : styles.assistantMessageWrap
                  }
                >
                  {message.sender === "assistant" && (
                    <span style={styles.smallBotAvatar}>✦</span>
                  )}
                  <div
                    style={
                      message.sender === "user"
                        ? styles.userMessage
                        : styles.assistantMessage
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={styles.assistantMessageWrap}>
                  <span style={styles.smallBotAvatar}>✦</span>
                  <div style={styles.typing}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crops, irrigation, harvest, weather..."
                style={styles.textarea}
                rows="2"
              />
              <button
                style={{
                  ...styles.sendButton,
                  opacity: loading ? 0.5 : 1,
                }}
                onClick={sendMessage}
                disabled={loading}
              >
                {loading ? "..." : "Send →"}
              </button>
            </div>
          </section>

          <aside style={styles.sidePanel}>
            <div style={styles.sideCard}>
              <p className="mono" style={styles.sideEyebrow}>
                QUICK QUESTIONS
              </p>
              <h2 style={styles.sideTitle}>Try asking</h2>
              <div style={styles.questionList}>
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    style={styles.questionButton}
                    onClick={() => setInput(question)}
                  >
                    {question}
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.sideCard}>
              <p className="mono" style={styles.sideEyebrow}>
                YOUR FARM CONTEXT
              </p>
              <div style={styles.contextRow}>
                <span>Farms</span>
                <strong>{farms.length}</strong>
              </div>
              <div style={styles.contextRow}>
                <span>Crop records</span>
                <strong>{crops.length}</strong>
              </div>
              <div style={styles.contextRow}>
                <span>Active crops</span>
                <strong>
                  {crops.filter((c) => c.cropStatus !== "Harvested").length}
                </strong>
              </div>
            </div>

            <div style={styles.disclaimer}>
              <strong>Important</strong>
              <p>
                Farmverse AI provides general farming guidance. Consult a
                certified agriculture officer before applying pesticide,
                fertilizer, or chemical treatments.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "45px 20px 65px",
  },
  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2.15rem",
    fontWeight: 500,
  },
  subtitle: {
    color: "#a8a094",
    maxWidth: "650px",
    lineHeight: 1.6,
    marginTop: "10px",
  },
  aiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#d8d0c3",
    border: "1px solid rgba(201,162,39,0.3)",
    background: "rgba(201,162,39,0.06)",
    padding: "9px 12px",
    borderRadius: "20px",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  },
  aiDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#c9a227",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
  },
  chatCard: {
    minHeight: "580px",
    display: "flex",
    flexDirection: "column",
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "18px 22px",
    borderBottom: "1px solid rgba(243,237,224,0.09)",
  },
  botAvatar: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#c9a227",
    color: "#0b0a08",
    borderRadius: "50%",
    fontWeight: 700,
  },
  botName: {
    color: "#f3ede0",
    fontSize: "0.92rem",
  },
  botStatus: {
    color: "#8f877b",
    fontSize: "0.73rem",
    margin: "3px 0 0",
  },
  clearButton: {
    marginLeft: "auto",
    background: "transparent",
    border: "1px solid rgba(243,237,224,0.15)",
    color: "#a8a094",
    padding: "5px 10px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.72rem",
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    padding: "22px",
    overflowY: "auto",
    maxHeight: "460px",
  },
  assistantMessageWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    maxWidth: "82%",
  },
  userMessageWrap: {
    display: "flex",
    justifyContent: "flex-end",
    maxWidth: "82%",
    alignSelf: "flex-end",
  },
  smallBotAvatar: {
    minWidth: "25px",
    height: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0b0a08",
    background: "#c9a227",
    borderRadius: "50%",
    fontSize: "0.68rem",
  },
  assistantMessage: {
    color: "#ded6ca",
    background: "#12110e",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px 4px 4px 0",
    padding: "11px 13px",
    fontSize: "0.85rem",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  userMessage: {
    color: "#0b0a08",
    background: "#c9a227",
    borderRadius: "4px 4px 0 4px",
    padding: "11px 13px",
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },
  typing: {
    display: "flex",
    gap: "4px",
    padding: "12px",
    background: "#12110e",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
  },
  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid rgba(243,237,224,0.09)",
    background: "#151310",
  },
  textarea: {
    flex: 1,
    resize: "none",
    background: "#0f0e0b",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.15)",
    borderRadius: "3px",
    padding: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "0.84rem",
  },
  sendButton: {
    alignSelf: "flex-end",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "10px 14px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
  },
  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  sideCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "22px",
  },
  sideEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  sideTitle: {
    color: "#f3ede0",
    fontSize: "1.08rem",
    fontWeight: 500,
  },
  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "16px",
  },
  questionButton: {
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    color: "#d0c7b9",
    padding: "10px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
  },
  contextRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "11px 0",
    borderBottom: "1px solid rgba(243,237,224,0.08)",
    color: "#a8a094",
    fontSize: "0.82rem",
  },
  disclaimer: {
    color: "#aa9f91",
    background: "rgba(224,122,79,0.06)",
    border: "1px solid rgba(224,122,79,0.17)",
    padding: "16px",
    fontSize: "0.75rem",
    lineHeight: 1.55,
  },
};

export default Chatbot;