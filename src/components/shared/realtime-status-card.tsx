"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusCard } from "./status-card";
import type { PlayerStatus } from "@/types/database";

interface RealtimeStatusCardProps {
  playerId: string;
  playerName: string;
  clubName: string;
  initialStatus: PlayerStatus;
}

export function RealtimeStatusCard({
  playerId,
  playerName,
  clubName,
  initialStatus,
}: RealtimeStatusCardProps) {
  const [status, setStatus] = useState<PlayerStatus>(initialStatus);

  useEffect(() => {
    const supabase = createClient();

    console.log("[realtime] Subscribing to player:", playerId);
    console.log("[realtime] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[realtime] Anon key present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const channel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `id=eq.${playerId}`,
        },
        (payload) => {
          console.log("[realtime] Received update:", payload.new.status);
          setStatus(payload.new.status as PlayerStatus);
        }
      )
      .subscribe((status, err) => {
        console.log("[realtime] Channel status:", status);
        if (err) {
          console.error("[realtime] Channel error:", err.message);
        }
      });

    return () => {
      console.log("[realtime] Unsubscribing from player:", playerId);
      supabase.removeChannel(channel);
    };
  }, [playerId]);

  return (
    <StatusCard
      playerName={playerName}
      clubName={clubName}
      status={status}
    />
  );
}
