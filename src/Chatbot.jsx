import React, { useEffect, useRef, useState } from "react";
import {
  getCrops,
  getFarms,
  sendChatMessage,
  sendLeafImageMessage,
  getChatHistory,
  clearChatHistory,
} from "./api.js";

import useVoiceAssistant, {
  voiceLanguages,
} from "./useVoiceAssistant.js";

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [autoSendVoice, setAutoSendVoice] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    speechSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getBestVoice,
    isVoiceAvailable,
  } = useVoiceAssistant();

  const selectedVoiceAvailable = isVoiceAvailable(voiceLanguage);
  const selectedVoice = getBestVoice(voiceLanguage);

  const selectedLanguageLabel =
    voiceLanguages.find((language) => language.code === voiceLanguage)?.label ||
    voiceLanguage;

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
              text: `Hello ${
                user?.name?.split(" ")[0] || "Farmer"
              }! I am your Farmverse AI Assistant. Ask me about crops, weather, irrigation, harvest planning, farm records, or upload a leaf image. You can also use the microphone to ask by voice.`,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);

        setMessages([
          {
            id: 1,
            sender: "assistant",
            text: `Hello ${
              user?.name?.split(" ")[0] || "Farmer"
            }! I am your Farmverse AI Assistant. Ask me about crops, weather, irrigation, harvest planning, farm records, or upload a leaf image. You can also use the microphone to ask by voice.`,
          },
        ]);
      }
    };

    loadHistory();
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (overrideMessage = null) => {
    const trimmedMessage = String(overrideMessage ?? input).trim();

    if ((!trimmedMessage && !selectedImage) || loading) return;

    const imageToSend = selectedImage;
    const previewToShow = imagePreview;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: imageToSend
        ? trimmedMessage || "Please analyze this leaf image."
        : trimmedMessage,
      image: previewToShow || "",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setLoading(true);

    try {
      const data = imageToSend
        ? await sendLeafImageMessage({
            message: trimmedMessage,
            image: imageToSend,
            language: voiceLanguage,
          })
        : await sendChatMessage(trimmedMessage, voiceLanguage);

      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        text: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (autoSpeak && selectedVoiceAvailable) {
        speak(data.reply, voiceLanguage);
      }
    } catch (err) {
      console.error("Chatbot error:", err);

      const errorText =
        err.message ||
        "Sorry, I couldn't process your request. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: errorText,
        },
      ]);

      if (autoSpeak && selectedVoiceAvailable) {
        speak(errorText, voiceLanguage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening({
      language: voiceLanguage,

      onTranscript: (transcript) => {
        setInput(transcript);
      },

      onFinalTranscript: (transcript) => {
        setInput(transcript);

        if (autoSendVoice) {
          setTimeout(() => {
            sendMessage(transcript);
          }, 300);
        }
      },

      onError: (errorMessage) => {
        const messageText = `Voice error: ${errorMessage}`;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "assistant",
            text: messageText,
          },
        ]);

        if (autoSpeak && selectedVoiceAvailable) {
          speak(messageText, voiceLanguage);
        }
      },
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = async () => {
    try {
      stopSpeaking();
      await clearChatHistory();

      setMessages([
        {
          id: Date.now(),
          sender: "assistant",
          text: `Chat cleared. Hello ${
            user?.name?.split(" ")[0] || "Farmer"
          }! Ask me anything about your farm, upload a leaf image, or use voice input.`,
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
    "Can you analyze this leaf image?",
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
              harvest planning, weather, leaf images, and voice questions.
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
                <p style={styles.botStatus}>
                  Text + voice + leaf image analysis
                </p>
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
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded crop leaf"
                        style={styles.messageImage}
                      />
                    )}

                    {message.text}

                    {message.sender === "assistant" &&
                      ttsSupported &&
                      selectedVoiceAvailable && (
                        <button
                          type="button"
                          style={styles.speakMessageBtn}
                          onClick={() => speak(message.text, voiceLanguage)}
                          title="Read this reply"
                        >
                          🔊 Read
                        </button>
                      )}
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

            {imagePreview && (
              <div style={styles.previewBox}>
                <img
                  src={imagePreview}
                  alt="Selected leaf"
                  style={styles.previewImage}
                />

                <div style={styles.previewText}>
                  <strong>Selected image</strong>
                  <span>{selectedImage?.name}</span>
                </div>

                <button
                  type="button"
                  style={styles.removeImageBtn}
                  onClick={removeSelectedImage}
                >
                  Remove
                </button>
              </div>
            )}

            <div style={styles.voiceToolbar}>
              <select
                value={voiceLanguage}
                onChange={(event) => {
                  stopSpeaking();
                  setVoiceLanguage(event.target.value);
                }}
                style={styles.voiceSelect}
                title="Voice language"
              >
                {voiceLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>

              <label style={styles.voiceToggle}>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(event) => setAutoSpeak(event.target.checked)}
                />
                Read replies
              </label>

              <label style={styles.voiceToggle}>
                <input
                  type="checkbox"
                  checked={autoSendVoice}
                  onChange={(event) => setAutoSendVoice(event.target.checked)}
                />
                Auto-send voice
              </label>

              {!speechSupported && (
                <span style={styles.voiceWarning}>
                  Voice input not supported in this browser
                </span>
              )}

              {ttsSupported &&
                !selectedVoiceAvailable &&
                voiceLanguage !== "en-IN" && (
                  <span style={styles.voiceWarning}>
                    {selectedLanguageLabel} voice is not installed. Text reply
                    will still work.
                  </span>
                )}

              {selectedVoice && (
                <span style={styles.voiceInfo}>
                  Voice: {selectedVoice.name}
                </span>
              )}

              {isSpeaking && (
                <button
                  type="button"
                  style={styles.stopVoiceBtn}
                  onClick={stopSpeaking}
                >
                  Stop voice
                </button>
              )}
            </div>

            <div style={styles.inputArea}>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={!speechSupported || loading}
                style={{
                  ...styles.micButton,
                  ...(isListening ? styles.micButtonActive : {}),
                  opacity: !speechSupported || loading ? 0.5 : 1,
                  cursor:
                    !speechSupported || loading ? "not-allowed" : "pointer",
                }}
                title={
                  speechSupported
                    ? isListening
                      ? "Stop listening"
                      : "Start voice input"
                    : "Voice input not supported"
                }
              >
                {isListening ? "■" : "🎙️"}
              </button>

              <label style={styles.imageButton} title="Upload leaf image">
                📷
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? "Listening... speak now"
                    : "Ask about crops, irrigation, harvest, weather, or upload a leaf image..."
                }
                style={styles.textarea}
                rows="2"
              />

              <button
                style={{
                  ...styles.sendButton,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onClick={() => sendMessage()}
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
                VOICE ASSISTANT
              </p>

              <p style={styles.helpText}>
                Click the microphone button and speak your farming question.
                You can also make the assistant read replies aloud.
              </p>

              <ul style={styles.helpList}>
                <li>Select your speaking language</li>
                <li>Use Chrome or Edge for best support</li>
                <li>Some languages need installed browser/Windows voices</li>
                <li>Use 🔊 Read to listen again</li>
              </ul>
            </div>

            <div style={styles.sideCard}>
              <p className="mono" style={styles.sideEyebrow}>
                LEAF IMAGE HELP
              </p>

              <p style={styles.helpText}>
                Upload a clear image of the affected leaf or plant. For better
                results, include crop name, growth stage, and symptoms.
              </p>

              <ul style={styles.helpList}>
                <li>Take photo in good light</li>
                <li>Show affected leaf clearly</li>
                <li>Also upload underside if possible</li>
                <li>Avoid blurry images</li>
              </ul>
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
                Farmverse AI provides possible crop guidance only. Consult a
                certified agriculture officer or KVK before applying pesticide,
                fertilizer, fungicide, or chemical treatments.
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
    whiteSpace: "pre-wrap",
  },
  messageImage: {
    display: "block",
    width: "190px",
    maxWidth: "100%",
    borderRadius: "4px",
    marginBottom: "8px",
    border: "1px solid rgba(11,10,8,0.25)",
  },
  speakMessageBtn: {
    display: "block",
    marginTop: "8px",
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "3px",
    padding: "4px 7px",
    cursor: "pointer",
    fontSize: "0.72rem",
  },
  typing: {
    display: "flex",
    gap: "4px",
    padding: "12px",
    background: "#12110e",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
  },
  previewBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    background: "#151310",
    borderTop: "1px solid rgba(243,237,224,0.08)",
  },
  previewImage: {
    width: "52px",
    height: "52px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid rgba(201,162,39,0.35)",
  },
  previewText: {
    color: "#a8a094",
    fontSize: "0.75rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  removeImageBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
    borderRadius: "3px",
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: "0.72rem",
  },
  voiceToolbar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    padding: "10px 15px",
    background: "#151310",
    borderTop: "1px solid rgba(243,237,224,0.09)",
  },
  voiceSelect: {
    background: "#0f0e0b",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "3px",
    padding: "7px 9px",
    outline: "none",
    fontSize: "0.78rem",
  },
  voiceToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#a8a094",
    fontSize: "0.76rem",
  },
  voiceWarning: {
    color: "#ffc1a6",
    fontSize: "0.74rem",
  },
  voiceInfo: {
    color: "#8f877b",
    fontSize: "0.72rem",
  },
  stopVoiceBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
    borderRadius: "3px",
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: "0.72rem",
  },
  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid rgba(243,237,224,0.09)",
    background: "#151310",
  },
  micButton: {
    alignSelf: "flex-end",
    background: "#12110e",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    padding: "10px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  micButtonActive: {
    background: "rgba(224,122,79,0.16)",
    color: "#ffc1a6",
    border: "1px solid rgba(224,122,79,0.45)",
    boxShadow: "0 0 14px rgba(224,122,79,0.25)",
  },
  imageButton: {
    alignSelf: "flex-end",
    background: "#12110e",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    padding: "10px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
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
  helpText: {
    color: "#a8a094",
    fontSize: "0.78rem",
    lineHeight: 1.55,
    marginTop: "8px",
  },
  helpList: {
    color: "#a8a094",
    fontSize: "0.76rem",
    lineHeight: 1.7,
    paddingLeft: "18px",
    marginTop: "10px",
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