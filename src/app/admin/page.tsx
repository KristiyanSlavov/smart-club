import Link from "next/link";
import { Shield, Users, CreditCard } from "lucide-react";

export const metadata = {
  title: "Admin - Smart Club",
};

export default function AdminPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0d0d0d] p-8 text-center">
      <Shield className="mb-6 h-16 w-16 text-[#32cd32]" />
      <h1 className="mb-2 text-3xl font-bold text-white">Smart Club Admin</h1>
      <p className="mb-10 text-sm text-white/50">
        Сканирайте NFC карта за директно плащане или потърсете играч ръчно.
      </p>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/admin/players"
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] px-6 py-5 transition-colors hover:border-[#32cd32]/30 hover:bg-[#1a1a1a]/80"
        >
          <Users className="h-8 w-8 text-[#32cd32]" />
          <div className="text-left">
            <p className="font-bold text-white">Списък играчи</p>
            <p className="text-sm text-white/40">
              Търсене, филтриране и ръчно плащане
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/10 bg-[#1a1a1a]/50 px-6 py-5">
          <CreditCard className="h-8 w-8 text-[#32cd32]/40" />
          <div className="text-left">
            <p className="font-bold text-white/60">NFC Плащане</p>
            <p className="text-sm text-white/30">
              Сканирайте карта → /admin/[tagId]
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
