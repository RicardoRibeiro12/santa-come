import { prisma } from "@/lib/prisma";
import { fetchMenuFromSheet } from "@/lib/menuSheet";
import { fetchDailySpecialsFromSheet } from "@/lib/dailySpecialsSheet";
import { fetchActiveCampaign } from "@/lib/seasonalCampaign";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [sheetSpecials, sheetMenu, campaign] = await Promise.all([
    fetchDailySpecialsFromSheet(),
    fetchMenuFromSheet(),
    fetchActiveCampaign(),
  ]);

  // Se DAILY_SPECIALS_SHEET_CSV_URL estiver configurado, os pratos do dia vêm
  // do Google Sheets; caso contrário, usa-se o que foi introduzido em /admin.
  const specials =
    sheetSpecials ??
    (await prisma.dailySpecial.findMany({
      where: { date: { gte: new Date(todayStr) }, available: true },
      orderBy: [{ date: "asc" }, { order: "asc" }],
      take: 20,
    }));

  // Se MENU_SHEET_CSV_URL estiver configurado, o menu vem do Google Sheets;
  // caso contrário, usa-se o que foi introduzido no painel /admin.
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
    />
  );
}
