import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0d0d0d] p-8 text-center">
      <Shield className="mb-6 h-16 w-16 text-[#32cd32]" />
      <h1 className="mb-2 text-4xl font-bold text-white">Smart Club</h1>
      <p className="mb-8 max-w-md text-white/50">
        Система за управление на членски внос с NFC профили в реално време.
      </p>
      <div className="flex gap-4">
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
    </main>
  );
}
