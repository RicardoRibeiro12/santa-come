import type { SheetMenuItem } from "@/lib/menuSheet";
import type { SheetDailySpecial } from "@/lib/dailySpecialsSheet";
import type { SeasonalCampaignRow } from "@/lib/seasonalCampaign";
import { splitIntoColumns } from "@/lib/splitIntoColumns";

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(price);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    date
  );
}

export default function SheetsPreview({
  menuItems,
  specials,
  campaigns,
}: {
  menuItems: SheetMenuItem[];
  specials: SheetDailySpecial[];
  campaigns: SeasonalCampaignRow[];
}) {
  const categories = Array.from(new Set(menuItems.map((i) => i.category)));

  return (
    <div className="space-y-6 mb-10">
      <h2 className="font-semibold text-lg">Pré-visualização do Google Sheets</h2>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h3 className="font-medium mb-3">
          Pratos do dia <span className="text-neutral-400 font-normal">({specials.length})</span>
        </h3>
        {specials.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">Nada publicado na aba &quot;PratosDoDia&quot;.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {specials.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between gap-4">
                <div>
                  <span className="text-neutral-400 mr-2">{formatDate(s.date)}</span>
                  <span className="font-medium">{s.title}</span>
                  {s.description && <span className="text-neutral-500"> — {s.description}</span>}
                </div>
                <span className="font-semibold whitespace-nowrap">{formatPrice(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h3 className="font-medium mb-3">
          Menu <span className="text-neutral-400 font-normal">({menuItems.length} itens)</span>
        </h3>
        {categories.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">Nada publicado na aba &quot;Menu&quot;.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {splitIntoColumns(categories, menuItems).map((column, colIndex) => (
              <div key={colIndex} className="space-y-6">
                {column.map((category) => (
                  <div key={category}>
                    <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
                      {category}
                    </p>
                    <ul className="divide-y divide-neutral-100 text-sm">
                      {menuItems
                        .filter((i) => i.category === category)
                        .map((item) => (
                          <li
                            key={item.id}
                            className="py-1.5 flex items-center justify-between gap-4"
                          >
                            <span>{item.name}</span>
                            <span className="font-semibold whitespace-nowrap">
                              {formatPrice(item.price)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h3 className="font-medium mb-3">
          Épocas festivas <span className="text-neutral-400 font-normal">({campaigns.length})</span>
        </h3>
        {campaigns.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">Nada publicado na aba &quot;Epocas&quot;.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {campaigns.map((c) => (
              <li key={c.campanha} className="py-2 flex items-center justify-between gap-4">
                <div>
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      c.ativo ? "bg-green-500" : "bg-neutral-300"
                    }`}
                    aria-hidden
                  />
                  <span className="font-medium">{c.titulo}</span>
                  <span className="text-neutral-400"> — {c.ativo ? "ativa" : "desligada"}</span>
                </div>
                {c.preco != null && <span className="font-semibold">{formatPrice(c.preco)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
