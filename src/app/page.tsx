import { prisma } from "@/lib/prisma";
import { fetchMenuFromSheet } from "@/lib/menuSheet";
import { fetchDailySpecialsFromSheet } from "@/lib/dailySpecialsSheet";
import { fetchActiveCampaign } from "@/lib/seasonalCampaign";
import { fetchActiveHoursNotices } from "@/lib/hoursNotice";
import { isUsingSheets } from "@/lib/dataSource";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLabel = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  }).format(new Date());
  const useSheets = isUsingSheets();

  const [sheetSpecials, sheetMenu, campaign, hoursNotices] = await Promise.all([
    useSheets ? fetchDailySpecialsFromSheet() : Promise.resolve(null),
    useSheets ? fetchMenuFromSheet() : Promise.resolve(null),
    fetchActiveCampaign(),
    fetchActiveHoursNotices(),
  ]);

  // DATA_SOURCE="database" força o uso da base de dados mesmo que as
  // variáveis *_SHEET_CSV_URL continuem definidas — ver src/lib/dataSource.ts.
  const specials =
    sheetSpecials ??
    (await prisma.dailySpecial.findMany({
      where: { date: { gte: new Date(todayStr) }, available: true },
      orderBy: [{ date: "asc" }, { order: "asc" }],
      take: 20,
    }));

  const menuItems =
    sheetMenu ??
    (await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
    }));

  const categories = Array.from(new Set(menuItems.map((i) => i.category)));

  return (
    <HomeClient
      specials={specials}
      menuItems={menuItems}
      categories={categories}
      campaign={campaign}
      todayLabel={todayLabel}
      hoursNotices={hoursNotices}
    />
  );
}
