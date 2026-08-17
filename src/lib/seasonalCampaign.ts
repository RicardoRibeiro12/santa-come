import Papa from "papaparse";

export type SeasonalCampaign = {
  title: string;
  subtitle: string | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  description: string | null;
};

type CampaignRow = {
  campanha?: string;
  ativo?: string;
  titulo?: string;
  subtitulo?: string;
  data_inicio?: string;
  data_fim?: string;
  preco?: string;
  descricao?: string;
};

/**
 * Se SEASONAL_SHEET_CSV_URL estiver definido, lê a aba "Epocas" do Google
 * Sheets e devolve a primeira campanha marcada como "ativo = sim" (o
 * interruptor liga/desliga fica na própria folha). Sem variável, ou sem
 * nenhuma campanha ativa, devolve null e nenhum banner é mostrado.
 */
export async function fetchActiveCampaign(): Promise<SeasonalCampaign | null> {
  const url = process.env.SEASONAL_SHEET_CSV_URL;
  if (!url) return null;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error(`Não foi possível ler o Google Sheets de épocas festivas (status ${res.status}).`);
    return null;
  }
  const csvText = await res.text();

  const parsed = Papa.parse<CampaignRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const active = (parsed.data ?? []).find(
    (row) => (row.ativo ?? "").trim().toLowerCase() === "sim"
  );
  if (!active || !active.titulo) return null;

  const priceRaw = (active.preco ?? "").replace(",", ".").trim();
  const price = priceRaw ? Number(priceRaw) : null;

  return {
    title: active.titulo.trim(),
    subtitle: active.subtitulo?.trim() || null,
    startDate: active.data_inicio?.trim() || null,
    endDate: active.data_fim?.trim() || null,
    price: price && !Number.isNaN(price) ? price : null,
    description: active.descricao?.trim() || null,
  };
}
