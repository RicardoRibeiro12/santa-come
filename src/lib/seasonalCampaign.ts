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
 * Imagens associadas a campanhas específicas, hospedadas no próprio site
 * (public/images/) — usadas quando a folha não tem (ou já não tem) uma
 * coluna "imagem" preenchida para essa campanha. A chave é comparada contra
 * o nome da campanha e o título, sem distinguir maiúsculas/minúsculas.
 *
 * Nota: NÃO usar links do Google Drive aqui — o Drive bloqueia esse tipo de
 * uso ("hotlinking") com Cross-Origin-Resource-Policy: same-site, e a
 * imagem simplesmente não aparece em sites externos.
 */
const CAMPAIGN_IMAGE_FALLBACKS: [RegExp, string][] = [[/sapateira/i, "/images/sapateira.jpeg"]];

function fallbackImageForCampaign(campanha: string, titulo: string): string | null {
  const haystack = `${campanha} ${titulo}`;
  for (const [pattern, path] of CAMPAIGN_IMAGE_FALLBACKS) {
    if (pattern.test(haystack)) return path;
  }
  return null;
}

/**
 * Aceita tanto um link direto de imagem como um link de partilha do Google
 * Drive (".../file/d/<id>/view...") — neste último caso converte para o
 * formato de imagem direta que funciona num <img>. Se a folha não tiver
 * imagem definida, tenta um fallback local pelo nome da campanha.
 */
function normalizeImageUrl(raw: string | undefined, campanha: string, titulo: string): string | null {
  const url = raw?.trim();
  if (!url) return fallbackImageForCampaign(campanha, titulo);
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
    imageUrl: normalizeImageUrl(active.imagem, active.campanha ?? "", active.titulo),
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
        imagem: normalizeImageUrl(row.imagem, row.campanha ?? "", row.titulo!),
      };
    });
}
