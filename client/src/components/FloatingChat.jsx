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
                <div className="fixed bottom-24 right-6 z-50 w-80 h-[450px] rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-fadeIn"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">🌾 {t("brand", "AgroAware")}</h3>
                            <p className="text-xs text-green-100">{t("ai_assistant_online", "AI Assistant Online")}</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                    </div>

                    {/* Chat Content - Functional Mini Interface */}
                    <div className="flex-1 overflow-hidden">
                        <iframe
                            src="/advisory-chat?embedded=true"
                            className="w-full h-full border-none"
                            title="AgroAware AI Chat"
                        />
                    </div>

                    {/* Footer Nav */}
                    <div className="p-2 grid grid-cols-3 gap-1 bg-gray-50 border-t" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                        <button onClick={() => { navigate('/voice'); setIsOpen(false); }} className="flex flex-col items-center p-1 rounded hover:bg-white transition">
                            <span className="text-lg">🎤</span>
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("voice", "Voice")}</span>
                        </button>
                        <button onClick={() => { navigate('/schemes'); setIsOpen(false); }} className="flex flex-col items-center p-1 rounded hover:bg-white transition">
                            <span className="text-lg">🏛️</span>
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("schemes", "Schemes")}</span>
                        </button>
                        <button onClick={() => { navigate('/awareness'); setIsOpen(false); }} className="flex flex-col items-center p-1 rounded hover:bg-white transition">
                            <span className="text-lg">📚</span>
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("tips", "Tips")}</span>
                        </button>
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
