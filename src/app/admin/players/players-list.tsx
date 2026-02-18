"use client";

import { useState } from "react";
import Image from "next/image";
import { markPlayerPaid } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle, Loader2, Users } from "lucide-react";
import type { Player, PlayerStatus } from "@/types/database";

const STATUS_BADGE: Record<PlayerStatus, { className: string; label: string }> =
  {
    paid: {
      className: "bg-[#32cd32]/20 text-[#32cd32] border-[#32cd32]/30",
      label: "Платено",
    },
    warning: {
      className: "bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30",
      label: "Напомняне",
    },
    overdue: {
      className: "bg-[#ff4d4d]/20 text-[#ff4d4d] border-[#ff4d4d]/30",
      label: "Просрочено",
    },
  };

const MIN_SEARCH_LENGTH = 2;

interface PlayersListDashboardProps {
  players: Player[];
  groups: string[];
}

export function PlayersListDashboard({
  players,
  groups,
}: PlayersListDashboardProps) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [optimisticPlayers, setOptimisticPlayers] = useState(players);

  const hasActiveFilter =
    groupFilter !== null || search.length >= MIN_SEARCH_LENGTH;

  const filtered = hasActiveFilter
    ? optimisticPlayers.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch =
          q.length < MIN_SEARCH_LENGTH ||
          p.full_name.toLowerCase().includes(q) ||
          (p.jersey_number && p.jersey_number.includes(q));
        const matchesGroup =
          groupFilter === null || p.team_group === groupFilter;
        return matchesSearch && matchesGroup;
      })
    : [];

  function handleGroupToggle(group: string) {
    setGroupFilter((prev) => (prev === group ? null : group));
  }

  async function handleMarkPaid(player: Player) {
    setPendingId(player.id);

    setOptimisticPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id
          ? { ...p, status: "paid" as PlayerStatus, last_payment_date: new Date().toISOString() }
          : p
      )
    );

    const result = await markPlayerPaid(player.id, player.full_name);

    if (result.error) {
      setOptimisticPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, status: player.status, last_payment_date: player.last_payment_date } : p
        )
      );
      alert(`Грешка: ${result.error}`);
    }

    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Group buttons */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => handleGroupToggle(g)}
            className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
              groupFilter === g
                ? "bg-[#32cd32] text-black shadow-[0_0_12px_rgba(50,205,50,0.4)]"
                : "border border-white/10 bg-[#1a1a1a] text-white/60 hover:border-[#32cd32]/40 hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Търси по име или номер..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-white/10 bg-[#1a1a1a] pl-9 text-white placeholder:text-white/30 focus-visible:ring-[#32cd32]/50"
        />
      </div>

      {/* Player list or placeholder */}
      {!hasActiveFilter ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Users className="h-12 w-12 text-[#32cd32]/30" />
          <p className="max-w-xs text-center text-sm text-white/40">
            Моля, изберете набор или потърсете играч по име/номер.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((player) => {
            const badge = STATUS_BADGE[player.status];
            const isPending = pendingId === player.id;

            return (
              <Card key={player.id} className="border-white/10 bg-[#1a1a1a]">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {player.avatar_url ? (
                      <Image
                        src={player.avatar_url}
                        alt={player.full_name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/40">
                        {player.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="truncate font-bold text-white">
                      {player.full_name}
                    </span>
                    <div className="flex items-center gap-2">
                      {player.jersey_number && (
                        <Badge
                          variant="outline"
                          className="border-[#32cd32]/30 bg-[#32cd32]/10 text-[#32cd32]"
                        >
                          #{player.jersey_number}
                        </Badge>
                      )}
                      <Badge variant="outline" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  {player.status === "paid" ? (
                    <CheckCircle className="h-6 w-6 shrink-0 text-[#32cd32]" />
                  ) : (
                    <Button
                      size="sm"
                      disabled={isPending}
                      className="shrink-0 gap-1.5 bg-[#32cd32] font-bold text-black hover:bg-[#2db82d] disabled:opacity-40"
                      onClick={() => handleMarkPaid(player)}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Платено
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-white/40">
              Няма намерени играчи.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
