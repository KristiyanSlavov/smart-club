"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { PlayerStatus } from "@/types/database";

const STATUS_CONFIG: Record<
  PlayerStatus,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    buttonLabel: string;
    borderColor: string;
    shadowColor: string;
    buttonBg: string;
    buttonTextColor: string;
  }
> = {
  paid: {
    icon: <CheckCircle className="h-10 w-10 text-[#32cd32]" />,
    title: "ПЛАТЕНО",
    message: "Всичко е наред! Членският внос е успешно отчетен.",
    buttonLabel: "МОЯТ ПРОГРЕС",
    borderColor: "border-[#32cd32]",
    shadowColor: "shadow-[0_0_20px_rgba(50,205,50,0.3)]",
    buttonBg: "bg-[#32cd32]",
    buttonTextColor: "text-black",
  },
  warning: {
    icon: <Clock className="h-10 w-10 text-[#ffd700]" />,
    title: "НАПОМНЯНЕ",
    message: "Остават по-малко от 7 дни до крайния срок.",
    buttonLabel: "ПЛАТИ СЕГА",
    borderColor: "border-[#ffd700]",
    shadowColor: "shadow-[0_0_20px_rgba(255,215,0,0.3)]",
    buttonBg: "bg-[#ffd700]",
    buttonTextColor: "text-black",
  },
  overdue: {
    icon: <AlertTriangle className="h-10 w-10 text-[#ff4d4d]" />,
    title: "ПРОСРОЧЕНО",
    message: "Срокът изтече. От 1-во число се начисляват 2 такси.",
    buttonLabel: "АКТУАЛИЗИРАЙ",
    borderColor: "border-[#ff4d4d]",
    shadowColor: "shadow-[0_0_20px_rgba(255,77,77,0.3)]",
    buttonBg: "bg-[#ff4d4d]",
    buttonTextColor: "text-white",
  },
};

interface StatusCardProps {
  playerName: string;
  clubName: string;
  status: PlayerStatus;
}

export function StatusCard({ playerName, clubName, status }: StatusCardProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Card
      className={`border-2 ${config.borderColor} ${config.shadowColor} rounded-[25px] bg-[#1a1a1a] transition-all duration-500`}
    >
      <CardContent className="flex flex-col items-center gap-5 p-[30px] text-center">
        {/* Club name */}
        <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#32cd32]">
          {clubName}
        </p>

        {/* Player name */}
        <h2 className="text-xl font-bold text-white">{playerName}</h2>

        {/* Icon circle */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          {config.icon}
        </div>

        {/* Status title */}
        <h1 className="text-2xl font-bold text-white">{config.title}</h1>

        {/* Status message */}
        <p className="text-sm text-white/70">{config.message}</p>

        {/* Action button */}
        <button
          className={`w-full rounded-xl ${config.buttonBg} ${config.buttonTextColor} py-4 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90`}
        >
          {config.buttonLabel}
        </button>
      </CardContent>
    </Card>
  );
}
