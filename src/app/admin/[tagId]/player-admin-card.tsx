"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { markPlayerPaid } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, ArrowLeft, Calendar, Users } from "lucide-react";
import type { Player, PlayerStatus } from "@/types/database";

const STATUS_CONFIG: Record<
  PlayerStatus,
  { className: string; label: string; glow: string }
> = {
  paid: {
    className: "bg-[#32cd32]/20 text-[#32cd32] border-[#32cd32]/30",
    label: "Платено",
    glow: "shadow-[0_0_40px_rgba(50,205,50,0.15)]",
  },
  warning: {
    className: "bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30",
    label: "Напомняне",
    glow: "shadow-[0_0_40px_rgba(255,215,0,0.15)]",
  },
  overdue: {
    className: "bg-[#ff4d4d]/20 text-[#ff4d4d] border-[#ff4d4d]/30",
    label: "Просрочено",
    glow: "shadow-[0_0_40px_rgba(255,77,77,0.15)]",
  },
};

interface PlayerAdminCardProps {
  player: Player;
}

export function PlayerAdminCard({ player: initialPlayer }: PlayerAdminCardProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [isPending, setIsPending] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  const status = STATUS_CONFIG[player.status];

  async function handleMarkPaid() {
    setIsPending(true);

    // Optimistic update
    setPlayer((prev) => ({
      ...prev,
      status: "paid" as PlayerStatus,
      last_payment_date: new Date().toISOString(),
    }));

    const result = await markPlayerPaid(player.id, player.full_name);

    if (result.error) {
      // Revert
      setPlayer(initialPlayer);
      alert(`Грешка: ${result.error}`);
    } else {
      setJustPaid(true);
    }

    setIsPending(false);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Back link */}
      <Link
        href="/admin/players"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-4 w-4" />
        Списък играчи
      </Link>

      {/* Card */}
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] ${status.glow} transition-shadow duration-500`}
      >
        {/* Header: Name + Jersey */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-white">{player.full_name}</h1>
            {player.team_group != null && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-white/40">
                <Users className="h-3.5 w-3.5" />
                Набор {player.team_group}
              </div>
            )}
          </div>
          {player.jersey_number && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#32cd32]/30 bg-[#32cd32]/10 text-lg font-bold text-[#32cd32]">
              {player.jersey_number.replace("№", "")}
            </div>
          )}
        </div>

        {/* Avatar + Status */}
        <div className="flex flex-col items-center gap-5 px-6 py-8">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/10 bg-white/5">
            {player.avatar_url ? (
              <Image
                src={player.avatar_url}
                alt={player.full_name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/20">
                {player.full_name.charAt(0)}
              </div>
            )}
          </div>

          <Badge
            variant="outline"
            className={`px-4 py-1.5 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="border-t border-white/5 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Calendar className="h-4 w-4" />
            <span>Последно плащане:</span>
            <span className="ml-auto font-medium text-white/60">
              {formatDate(player.last_payment_date)}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6 pt-2">
          {player.status === "paid" ? (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl border border-[#32cd32]/20 bg-[#32cd32]/10 py-4 text-[#32cd32] ${
                justPaid ? "animate-pulse" : ""
              }`}
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-bold">
                {justPaid ? "Успешно платено!" : "Таксата е платена"}
              </span>
            </div>
          ) : (
            <Button
              size="lg"
              disabled={isPending}
              className="w-full gap-2 bg-[#32cd32] py-6 text-lg font-bold text-black shadow-[0_0_20px_rgba(50,205,50,0.3)] hover:bg-[#2db82d] hover:shadow-[0_0_30px_rgba(50,205,50,0.5)] disabled:opacity-40"
              onClick={handleMarkPaid}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              Маркирай като платено
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
