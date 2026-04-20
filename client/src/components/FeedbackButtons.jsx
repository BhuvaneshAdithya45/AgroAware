import { useState } from "react";
import { useTranslation } from "../i18n";
import { authFetch } from "../lib/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Thumbs up/down feedback buttons for AI answers.
 *
 * Props:
 *   feature  — "chat" | "voice" | "rag" | "poster" | "crop_prediction"
 *   question — the user's question (string)
 *   answer   — the AI's answer (string)
 *   language — current UI language code
 */
export default function FeedbackButtons({ feature, question, answer, language }) {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(null); // 1 | -1 | null

    const submitFeedback = async (rating) => {
        setSubmitted(rating);
        try {
            await authFetch(`${BACKEND_URL}/api/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    feature,
                    question: (question || "").slice(0, 500),
                    answer: (answer || "").slice(0, 1000),
                    rating,
                    language: language || "en",
                }),
            });
        } catch (err) {
            console.error("Feedback submit error:", err);
        }
    };

    if (submitted !== null) {
        return (
            <div style={{ fontSize: "12px", color: "var(--text-muted, #9ca3af)", marginTop: "6px" }}>
                {submitted === 1 ? "👍" : "👎"} {t("feedback_thanks", "Thanks for your feedback!")}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted, #9ca3af)" }}>
                {t("was_this_helpful", "Was this helpful?")}
            </span>
            <button
                onClick={() => submitFeedback(1)}
                title={t("helpful", "Helpful")}
                style={{
                    background: "none",
                    border: "1px solid var(--border-color, #e5e7eb)",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#dcfce7")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
                👍
            </button>
            <button
                onClick={() => submitFeedback(-1)}
                title={t("not_helpful", "Not helpful")}
                style={{
                    background: "none",
                    border: "1px solid var(--border-color, #e5e7eb)",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#fee2e2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
                👎
            </button>
        </div>
    );
}
