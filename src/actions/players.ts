"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/actions/notifications";
import type { PlayerStatus } from "@/types/database";

export async function updatePlayerStatus(
  playerId: string,
  status: PlayerStatus
) {
  const supabase = await createClient();

  const updateData: { status: PlayerStatus; last_payment_date?: string } = { status };
  if (status === "paid") {
    updateData.last_payment_date = new Date().toISOString();
  }

  const { error } = await supabase
    .from("players")
    .update(updateData)
    .eq("id", playerId);

  if (error) {
    return { error: error.message };
  }

  if (status === "paid") {
    const { data: player } = await supabase
      .from("players")
      .select("nfc_tag_id")
      .eq("id", playerId)
      .single();

    const profileUrl = player?.nfc_tag_id
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://smart-club-henna.vercel.app"}/p/${player.nfc_tag_id}`
      : undefined;

    sendPushToPlayer(playerId, {
      title: "Smart Club",
      body: "Плащането е успешно! Месечната такса е отчетенa.",
      url: profileUrl,
    }).catch(() => {});
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function createPlayer(data: {
  id: string; // Blind Insert: client generates UUID
  club_id: string;
  full_name: string;
  nfc_tag_id: string;
  status: PlayerStatus;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("players").insert(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
