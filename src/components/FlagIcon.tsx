import type { LangCode } from "@/lib/i18n";

const FLAGS: Record<LangCode, React.ReactNode> = {
  pt: (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#FF0000" />
      <rect width="12" height="20" fill="#046A38" />
      <circle cx="12" cy="10" r="3.4" fill="#FFCC00" stroke="#FF0000" strokeWidth="0.5" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="1.3" />
      <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="6" />
      <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3.6" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </svg>
  ),
};

export default function FlagIcon({ lang, className }: { lang: LangCode; className?: string }) {
  return (
    <span
      className={`inline-block w-[22px] h-[15px] rounded-[3px] overflow-hidden shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.25)] ${
        className ?? ""
      }`}
    >
      {FLAGS[lang]}
    </span>
  );
}
