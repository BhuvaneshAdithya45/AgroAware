import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { getToken } from '../lib/auth';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Triggers re-render on route change
    const { t } = useTranslation();
    const token = getToken();

    // Close chat if user logs out or is not authenticated
    useEffect(() => {
        if (!token) {
            setIsOpen(false);
        }
    }, [token, location]);

    if (!token) return null; // Don't render if not logged in

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                aria-label={t("chat_with_agroaware", "Chat with AgroAware")}
            >
                {isOpen ? (
                    <span className="text-2xl">✕</span>
                ) : (
                    <span className="text-2xl">💬</span>
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl border overflow-hidden animate-fadeIn"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                        <h3 className="font-bold text-lg">🌾 {t("brand", "AgroAware")} {t("assistant", "Assistant")}</h3>
                        <p className="text-sm text-green-100">{t("how_can_we_help", "How can we help you today?")}</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 space-y-3">
                        <button
                            onClick={() => {
                                navigate('/advisory-chat');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition text-left"
                        >
                            <span className="text-2xl">💬</span>
                            <div>
                                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{t("chat_with_ai", "Chat with AI")}</div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("ask_farming_questions", "Ask farming questions")}</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/voice');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition text-left"
                        >
                            <span className="text-2xl">🎤</span>
                            <div>
                                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{t("voice_assistant", "Voice Assistant")}</div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("speak_your_questions", "Speak your questions")}</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/schemes');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition text-left"
                        >
                            <span className="text-2xl">🏛️</span>
                            <div>
                                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{t("govt_schemes", "Govt Schemes")}</div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("find_subsidies_loans", "Find subsidies & loans")}</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/awareness');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition text-left"
                        >
                            <span className="text-2xl">📚</span>
                            <div>
                                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{t("farming_tips", "Farming Tips")}</div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("best_practices_faqs", "Best practices & FAQs")}</div>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-3 text-center text-xs" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                        {t("available_5_languages", "Available in 5 languages")} • {t("support_24_7", "24/7 Support")}
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </>
    );
}
