import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext();

let _id = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((type, message) => {
        const id = ++_id;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }, []);

    const toast = {
        success: (m) => push("success", m),
        error: (m) => push("error", m),
        info: (m) => push("info", m),
    };

    const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastCtx.Provider value={toast}>
            {children}

            {/* Toast Stack */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
                style={{ maxWidth: "360px" }}
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => dismiss(t.id)}
                        className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium backdrop-blur-md cursor-pointer
              animate-[slideIn_0.3s_ease-out]
              ${t.type === "success" ? "bg-green-600/90 text-white" : ""}
              ${t.type === "error" ? "bg-red-600/90 text-white" : ""}
              ${t.type === "info" ? "bg-blue-600/90 text-white" : ""}
            `}
                    >
                        <span className="text-lg leading-none mt-0.5">
                            {t.type === "success" && "✅"}
                            {t.type === "error" && "❌"}
                            {t.type === "info" && "ℹ️"}
                        </span>
                        <span className="flex-1">{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx;
}
