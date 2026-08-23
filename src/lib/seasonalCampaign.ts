import Papa from "papaparse";

export type SeasonalCampaign = {
  title: string;
  subtitle: string | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
};

export type SeasonalCampaignRow = {
  campanha: string;
  ativo: boolean;
  titulo: string;
  subtitulo: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  preco: number | null;
  descricao: string | null;
  imagem: string | null;
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
  imagem?: string;
};

/**
 * Aceita tanto um link direto de imagem como um link de partilha do Google
 * Drive (".../file/d/<id>/view...") — neste último caso converte para o
 * formato de imagem direta que funciona num <img>.
 */
function normalizeImageUrl(raw: string | undefined): string | null {
  const url = raw?.trim();
  if (!url) return null;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
}

async function fetchCampaignRows(): Promise<CampaignRow[] | null> {
  const url = process.env.SEASONAL_SHEET_CSV_URL;
  if (!url) return null;

  const res = await fetch(url, { cache: "no-store" });
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

  return parsed.data ?? [];
}

/**
 * Se SEASONAL_SHEET_CSV_URL estiver definido, lê a aba "Epocas" do Google
 * Sheets e devolve a primeira campanha marcada como "ativo = sim" (o
 * interruptor liga/desliga fica na própria folha). Sem variável, ou sem
 * nenhuma campanha ativa, devolve null e nenhum banner é mostrado.
 */
export async function fetchActiveCampaign(): Promise<SeasonalCampaign | null> {
  const rows = await fetchCampaignRows();
  if (!rows) return null;

  const active = rows.find((row) => (row.ativo ?? "").trim().toLowerCase() === "sim");
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
    imageUrl: normalizeImageUrl(active.imagem),
  };
}

/** Todas as linhas da aba "Epocas", tal como estão na folha — usado no /admin (só leitura). */
export async function fetchAllCampaigns(): Promise<SeasonalCampaignRow[] | null> {
  const rows = await fetchCampaignRows();
  if (!rows) return null;

  return rows
    .filter((row) => row.titulo)
    .map((row) => {
      const priceRaw = (row.preco ?? "").replace(",", ".").trim();
      const price = priceRaw ? Number(priceRaw) : null;
      return {
        campanha: row.campanha?.trim() || row.titulo!.trim(),
        ativo: (row.ativo ?? "").trim().toLowerCase() === "sim",
        titulo: row.titulo!.trim(),
        subtitulo: row.subtitulo?.trim() || null,
        dataInicio: row.data_inicio?.trim() || null,
        dataFim: row.data_fim?.trim() || null,
        preco: price && !Number.isNaN(price) ? price : null,
        descricao: row.descricao?.trim() || null,
        imagem: normalizeImageUrl(row.imagem),
      };
    });
}
