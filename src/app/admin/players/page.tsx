import { createClient } from "@/lib/supabase/server";
import { PlayersListDashboard } from "./players-list";
import type { Player } from "@/types/database";

export const metadata = {
  title: "Играчи - Smart Club Admin",
};

export default async function PlayersPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select(
      "id, full_name, nfc_tag_id, status, jersey_number, birth_date, team_group, last_payment_date, avatar_url"
    )
    .order("full_name");

  const { data: groupRows } = await supabase
    .from("players")
    .select("team_group")
    .not("team_group", "is", null)
    .order("team_group", { ascending: false });

  const groups = [
    ...new Set(
      (groupRows ?? [])
        .map((r) => r.team_group as number)
        .filter((g): g is number => g !== null)
    ),
  ];

  return (
    <main className="min-h-dvh bg-[#0d0d0d] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-[#32cd32]">
          Списък играчи
        </h1>
        <p className="mb-8 text-sm text-white/50">
          Търсене, филтриране и ръчно отбелязване на плащания
        </p>
        <PlayersListDashboard
          players={(players as Player[]) ?? []}
          groups={groups}
        />
      </div>
    </main>
  );
}
