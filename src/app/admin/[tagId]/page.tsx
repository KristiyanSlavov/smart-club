import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerAdminCard } from "./player-admin-card";
import type { Player } from "@/types/database";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tagId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("full_name")
    .eq("nfc_tag_id", tagId)
    .single();

  if (!player) {
    return { title: "Играч не е намерен" };
  }

  return {
    title: `${player.full_name} - Admin - Smart Club`,
  };
}

export default async function AdminPlayerPage({ params }: Props) {
  const { tagId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select(
      "id, full_name, nfc_tag_id, status, jersey_number, birth_date, team_group, last_payment_date, avatar_url"
    )
    .eq("nfc_tag_id", tagId)
    .single<Player>();

  if (!player) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] p-4">
      <PlayerAdminCard player={player} />
    </main>
  );
}
