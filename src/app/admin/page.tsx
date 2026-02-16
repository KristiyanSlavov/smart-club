import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "./admin-dashboard";
import type { Player } from "@/types/database";

export const metadata = {
  title: "Admin - Smart Club",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("id, full_name, nfc_tag_id, status, club_id")
    .order("full_name");

  return (
    <main className="min-h-dvh bg-[#0d0d0d] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-[#32cd32]">
          Smart Club Admin
        </h1>
        <p className="mb-8 text-sm text-white/50">
          Управлявайте статусите на играчите
        </p>
        <AdminDashboard players={(players as Player[]) ?? []} />
      </div>
    </main>
  );
}
