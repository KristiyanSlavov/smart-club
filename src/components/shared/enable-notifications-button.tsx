"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToPush, isIOS, isStandalone } from "@/lib/push";
import { Button } from "@/components/ui/button";
import { Bell, Check, BellOff, Loader2, Share, Plus, X } from "lucide-react";

type State =
  | "idle"
  | "loading"
  | "subscribed"
  | "denied"
  | "ios-install"
  | "unsupported";

interface EnableNotificationsButtonProps {
  playerId: string;
}

// ── iOS "Add to Home Screen" guide ──────────────────────────────────────────

function IOSInstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative rounded-xl border border-[#32cd32]/20 bg-[#1a1a1a] p-4">
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Затвори"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="mb-3 text-sm font-semibold text-white">
        Как да активирате известия на iPhone:
      </p>

      <ol className="space-y-3 text-sm text-white/70">
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#32cd32]/20 text-xs font-bold text-[#32cd32]">
            1
          </span>
          <span>
            Натиснете бутона{" "}
            <Share className="inline h-4 w-4 text-[#007AFF] align-text-bottom" />{" "}
            <strong className="text-white">Share</strong> в долната лента на Safari
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#32cd32]/20 text-xs font-bold text-[#32cd32]">
            2
          </span>
          <span>
            Превъртете надолу и изберете{" "}
            <Plus className="inline h-4 w-4 text-white align-text-bottom" />{" "}
            <strong className="text-white">&ldquo;Добавяне към начален екран&rdquo;</strong>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#32cd32]/20 text-xs font-bold text-[#32cd32]">
            3
          </span>
          <span>
            Отворете приложението от началния екран и натиснете{" "}
            <strong className="text-white">&ldquo;Активиране на известия&rdquo;</strong>
          </span>
        </li>
      </ol>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function EnableNotificationsButton({
  playerId,
}: EnableNotificationsButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const subscribingRef = useRef(false);

  async function doSubscribe() {
    // Prevent concurrent calls (React Strict Mode, double-fire, etc.)
    if (subscribingRef.current) {
      console.log("[notifications] Subscribe already in progress, skipping");
      return;
    }
    subscribingRef.current = true;
    setState("loading");
    setErrorMsg(null);

    try {
      const result = await subscribeToPush(playerId);
      if (result.ok) {
        setState("subscribed");
      } else {
        console.warn("[notifications] subscribeToPush failed:", result.error);
        setErrorMsg(result.error ?? "Unknown error");
        setState("denied");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[notifications] Exception during subscribe:", msg);
      setErrorMsg(msg);
      setState("denied");
    } finally {
      subscribingRef.current = false;
    }
  }

  useEffect(() => {
    setMounted(true);

    // iOS + not installed as PWA → show installation guide
    if (isIOS() && !isStandalone()) {
      setState("ios-install");
      return;
    }

    // Browser doesn't support push at all (non-iOS)
    if (!("Notification" in window) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    if (Notification.permission === "granted") {
      doSubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  // Before mount, render a skeleton that matches the server HTML exactly
  if (!mounted) {
    return (
      <Button
        disabled
        className="w-full gap-2 bg-white/10 text-white border border-white/20"
      >
        <Bell className="h-4 w-4" />
        Активиране на известия
      </Button>
    );
  }

  // ── iOS: not installed as PWA ──
  if (state === "ios-install") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => setShowGuide((v) => !v)}
          className="w-full gap-2 bg-[#007AFF]/20 text-[#4da3ff] hover:bg-[#007AFF]/30 border border-[#007AFF]/30"
        >
          <Share className="h-4 w-4" />
          Добавете към начален екран
        </Button>
        <p className="text-center text-xs text-white/40">
          За да активирате известията на iPhone, натиснете бутона Share и
          изберете &ldquo;Добавяне към начален екран&rdquo;.
        </p>
        {showGuide && (
          <IOSInstallGuide onClose={() => setShowGuide(false)} />
        )}
      </div>
    );
  }

  // ── Browser doesn't support push ──
  if (state === "unsupported") {
    return (
      <Button
        disabled
        className="w-full gap-2 bg-white/5 text-white/30 border border-white/10"
      >
        <BellOff className="h-4 w-4" />
        Известията не се поддържат
      </Button>
    );
  }

  // ── Successfully subscribed ──
  if (state === "subscribed") {
    return (
      <Button
        disabled
        className="w-full gap-2 bg-[#32cd32]/20 text-[#32cd32] border border-[#32cd32]/30"
      >
        <Check className="h-4 w-4" />
        Известията са активирани
      </Button>
    );
  }

  // ── Permission denied or error ──
  if (state === "denied") {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          disabled
          className="w-full gap-2 bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/30"
        >
          <BellOff className="h-4 w-4" />
          Известията са блокирани
        </Button>
        {errorMsg && (
          <p className="text-center text-xs text-[#ff4d4d]/70">{errorMsg}</p>
        )}
      </div>
    );
  }

  // ── Default: idle / loading — button triggers permission via user gesture ──
  return (
    <Button
      onClick={doSubscribe}
      disabled={state === "loading"}
      className="w-full gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/20"
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      Активиране на известия
    </Button>
  );
}
