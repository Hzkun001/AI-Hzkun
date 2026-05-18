import { useState, useRef, useEffect } from "react";
import "./App.css";
import { requestToGroqAI, AVAILABLE_MODELS, DEFAULT_MODEL } from "./utils/groq";
import MessageContent from "./components/MessageContent";

const EXAMPLE_PROMPTS = [
  { icon: "💡", text: "Jelaskan apa itu closure di JavaScript" },
  { icon: "🐍", text: "Buatkan contoh function Python untuk sorting" },
  { icon: "⚛️", text: "Cara pakai useEffect di React" },
  { icon: "🎨", text: "Tips desain UI yang modern" },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("id");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submitPrompt = async (prompt) => {
    if (!prompt || prompt.trim() === "") {
      alert("Input tidak boleh kosong!");
      return;
    }

    const userMessage = { role: "user", content: prompt };
    // Snapshot history saat ini (sebelum tambah user message) untuk dikirim ke AI
    const historyForAi = messages;

    setMessages((prev) => [...prev, userMessage]);
    if (inputRef.current) inputRef.current.value = "";

    setLoading(true);
    setCopiedIdx(null);
    try {
      const ai = await requestToGroqAI(prompt, language, model, historyForAi);
      setMessages((prev) => [...prev, { role: "ai", content: ai }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Terjadi kesalahan: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const content = inputRef.current?.value ?? "";
    submitPrompt(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (text) => {
    if (inputRef.current) inputRef.current.value = text;
    submitPrompt(text);
  };

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      console.error("Gagal menyalin:", err);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCopiedIdx(null);
  };

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === model);

  return (
    <div className="app-bg">
      <main className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen">
        {/* ---------- HEADER ---------- */}
        <header className="flex flex-col items-center text-center mb-8 fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/robot.svg"
              alt="Hzkun AI Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-500 shadow-lg pulse-glow"
            />
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-pink-500 bg-clip-text text-transparent">
              Hzkun AI
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-300 max-w-md">
            👑 Asisten AI cepat untuk programmer
          </p>
          <p className="text-xs text-gray-500 mt-1 italic">Build with 🩷</p>
        </header>

        {/* ---------- FORM CARD ---------- */}
        <section className="glass w-full p-4 sm:p-6 fade-in-up">
          {/* Settings: Bahasa & Model */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">
                🌐 Bahasa
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-modern py-2 px-3 text-sm rounded-lg bg-white/5 text-white border border-white/10 cursor-pointer w-full"
              >
                <option value="id" className="bg-gray-900">🇮🇩 Bahasa Indonesia</option>
                <option value="en" className="bg-gray-900">🇬🇧 English</option>
                <option value="ja" className="bg-gray-900">🇯🇵 日本語</option>
                <option value="zh" className="bg-gray-900">🇨🇳 中文</option>
                <option value="ru" className="bg-gray-900">🇷🇺 Русский</option>
                <option value="hi" className="bg-gray-900">🇮🇳 हिन्दी</option>
                <option value="ar" className="bg-gray-900">🇸🇦 العربية</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">
                🤖 Model AI
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-modern py-2 px-3 text-sm rounded-lg bg-white/5 text-white border border-white/10 cursor-pointer w-full"
                title={currentModel?.description}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-900">
                    {m.badge} {m.name}
                  </option>
                ))}
              </select>
            </div>

            {messages.length > 0 && (
              <div className="flex items-end">
                <button
                  onClick={handleClearChat}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg border border-white/10 hover:border-red-400/30 whitespace-nowrap"
                  title="Hapus semua percakapan"
                >
                  🗑️ Hapus Chat
                </button>
              </div>
            )}
          </div>

          {/* Deskripsi model aktif */}
          {currentModel && (
            <p className="text-[11px] text-gray-500 mb-3 ml-1 italic">
              ℹ️ {currentModel.description}
            </p>
          )}

          {/* Input + Tombol Kirim */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              placeholder="Ketik permintaanmu di sini..."
              className="input-modern flex-1 py-3 px-4 text-sm sm:text-base rounded-lg bg-white/5 text-white border border-white/10 placeholder-gray-500 transition-all"
              type="text"
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              type="button"
              className="btn-send bg-gradient-to-r from-amber-500 to-pink-500 py-3 px-6 font-semibold text-white rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="dot-typing">
                    <span></span><span></span><span></span>
                  </span>
                  <span>Memproses</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  Kirim
                </>
              )}
            </button>
          </div>
        </section>

        {/* ---------- CHAT AREA ---------- */}
        <section className="w-full mt-6 flex-1">
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="glass p-6 sm:p-8 fade-in-up text-center">
              <div className="text-5xl mb-3">🐗</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Halo! Ada yang bisa kubantu?
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Coba salah satu contoh di bawah, atau ketik pertanyaanmu sendiri.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(p.text)}
                    className="example-chip text-left p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:text-white"
                  >
                    <span className="mr-2">{p.icon}</span>
                    {p.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`fade-in-up ${
                    msg.role === "user" ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    /* USER BUBBLE */
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg">
                        <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 text-right">Kamu</p>
                    </div>
                  ) : (
                    /* AI BUBBLE */
                    <div className="max-w-[95%] sm:max-w-[90%] w-full">
                      <div className="glass overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Hzkun AI
                          </div>
                          <button
                            onClick={() => handleCopy(msg.content, idx)}
                            className="copy-btn flex items-center gap-1.5 text-xs text-gray-300 px-2 py-1 rounded-md border border-white/10"
                            title="Salin seluruh jawaban"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Tersalin
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Salin
                              </>
                            )}
                          </button>
                        </div>
                        <MessageContent content={msg.content} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator inline */}
              {loading && (
                <div className="flex justify-start fade-in-up">
                  <div className="glass px-5 py-4 flex items-center gap-3">
                    <div className="loader-modern" style={{ width: "24px", height: "24px" }}></div>
                    <p className="text-sm text-gray-400">AI sedang berpikir...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Loading saat belum ada pesan */}
          {messages.length === 0 && loading && (
            <div className="glass p-8 fade-in-up flex flex-col items-center gap-3">
              <div className="loader-modern"></div>
              <p className="text-sm text-gray-400">AI sedang berpikir...</p>
            </div>
          )}
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer className="mt-8 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Hzkun AI · Powered by Groq
        </footer>
      </main>
    </div>
  );
}

export default App;
