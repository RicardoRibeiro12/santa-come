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
        <AdminDashboard />
      </main>
    </div>
  );
}
