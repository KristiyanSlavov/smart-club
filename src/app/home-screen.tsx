"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";

const ACCESS_KEY = process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY;

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    // 1. Check for secret activation key
    if (ACCESS_KEY && searchParams.get("access") === ACCESS_KEY) {
      localStorage.setItem("isAdmin", "true");
      window.history.replaceState(null, "", "/");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }

    // 2. Redirect admins straight to player list
    if (localStorage.getItem("isAdmin") === "true") {
      router.replace("/admin/players");
      return;
    }

    // 3. Not an admin — show the welcome screen
    setReady(true);
  }, [searchParams, router]);

  // Show nothing while checking role (prevents flash)
  if (!ready) {
    return <div className="min-h-dvh bg-[#0d0d0d]" />;
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0d0d0d] p-8 text-center">
      <Shield className="mb-6 h-20 w-20 text-[#32cd32]" />

      <h1 className="mb-3 text-4xl font-bold text-white">
        Добре дошли в Smart Club
      </h1>
      <p className="mb-6 max-w-sm text-white/50">
        Система за управление на членски внос с NFC профили в реално време.
      </p>
      <p className="max-w-xs text-sm text-white/30">
        Сканирайте вашата NFC карта, за да видите клубния си профил.
      </p>

      <footer className="absolute bottom-6 text-[11px] text-white/20">
        Smart Club &copy; {new Date().getFullYear()} &middot; Powered by Mozyk
      </footer>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeSlideUp_0.3s_ease-out] rounded-xl border border-[#32cd32]/30 bg-[#1a1a1a] px-6 py-3 shadow-[0_0_20px_rgba(50,205,50,0.2)]">
          <p className="whitespace-nowrap text-sm font-medium text-[#32cd32]">
            Администраторският достъп е активиран успешно!
          </p>
        </div>
      )}
    </main>
  );
}
