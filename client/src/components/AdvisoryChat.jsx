import { useState, useRef, useEffect } from "react";
import API from "../lib/api";
import Navbar from "./Navbar";

export default function AdvisoryChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
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
        language,
      });

      const botMsg = { role: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
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
          text: "📄 Document uploaded successfully. You can now ask questions from it.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Document upload failed." },
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
          AgroAware Advisory Chat
        </h1>

        <select
          className="border rounded-lg p-2 bg-white text-green-700"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="kn">Kannada</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
        </select>
      </div>

      {/* DOCUMENT UPLOAD BAR */}
      <div className="mx-auto max-w-4xl w-full px-4 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:bg-green-800">
            📄 Upload Advisory PDF
          </span>

          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) => uploadDocument(e.target.files[0])}
          />

          {uploading && (
            <span className="text-sm text-gray-600">Uploading...</span>
          )}

          {docUploaded && !uploading && (
            <span className="text-sm text-green-700">
              ✔ Document ready
            </span>
          )}
        </label>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 mx-auto max-w-4xl w-full p-4 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${
              m.role === "user"
                ? "bg-green-200 ml-auto text-right"
                : "bg-white border text-gray-800 mr-auto"
            }`}
          >
            {m.text}
          </div>
        ))}

        {(loading || uploading) && (
          <div className="mr-auto bg-white border p-3 rounded-xl text-gray-500">
            Typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="mx-auto max-w-4xl w-full p-4 flex gap-3 bg-green-100">
        <input
          className="input flex-1"
          placeholder="Ask crop advice, fertilizer, pests, seasons..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={uploading}
        />

        <button
          className="btn px-5"
          onClick={sendMessage}
          disabled={loading || uploading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
