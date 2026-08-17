"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DEFAULT_LANG, LangCode, SUPPORTED_LANGS, t as translate } from "@/lib/i18n";

const STORAGE_KEY = "santacome_lang";

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage indisponível (ex.: modo privado) — mantém o idioma por omissão
    }
    if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only API (localStorage) on mount
      setLangState(stored as LangCode);
    }
  }, []);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignora se localStorage não estiver disponível
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage deve ser usado dentro de <LanguageProvider>");
  return ctx;
}
