import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

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
        {(process.env.MENU_SHEET_CSV_URL || process.env.DAILY_SPECIALS_SHEET_CSV_URL) && (
          <div className="mb-8 rounded-xl border-2 border-[var(--brand-orange)] bg-orange-50 px-5 py-4 text-sm text-neutral-800">
            <p className="font-semibold text-[var(--brand-orange)] mb-1">
              O site está a ler do Google Sheets, não deste painel
            </p>
            <p>
              {process.env.MENU_SHEET_CSV_URL && "O Menu completo "}
              {process.env.MENU_SHEET_CSV_URL && process.env.DAILY_SPECIALS_SHEET_CSV_URL && "e os "}
              {process.env.DAILY_SPECIALS_SHEET_CSV_URL && "Pratos do Dia "}
              está{process.env.MENU_SHEET_CSV_URL && process.env.DAILY_SPECIALS_SHEET_CSV_URL ? "ão" : ""}{" "}
              a vir da tua folha do Google Sheets. Tudo o que editares aqui em baixo fica guardado na
              base de dados, mas <strong>não aparece no site público</strong> enquanto essa
              configuração estiver ativa. Edita a folha do Google Sheets diretamente.
            </p>
          </div>
        )}
        <AdminDashboard />
      </main>
    </div>
  );
}
