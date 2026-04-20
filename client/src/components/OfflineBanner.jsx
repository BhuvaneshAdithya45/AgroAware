import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";

/**
 * Shows a non-intrusive banner when the user goes offline.
 * Auto-hides when connection is restored.
 */
export default function OfflineBanner() {
    const { t } = useTranslation();
    const [online, setOnline] = useState(navigator.onLine);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const goOnline = () => {
            setOnline(true);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };
        const goOffline = () => {
            setOnline(false);
            setShowReconnected(false);
        };

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    if (online && !showReconnected) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                animation: "slideUp 0.3s ease-out",
                backgroundColor: online ? "#059669" : "#dc2626",
                color: "white",
            }}
        >
            <span>{online ? "✅" : "📡"}</span>
            <span>
                {online
                    ? t("back_online", "Back online!")
                    : t("no_internet", "No internet connection. Some features may not work.")}
            </span>
        </div>
    );
}
