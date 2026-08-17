import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { isUsingSheets } from "@/lib/dataSource";
import { fetchMenuFromSheet } from "@/lib/menuSheet";
import { fetchDailySpecialsFromSheet } from "@/lib/dailySpecialsSheet";
import { fetchAllCampaigns } from "@/lib/seasonalCampaign";
import AdminDashboard from "./AdminDashboard";
import LogoutButton from "./LogoutButton";
import SheetsPreview from "./SheetsPreview";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const useSheets = isUsingSheets();
  const [sheetMenu, sheetSpecials, campaigns] = useSheets
    ? await Promise.all([fetchMenuFromSheet(), fetchDailySpecialsFromSheet(), fetchAllCampaigns()])
    : [null, null, null];

  return (
    <div className="flex-1 flex flex-col bg-neutral-100">
      <header className="bg-[var(--brand-black)] text-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Santa Come"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg leading-tight">
                Santa Come
              </p>
              <p className="text-xs uppercase tracking-widest text-white/60">Painel de gestão</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-[var(--brand-orange)] transition-colors">
              Ver site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 w-full flex-1">
        {useSheets && (
          <div className="mb-8 rounded-xl border-2 border-[var(--brand-orange)] bg-orange-50 px-5 py-4 text-sm text-neutral-800">
            <p className="font-semibold text-[var(--brand-orange)] mb-1">
              O site está a ler do Google Sheets, não deste painel
            </p>
            <p>
              O que vês em baixo, sob &quot;Pré-visualização do Google Sheets&quot;, é exatamente o
              que está publicado no site agora. O formulário mais abaixo (&quot;Base de dados&quot;)
              continua a funcionar e guarda tudo, mas <strong>fica em reserva</strong> — só aparece no site
              público se mudares <code className="bg-white px-1 rounded">DATA_SOURCE</code> para{" "}
              <code className="bg-white px-1 rounded">database</code> nas variáveis de ambiente.
            </p>
          </div>
        )}

        {useSheets && (
          <SheetsPreview
            menuItems={sheetMenu ?? []}
            specials={sheetSpecials ?? []}
            campaigns={campaigns ?? []}
          />
        )}

        <h2 className="font-semibold text-lg mt-4 mb-4">
          {useSheets ? "Base de dados (em reserva)" : "Gestão do menu e pratos do dia"}
        </h2>
        <AdminDashboard />
      </main>
    </div>
  );
}
