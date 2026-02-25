"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Share } from "lucide-react";

interface SmartRedirectProps {
  tagId: string;
  children: React.ReactNode;
}

export function SmartRedirect({ tagId, children }: SmartRedirectProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true") {
      router.replace(`/admin/${tagId}`);
      return;
    }

    // Save to localStorage (works within the same browsing context)
    localStorage.setItem("lastPlayerId", tagId);

    // Save to cookie (bridges Safari ↔ standalone PWA on iOS)
    document.cookie = `lastPlayerId=${tagId};path=/;max-age=31536000;SameSite=Lax`;

    // Detect iOS Safari (not standalone) → show install hint
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(navigator as unknown as { standalone?: boolean }).standalone;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    if (isIOS && !isStandalone) {
      setShowIOSHint(true);
    }

    setChecked(true);
  }, [tagId, router]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#32cd32] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {children}
      {showIOSHint && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[400px] animate-[fadeSlideUp_0.3s_ease-out] rounded-xl border border-[#32cd32]/30 bg-[#1a1a1a] px-4 py-3 shadow-[0_0_20px_rgba(50,205,50,0.15)]">
          <div className="flex items-start gap-3">
            <Share className="mt-0.5 size-5 shrink-0 text-[#32cd32]" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/90">
                Запазете профила на началния екран
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                Натиснете{" "}
                <span className="inline-flex items-center text-[#32cd32]">
                  Сподели
                </span>{" "}
                →{" "}
                <span className="text-white/70">
                  Към началния екран
                </span>
                , след което отворете веднъж от иконата, за да се запази профилът.
              </p>
            </div>
            <button
              onClick={() => setShowIOSHint(false)}
              className="shrink-0 text-white/30 hover:text-white/60"
              aria-label="Затвори"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
