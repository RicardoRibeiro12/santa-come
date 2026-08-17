"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Special = {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  price: number;
};

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
};

const LOCALE_BY_LANG: Record<string, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", de: "de-DE" };

export default function HomeClient({
  specials,
  menuItems,
  categories,
}: {
  specials: Special[];
  menuItems: MenuItem[];
  categories: string[];
}) {
  const { lang, t } = useLanguage();
  const locale = LOCALE_BY_LANG[lang] ?? "pt-PT";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(price);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(
      date
    );

  const formatDayNumber = (date: Date) =>
    new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);

  const formatMonthShort = (date: Date) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "");

  const HOURS: [string, string][] = [
    [t("days.monday"), "11:30–22:30"],
    [t("days.tuesday"), t("contact.closed")],
    [t("days.wednesday"), "11:30–22:30"],
    [t("days.thursday"), "11:30–22:30"],
    [t("days.friday"), "11:30–22:30"],
    [t("days.saturday"), "11:30–22:30"],
    [t("days.sunday"), "11:30–22:30"],
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[--brand-black]/90 backdrop-blur text-white border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Santa Come"
              width={48}
              height={48}
              className="rounded-full ring-2 ring-[--brand-red]/60"
              priority
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl leading-tight tracking-tight">
                Santa Come
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                {t("nav.tagline")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-8 text-sm uppercase tracking-wider">
              <a href="#pratos-do-dia" className="hover:text-[--brand-red-bright] transition-colors">
                {t("nav.dailySpecials")}
              </a>
              <a href="#menu" className="hover:text-[--brand-red-bright] transition-colors">
                {t("nav.menu")}
              </a>
              <a href="#contactos" className="hover:text-[--brand-red-bright] transition-colors">
                {t("nav.contact")}
              </a>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative grain overflow-hidden bg-[--brand-black] text-white scallop-bottom">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 26px)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 text-center">
          <span className="font-[family-name:var(--font-script)] text-3xl text-[--brand-mustard] block -rotate-2">
            {t("hero.eyebrow")}
          </span>
          <h1 className="font-[family-name:var(--font-display)] font-black tracking-tight text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] mt-1 text-balance">
            Santa Come
          </h1>
          <p className="mt-6 text-white/70 max-w-xl mx-auto text-lg text-balance">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a
              href="#pratos-do-dia"
              className="bg-[--brand-red] hover:bg-[--brand-red-bright] transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm shadow-[0_8px_30px_-8px_rgba(179,35,28,0.6)]"
            >
              {t("hero.ctaSpecials")}
            </a>
            <a
              href="#contactos"
              className="border border-white/25 hover:border-white/60 transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm"
            >
              {t("hero.ctaDirections")}
            </a>
          </div>
        </div>
      </section>

      {/* Pratos do dia */}
      <section id="pratos-do-dia" className="mx-auto max-w-6xl px-6 py-24 w-full">
        <div className="flex items-end justify-between gap-4 mb-12 flex-wrap">
          <div>
            <span className="font-[family-name:var(--font-script)] text-2xl text-[--brand-red] block -rotate-1">
              {t("specials.eyebrow")}
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
              {t("specials.title")}
            </h2>
          </div>
          <p className="text-neutral-500 max-w-xs text-sm">{t("specials.subtitle")}</p>
        </div>

        {specials.length === 0 ? (
          <p className="text-neutral-500 italic border-l-4 border-[--brand-red] pl-4 py-2">
            {t("specials.empty")}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specials.map((s) => (
              <div
                key={s.id}
                className="group relative border-2 border-[--brand-black] rounded-2xl p-6 flex flex-col gap-2 bg-white shadow-[6px_6px_0_0_var(--brand-black)] hover:shadow-[9px_9px_0_0_var(--brand-red)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col items-center justify-center bg-[--brand-black] text-white rounded-xl w-14 h-14 shrink-0">
                    <span className="text-lg font-extrabold leading-none">
                      {formatDayNumber(s.date)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[--brand-mustard]">
                      {formatMonthShort(s.date)}
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-[--brand-red] whitespace-nowrap">
                    {formatPrice(s.price)}
                  </span>
                </div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                  {formatDate(s.date)}
                </span>
                <h3 className="font-semibold text-lg leading-snug">{s.title}</h3>
                {s.description && <p className="text-sm text-neutral-500">{s.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Menu completo */}
      <section id="menu" className="relative bg-[--brand-cream] scallop-bottom">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-14">
            <span className="font-[family-name:var(--font-script)] text-2xl text-[--brand-red] block rotate-1">
              {t("menu.eyebrow")}
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
              {t("menu.title")}
            </h2>
          </div>

          {categories.length === 0 ? (
            <p className="text-neutral-500 italic text-center">{t("menu.empty")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-16 gap-y-12">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[--brand-black] mb-4 pb-2 border-b-2 border-[--brand-red] inline-block">
                    {category}
                  </h3>
                  <ul className="space-y-4 mt-2">
                    {menuItems
                      .filter((i) => i.category === category)
                      .map((item) => (
                        <li key={item.id} className="flex items-baseline gap-1">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-neutral-500">{item.description}</p>
                            )}
                          </div>
                          <span className="menu-leader text-neutral-400" aria-hidden />
                          <span className="font-[family-name:var(--font-display)] font-bold whitespace-nowrap text-[--brand-red]">
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
      <section id="contactos" className="grain relative bg-[--brand-black] text-white">
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <span className="font-[family-name:var(--font-script)] text-2xl text-[--brand-mustard] block -rotate-1">
            {t("contact.eyebrow")}
          </span>
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight mb-12">
            {t("contact.title")}
          </h2>

          <div className="grid sm:grid-cols-2 gap-12">
            <div className="space-y-6 text-white/80">
              <div>
                <p className="text-xs uppercase tracking-widest text-[--brand-mustard] mb-1">
                  {t("contact.address")}
                </p>
                <p className="text-lg">
                  Pátio da Azenha, Lt. 8, Lj A
                  <br />
                  R. da Azenha 9, 2560-474 Silveira
                  <br />
                  Santa Cruz, Lisboa
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[--brand-mustard] mb-1">
                  {t("contact.phone")}
                </p>
                <a
                  href="tel:+351261938747"
                  className="text-lg hover:text-[--brand-red-bright] transition-colors"
                >
                  261 938 747
                </a>
              </div>
              <div>
                <a
                  href="https://maps.app.goo.gl/cxFpjsntb6DwRrXYA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[--brand-red] hover:bg-[--brand-red-bright] transition-colors px-6 py-3 rounded-full font-semibold uppercase tracking-wide text-sm"
                >
                  {t("contact.mapsCta")}
                </a>
              </div>
              <div className="flex gap-5 pt-2 text-sm uppercase tracking-wider">
                <a
                  href="https://www.facebook.com/restaurantesantacome/?locale=pt_PT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[--brand-red-bright] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/restaurante.santacome/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[--brand-red-bright] transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tripadvisor.pt/Restaurant_Review-g5602892-d5981355-Reviews-Santa_Come-Silveira_Lisbon_District_Central_Portugal.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[--brand-red-bright] transition-colors"
                >
                  TripAdvisor
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[--brand-mustard] mb-3">
                {t("contact.hours")}
              </p>
              <table className="w-full max-w-sm text-sm">
                <tbody>
                  {HOURS.map(([day, hours]) => (
                    <tr key={day} className="border-b border-white/10">
                      <td className="py-2.5 text-white/60">{day}</td>
                      <td
                        className={`py-2.5 text-right font-semibold ${
                          hours === t("contact.closed") ? "text-white/30 font-normal" : "text-white"
                        }`}
                      >
                        {hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[--brand-black] text-white/40 text-sm border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Santa Come. {t("footer.rights")}
          </p>
          <Link href="/admin" className="hover:text-white transition-colors">
            {t("footer.admin")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
