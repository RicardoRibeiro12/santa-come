import Papa from "papaparse";

export type SheetDailySpecial = {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  price: number;
};

type SheetRow = {
  data?: string;
  titulo?: string;
  descricao?: string;
  preco?: string;
  disponivel?: string;
  ordem?: string;
};

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > lastDot) return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  if (lastDot > lastComma) return Number(cleaned.replace(/,/g, "")) || 0;
  return Number(cleaned) || 0;
}

/**
 * Se DAILY_SPECIALS_SHEET_CSV_URL estiver definido, os pratos do dia são lidos
 * diretamente da aba "PratosDoDia" do Google Sheets, em vez de virem do painel
 * /admin. Ver docs/menu-template.xlsx para o formato de colunas esperado.
 */
export async function fetchDailySpecialsFromSheet(): Promise<SheetDailySpecial[] | null> {
  const url = process.env.DAILY_SPECIALS_SHEET_CSV_URL;
  if (!url) return null;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error(`Não foi possível ler o Google Sheets de pratos do dia (status ${res.status}).`);
    return null;
  }
  const csvText = await res.text();

  const parsed = Papa.parse<SheetRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  return (parsed.data ?? [])
    .filter((row) => row.data && row.titulo && row.data.trim() >= todayStr)
    .map((row, index) => {
      const available = (row.disponivel ?? "sim").trim().toLowerCase();
      return {
        id: `sheet-special-${index}`,
        date: new Date(row.data!.trim()),
        title: row.titulo!.trim(),
        description: row.descricao?.trim() || null,
        price: parsePrice(String(row.preco ?? "0")),
        available: available !== "nao" && available !== "não",
        order: Number(row.ordem) || 0,
      };
    })
    .filter((item) => item.available)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.order - b.order)
    .slice(0, 20)
    .map(({ id, date, title, description, price }) => ({ id, date, title, description, price }));
}
