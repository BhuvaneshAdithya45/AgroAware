import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext();

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => {
        if (typeof window === "undefined") return false;
        const saved = localStorage.getItem("agroaware-theme");
        if (saved) return saved === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("agroaware-theme", dark ? "dark" : "light");
    }, [dark]);

    const toggleTheme = () => setDark((d) => !d);

    return (
        <ThemeCtx.Provider value={{ dark, toggleTheme }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeCtx);
    if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
    return ctx;
}
