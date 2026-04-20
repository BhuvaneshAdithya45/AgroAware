import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { useToast } from "../components/ToastProvider";
import { useTranslation } from "../i18n";
import { useLanguage } from "../i18n";
import { authFetch } from "../lib/auth";
import FeedbackButtons from "../components/FeedbackButtons";

const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:8000";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function RagUpload() {
    const toast = useToast();
    const { t } = useTranslation();
    const { lang } = useLanguage();
    const fileRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // Q&A state
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [answer, setAnswer] = useState(null);

    /* ---------- File handling ---------- */
    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.toLowerCase().endsWith(".pdf")) {
            toast.error(t("only_pdf", "Only PDF files are supported"));
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            toast.error(t("file_too_large", "File must be under 10 MB"));
            return;
        }
        setFile(f);
        setUploadResult(null);
        setAnswer(null);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const onDragLeave = () => setDragOver(false);

    /* ---------- Upload ---------- */
    const uploadFile = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${ML_URL}/rag/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(t("upload_failed", "Upload failed"));
            const data = await res.json();

            if (data.status === "success") {
                setUploadResult(data);
                toast.success(t("doc_indexed", `Document ready! ${data.total_chunks} sections processed.`));
            } else {
                toast.error(data.message || t("upload_failed", "Upload failed"));
            }
        } catch (err) {
            toast.error(err.message || t("upload_failed", "Upload failed"));
        } finally {
            setUploading(false);
        }
    };

    /* ---------- Ask (via Backend Chat API — RAG + LLM grounded answer) ---------- */
    const askQuestion = async () => {
        if (!question.trim()) return;
        setAsking(true);
        setAnswer(null);
        try {
            // Call backend chat endpoint which does: RAG search → LLM grounding → AI answer
            const res = await authFetch(`${BACKEND_URL}/api/advisory/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question.trim(), language: lang }),
            });

            if (!res.ok) throw new Error(t("query_failed", "Could not get answer. Please try again."));
            const data = await res.json();

            setAnswer({
                question: question.trim(),
                reply: data.answer || data.message || t("no_answer", "Sorry, I could not find an answer."),
                source: data.source || "general",
            });
        } catch (err) {
            toast.error(err.message || t("query_failed", "Could not get answer. Please try again."));
        } finally {
            setAsking(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-4xl p-4 md:p-8 space-y-8">
                {/* Header */}
                <header className="rounded-2xl border bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <h1 className="text-3xl font-bold">📄 {t("rag_title", "Ask Your Documents")}</h1>
                    <p className="text-purple-100 mt-1">
                        {t("rag_subtitle", "Upload your farming guidebook or manual and ask questions in your language")}
                    </p>
                </header>

                {/* Upload Zone */}
                <section className="card space-y-4">
                    <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                        {t("upload_document", "Upload Document")}
                    </h2>

                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onClick={() => fileRef.current?.click()}
                        className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all
              ${dragOver
                                ? "border-purple-500 bg-purple-50 scale-[1.02]"
                                : "border-gray-300 hover:border-purple-400"
                            }
            `}
                        style={{
                            borderColor: dragOver ? "#a855f7" : "var(--border-color)",
                            backgroundColor: dragOver ? "rgba(168,85,247,0.08)" : "transparent",
                        }}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        <div className="text-5xl mb-3">📁</div>
                        <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                            {file ? file.name : t("drop_pdf", "Drop your PDF here or click to browse")}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                            {file
                                ? `${(file.size / 1024).toFixed(1)} KB — ${t("ready_to_upload", "Ready to upload")}`
                                : t("pdf_limit", "Supports PDF files up to 10 MB")}
                        </p>
                    </div>

                    {file && (
                        <button
                            className="btn bg-purple-600 hover:bg-purple-700 w-full"
                            onClick={uploadFile}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span> {t("indexing", "Processing document...")}
                                </span>
                            ) : (
                                `🚀 ${t("upload_and_index", "Upload & Process")}`
                            )}
                        </button>
                    )}

                    {/* Upload result */}
                    {uploadResult && (
                        <div className="rounded-xl p-4 bg-green-50 border border-green-200 space-y-1">
                            <p className="font-semibold text-green-800">✅ {t("doc_ready", "Document Ready!")}</p>
                            <p className="text-sm text-green-700">
                                <strong>{uploadResult.filename}</strong> — {t("sections_processed", `${uploadResult.total_chunks} sections processed. You can now ask questions!`)}
                            </p>
                        </div>
                    )}
                </section>

                {/* Q&A Section */}
                <section className="card space-y-4">
                    <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                        🔍 {t("ask_question", "Ask a Question")}
                    </h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {t("ask_description", "Ask questions about your uploaded document and get AI-powered answers")}
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder={t("ask_placeholder", "e.g. What fertilizer is best for rice?")}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                        />
                        <button
                            className="btn bg-purple-600 hover:bg-purple-700 px-6"
                            onClick={askQuestion}
                            disabled={asking || !question.trim()}
                        >
                            {asking ? "⏳" : t("ask_btn", "Ask")}
                        </button>
                    </div>

                    {/* AI Answer */}
                    {answer && (
                        <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                    {t("your_question", "Your Question")}
                                </p>
                                <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>"{answer.question}"</p>
                            </div>
                            <hr style={{ borderColor: "var(--border-color)" }} />
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                        🤖 {t("ai_answer", "AI Answer")}
                                    </p>
                                    {answer.source === "document" && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                            📄 {t("from_document", "From your document")}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
                                    style={{
                                        backgroundColor: "var(--bg-card)",
                                        color: "var(--text-secondary)",
                                        border: "1px solid var(--border-color)",
                                    }}
                                >
                                    {answer.reply}
                                </div>
                                <FeedbackButtons
                                    feature="rag"
                                    question={answer.question}
                                    answer={answer.reply}
                                    language={lang}
                                />
                            </div>
                        </div>
                    )}

                    {/* Suggested queries */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            t("rag_q1", "What are the NPK requirements for wheat?"),
                            t("rag_q2", "Best practices for soil health"),
                            t("rag_q3", "Government schemes for farmers"),
                        ].map((q) => (
                            <button
                                key={q}
                                className="rounded-full border px-3 py-1 text-xs hover:bg-purple-50 transition"
                                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                                onClick={() => { setQuestion(q); }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
