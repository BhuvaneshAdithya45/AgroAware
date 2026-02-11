import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import Navbar from "./Navbar";
import SpeakerButton from "./SpeakerButton";
import MicrophoneButton from "./MicrophoneButton";
import { useTranslation } from "../i18n";

export default function AdvisoryChat() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 NEW STATES
  const [uploading, setUploading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);

  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);

    try {
      const { data } = await API.post("/api/advisory/chat", {
        question: userMsg.text,
        language: lang,
      });

      const botMsg = { role: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("error_msg", "Something went wrong. Please try again.") },
      ]);
    }

    setLoading(false);
  };

  // 🔹 DOCUMENT UPLOAD HANDLER
  const uploadDocument = async (file) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("http://localhost:5000/api/advisory/rag-upload", {
        method: "POST",
        body: formData,
      });

      setDocUploaded(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: t("doc_upload_success", "📄 Document uploaded successfully. You can now ask questions from it."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("doc_upload_fail", "❌ Document upload failed.") },
      ]);
    }

    setUploading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, uploading]);

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <Navbar />

      {/* HEADER */}
      <div className="mx-auto max-w-4xl w-full px-4 mt-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">
          {t("advisory_chat_title", "AgroAware Advisory Chat")}
        </h1>
      </div>

      {/* DOCUMENT UPLOAD BAR */}
      <div className="mx-auto max-w-4xl w-full px-4 mt-4 flex gap-3 flex-wrap">
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:bg-green-800">
            {t("upload_advisory_pdf", "📄 Upload Advisory PDF")}
          </span>

          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) => uploadDocument(e.target.files[0])}
          />

          {uploading && (
            <span className="text-sm text-gray-600">{t("uploading", "Uploading...")}</span>
          )}

          {docUploaded && !uploading && (
            <span className="text-sm text-green-700">
              {t("doc_ready", "✔ Document ready")}
            </span>
          )}
        </label>

        {/* 🏛️ NEW: Schemes Button */}
        <button
          onClick={() => navigate("/schemes")}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition flex items-center gap-2"
        >
          🏛️ {t("view_schemes_btn", "View Schemes")}
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 mx-auto max-w-4xl w-full p-4 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${m.role === "user"
                ? "bg-green-200 ml-auto text-right"
                : "bg-white border text-gray-800 mr-auto"
              }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex-1">{m.text}</span>
              {/* 🔊 Speaker button for bot messages */}
              {m.role === "bot" && (
                <SpeakerButton text={m.text} language={lang} size="sm" />
              )}
            </div>
          </div>
        ))}

        {(loading || uploading) && (
          <div className="mr-auto bg-white border p-3 rounded-xl text-gray-500">
            {t("typing", "Typing...")}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="mx-auto max-w-4xl w-full p-4 flex gap-3 bg-green-100">
        <input
          className="input flex-1"
          placeholder={t("chat_placeholder", "Ask crop advice, fertilizer, pests, seasons...")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={uploading || loading}
        />

        {/* 🎤 Microphone button for voice input */}
        <MicrophoneButton
          language={lang}
          onTranscript={(transcript) => {
            setInput(transcript.trim());
          }}
          disabled={uploading || loading}
          size="md"
        />
      </div>
    </div>
  );
}
