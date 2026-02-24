"use client";

import { useState } from "react";
import { FileText, Printer, X, Receipt, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PaymentLog } from "@/types/database";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ── Receipt Modal ───────────────────────────────────────────────────────────

function ReceiptModal({
  payment,
  playerName,
  clubName,
  open,
  onClose,
}: {
  payment: PaymentLog;
  playerName: string;
  clubName: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[400px] border-0 bg-transparent p-2 shadow-none sm:p-0"
      >
        {/* Hidden accessible title */}
        <DialogTitle className="sr-only">
          Разписка за {payment.paid_for}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Потвърждение за плащане на {playerName} за период {payment.paid_for}
        </DialogDescription>

        {/* Receipt card — white "document" style */}
        <div id="receipt-print-area" className="relative rounded-xl bg-white p-6 shadow-2xl">
          {/* Mobile close X in top-right corner */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="Затвори"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {clubName}
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-400 uppercase tracking-widest">
              Разписка за членски внос
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Body */}
          <div className="my-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Играч:</span>
              <span className="font-semibold text-gray-900">{playerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Период:</span>
              <span className="font-semibold text-gray-900">
                {payment.paid_for}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Дата на плащане:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(payment.paid_at)}
              </span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Stamp */}
          <div className="my-6 flex items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-dashed border-[#32cd32]/60 rotate-[-12deg]">
              <span className="text-center text-xs font-black uppercase leading-tight tracking-wider text-[#32cd32]">
                ПОТВЪР
                <br />
                ДЕНО
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Printer className="h-4 w-4" />
              Принтирай / Запази
            </button>
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
              Затвори
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Payment History Section ─────────────────────────────────────────────────

interface PaymentHistoryProps {
  payments: PaymentLog[];
  playerName: string;
  clubName: string;
}

export function PaymentHistory({
  payments,
  playerName,
  clubName,
}: PaymentHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentLog | null>(
    null
  );

  return (
    <>
      <div className="mt-6 w-full overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]">
        {/* ── Sticky accordion header ── */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            История на плащанията
            {payments.length > 0 && (
              <span className="ml-1.5 text-white/25">({payments.length})</span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-white/30 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── Collapsible body ── */}
        <div
          className={`grid transition-[grid-template-rows] duration-200 ${
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 pb-5 pt-2 text-white/20">
                <Receipt className="h-7 w-7" />
                <p className="text-xs">Все още няма регистрирани плащания</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto px-2 pb-2 scrollbar-thin">
                <div className="space-y-px">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-tight text-white/80">
                          {p.paid_for}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {formatDate(p.paid_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                      >
                        <FileText className="h-3 w-3" />
                        Разписка
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPayment && (
        <ReceiptModal
          payment={selectedPayment}
          playerName={playerName}
          clubName={clubName}
          open={true}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}
