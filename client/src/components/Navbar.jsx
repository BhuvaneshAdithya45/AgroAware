import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";
import { useTheme } from "./ThemeProvider";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "how", label: "How" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Videos" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact" },
];

// ... (previous imports)

// ... (SECTIONS array)

export default function Navbar({ dark: forceDark }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isAuthed = !!localStorage.getItem("token");
  const { t, lang, setLang } = useTranslation();
  const { dark: themeDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use forced dark mode if provided (screen-specific), otherwise use global theme
  const isDark = forceDark !== undefined ? forceDark : themeDark;

  const to = (p) => () => { nav(p); setMobileOpen(false); };
  const anchorHref = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur transition-colors duration-300 ${forceDark ? 'bg-transparent border-white/10' : ''
        }`}
      style={{
        backgroundColor: forceDark
          ? "transparent"
          : isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.92)",
        borderColor: forceDark ? "rgba(255,255,255,0.1)" : "var(--border-color)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
        {/* Brand */}
        <button
          onClick={to(isAuthed ? "/dashboard" : "/")}
          className="flex items-center gap-2"
          title={t("brand")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2913/2913465.png"
            className="w-7"
            alt="logo"
          />
          <span className={`text-lg font-bold ${forceDark ? 'text-white' : ''}`} style={{ color: forceDark ? "white" : "var(--green-accent)" }}>
            {t("brand")}
          </span>
        </button>

        {/* Mid: section anchors (show on lg+ screens, ONLY if NOT authed) */}
        {!isAuthed && (
          <div className="hidden lg:flex items-center gap-4 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={anchorHref(s.id)}
                className="hover:opacity-80 transition-opacity"
                style={{ color: forceDark ? "rgba(255,255,255,0.8)" : "var(--text-secondary)" }}
              >
                {t(s.id, s.label)}
              </a>
            ))}
          </div>
        )}

        {/* Right: controls */}
        <div className="flex items-center gap-2 text-sm">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className={`rounded-lg p-2 transition text-lg ${forceDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200/50'}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Language selector */}
          <select
            id="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
            style={{
              backgroundColor: forceDark ? "rgba(0,0,0,0.3)" : "var(--input-bg)",
              color: forceDark ? "white" : "var(--text-primary)",
              borderColor: forceDark ? "rgba(255,255,255,0.2)" : "var(--border-color)",
            }}
            aria-label={t("language")}
          >
            <option value="en" className="text-gray-900">English</option>
            <option value="kn" className="text-gray-900">ಕನ್ನಡ</option>
            <option value="hi" className="text-gray-900">हिंदी</option>
            <option value="te" className="text-gray-900">తెలుగు</option>
            <option value="ta" className="text-gray-900">தமிழ்</option>
          </select>

          {/* Desktop nav buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthed ? (
              <>
                {/* Chat */}
                <button
                  onClick={to("/advisory-chat")}
                  className={`rounded-lg border px-3 py-1.5 transition hover:opacity-80 ${forceDark ? 'border-white/30 text-white hover:bg-white/10' : ''}`}
                  style={!forceDark ? { borderColor: "var(--green-accent)", color: "var(--green-accent)" } : {}}
                  title={t("chat_with_agroaware", "Chat with AgroAware")}
                >
                  💬 {t("chat", "Chat")}
                </button>

                {/* Crops */}
                <button
                  onClick={to("/crop-advisory")}
                  className={`rounded-lg border px-3 py-1.5 transition ${forceDark ? 'border-emerald-400 text-emerald-300 hover:bg-emerald-500/20' : 'border-emerald-600 px-3 py-1.5 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                  title={t("crop_advisory", "Crop Advisory Tool")}
                >
                  🌾 {t("crops", "Crops")}
                </button>

                {/* Schemes */}
                <button
                  onClick={to("/schemes")}
                  className={`rounded-lg border px-3 py-1.5 transition ${forceDark ? 'border-blue-400 text-blue-300 hover:bg-blue-500/20' : 'border-blue-600 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                  title={t("schemes", "Government Schemes")}
                >
                  🏛️ {t("schemes", "Schemes")}
                </button>

                {/* Awareness */}
                <button
                  onClick={to("/awareness")}
                  className={`rounded-lg border px-3 py-1.5 transition ${forceDark ? 'border-orange-400 text-orange-300 hover:bg-orange-500/20' : 'border-orange-500 px-3 py-1.5 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
                  title={t("farming_awareness", "Farming Awareness Hub")}
                >
                  🌾 {t("nav_awareness", "Awareness")}
                </button>

                {/* Voice Assistant */}
                <button
                  onClick={to("/voice")}
                  className={`rounded-lg border px-3 py-1.5 transition ${forceDark ? 'border-pink-400 text-pink-300 hover:bg-pink-500/20' : 'border-pink-600 px-3 py-1.5 text-pink-600 hover:bg-pink-600 hover:text-white'}`}
                  title={t("voice_assistant", "Voice Assistant")}
                >
                  🎤 {t("nav_voice", "Voice")}
                </button>

                {/* RAG Upload */}
                <button
                  onClick={to("/rag")}
                  className={`rounded-lg border px-3 py-1.5 transition ${forceDark ? 'border-purple-400 text-purple-300 hover:bg-purple-500/20' : 'border-purple-600 px-3 py-1.5 text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                  title={t("rag_upload", "Upload & query documents")}
                >
                  📄 {t("nav_rag", "RAG")}
                </button>
              </>
            ) : null}

            {!isAuthed ? (
              <>
                <button
                  onClick={to("/login")}
                  className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 shadow-lg"
                >
                  {t("login")}
                </button>
                <button
                  onClick={to("/signup")}
                  className={`rounded-lg border px-4 py-2 hover:opacity-80 ${forceDark ? 'border-white text-white hover:bg-white/10' : ''}`}
                  style={!forceDark ? { borderColor: "var(--green-accent)", color: "var(--green-accent)" } : {}}
                >
                  {t("signup")}
                </button>
              </>
            ) : (
              <button
                className="text-red-500 hover:underline"
                onClick={() => {
                  localStorage.removeItem("token");
                  nav("/");
                }}
              >
                {t("logout", "Logout")}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden rounded-lg p-2 transition ${forceDark ? 'text-white hover:bg-white/10' : 'hover:bg-gray-200/50'}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t p-4 space-y-3 text-sm animate-in slide-in-from-top-5"
          style={{
            backgroundColor: isDark ? "rgba(15,23,42,0.98)" : "rgba(255,255,255,0.98)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "var(--border-color)",
            color: isDark ? "white" : "black"
          }}
        >
          <button
            onClick={to("/advisory-chat")}
            className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            💬 {t("chat", "Chat")}
          </button>
          <button
            onClick={to("/crop-advisory")}
            className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            🌾 {t("crops", "Crops")}
          </button>
          <button
            onClick={to("/schemes")}
            className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            🏛️ {t("schemes", "Schemes")}
          </button>
          <button
            onClick={to("/awareness")}
            className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            🌾 {t("nav_awareness", "Awareness")}
          </button>
          <button
            onClick={to("/voice")}
            className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            🎤 {t("nav_voice", "Voice")}
          </button>
          {isAuthed && (
            <button
              onClick={to("/rag")}
              className={`block w-full text-left rounded-lg px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              📄 {t("nav_rag", "RAG")}
            </button>
          )}
          <hr style={{ borderColor: "var(--border-color)" }} />
          {!isAuthed ? (
            <div className="flex gap-2">
              <button onClick={to("/login")} className="btn flex-1 bg-green-700 text-white">{t("login")}</button>
              <button
                onClick={to("/signup")}
                className="flex-1 rounded-lg border px-4 py-2"
                style={{ borderColor: "var(--green-accent)", color: "var(--green-accent)" }}
              >
                {t("signup")}
              </button>
            </div>
          ) : (
            <button
              className="text-red-500 hover:underline"
              onClick={() => { localStorage.removeItem("token"); nav("/"); setMobileOpen(false); }}
            >
              {t("logout", "Logout")}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
