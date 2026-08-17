import Papa from "papaparse";

export type SheetMenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
};

type SheetRow = {
  categoria?: string;
  nome?: string;
  descricao?: string;
  preco?: string;
  disponivel?: string;
  ordem?: string;
};

/**
 * Aceita preços em vários formatos (o Google Sheets pode exportar valores
 * formatados como moeda, ex.: "2,50 €" ou "1.234,56"): remove tudo o que não
 * for dígito/vírgula/ponto e interpreta o último separador como decimal.
 */
function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > lastDot) {
    // vírgula é o separador decimal (formato PT): "1.234,56" -> 1234.56
    return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }
  if (lastDot > lastComma) {
    // ponto é o separador decimal (formato EN): "1,234.56" -> 1234.56
    return Number(cleaned.replace(/,/g, "")) || 0;
  }
  return Number(cleaned) || 0;
}

/**
 * Se MENU_SHEET_CSV_URL estiver definido, o menu completo é lido diretamente
 * de uma folha do Google Sheets publicada como CSV, em vez de vir da base de
 * dados. Ver docs/menu-template.xlsx para o formato de colunas esperado.
 */
export async function fetchMenuFromSheet(): Promise<SheetMenuItem[] | null> {
  const url = process.env.MENU_SHEET_CSV_URL;
  if (!url) return null;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error(`Não foi possível ler o Google Sheets do menu (status ${res.status}).`);
    return null;
  }
  const csvText = await res.text();

  const parsed = Papa.parse<SheetRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const rows = (parsed.data ?? [])
    .filter((row) => row.nome && row.nome.trim())
    .map((row, index) => {
      const available = (row.disponivel ?? "sim").trim().toLowerCase();
      return {
        id: `sheet-${index}`,
        category: (row.categoria ?? "Menu").trim(),
        name: row.nome!.trim(),
        description: row.descricao?.trim() || null,
        price: parsePrice(String(row.preco ?? "0")),
        available: available !== "nao" && available !== "não",
        order: Number(row.ordem) || 0,
      };
    })
    .filter((item) => item.available)
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

  return rows.map(({ id, category, name, description, price }) => ({
    id,
    category,
    name,
    description,
    price,
  }));
}
