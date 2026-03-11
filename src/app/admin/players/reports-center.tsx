/**
 * Smart Club — Proprietary Software
 * Copyright (c) 2026 Кристиян Славов. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use of this software,
 * in whole or in part, is strictly prohibited without prior written permission.
 * Protected under applicable copyright and intellectual property laws.
 */

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
import { createClient } from "@/lib/supabase/client";
import { BG_MONTHS } from "@/lib/constants";
import {
  BarChart3,
  Printer,
  Calendar,
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

const BG_MONTHS_SHORT = BG_MONTHS.map((m) => m.slice(0, 3));

/* ── Club crest as raw SVG string (injected into iframe) ── */
const CLUB_LOGO_SVG = `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="80"><path d="M60 2 L115 20 L115 85 Q115 120 60 138 Q5 120 5 85 L5 20 Z" fill="#1a5c1a" stroke="#32cd32" stroke-width="3"/><path d="M60 8 L109 24 L109 83 Q109 114 60 132 Q11 114 11 83 L11 24 Z" fill="#0d3d0d"/><rect x="15" y="18" width="90" height="22" rx="2" fill="#1a5c1a"/><text x="60" y="33" text-anchor="middle" fill="#fff" font-size="11" font-weight="800" font-family="Arial,sans-serif">ФК ВИХЪР</text><rect x="20" y="44" width="16" height="40" fill="#fff"/><rect x="36" y="44" width="16" height="40" fill="#32cd32"/><rect x="52" y="44" width="16" height="40" fill="#fff"/><rect x="68" y="44" width="16" height="40" fill="#32cd32"/><rect x="84" y="44" width="16" height="40" fill="#fff"/><circle cx="60" cy="64" r="14" fill="#1a5c1a" stroke="#32cd32" stroke-width="1.5"/><circle cx="60" cy="64" r="10" fill="none" stroke="#fff" stroke-width="1"/><text x="60" y="68" text-anchor="middle" fill="#fff" font-size="12">⚽</text><rect x="15" y="88" width="90" height="20" rx="2" fill="#1a5c1a"/><text x="60" y="102" text-anchor="middle" fill="#fff" font-size="8.5" font-weight="700" font-family="Arial,sans-serif">ВОЙВОДИНОВО</text><text x="60" y="122" text-anchor="middle" fill="#32cd32" font-size="14" font-weight="800" font-family="Arial,sans-serif">1961</text></svg>`;

/** Escape HTML special characters */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Print self-contained HTML via a hidden iframe.
 * Works reliably on both desktop and mobile (Android / iOS).
 */
function printViaIframe(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Give the browser time to layout the content, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // silently ignore — some browsers restrict cross-frame print
    }

    // Remove the iframe after the print dialog is closed
    const cleanup = () => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // already removed
      }
    };
    try {
      iframe.contentWindow?.addEventListener("afterprint", cleanup, {
        once: true,
      });
    } catch {
      // afterprint not supported — fallback below
    }
    // Fallback: remove after 60 s if afterprint never fires (mobile)
    setTimeout(cleanup, 60_000);
  }, 500);
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
  const [loadingAnnual, setLoadingAnnual] = useState(false);

  /* ── Monthly fetch (dashboard) ── */
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

  /* ── Dashboard derived data ── */
  const filteredPlayers =
    groupFilter === "all"
      ? players
      : players.filter((p) => p.team_group === Number(groupFilter));

  const paidIds = new Set(paymentLogs.map((l) => l.player_id));
  const paidPlayers = filteredPlayers.filter((p) => paidIds.has(p.id));
  const unpaidPlayers = filteredPlayers.filter((p) => !paidIds.has(p.id));

  const total = filteredPlayers.length;
  const paidCount = paidPlayers.length;
  const unpaidCount = unpaidPlayers.length;
  const percentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  const displayPlayers =
    statusFilter === "paid"
      ? paidPlayers
      : statusFilter === "unpaid"
        ? unpaidPlayers
        : filteredPlayers;

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

  /* ── Monthly report → iframe print ── */
  const handleMonthlyReport = () => {
    const rows = displayPlayers
      .map((p, i) => {
        const isPaid = paidIds.has(p.id);
        const paidAt = paidAtMap.get(p.id);
        const dateStr =
          isPaid && paidAt
            ? new Date(paidAt).toLocaleDateString("bg-BG")
            : "—";
        return `<tr>
          <td>${i + 1}</td>
          <td>${esc(p.full_name)}</td>
          <td>${p.team_group ?? "—"}</td>
          <td>${dateStr}</td>
          <td>${isPaid ? "Платено" : "Неплатено"}</td>
        </tr>`;
      })
      .join("");

    const groupLine =
      groupFilter !== "all"
        ? `<p style="margin:4px 0 0;font-size:13px;color:#555">Набор: ${esc(groupFilter)}</p>`
        : "";

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @page { size: portrait; margin: 15mm; }
  body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { display: table-header-group; }
  tbody { display: table-row-group; }
  tr { page-break-inside: avoid; }
  th { border-bottom: 2px solid #000; padding: 6px 8px; text-align: left; }
  td { border-bottom: 1px solid #ddd; padding: 6px 8px; }
</style></head><body>
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
    ${CLUB_LOGO_SVG}
    <div>
      <h1 style="margin:0;font-size:20px;font-weight:800">ФК ВИХЪР ВОЙВОДИНОВО</h1>
      <h2 style="margin:4px 0 0;font-size:16px;font-weight:600">ФИНАНСОВ ОТЧЕТ ЗА МЕСЕЦ ${esc(BG_MONTHS[month].toUpperCase())} ${year}</h2>
      ${groupLine}
    </div>
  </div>
  <p style="font-size:14px;margin-bottom:16px"><strong>Платили:</strong> ${paidCount} / ${total} (${percentage}%)</p>
  <table>
    <thead><tr><th>#</th><th>Име</th><th>Набор</th><th>Дата на плащане</th><th>Статус</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:24px;font-size:11px;color:#888">Генериран на ${todayFormatted}</p>
</body></html>`;

    printViaIframe(html);
  };

  /* ── Annual report → fetch + iframe print ── */
  const handleAnnualReport = useCallback(async () => {
    setLoadingAnnual(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("payment_logs")
      .select("player_id, paid_for, paid_at")
      .like("paid_for", `% ${year}`);
    const logs = (data as PaymentLogRow[]) ?? [];

    // Build paid map: player_id → Set<monthIndex>
    const paidMap = new Map<string, Set<number>>();
    for (const log of logs) {
      const monthName = log.paid_for.split(" ")[0];
      const monthIdx = BG_MONTHS.indexOf(monthName);
      if (monthIdx === -1) continue;
      if (!paidMap.has(log.player_id))
        paidMap.set(log.player_id, new Set());
      paidMap.get(log.player_id)!.add(monthIdx);
    }

    // Sort players by group then name
    const filtered =
      groupFilter === "all"
        ? [...players]
        : players.filter((p) => p.team_group === Number(groupFilter));
    filtered.sort((a, b) => {
      if (groupFilter === "all") {
        const ga = a.team_group ?? 0;
        const gb = b.team_group ?? 0;
        if (ga !== gb) return ga - gb;
      }
      return a.full_name.localeCompare(b.full_name, "bg");
    });

    // Distinct groups (only when showing all)
    const distinctGroups =
      groupFilter === "all"
        ? [
            ...new Set(filtered.map((p) => p.team_group)),
          ].sort((a, b) => (a ?? 0) - (b ?? 0))
        : [];

    // Row builder
    const buildRow = (player: Player, idx: number) => {
      const cells = BG_MONTHS.map((_, mi) => {
        const paid = paidMap.get(player.id)?.has(mi);
        return `<td style="text-align:center;color:${paid ? "#228B22" : "#CC0000"};font-weight:${paid ? 700 : 400}">${paid ? "✓" : "—"}</td>`;
      }).join("");
      return `<tr><td style="text-align:center">${idx + 1}</td><td style="white-space:nowrap">${esc(player.full_name)}</td>${cells}</tr>`;
    };

    // Build table body
    let bodyRows = "";
    if (groupFilter === "all") {
      for (const group of distinctGroups) {
        const gp = filtered.filter((p) => p.team_group === group);
        bodyRows += `<tr class="group-header"><td colspan="14" style="background:#f0f0f0;font-weight:bold;padding:6px 8px;font-size:11px;border-bottom:1px solid #ccc">Набор ${group ?? "—"}</td></tr>`;
        bodyRows += gp.map((p, i) => buildRow(p, i)).join("");
      }
    } else {
      bodyRows = filtered.map((p, i) => buildRow(p, i)).join("");
    }

    const monthHeaders = BG_MONTHS_SHORT.map(
      (m) =>
        `<th style="padding:4px 2px;text-align:center;font-size:10px;font-weight:600">${m}</th>`,
    ).join("");

    const groupLine =
      groupFilter !== "all"
        ? `<p style="margin:4px 0 0;font-size:12px;color:#555">Набор: ${esc(groupFilter)}</p>`
        : "";

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @page { size: landscape; margin: 10mm; }
  body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 10px; zoom: 0.85; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead { display: table-header-group; }
  tbody { display: table-row-group; }
  tr { page-break-inside: avoid; }
  .group-header { page-break-after: avoid; }
  th { border-bottom: 2px solid #000; padding: 4px 6px; font-size: 10px; font-weight: 600; }
  td { border-bottom: 1px solid #ddd; padding: 4px 6px; font-size: 11px; }
</style></head><body>
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
    ${CLUB_LOGO_SVG}
    <div>
      <h1 style="margin:0;font-size:18px;font-weight:800">ФК ВИХЪР ВОЙВОДИНОВО</h1>
      <h2 style="margin:4px 0 0;font-size:14px;font-weight:600">ГОДИШЕН ОТЧЕТ ЗА СЪБИРАЕМОСТ - ${year} Г.</h2>
      ${groupLine}
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="text-align:center">#</th>
      <th style="text-align:left;min-width:120px">Име</th>
      ${monthHeaders}
    </tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p style="margin-top:16px;font-size:10px;color:#888">Генериран на ${todayFormatted}</p>
</body></html>`;

    printViaIframe(html);
    setLoadingAnnual(false);
  }, [year, groupFilter, players, todayFormatted]);

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
              <label className="text-xs text-white/50 mb-1 block">
                Месец
              </label>
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
              <label className="text-xs text-white/50 mb-1 block">
                Година
              </label>
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
            <label className="text-xs text-white/50 mb-1 block">
              Статус
            </label>
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
                    <th className="py-2 px-3 text-left font-medium">
                      Статус
                    </th>
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
                        <td className="py-2 px-3 text-white/40">
                          {idx + 1}
                        </td>
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

            {/* Report buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="gap-2 border-white/10 text-white hover:bg-white/10"
                onClick={handleMonthlyReport}
              >
                <Printer className="size-4" />
                Генерирай месечен отчет
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-white/10 text-white hover:bg-white/10"
                onClick={handleAnnualReport}
                disabled={loadingAnnual}
              >
                {loadingAnnual ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Calendar className="size-4" />
                )}
                Генерирай годишен отчет
              </Button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
