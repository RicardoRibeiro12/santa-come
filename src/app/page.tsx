import { prisma } from "@/lib/prisma";
import { fetchMenuFromSheet } from "@/lib/menuSheet";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [specials, sheetMenu] = await Promise.all([
    prisma.dailySpecial.findMany({
      where: { date: { gte: new Date(todayStr) }, available: true },
      orderBy: { date: "asc" },
      take: 7,
    }),
    fetchMenuFromSheet(),
  ]);

  // Se MENU_SHEET_CSV_URL estiver configurado, o menu vem do Google Sheets;
  // caso contrário, usa-se o que foi introduzido no painel /admin.
  const menuItems =
    sheetMenu ??
    (await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
    }));

  const categories = Array.from(new Set(menuItems.map((i) => i.category)));

  return <HomeClient specials={specials} menuItems={menuItems} categories={categories} />;
}
