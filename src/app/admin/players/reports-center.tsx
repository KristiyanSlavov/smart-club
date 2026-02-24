"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClubLogo } from "@/components/shared/club-logo";
import { createClient } from "@/lib/supabase/client";
import { BG_MONTHS } from "@/lib/constants";
import {
  BarChart3,
  Printer,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Player } from "@/types/database";

interface PaymentLogRow {
  player_id: string;
  paid_for: string;
  paid_at: string;
}

type StatusFilter = "all" | "paid" | "unpaid";

interface ReportsCenterProps {
  players: Player[];
  groups: number[];
}

export function ReportsCenter({ players, groups }: ReportsCenterProps) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const periodString = `${BG_MONTHS[month]} ${year}`;
    const { data } = await supabase
      .from("payment_logs")
      .select("player_id, paid_for, paid_at")
      .eq("paid_for", periodString);
    setPaymentLogs((data as PaymentLogRow[]) ?? []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  // Filtered players by group
  const filteredPlayers =
    groupFilter === "all"
      ? players
      : players.filter((p) => p.team_group === Number(groupFilter));

  // Paid set
  const paidIds = new Set(paymentLogs.map((l) => l.player_id));
  const paidPlayers = filteredPlayers.filter((p) => paidIds.has(p.id));
  const unpaidPlayers = filteredPlayers.filter((p) => !paidIds.has(p.id));

  const total = filteredPlayers.length;
  const paidCount = paidPlayers.length;
  const unpaidCount = unpaidPlayers.length;
  const percentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  // Display list based on status filter
  const displayPlayers =
    statusFilter === "paid"
      ? paidPlayers
      : statusFilter === "unpaid"
        ? unpaidPlayers
        : filteredPlayers;

  // Map player_id → paid_at
  const paidAtMap = new Map(paymentLogs.map((l) => [l.player_id, l.paid_at]));

  const percentColor =
    percentage >= 75
      ? "text-[#32cd32]"
      : percentage >= 50
        ? "text-[#ffd700]"
        : "text-[#ff4d4d]";

  const todayFormatted = new Date().toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mb-6 gap-2 border-[#32cd32]/30 text-[#32cd32] hover:bg-[#32cd32]/10"
        >
          <BarChart3 className="size-4" />
          Център за отчети
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#32cd32] flex items-center gap-2">
            <BarChart3 className="size-5" />
            Център за отчети
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Period: Month + Year */}
          <div className="flex gap-2">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Месец</label>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {BG_MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Година</label>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {[2025, 2026, 2027].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Group filter */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Набор</label>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="all">Всички</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Статус</label>
            <div className="flex rounded-md overflow-hidden border border-white/10">
              {(
                [
                  ["all", "Всички"],
                  ["paid", "Платили"],
                  ["unpaid", "Неплатили"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === value
                      ? "bg-[#32cd32]/20 text-[#32cd32]"
                      : "bg-white/5 text-white/50 hover:text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-6 animate-spin text-[#32cd32]" />
          </div>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                  <Users className="size-3.5" />
                  Общо събрани такси
                </div>
                <div className="text-2xl font-bold text-[#32cd32]">
                  {paidCount}
                  <span className="text-sm font-normal text-white/40 ml-1">
                    / {total}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                  <TrendingUp className="size-3.5" />
                  Процент събираемост
                </div>
                <div className={`text-2xl font-bold ${percentColor}`}>
                  {percentage}%
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                  <AlertCircle className="size-3.5" />
                  Липсващи плащания
                </div>
                <div
                  className={`text-2xl font-bold ${unpaidCount > 0 ? "text-[#ff4d4d]" : "text-[#32cd32]"}`}
                >
                  {unpaidCount}
                </div>
              </div>
            </div>

            {/* Player table */}
            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10 scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#1a1a1a] text-white/50 text-xs">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium">#</th>
                    <th className="py-2 px-3 text-left font-medium">Име</th>
                    <th className="py-2 px-3 text-left font-medium">Набор</th>
                    <th className="py-2 px-3 text-left font-medium">
                      Дата на плащане
                    </th>
                    <th className="py-2 px-3 text-left font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPlayers.map((player, idx) => {
                    const isPaid = paidIds.has(player.id);
                    const paidAt = paidAtMap.get(player.id);
                    return (
                      <tr
                        key={player.id}
                        className="border-t border-white/5 hover:bg-white/5"
                      >
                        <td className="py-2 px-3 text-white/40">{idx + 1}</td>
                        <td className="py-2 px-3">{player.full_name}</td>
                        <td className="py-2 px-3 text-white/60">
                          {player.team_group ?? "—"}
                        </td>
                        <td className="py-2 px-3 text-white/60">
                          {isPaid && paidAt
                            ? new Date(paidAt).toLocaleDateString("bg-BG")
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {isPaid ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#32cd32]/20 text-[#32cd32]">
                              Платено
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#ff4d4d]/20 text-[#ff4d4d]">
                              Неплатено
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {displayPlayers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-white/30"
                      >
                        Няма играчи за показване
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="gap-2 border-white/10 text-white hover:bg-white/10"
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                Генерирай PDF за печат
              </Button>
            </div>
          </>
        )}

        {/* Hidden print layout */}
        <div id="report-print-area" className="hidden print:block">
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              color: "#000",
              padding: "20px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <ClubLogo className="w-16 h-20" />
              <div>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
                  ФК ВИХЪР ВОЙВОДИНОВО
                </h1>
                <h2 style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600 }}>
                  ФИНАНСОВ ОТЧЕТ ЗА МЕСЕЦ {BG_MONTHS[month].toUpperCase()} {year}
                </h2>
                {groupFilter !== "all" && (
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
                    Набор: {groupFilter}
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <p style={{ fontSize: "14px", marginBottom: "16px" }}>
              <strong>Платили:</strong> {paidCount} / {total} ({percentage}%)
            </p>

            {/* Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "2px solid #000",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #000",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    Име
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #000",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    Набор
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #000",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    Дата на плащане
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #000",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayPlayers.map((player, idx) => {
                  const isPaid = paidIds.has(player.id);
                  const paidAt = paidAtMap.get(player.id);
                  return (
                    <tr key={player.id}>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "6px 8px",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "6px 8px",
                        }}
                      >
                        {player.full_name}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "6px 8px",
                        }}
                      >
                        {player.team_group ?? "—"}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "6px 8px",
                        }}
                      >
                        {isPaid && paidAt
                          ? new Date(paidAt).toLocaleDateString("bg-BG")
                          : "—"}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "6px 8px",
                        }}
                      >
                        {isPaid ? "Платено" : "Неплатено"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <p
              style={{
                marginTop: "24px",
                fontSize: "11px",
                color: "#888",
              }}
            >
              Генериран на {todayFormatted}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
