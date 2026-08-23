"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { SeasonalCampaign } from "@/lib/seasonalCampaign";

const LOCALE_BY_LANG: Record<string, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", de: "de-DE" };

function formatRange(start: string | null, end: string | null, locale: string) {
  if (!start) return null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startDate = new Intl.DateTimeFormat(locale, opts).format(new Date(start));
  if (!end || end === start) return startDate;
  const endDate = new Intl.DateTimeFormat(locale, { ...opts, year: "numeric" }).format(
    new Date(end)
  );
  return `${startDate} – ${endDate}`;
}

export default function SeasonalBanner({ campaign }: { campaign: SeasonalCampaign }) {
  const { lang, t } = useLanguage();
  const locale = LOCALE_BY_LANG[lang] ?? "pt-PT";
  const range = formatRange(campaign.startDate, campaign.endDate, locale);

  return (
    <div className="bg-[var(--brand-black)] text-white border-b-2 border-[var(--brand-sea)]">
      <a
        href="#oferta"
        className="w-full mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4 text-left"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--brand-sea-bright)]">
            {campaign.title}
          </span>
          {campaign.subtitle && <span className="text-sm text-white/80">{campaign.subtitle}</span>}
          {range && <span className="text-sm text-white/80">· {range}</span>}
          {campaign.price != null && (
            <span className="text-sm font-semibold text-white">
              ·{" "}
              {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
                campaign.price
              )}
            </span>
          )}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide shrink-0 border border-[var(--brand-sea)] text-[var(--brand-sea-bright)] rounded-full px-3 py-1.5 hover:bg-[var(--brand-sea)] hover:text-white transition-colors">
          {t("offer.viewCta")}
        </span>
      </a>
    </div>
  );
}
