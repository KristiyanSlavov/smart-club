import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

console.log("[cron] VAPID_PUBLIC_KEY present:", !!VAPID_PUBLIC_KEY);
console.log("[cron] VAPID_PRIVATE_KEY present:", !!VAPID_PRIVATE_KEY);

webPush.setVapidDetails(
  "mailto:noreply@smartclub.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const APP_URL = Deno.env.get("APP_URL") ?? "https://smart-club-henna.vercel.app";

async function sendPushToPlayer(
  playerId: string,
  playerName: string,
  payload: { title: string; body: string; url?: string }
): Promise<{ sent: number; failed: number; noSubs: boolean }> {
  console.log(`[cron] Looking up push_subscriptions for player: ${playerName} (${playerId})`);

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("player_id", playerId);

  if (subError) {
    console.error(`[cron] DB error fetching subscriptions for ${playerName}:`, subError.message);
    return { sent: 0, failed: 0, noSubs: true };
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.warn(`[cron] No push subscriptions found for player: ${playerName} (${playerId})`);
    return { sent: 0, failed: 0, noSubs: true };
  }

  // Deduplicate by endpoint — keep only the latest row per endpoint
  const seen = new Map<string, typeof subscriptions[number]>();
  for (const sub of subscriptions) {
    seen.set(sub.endpoint, sub);
  }
  const uniqueSubs = [...seen.values()];

  console.log(`[cron] Found ${subscriptions.length} row(s), ${uniqueSubs.length} unique endpoint(s) for ${playerName}`);

  const message = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  for (const sub of uniqueSubs) {
    console.log(`[cron] Attempting to send push to ${playerName}, endpoint: ${sub.endpoint.slice(0, 60)}...`);
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message
      );
      sent++;
      console.log(`[cron] Push sent successfully to ${playerName}`);
    } catch (err: unknown) {
      failed++;
      const statusCode = (err as { statusCode?: number })?.statusCode;
      const errBody = (err as { body?: string })?.body;
      console.error(
        `[cron] Push FAILED for ${playerName} (${playerId}):`,
        `statusCode=${statusCode}`,
        `body=${errBody}`,
        err
      );
      if (statusCode === 410) {
        expiredIds.push(sub.id);
      }
    }
  }

  if (expiredIds.length > 0) {
    console.log(`[cron] Cleaning up ${expiredIds.length} expired subscription(s) for ${playerName}`);
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }

  return { sent, failed, noSubs: false };
}

type CronType = "reminder_25" | "reminder_29" | "overdue_1st";

