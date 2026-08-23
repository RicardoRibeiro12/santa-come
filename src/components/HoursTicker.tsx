"use client";

import type { HoursNotice } from "@/lib/hoursNotice";

/**
 * Faixa fina, fixa por baixo do cabeçalho, com avisos de horários especiais
 * (Natal, Fim de Ano, ou qualquer dia extra que os donos decidam fechar).
 * Só aparece quando há pelo menos um aviso marcado como ativo na aba
 * "Horarios" do Google Sheets. Pode mostrar vários ao mesmo tempo.
 */
export default function HoursTicker({ notices }: { notices: HoursNotice[] }) {
  if (notices.length === 0) return null;

  return (
    <div className="bg-[var(--brand-black)] text-white border-b-2 border-[var(--brand-orange)]">
      <div className="w-full mx-auto max-w-6xl px-6 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 justify-center text-center">
        {notices.map((notice, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange-bright)] shrink-0" aria-hidden />
            <span className="text-white/90">{notice.message}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
