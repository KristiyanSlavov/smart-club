"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClubCard } from "./club-card";
import type { PlayerStatus } from "@/types/database";

interface RealtimeStatusCardProps {
  playerId: string;
  playerName: string;
  clubName: string;
  initialStatus: PlayerStatus;
  jerseyNumber: string | null;
  birthDate: string | null;
  teamGroup: string | null;
  lastPaymentDate: string | null;
  avatarUrl: string | null;
  emblemUrl: string | null;
}

export function RealtimeStatusCard({
  playerId,
  playerName,
  clubName,
  initialStatus,
  jerseyNumber,
  birthDate,
  teamGroup,
  lastPaymentDate,
  avatarUrl,
  emblemUrl,
}: RealtimeStatusCardProps) {
  const [status, setStatus] = useState<PlayerStatus>(initialStatus);
  const [paymentDate, setPaymentDate] = useState<string | null>(lastPaymentDate);

  useEffect(() => {
    const supabase = createClient();

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
          setStatus(payload.new.status as PlayerStatus);
          if (payload.new.last_payment_date) {
            setPaymentDate(payload.new.last_payment_date as string);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("[realtime] Channel error:", err.message);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId]);

  return (
    <ClubCard
      playerName={playerName}
      clubName={clubName}
      status={status}
      jerseyNumber={jerseyNumber}
      birthDate={birthDate}
      teamGroup={teamGroup}
      lastPaymentDate={paymentDate}
      avatarUrl={avatarUrl}
      emblemUrl={emblemUrl}
    />
  );
}
