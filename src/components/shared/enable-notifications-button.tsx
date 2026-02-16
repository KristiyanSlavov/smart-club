"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToPush } from "@/lib/push";
import { Button } from "@/components/ui/button";
import { Bell, Check, BellOff, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "subscribed" | "denied";

interface EnableNotificationsButtonProps {
  playerId: string;
}

export function EnableNotificationsButton({
  playerId,
}: EnableNotificationsButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

    if (!("Notification" in window)) return;

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