function resolveType(body: { type?: string }): CronType | null {
  if (body.type === "reminder_25" || body.type === "reminder_29" || body.type === "overdue_1st") {
    return body.type;
  }

  const day = new Date().getUTCDate();
  if (day === 25) return "reminder_25";
  if (day === 29) return "reminder_29";
  if (day === 1) return "overdue_1st";

  return null;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`) {
    console.error("[cron] Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { type?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty or invalid body — fall back to date-based resolution
  }

  const type = resolveType(body);
  console.log("[cron] ===== Processing type:", type, "=====");

  // Diagnostic: check if push_subscriptions table has any rows at all
  const { count, error: countError } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true });
  if (countError) {
    console.error("[cron] Failed to count push_subscriptions:", countError.message);
  } else {
    console.log(`[cron] Total rows in push_subscriptions table: ${count}`);
  }

  const actions: string[] = [];

  if (type === "reminder_25") {
    const { data: players, error: playersErr } = await supabase
      .from("players")
      .select("id, full_name, nfc_tag_id, status")
      .neq("status", "paid");

    console.log(`[cron] Found ${players?.length ?? 0} player(s) with unpaid status`);
    if (playersErr) console.error("[cron] Players query error:", playersErr.message);

    if (players && players.length > 0) {
      players.forEach((p) => console.log(`[cron]   - ${p.full_name} (status: ${p.status})`));

      const results = await Promise.allSettled(
        players.map((p: { id: string; full_name: string; nfc_tag_id: string }) =>
          sendPushToPlayer(p.id, p.full_name, {
            title: "Smart Club",
            body: "Напомняне: Моля, платете месечната такса до края на месеца.",
            url: `${APP_URL}/p/${p.nfc_tag_id}`,
          })
        )
      );
      const summary = results.map((r) => r.status === "fulfilled" ? r.value : { error: r.reason });
      console.log("[cron] Push results:", JSON.stringify(summary));
      actions.push(`Sent reminder to ${players.length} player(s)`);
    }
  } else if (type === "reminder_29") {
    const { data: players, error: playersErr } = await supabase
      .from("players")
      .select("id, full_name, nfc_tag_id, status")
      .neq("status", "paid");

    console.log(`[cron] Found ${players?.length ?? 0} player(s) with unpaid status`);
    if (playersErr) console.error("[cron] Players query error:", playersErr.message);

    if (players && players.length > 0) {
      players.forEach((p) => console.log(`[cron]   - ${p.full_name} (status: ${p.status})`));

      const results = await Promise.allSettled(
        players.map((p: { id: string; full_name: string; nfc_tag_id: string }) =>
          sendPushToPlayer(p.id, p.full_name, {
            title: "Smart Club",
            body: "Последно напомняне: Месечната такса все още не е платена.",
            url: `${APP_URL}/p/${p.nfc_tag_id}`,
          })
        )
      );
      const summary = results.map((r) => r.status === "fulfilled" ? r.value : { error: r.reason });
      console.log("[cron] Push results:", JSON.stringify(summary));
      actions.push(`Sent last reminder to ${players.length} player(s)`);
    }
  } else if (type === "overdue_1st") {
    // Mark unpaid players as overdue
    const { data: unpaid, error: unpaidErr } = await supabase
      .from("players")
      .select("id, full_name, nfc_tag_id, status")
      .neq("status", "paid");

    console.log(`[cron] Found ${unpaid?.length ?? 0} player(s) with unpaid status (for overdue)`);
    if (unpaidErr) console.error("[cron] Unpaid query error:", unpaidErr.message);

    if (unpaid && unpaid.length > 0) {
      unpaid.forEach((p) => console.log(`[cron]   - ${p.full_name} (status: ${p.status})`));

      const { error: updateErr } = await supabase
        .from("players")
        .update({ status: "overdue" })
        .neq("status", "paid");

      if (updateErr) {
        console.error("[cron] Failed to update players to overdue:", updateErr.message);
      } else {
        console.log(`[cron] Updated ${unpaid.length} player(s) to overdue`);
      }

      const results = await Promise.allSettled(
        unpaid.map((p: { id: string; full_name: string; nfc_tag_id: string }) =>
          sendPushToPlayer(p.id, p.full_name, {
            title: "Smart Club",
            body: "Просрочено плащане! Дължите две такси.",
            url: `${APP_URL}/p/${p.nfc_tag_id}`,
          })
        )
      );
      const summary = results.map((r) => r.status === "fulfilled" ? r.value : { error: r.reason });
      console.log("[cron] Push results (overdue):", JSON.stringify(summary));
      actions.push(`Marked ${unpaid.length} player(s) as overdue`);
    }

    // Reset paid players to warning (new billing cycle)
    const { data: paid, error: paidErr } = await supabase
      .from("players")
      .select("id, full_name")
      .eq("status", "paid");

    console.log(`[cron] Found ${paid?.length ?? 0} paid player(s) to reset to warning`);
    if (paidErr) console.error("[cron] Paid query error:", paidErr.message);

    if (paid && paid.length > 0) {
      paid.forEach((p) => console.log(`[cron]   - ${p.full_name} (resetting to warning)`));

      const { error: resetErr } = await supabase
        .from("players")
        .update({ status: "warning" })
        .eq("status", "paid");

      if (resetErr) {
        console.error("[cron] Failed to reset paid players to warning:", resetErr.message);
      } else {
        console.log(`[cron] Reset ${paid.length} paid player(s) to warning`);
      }

      actions.push(`Reset ${paid.length} paid player(s) to warning`);
    }
  } else {
    console.log(`[cron] No action for today — type resolved to null (day ${new Date().getUTCDate()})`);
    actions.push(`No action — type resolved to null (day ${new Date().getUTCDate()})`);
  }

  // Diagnostic: cross-check player_id FK linkage
  const { data: orphans, error: orphanErr } = await supabase
    .from("push_subscriptions")
    .select("id, player_id")
    .not("player_id", "in", `(${(await supabase.from("players").select("id")).data?.map((p: { id: string }) => p.id).join(",") ?? ""})`);

  if (orphanErr) {
    console.error("[cron] Orphan check error:", orphanErr.message);
  } else if (orphans && orphans.length > 0) {
    console.error(`[cron] WARNING: ${orphans.length} push_subscription(s) with player_id not matching any player:`, orphans);
  } else {
    console.log("[cron] FK check passed: all push_subscriptions.player_id values match a player");
  }

  const response = { ok: true, type, actions };
  console.log("[cron] ===== Done =====", JSON.stringify(response));

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
});
