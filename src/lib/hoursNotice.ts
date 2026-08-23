import Papa from "papaparse";

export type HoursNotice = {
  message: string;
  order: number;
};

type HoursNoticeRow = {
  mensagem?: string;
  ativo?: string;
  ordem?: string;
};

/**
 * Lê a aba "Horarios" do Google Sheets: avisos de horários especiais
 * (Natal, Fim de Ano, ou qualquer dia que os donos decidam fechar/mudar).
 * Cada linha tem o seu próprio "ativo sim/nao" — podem estar várias ativas
 * ao mesmo tempo (ex.: Natal e Fim de Ano juntos em dezembro).
 */
export async function fetchActiveHoursNotices(): Promise<HoursNotice[]> {
  const url = process.env.HOURS_SHEET_CSV_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.error(`Não foi possível ler o Google Sheets de horários especiais (status ${res.status}).`);
    return [];
  }
  const csvText = await res.text();

  const parsed = Papa.parse<HoursNoticeRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return (parsed.data ?? [])
    .filter((row) => (row.ativo ?? "").trim().toLowerCase() === "sim" && row.mensagem?.trim())
    .map((row) => ({
      message: row.mensagem!.trim(),
      order: Number(row.ordem) || 0,
    }))
    .sort((a, b) => a.order - b.order);
}
