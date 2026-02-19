import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SmartRedirect } from "@/components/shared/smart-redirect";
import { RealtimeStatusCard } from "@/components/shared/realtime-status-card";
import { EnableNotificationsButton } from "@/components/shared/enable-notifications-button";
import type { PlayerWithClub } from "@/types/database";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tagId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("full_name, clubs(name)")
    .eq("nfc_tag_id", tagId)
    .single<PlayerWithClub>();

  if (!player) {
    return { title: "Профил не е намерен" };
  }

  return {
    title: `${player.full_name} - ${player.clubs.name}`,
    description: `Клубна карта на ${player.full_name}`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { tagId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select(
      "id, full_name, status, jersey_number, birth_date, team_group, last_payment_date, avatar_url, clubs(name, emblem_url)"
    )
    .eq("nfc_tag_id", tagId)
    .single<PlayerWithClub>();

  if (!player) {
    notFound();
  }

  return (
    <SmartRedirect tagId={tagId}>
      <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] p-4">
        <div className="w-full max-w-[420px]">
          <RealtimeStatusCard
            playerId={player.id}
            playerName={player.full_name}
            clubName={player.clubs.name}
            initialStatus={player.status}
            jerseyNumber={player.jersey_number}
            birthDate={player.birth_date}
            teamGroup={player.team_group}
            lastPaymentDate={player.last_payment_date}
            avatarUrl={player.avatar_url}
            emblemUrl={player.clubs.emblem_url}
          />
          <div className="mt-3">
            <EnableNotificationsButton playerId={player.id} />
          </div>
          <p className="mt-2 text-center text-[10px] text-white/25">
            Получавайте push известия дори когато браузърът е затворен.
          </p>
        </div>
      </main>
    </SmartRedirect>
  );
}
