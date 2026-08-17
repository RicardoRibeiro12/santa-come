"use client";

import { useEffect, useState, useCallback } from "react";

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  order: number;
};

type DailySpecial = {
  id: string;
  date: string;
  title: string;
  description: string | null;
  price: number;
  available: boolean;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"specials" | "menu">("specials");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [itemsRes, specialsRes] = await Promise.all([
      fetch("/api/menu-items"),
      fetch("/api/daily-specials"),
    ]);
    setMenuItems(await itemsRes.json());
    setSpecials(await specialsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadAll();
  }, [loadAll]);

  return (
    <div>
      <div className="flex gap-2 mb-8 border-b border-neutral-200">
        <button
          onClick={() => setTab("specials")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "specials"
              ? "border-[--brand-red] text-[--brand-red]"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Pratos do dia
        </button>
        <button
          onClick={() => setTab("menu")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "menu"
              ? "border-[--brand-red] text-[--brand-red]"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Menu completo
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">A carregar...</p>
      ) : tab === "specials" ? (
        <DailySpecialsPanel specials={specials} onChange={loadAll} />
      ) : (
        <MenuItemsPanel items={menuItems} onChange={loadAll} />
      )}
    </div>
  );
}

function DailySpecialsPanel({
  specials,
  onChange,
}: {
  specials: DailySpecial[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    date: todayISO(),
    title: "",
    description: "",
    price: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = Number(form.price.replace(",", "."));
    if (!form.title.trim() || Number.isNaN(price)) {
      setError("Preenche o título e um preço válido.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/daily-specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          price,
        }),
      });
      if (!res.ok) {
        setError("Não foi possível guardar o prato do dia.");
        return;
      }
      setForm({ date: todayISO(), title: "", description: "", price: "" });
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este prato do dia?")) return;
    await fetch(`/api/daily-specials/${id}`, { method: "DELETE" });
    onChange();
  }

  async function handleToggle(item: DailySpecial) {
    await fetch(`/api/daily-specials/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    onChange();
  }

  async function handlePriceEdit(item: DailySpecial, newPrice: string) {
    const price = Number(newPrice.replace(",", "."));
    if (Number.isNaN(price)) return;
    await fetch(`/api/daily-specials/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    onChange();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-medium mb-4">Adicionar / atualizar prato do dia</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Prato</label>
            <input
              type="text"
              placeholder="Ex.: Feijoada de marisco"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Descrição (opcional)</label>
            <input
              type="text"
              placeholder="Acompanhamentos, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Preço (€)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="8.50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-[--brand-red] text-white rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar"}
        </button>
        <p className="text-xs text-neutral-400 mt-2">
          Se já existir um prato para essa data, ele é substituído.
        </p>
      </form>

      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {specials.length === 0 && (
          <p className="p-6 text-neutral-500 italic">Ainda não há pratos do dia registados.</p>
        )}
        {specials.map((s) => (
          <div key={s.id} className="p-5 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-neutral-500">
                {new Intl.DateTimeFormat("pt-PT", { dateStyle: "full" }).format(new Date(s.date))}
              </p>
              <p className="font-medium">{s.title}</p>
              {s.description && <p className="text-sm text-neutral-500">{s.description}</p>}
            </div>
            <input
              type="text"
              defaultValue={s.price.toFixed(2)}
              onBlur={(e) => handlePriceEdit(s, e.target.value)}
              className="w-24 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm text-right"
            />
            <button
              onClick={() => handleToggle(s)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                s.available
                  ? "border-green-300 text-green-700 bg-green-50"
                  : "border-neutral-300 text-neutral-500 bg-neutral-50"
              }`}
            >
              {s.available ? "Visível" : "Oculto"}
            </button>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItemsPanel({ items, onChange }: { items: MenuItem[]; onChange: () => void }) {
  const [form, setForm] = useState({ category: "", name: "", description: "", price: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = Number(form.price.replace(",", "."));
    if (!form.category.trim() || !form.name.trim() || Number.isNaN(price)) {
      setError("Preenche a categoria, o nome e um preço válido.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category.trim(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price,
        }),
      });
      if (!res.ok) {
        setError("Não foi possível adicionar o item.");
        return;
      }
      setForm({ category: form.category, name: "", description: "", price: "" });
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este item do menu?")) return;
    await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
    onChange();
  }

  async function handleToggle(item: MenuItem) {
    await fetch(`/api/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    onChange();
  }

  async function handlePriceEdit(item: MenuItem, newPrice: string) {
    const price = Number(newPrice.replace(",", "."));
    if (Number.isNaN(price)) return;
    await fetch(`/api/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    onChange();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-medium mb-4">Adicionar item ao menu</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Categoria</label>
            <input
              type="text"
              placeholder="Ex.: Entradas, Carnes..."
              list="categories"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Nome do prato</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Descrição (opcional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Preço (€)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="7.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-[--brand-red] text-white rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Adicionar"}
        </button>
      </form>

      {categories.length === 0 && (
        <p className="text-neutral-500 italic">Ainda não há itens no menu.</p>
      )}

      {categories.map((category) => (
        <div key={category} className="bg-white rounded-2xl border border-neutral-200">
          <h3 className="px-5 py-3 border-b border-neutral-100 font-medium">{category}</h3>
          <div className="divide-y divide-neutral-100">
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <div key={item.id} className="p-5 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-neutral-500">{item.description}</p>
                    )}
                  </div>
                  <input
                    type="text"
                    defaultValue={item.price.toFixed(2)}
                    onBlur={(e) => handlePriceEdit(item, e.target.value)}
                    className="w-24 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm text-right"
                  />
                  <button
                    onClick={() => handleToggle(item)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      item.available
                        ? "border-green-300 text-green-700 bg-green-50"
                        : "border-neutral-300 text-neutral-500 bg-neutral-50"
                    }`}
                  >
                    {item.available ? "Disponível" : "Indisponível"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
