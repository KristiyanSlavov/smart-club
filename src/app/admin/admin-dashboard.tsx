"use client";

import { useTransition } from "react";
import { updatePlayerStatus } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Player, PlayerStatus } from "@/types/database";

const STATUS_OPTIONS: {
  value: PlayerStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
}[] = [
  {
    value: "paid",
    label: "ПЛАТЕНО",
    icon: <CheckCircle className="h-5 w-5" />,
    className: "bg-[#32cd32] text-black hover:bg-[#2db82d]",
  },
];

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

interface AdminDashboardProps {
  players: Player[];
}

export function AdminDashboard({ players }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-4">
      {players.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}
      {players.length === 0 && (
        <p className="py-12 text-center text-white/40">
          Няма добавени играчи. Изпълнете миграцията със seed данни.
        </p>
      )}
    </div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const [isPending, startTransition] = useTransition();
  const badge = STATUS_BADGE[player.status];

  function handleStatusChange(status: PlayerStatus) {
    startTransition(async () => {
      const result = await updatePlayerStatus(player.id, status);
      if (result.error) {
        alert(`Грешка: ${result.error}`);
      }
    });
  }

  return (
    <Card className="border-white/10 bg-[#1a1a1a]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            {player.full_name}
          </CardTitle>
          <Badge variant="outline" className={badge.className}>
            {badge.label}
          </Badge>
        </div>
        <p className="text-xs text-white/40">NFC: {player.nfc_tag_id}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              disabled={isPending || player.status === opt.value}
              className={`flex-1 gap-1.5 font-bold uppercase ${opt.className} disabled:opacity-40`}
              onClick={() => handleStatusChange(opt.value)}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                opt.icon
              )}
              {opt.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
