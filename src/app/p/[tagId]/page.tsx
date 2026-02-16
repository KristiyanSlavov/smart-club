import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    description: `Смарт профил на ${player.full_name}`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { tagId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("id, full_name, status, clubs(name)")
    .eq("nfc_tag_id", tagId)
    .single<PlayerWithClub>();

  if (!player) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0d0d0d] p-5">
      <div className="w-full max-w-[400px]">
        <RealtimeStatusCard
          playerId={player.id}
          playerName={player.full_name}
          clubName={player.clubs.name}
          initialStatus={player.status}
        />
        <div className="mt-4">
          <EnableNotificationsButton playerId={player.id} />
        </div>
        <p className="mt-3 text-center text-xs text-white/50">
          Получавайте push известия дори когато браузърът е затворен.
        </p>
      </div>
    </main>
  );
}
