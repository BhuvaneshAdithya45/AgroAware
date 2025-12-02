import { useState, useRef, useEffect } from "react";
import API from "../lib/api";
import Navbar from "./Navbar";

export default function AdvisoryChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);

    const { data } = await API.post("/api/advisory/chat", {
      question: userMsg.text,
      language,
    });

    const botMsg = { role: "bot", text: data.answer };
    setMessages((prev) => [...prev, botMsg]);

    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <Navbar />

      {/* PAGE HEADER */}
      <div className="mx-auto max-w-4xl w-full px-4 mt-6 flex justify-between">
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

        {loading && (
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
          placeholder="Ask for crop advice, fertilizer, pests, seasons..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button className="btn px-5" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
