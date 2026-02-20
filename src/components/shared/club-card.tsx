import { ClubLogo } from "./club-logo";
import { PlayerAvatar } from "./player-avatar";
import type { PlayerStatus } from "@/types/database";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function statusLabel(status: PlayerStatus): { text: string; color: string; glow: string } {
  if (status === "paid") {
    return {
      text: "ТАКСА: ПЛАТЕНА",
      color: "text-[#32cd32]",
      glow: "drop-shadow-[0_0_6px_rgba(50,205,50,0.5)]",
    };
  }
  return {
    text: "ТАКСА: ДЪЛЖИМА",
    color: "text-[#ff4d4d]",
    glow: "drop-shadow-[0_0_6px_rgba(255,77,77,0.5)]",
  };
}

interface ClubCardProps {
  playerName: string;
  clubName: string;
  status: PlayerStatus;
  jerseyNumber: string | null;
  birthDate: string | null;
  teamGroup: number | null;
  lastPaymentDate: string | null;
  avatarUrl: string | null;
  emblemUrl: string | null;
}

export function ClubCard({
  playerName,
  clubName,
  status,
  jerseyNumber,
  birthDate,
  teamGroup,
  lastPaymentDate,
  avatarUrl,
  emblemUrl,
}: ClubCardProps) {
  const sl = statusLabel(status);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#0c0f0c]">
      {/* ── Diagonal speed lines background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[8, 16, 24, 33, 42, 54, 65, 76, 85, 93].map((left, i) => (
          <div
            key={i}
            className="absolute h-[250%] bg-gradient-to-b from-transparent via-[#32cd32] to-transparent"
            style={{
              top: "-75%",
              left: `${left}%`,
              width: i % 3 === 0 ? "3px" : "2px",
              opacity: 0.06 + (i % 3) * 0.03,
              filter: `blur(${i % 2 === 0 ? 1 : 3}px)`,
              transform: "rotate(25deg)",
            }}
          />
        ))}
        <div
          className="absolute h-[250%] w-[30px] bg-gradient-to-b from-transparent via-[#32cd32]/[0.04] to-transparent blur-[12px]"
          style={{ top: "-75%", left: "18%", transform: "rotate(25deg)" }}
        />
        <div
          className="absolute h-[250%] w-[25px] bg-gradient-to-b from-transparent via-[#32cd32]/[0.03] to-transparent blur-[10px]"
          style={{ top: "-75%", left: "70%", transform: "rotate(25deg)" }}
        />
      </div>

      {/* ── Radial vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0c0f0c_100%)]" />

      {/* ── Card content ── */}
      <div className="relative flex flex-col p-5 sm:p-6">

        {/* ══════ TOP HEADER: 3-column grid ══════ */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* LEFT — Club emblem */}
          <div className="h-14 w-14 shrink-0">
            {emblemUrl ? (
              <img
                src={emblemUrl}
                alt={clubName}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : (
              <ClubLogo className="h-full w-full" />
            )}
          </div>

          {/* CENTER — Title */}
          <div className="flex flex-col items-center justify-center min-w-0">
            <h1 className="text-center text-base sm:text-lg font-black uppercase tracking-wider text-white leading-tight">
              КЛУБНА КАРТА{" "}
              <span className="text-[#32cd32]">2026</span>
            </h1>
            <p className="mt-0.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white/60 truncate max-w-full">
              {clubName}
            </p>
          </div>

          {/* RIGHT — Jersey number shield */}
          <div className="h-14 w-14 shrink-0 flex items-center justify-center">
            {jerseyNumber ? (
              <div className="relative h-full w-full flex items-center justify-center">
                <svg viewBox="0 0 50 56" fill="none" className="absolute inset-0 h-full w-full">
                  <path
                    d="M25 2 L47 12 L47 35 Q47 50 25 54 Q3 50 3 35 L3 12 Z"
                    fill="#32cd32"
                    fillOpacity="0.1"
                    stroke="#32cd32"
                    strokeWidth="2.5"
                  />
                </svg>
                <span className="relative text-sm sm:text-base font-black text-[#32cd32]">
                  {jerseyNumber}
                </span>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* ── Neon divider ── */}
        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#32cd32]/40 to-transparent" />

        {/* ══════ CENTRAL BLOCK: Photo + Info ══════ */}
        <div className="flex flex-col items-center">
          {/* Player photo */}
          <div className="relative aspect-[9/11] w-36 sm:w-40 overflow-hidden rounded-xl border-2 border-[#32cd32]/20 shadow-[0_0_20px_rgba(50,205,50,0.15)]">
            <PlayerAvatar
              src={avatarUrl}
              alt={playerName}
              size={160}
              className="h-full w-full rounded-xl"
              fallbackClass="text-5xl text-white/20"
            />
          </div>

          {/* ── Neon divider ── */}
          <div className="my-4 h-px w-3/4 bg-gradient-to-r from-transparent via-[#32cd32]/40 to-transparent" />

          {/* Player info list */}
          <div className="flex flex-col gap-2 w-full max-w-[280px]">
            {/* 1. Име */}
            <div className="flex justify-between text-sm sm:text-base">
              <span className="font-semibold text-white/50">Име:</span>
              <span className="font-bold text-white text-right">{playerName}</span>
            </div>

            {/* 2. Роден */}
            {birthDate && (
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-semibold text-white/50">Роден:</span>
                <span className="font-bold text-white">{formatDate(birthDate)}</span>
              </div>
            )}

            {/* 3. Набор */}
            {teamGroup != null && (
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-semibold text-white/50">Набор:</span>
                <span className="font-bold text-[#32cd32]">{teamGroup}</span>
              </div>
            )}

            {/* 4. Статус */}
            <div className="flex justify-between text-sm sm:text-base">
              <span className="font-semibold text-white/50">Статус:</span>
              <span className={`font-extrabold ${sl.color} ${sl.glow}`}>{sl.text}</span>
            </div>

            {/* 5. Последно плащане */}
            {lastPaymentDate && (
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-semibold text-white/50">Последно плащане:</span>
                <span className="font-bold text-white">{formatDate(lastPaymentDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Neon divider (bottom frame) ── */}
        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#32cd32]/40 to-transparent" />
      </div>
    </div>
  );
}
