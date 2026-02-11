import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { useToast } from "../components/ToastProvider";
import { useTranslation } from "../i18n";

const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:8800";

export default function RagUpload() {
    const toast = useToast();
    const { t } = useTranslation();
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
            toast.error("Only PDF files are supported");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            toast.error("File must be under 10 MB");
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

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);
            const data = await res.json();

            if (data.status === "success") {
                setUploadResult(data);
                toast.success(`Document indexed: ${data.total_chunks} chunks created`);
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    /* ---------- Ask ---------- */
    const askQuestion = async () => {
        if (!question.trim()) return;
        setAsking(true);
        setAnswer(null);
        try {
            const res = await fetch(`${ML_URL}/rag/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question.trim() }),
            });

            if (!res.ok) throw new Error(`Query failed (${res.status})`);
            const data = await res.json();

            if (data.status === "success") {
                setAnswer(data);
            } else {
                toast.error(data.message || "Query failed");
            }
        } catch (err) {
            toast.error(err.message || "Query failed");
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
                    <h1 className="text-3xl font-bold">📄 RAG Document Intelligence</h1>
                    <p className="text-purple-100 mt-1">
                        Upload agricultural PDFs and query them using AI-powered retrieval
                    </p>
                </header>

                {/* Upload Zone */}
                <section className="card space-y-4">
                    <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                        Upload Document
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
                            {file ? file.name : "Drop your PDF here or click to browse"}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                            {file
                                ? `${(file.size / 1024).toFixed(1)} KB — Ready to upload`
                                : "Supports PDF files up to 10 MB"}
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
                                    <span className="animate-spin">⏳</span> Indexing document...
                                </span>
                            ) : (
                                "🚀 Upload & Index"
                            )}
                        </button>
                    )}

                    {/* Upload result */}
                    {uploadResult && (
                        <div className="rounded-xl p-4 bg-green-50 border border-green-200 space-y-1">
                            <p className="font-semibold text-green-800">✅ Document Indexed Successfully</p>
                            <p className="text-sm text-green-700">
                                <strong>{uploadResult.filename}</strong> — {uploadResult.total_chunks} chunks created
                            </p>
                        </div>
                    )}
                </section>

                {/* Q&A Section */}
                <section className="card space-y-4">
                    <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                        🔍 Ask a Question
                    </h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Query your uploaded documents using natural language
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="e.g. What fertilizer is best for rice?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                        />
                        <button
                            className="btn bg-purple-600 hover:bg-purple-700 px-6"
                            onClick={askQuestion}
                            disabled={asking || !question.trim()}
                        >
                            {asking ? "…" : "Ask"}
                        </button>
                    </div>

                    {/* Answer */}
                    {answer && (
                        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                    Question
                                </p>
                                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{answer.question}</p>
                            </div>
                            <hr style={{ borderColor: "var(--border-color)" }} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                    Retrieved Context ({answer.chunks_retrieved} chunks)
                                </p>
                                <pre
                                    className="mt-2 whitespace-pre-wrap text-sm rounded-lg p-3"
                                    style={{
                                        backgroundColor: "var(--bg-card)",
                                        color: "var(--text-secondary)",
                                        border: "1px solid var(--border-color)",
                                    }}
                                >
                                    {answer.context}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Suggested queries */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            "What are the NPK requirements for wheat?",
                            "Best practices for soil health",
                            "Government schemes for farmers",
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
