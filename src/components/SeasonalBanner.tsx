"use client";

import { useState } from "react";
import type { SeasonalCampaign } from "@/lib/seasonalCampaign";

function formatRange(start: string | null, end: string | null) {
  if (!start) return null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startDate = new Intl.DateTimeFormat("pt-PT", opts).format(new Date(start));
  if (!end || end === start) return startDate;
  const endDate = new Intl.DateTimeFormat("pt-PT", { ...opts, year: "numeric" }).format(
    new Date(end)
  );
  return `${startDate} a ${endDate}`;
}

export default function SeasonalBanner({ campaign }: { campaign: SeasonalCampaign }) {
  const [open, setOpen] = useState(false);
  const range = formatRange(campaign.startDate, campaign.endDate);

  return (
    <div className="bg-[--brand-black] text-white border-b-2 border-[--brand-orange]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-[family-name:var(--font-display)] font-bold text-lg text-[--brand-orange-bright]">
            {campaign.title}
          </span>
          {campaign.subtitle && <span className="text-sm text-white/80">{campaign.subtitle}</span>}
          {range && <span className="text-sm text-white/80">· {range}</span>}
          {campaign.price != null && (
            <span className="text-sm font-semibold text-white">
              ·{" "}
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                campaign.price
              )}
            </span>
          )}
        </span>
        <span className="text-sm underline shrink-0 text-white/90">
          {open ? "fechar" : "saber mais"}
        </span>
      </button>
      {open && campaign.description && (
        <div className="border-t border-white/15 bg-white/5">
          <p className="mx-auto max-w-6xl px-6 py-4 text-sm text-white/90 leading-relaxed">
            {campaign.description}
          </p>
        </div>
      )}
    </div>
  );
}
