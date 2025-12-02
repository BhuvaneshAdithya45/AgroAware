// client/src/i18n/index.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import hi from "./hi.json";
import kn from "./kn.json";
import te from "./te.json";

const DICT = { en, hi, kn, te };

const LanguageContext = createContext(null);

/**
 * LanguageProvider - wraps the app and exposes:
 *  - lang: current language code
 *  - setLang(code): change language
 *  - t(key, fallback): translation lookup with optional fallback
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("language") || "en";
    } catch (e) {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("language", lang);
    } catch (e) {
      // ignore storage errors (e.g. private mode)
    }
  }, [lang]);

  const t = (key, fallback) => {
    if (!key) return fallback || "";
    const dict = DICT[lang] || DICT.en;

    // Safe nested key lookup: supports "a.b.c"
    const parts = String(key).split(".");
    let cur = dict;
    for (let i = 0; i < parts.length; i++) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, parts[i])) {
        cur = cur[parts[i]];
      } else {
        cur = undefined;
        break;
      }
    }

    if (cur !== undefined && cur !== null) return cur;
    return fallback !== undefined ? fallback : key;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const ctx = useLanguage();
  if (!ctx) {
    throw new Error("useTranslation must be used inside LanguageProvider");
  }
  return { t: ctx.t, lang: ctx.lang, setLang: ctx.setLang };
}
