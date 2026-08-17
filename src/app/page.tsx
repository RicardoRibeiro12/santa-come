import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(price);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default async function Home() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [specials, menuItems] = await Promise.all([
    prisma.dailySpecial.findMany({
      where: { date: { gte: new Date(todayStr) }, available: true },
      orderBy: { date: "asc" },
      take: 7,
    }),
    prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
    }),
  ]);

  const categories = Array.from(new Set(menuItems.map((i) => i.category)));

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-[--brand-black] text-white">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Santa Come"
              width={56}
              height={56}
              className="rounded-full"
              priority
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl leading-tight">
                Santa Come
              </p>
              <p className="text-xs uppercase tracking-widest text-white/60">
                Self-Service &amp; Take Away — Santa Cruz
              </p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <a href="#pratos-do-dia" className="hover:text-[--brand-red] transition-colors">
              Pratos do dia
            </a>
            <a href="#menu" className="hover:text-[--brand-red] transition-colors">
              Menu
            </a>
            <a href="#contactos" className="hover:text-[--brand-red] transition-colors">
              Contactos
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[--brand-black] text-white pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
            Bem-vindo ao Santa Come
          </h1>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Restaurante self-service e take away em Santa Cruz. Comida caseira, pratos do dia
            atualizados e preços justos.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <a
              href="#pratos-do-dia"
              className="bg-[--brand-red] hover:opacity-90 transition-opacity px-6 py-3 rounded-full font-medium"
            >
              Ver pratos do dia
            </a>
            <a
              href="#contactos"
              className="border border-white/30 hover:border-white/60 transition-colors px-6 py-3 rounded-full font-medium"
            >
              Como chegar
            </a>
          </div>
        </div>
      </section>

      {/* Pratos do dia */}
      <section id="pratos-do-dia" className="mx-auto max-w-5xl px-6 py-16 w-full">
        <h2 className="font-[family-name:var(--font-display)] text-3xl mb-2">Pratos do dia</h2>
        <p className="text-neutral-500 mb-8">Atualizado pelos nossos donos regularmente.</p>

        {specials.length === 0 ? (
          <p className="text-neutral-500 italic">
            Ainda não há pratos do dia publicados. Volta a passar por aqui em breve!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {specials.map((s) => (
              <div
                key={s.id}
                className="border border-neutral-200 rounded-2xl p-5 flex flex-col gap-1 bg-white shadow-sm"
              >
                <span className="text-xs uppercase tracking-widest text-[--brand-red] font-semibold">
                  {formatDate(s.date)}
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <span className="font-semibold whitespace-nowrap">{formatPrice(s.price)}</span>
                </div>
                {s.description && (
                  <p className="text-sm text-neutral-500">{s.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Menu completo */}
      <section id="menu" className="bg-[--brand-cream]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl mb-8">Menu</h2>

          {categories.length === 0 ? (
            <p className="text-neutral-500 italic">O menu vai ser publicado brevemente.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="font-[family-name:var(--font-display)] text-xl text-[--brand-red] mb-3">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {menuItems
                      .filter((i) => i.category === category)
                      .map((item) => (
                        <li key={item.id} className="flex items-baseline justify-between gap-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-neutral-500">{item.description}</p>
                            )}
                          </div>
                          <span className="font-semibold whitespace-nowrap">
                            {formatPrice(item.price)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contactos */}
      <section id="contactos" className="mx-auto max-w-5xl px-6 py-16 w-full">
        <h2 className="font-[family-name:var(--font-display)] text-3xl mb-8">Contactos</h2>
        <div className="grid sm:grid-cols-2 gap-10">
          <div className="space-y-4 text-neutral-700">
            <p>
              <strong>Morada:</strong>
              <br />
              Pátio da Azenha, Lt. 8, Lj A
              <br />
              R. da Azenha 9, 2560-474 Silveira
              <br />
              Santa Cruz, Lisboa
            </p>
            <p>
              <strong>Telefone:</strong>{" "}
              <a href="tel:+351261938747" className="hover:text-[--brand-red] transition-colors">
                261 938 747
              </a>
            </p>
            <div>
              <strong>Horário:</strong>
              <table className="mt-1 text-sm">
                <tbody>
                  {[
                    ["Segunda-feira", "11:30–22:30"],
                    ["Terça-feira", "Encerrado"],
                    ["Quarta-feira", "11:30–22:30"],
                    ["Quinta-feira", "11:30–22:30"],
                    ["Sexta-feira", "11:30–22:30"],
                    ["Sábado", "11:30–22:30"],
                    ["Domingo", "11:30–22:30"],
                  ].map(([day, hours]) => (
                    <tr key={day}>
                      <td className="pr-4 py-0.5 text-neutral-500">{day}</td>
                      <td
                        className={
                          hours === "Encerrado" ? "py-0.5 text-neutral-400" : "py-0.5 font-medium"
                        }
                      >
                        {hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              <a
                href="https://maps.app.goo.gl/cxFpjsntb6DwRrXYA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--brand-red] font-medium hover:underline"
              >
                Ver no Google Maps →
              </a>
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Segue-nos:</p>
            <div className="flex flex-col gap-2 text-neutral-700">
              <a
                href="https://www.facebook.com/restaurantesantacome/?locale=pt_PT"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[--brand-red] transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/restaurante.santacome/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[--brand-red] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.tripadvisor.pt/Restaurant_Review-g5602892-d5981355-Reviews-Santa_Come-Silveira_Lisbon_District_Central_Portugal.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[--brand-red] transition-colors"
              >
                TripAdvisor
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[--brand-black] text-white/60 text-sm">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Santa Come. Todos os direitos reservados.</p>
          <Link href="/admin" className="hover:text-white transition-colors">
            Área reservada
          </Link>
        </div>
      </footer>
    </div>
  );
}
