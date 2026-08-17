"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SeasonalBanner from "@/components/SeasonalBanner";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";
import { splitIntoColumns } from "@/lib/splitIntoColumns";
import type { SeasonalCampaign } from "@/lib/seasonalCampaign";

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
  campaign,
}: {
  specials: Special[];
  menuItems: MenuItem[];
  categories: string[];
  campaign: SeasonalCampaign | null;
}) {
  const { lang, t } = useLanguage();
  const locale = LOCALE_BY_LANG[lang] ?? "pt-PT";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // só fica sólido depois de sair da foto do hero (~86vh), não ao primeiro pixel de scroll
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const navLinks = [
    { href: "#pratos-do-dia", label: t("nav.dailySpecials") },
    { href: "#menu", label: t("nav.menu") },
    { href: "#contactos", label: t("nav.contact") },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header — flutua transparente sobre o hero e fica opaco ao fazer scroll */}
      <header
        className={`fixed top-0 inset-x-0 z-50 text-white transition-colors duration-300 ${
          scrolled || mobileOpen
            ? "bg-[var(--brand-black)] border-b border-white/10"
            : "bg-gradient-to-b from-black/50 to-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Santa Come"
              width={48}
              height={48}
              className="rounded-full ring-2 ring-[var(--brand-orange)]/60"
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
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden sm:flex items-center gap-8 text-sm uppercase tracking-wider">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-[var(--brand-orange-bright)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 -mr-1.5"
            >
              <span
                className={`block h-0.5 w-5 bg-white transition-transform ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span className={`block h-0.5 w-5 bg-white transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span
                className={`block h-0.5 w-5 bg-white transition-transform ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="sm:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm uppercase tracking-wider">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="hover:text-[var(--brand-orange-bright)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {campaign && (
        <div className="fixed top-[80px] inset-x-0 z-40">
          <SeasonalBanner campaign={campaign} />
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--brand-black)] text-white min-h-[86vh] flex flex-col justify-end">
        <Image
          src="/images/interior.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-black)] via-[var(--brand-black)]/55 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 text-center">
          <span className="font-[family-name:var(--font-script)] text-3xl text-[var(--brand-mustard)] block -rotate-2">
            {t("hero.eyebrow")}
          </span>
          <h1 className="font-[family-name:var(--font-display)] font-black tracking-tight text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] mt-1 text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
            Santa Come
          </h1>
          <p className="mt-6 text-white/90 max-w-xl mx-auto text-lg text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a
              href="#pratos-do-dia"
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-bright)] transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm shadow-[0_8px_30px_-8px_rgba(193,86,15,0.6)]"
            >
              {t("hero.ctaSpecials")}
            </a>
            <a
              href="#contactos"
              className="bg-white/10 border-2 border-white hover:bg-white hover:text-[var(--brand-black)] transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm"
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
            <span className="font-[family-name:var(--font-script)] text-2xl text-[var(--brand-orange)] block -rotate-1">
              {t("specials.eyebrow")}
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
              {t("specials.title")}
            </h2>
          </div>
          <p className="text-neutral-500 max-w-xs text-sm">{t("specials.subtitle")}</p>
        </div>

        {specials.length === 0 ? (
          <p className="text-neutral-500 italic border-l-4 border-[var(--brand-orange)] pl-4 py-2">
            {t("specials.empty")}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specials.map((s, i) => (
              <Reveal key={s.id} className={`delay-[${Math.min(i, 6) * 60}ms]`}>
                <div className="group relative h-full border-2 border-[var(--brand-black)] rounded-2xl p-6 flex flex-col gap-2 bg-white shadow-[6px_6px_0_0_var(--brand-black)] hover:shadow-[9px_9px_0_0_var(--brand-orange)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col items-center justify-center bg-[var(--brand-black)] text-white rounded-xl w-14 h-14 shrink-0">
                      <span className="text-lg font-extrabold leading-none">
                        {formatDayNumber(s.date)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--brand-mustard)]">
                        {formatMonthShort(s.date)}
                      </span>
                    </div>
                    <span className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-[var(--brand-orange)] whitespace-nowrap">
                      {formatPrice(s.price)}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    {formatDate(s.date)}
                  </span>
                  <h3 className="font-semibold text-lg leading-snug">{s.title}</h3>
                  {s.description && <p className="text-sm text-neutral-500">{s.description}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Menu completo */}
      <section id="menu" className="relative bg-[var(--brand-cream)] scallop-bottom">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-14">
            <span className="font-[family-name:var(--font-script)] text-2xl text-[var(--brand-orange)] block rotate-1">
              {t("menu.eyebrow")}
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
              {t("menu.title")}
            </h2>
          </div>

          {categories.length === 0 ? (
            <p className="text-neutral-500 italic text-center">{t("menu.empty")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-16">
              {splitIntoColumns(categories, menuItems).map((column, colIndex) => (
                <div key={colIndex} className="space-y-12">
                  {column.map((category) => (
                    <Reveal key={category}>
                      <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--brand-black)] mb-4 pb-2 border-b-2 border-[var(--brand-orange)]">
                        <CategoryIcon
                          category={category}
                          className="w-6 h-6 text-[var(--brand-orange)] shrink-0"
                        />
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
                              <span className="font-[family-name:var(--font-display)] font-bold whitespace-nowrap text-[var(--brand-orange)]">
                                {formatPrice(item.price)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </Reveal>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contactos */}
      <section id="contactos" className="grain relative bg-[var(--brand-black)] text-white">
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <span className="font-[family-name:var(--font-script)] text-2xl text-[var(--brand-mustard)] block -rotate-1">
            {t("contact.eyebrow")}
          </span>
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight mb-12">
            {t("contact.title")}
          </h2>

          <div className="grid sm:grid-cols-2 gap-12">
            <div className="space-y-6 text-white/80">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--brand-mustard)] mb-1">
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
                <p className="text-xs uppercase tracking-widest text-[var(--brand-mustard)] mb-1">
                  {t("contact.phone")}
                </p>
                <a
                  href="tel:+351261938747"
                  className="text-lg hover:text-[var(--brand-orange-bright)] transition-colors"
                >
                  261 938 747
                </a>
              </div>
              <div>
                <a
                  href="https://maps.app.goo.gl/cxFpjsntb6DwRrXYA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-bright)] transition-colors px-6 py-3 rounded-full font-semibold uppercase tracking-wide text-sm"
                >
                  {t("contact.mapsCta")}
                </a>
              </div>
              <div className="flex gap-5 pt-2 text-sm uppercase tracking-wider">
                <a
                  href="https://www.facebook.com/restaurantesantacome/?locale=pt_PT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--brand-orange-bright)] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/restaurante.santacome/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--brand-orange-bright)] transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tripadvisor.pt/Restaurant_Review-g5602892-d5981355-Reviews-Santa_Come-Silveira_Lisbon_District_Central_Portugal.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--brand-orange-bright)] transition-colors"
                >
                  TripAdvisor
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--brand-mustard)] mb-3">
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

      <footer className="bg-[var(--brand-black)] text-white/40 text-sm border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center">
          <p>
            © {new Date().getFullYear()} Santa Come. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
