"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AutoRefresh from "@/components/AutoRefresh";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";
import HoursTicker from "@/components/HoursTicker";
import { splitIntoColumns } from "@/lib/splitIntoColumns";
import type { SeasonalCampaign } from "@/lib/seasonalCampaign";
import type { HoursNotice } from "@/lib/hoursNotice";

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

// Categorias de menu reconhecidas na descrição da campanha (ex.: "Entradas: camarão, ...").
// Outras etiquetas (ex.: "Crianças:", "Reservas:") são tratadas como notas de rodapé.
const CAMPAIGN_MENU_LABELS = ["Entradas", "Pratos", "Sobremesas", "Bebidas"];

function parseCampaignDescriptionSections(text: string): { label: string; content: string }[] {
  const matches = [...text.matchAll(/([A-ZÀ-Ú][\wà-úçãõ]*)\s*:\s*/g)];
  if (matches.length === 0) return [];
  return matches.map((m, i) => {
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    return { label: m[1], content: text.slice(start, end).trim() };
  });
}

export default function HomeClient({
  specials,
  menuItems,
  categories,
  campaign,
  todayLabel,
  hoursNotices,
}: {
  specials: Special[];
  menuItems: MenuItem[];
  categories: string[];
  campaign: SeasonalCampaign | null;
  todayLabel: string;
  hoursNotices: HoursNotice[];
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

  // Se a descrição da campanha tiver pelo menos 2 categorias reconhecidas
  // (Entradas/Pratos/Sobremesas/Bebidas), mostra-as como cards em vez de texto corrido.
  const campaignDescriptionSections = campaign?.description
    ? parseCampaignDescriptionSections(campaign.description)
    : [];
  const campaignMenuSections = campaignDescriptionSections.filter((s) =>
    CAMPAIGN_MENU_LABELS.includes(s.label)
  );
  const campaignNoteSections = campaignDescriptionSections.filter(
    (s) => !CAMPAIGN_MENU_LABELS.includes(s.label)
  );
  const showCampaignMenuCards = campaignMenuSections.length >= 2;

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
      <AutoRefresh />
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

      {/* Aviso de horário especial (Natal, Fim de Ano, ou dias extra encerrados) — só aparece se houver algum ativo na aba "Horarios" */}
      {hoursNotices.length > 0 && (
        <div className="fixed top-[80px] inset-x-0 z-40">
          <HoursTicker notices={hoursNotices} />
        </div>
      )}

      {/* Hero — usa a imagem da campanha ativa, se houver, senão a foto do espaço */}
      <section className="relative overflow-hidden bg-[var(--brand-black)] text-white min-h-[86vh] flex flex-col justify-end">
        {campaign?.imageUrl ? (
          // Imagem externa (Google Sheets/Drive) — next/image exigiria configurar
          // o domínio antecipadamente, por isso usa-se uma <img> normal aqui.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src="/images/interior.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-black)] via-[var(--brand-black)]/55 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 text-center">
          {campaign ? (
            <>
              <span className="font-[family-name:var(--font-script)] text-3xl text-[var(--brand-mustard)] block -rotate-2">
                {t("hero.eyebrow")}
              </span>
              <h1 className="font-[family-name:var(--font-display)] font-black tracking-tight text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] mt-1 text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
                {campaign.title}
              </h1>
              {campaign.subtitle && (
                <p className="mt-4 text-white/90 max-w-xl mx-auto text-lg text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  {campaign.subtitle}
                </p>
              )}
              {campaign.price != null && (
                <span className="inline-flex items-baseline gap-1 mt-6 bg-[var(--brand-sea)] px-6 py-3 rounded-full shadow-[0_8px_30px_-8px_rgba(29,78,102,0.6)]">
                  <span className="font-[family-name:var(--font-display)] font-extrabold text-2xl">
                    {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
                      campaign.price
                    )}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-white/85">
                    /{t("hero.perPerson")}
                  </span>
                </span>
              )}
              <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <a
                  href="#oferta"
                  className="bg-[var(--brand-sea)] hover:bg-[var(--brand-sea-bright)] transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm shadow-[0_8px_30px_-8px_rgba(29,78,102,0.6)]"
                >
                  {t("offer.viewCta")}
                </a>
                <a
                  href="#pratos-do-dia"
                  className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-bright)] transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm shadow-[0_8px_30px_-8px_rgba(193,86,15,0.6)]"
                >
                  {t("hero.ctaSpecials")}
                </a>
                <a
                  href="#contactos"
                  className="bg-white text-[var(--brand-black)] hover:bg-white/90 transition-colors px-8 py-4 rounded-full font-semibold uppercase tracking-wide text-sm"
                >
                  {t("hero.ctaDirections")}
                </a>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* Pratos do dia */}
      <section id="pratos-do-dia" className="mx-auto max-w-6xl px-6 py-24 w-full">
        <div className="flex items-end justify-between gap-4 mb-12 flex-wrap">
          <div>
            <span className="font-[family-name:var(--font-script)] text-2xl text-[var(--brand-orange)] block -rotate-1">
              {t("specials.eyebrow")}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
                {t("specials.title")}
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-[var(--brand-black)] text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange-bright)]" aria-hidden />
                {todayLabel}
              </span>
            </div>
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

      {/* Oferta/campanha sazonal em destaque (só aparece com uma época ativa) */}
      {campaign && (
        <section id="oferta" className="mx-auto max-w-6xl px-6 pb-24 w-full">
          <Reveal>
            <div
              className={`relative overflow-hidden rounded-3xl bg-[var(--brand-black)] text-white ${
                campaign.imageUrl || campaign.bannerImageUrl ? "grid sm:grid-cols-2" : ""
              }`}
            >
              {campaign.bannerImageUrl ? (
                <div className="relative min-h-[260px] sm:min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.bannerImageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-black)] via-[var(--brand-black)]/20 to-[var(--brand-black)]/25" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
                    <Image
                      src="/images/logo.jpg"
                      alt="Santa Come"
                      width={72}
                      height={72}
                      className="rounded-full ring-2 ring-white/70 shadow-lg"
                    />
                    {(() => {
                      const match = campaign.title.match(/^(Jantar)\s+(.*)$/i);
                      return match ? (
                        <>
                          <span className="font-[family-name:var(--font-script)] text-3xl text-white -rotate-2">
                            {match[1]}
                          </span>
                          <span className="font-[family-name:var(--font-display)] font-black text-4xl sm:text-5xl tracking-tight text-[var(--brand-mustard)] leading-none -mt-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                            {match[2]}
                          </span>
                        </>
                      ) : (
                        <span className="font-[family-name:var(--font-display)] font-black text-4xl sm:text-5xl tracking-tight text-[var(--brand-mustard)] leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                          {campaign.title}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                campaign.imageUrl && (
                  <div className="relative min-h-[260px] sm:min-h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                )
              )}
              <div
                className={
                  campaign.imageUrl || campaign.bannerImageUrl
                    ? "p-8 sm:p-10 flex flex-col justify-center"
                    : "p-10 sm:p-16 flex flex-col items-center text-center max-w-2xl mx-auto"
                }
              >
                <span className="font-[family-name:var(--font-script)] text-xl text-[var(--brand-mustard)] -rotate-1">
                  {t("offer.eyebrow")}
                </span>
                <h3 className="font-[family-name:var(--font-display)] font-extrabold text-3xl sm:text-4xl tracking-tight mt-1">
                  {campaign.title}
                </h3>
                {campaign.subtitle && <p className="mt-2 text-white/80">{campaign.subtitle}</p>}
                {showCampaignMenuCards ? (
                  <>
                    <div
                      className={`mt-5 grid gap-3 w-full text-left ${
                        campaign.imageUrl ? "grid-cols-1" : "sm:grid-cols-2"
                      }`}
                    >
                      {campaignMenuSections.map((section) => (
                        <div
                          key={section.label}
                          className="rounded-2xl border border-white/15 bg-white/5 p-4"
                        >
                          <h4 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--brand-mustard)] mb-1.5">
                            {section.label}
                          </h4>
                          <ul className="space-y-1 text-sm text-white/75 leading-snug">
                            {section.content
                              .replace(/\.$/, "")
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {campaignNoteSections.length > 0 && (
                      <p className="mt-3 text-xs text-white/55">
                        {campaignNoteSections
                          .map((n) => `${n.label}: ${n.content.replace(/\.$/, "")}`)
                          .join("  ·  ")}
                      </p>
                    )}
                  </>
                ) : (
                  campaign.description && (
                    <p className="mt-3 text-sm text-white/70 leading-relaxed">
                      {campaign.description}
                    </p>
                  )
                )}
                <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
                  {campaign.price != null && (
                    <span className="font-[family-name:var(--font-display)] font-extrabold text-3xl text-[var(--brand-sea-bright)]">
                      {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
                        campaign.price
                      )}
                    </span>
                  )}
                  {/* No Fim de Ano o cardápio já vem todo nos cards acima — não faz sentido mandar para o menu completo do dia-a-dia */}
                  {!campaign.bannerImageUrl && (
                    <a
                      href="#menu"
                      className="bg-[var(--brand-sea)] hover:bg-[var(--brand-sea-bright)] transition-colors px-6 py-3 rounded-full font-semibold uppercase tracking-wide text-sm"
                    >
                      {t("offer.cta")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

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
