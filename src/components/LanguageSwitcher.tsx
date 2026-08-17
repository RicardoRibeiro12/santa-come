"use client";

import { useEffect, useRef, useState } from "react";
import { LANG_LABELS, SUPPORTED_LANGS } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Escolher idioma"
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm hover:border-white/50 transition-colors"
      >
        <span aria-hidden>{LANG_LABELS[lang].flag}</span>
        <span className="hidden sm:inline">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-[--brand-black] shadow-xl overflow-hidden z-50"
        >
          {SUPPORTED_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === lang}
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                code === lang ? "bg-white/10 font-semibold" : ""
              }`}
            >
              <span aria-hidden>{LANG_LABELS[code].flag}</span>
              {LANG_LABELS[code].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
