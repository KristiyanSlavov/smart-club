"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ACCESS_KEY = process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY;

export function AdminActivator() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (ACCESS_KEY && searchParams.get("access") === ACCESS_KEY) {
      localStorage.setItem("isAdmin", "true");
      setToast(true);

      // Clean the URL without reload
      window.history.replaceState(null, "", "/");

      const timer = setTimeout(() => setToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeSlideUp_0.3s_ease-out] rounded-xl border border-[#32cd32]/30 bg-[#1a1a1a] px-6 py-3 shadow-[0_0_20px_rgba(50,205,50,0.2)]">
      <p className="whitespace-nowrap text-sm font-medium text-[#32cd32]">
        Администраторският достъп е активиран успешно!
      </p>
    </div>
  );
}
