import { Suspense } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminActivator } from "@/components/shared/admin-activator";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0d0d0d] p-8 text-center">
      <Shield className="mb-6 h-16 w-16 text-[#32cd32]" />
      <h1 className="mb-2 text-4xl font-bold text-white">Smart Club</h1>
      <p className="mb-8 max-w-md text-white/50">
        Система за управление на членски внос с NFC профили в реално време.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="bg-[#32cd32] text-lg font-bold text-black shadow-[0_0_20px_rgba(50,205,50,0.3)] hover:bg-[#2db82d] hover:shadow-[0_0_30px_rgba(50,205,50,0.5)]"
        >
          <Link href="/admin/players">Ръчно Плащане</Link>
        </Button>
        <Button asChild className="bg-[#32cd32] text-black hover:bg-[#2db82d]">
          <Link href="/p/vihar_01">Demo Profile</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Link href="/admin">Admin Panel</Link>
        </Button>
      </div>
      <Suspense>
        <AdminActivator />
      </Suspense>
    </main>
  );
}
