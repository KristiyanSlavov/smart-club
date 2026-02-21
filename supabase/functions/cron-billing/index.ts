import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webPush.setVapidDetails(
  "mailto:noreply@smartclub.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const APP_URL =
  Deno.env.get("APP_URL") ?? "https://smart-club-henna.vercel.app";

// ── Push helper ─────────────────────────────────────────────────────────────

async function sendPushToPlayer(
  playerId: string,
  playerName: string,
  payload: { title: string; body: string; url?: string },
  isDemo: boolean
): Promise<{ sent: number; failed: number; noSubs: boolean }> {
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("player_id", playerId);

  if (subError) {
    console.error(
      `[cron] DB error fetching subscriptions for ${playerName}:`,
      subError.message
    );
    return { sent: 0, failed: 0, noSubs: true };
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.warn(`[cron] No subscriptions for ${playerName}`);
    return { sent: 0, failed: 0, noSubs: true };
  }

  // Deduplicate by endpoint
  const seen = new Map<string, (typeof subscriptions)[number]>();
  for (const sub of subscriptions) {
    seen.set(sub.endpoint, sub);
  }
  const uniqueSubs = [...seen.values()];

  console.log(
    `[cron] ${uniqueSubs.length} endpoint(s) for ${playerName}`
  );

  const message = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  for (const sub of uniqueSubs) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message
      );
      sent++;
      console.log(`[cron] ✅ Push sent to ${playerName}`);
    } catch (err: unknown) {
      failed++;
      const statusCode = (err as { statusCode?: number })?.statusCode;
      console.error(
        `[cron] ❌ Push failed for ${playerName}: status=${statusCode}`
      );
      if (statusCode === 410) {
        expiredIds.push(sub.id);
      }
    }
  }

  // Clean up expired subscriptions (skip in demo mode)
  if (expiredIds.length > 0 && !isDemo) {
    console.log(
      `[cron] Cleaning ${expiredIds.length} expired sub(s) for ${playerName}`
    );
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }

  return { sent, failed, noSubs: false };
}

// ── Type resolution ─────────────────────────────────────────────────────────

type CronType = "reminder_25" | "reminder_29" | "overdue_1st";

function resolveType(body: { type?: string }): CronType | null {
  if (
    body.type === "reminder_25" ||
    body.type === "reminder_29" ||
    body.type === "overdue_1st"
  ) {
    return body.type;
  }

  const day = new Date().getUTCDate();
  if (day === 25) return "reminder_25";
  if (day === 29) return "reminder_29";
  if (day === 1) return "overdue_1st";

  return null;
}

// ── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { type?: string; isDemo?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body — fall back to date-based resolution
  }

  const type = resolveType(body);
  const isDemo = body.isDemo === true;

  console.log(
    `[cron] ===== type=${type} isDemo=${isDemo} =====`
  );

  const actions: string[] = [];

  // ── reminder_25 / reminder_29 ─────────────────────────────────────────
  // Rule C: Only notify players whose status is 'warning'
  if (type === "reminder_25" || type === "reminder_29") {
    const { data: warningPlayers, error: wErr } = await supabase
      .from("players")
      .select("id, full_name, nfc_tag_id")
      .eq("status", "warning");

    if (wErr) {
      console.error("[cron] Query error:", wErr.message);
    }

    const players = warningPlayers ?? [];
    console.log(
      `[cron] Found ${players.length} player(s) with status=warning`
    );
    players.forEach((p) => console.log(`[cron]   - ${p.full_name}`));

    if (players.length > 0) {
      const pushBody =
        type === "reminder_25"
          ? "Напомняне: Моля, платете месечната такса до края на месеца."
          : "Последно напомняне: Месечната такса все още не е платена.";

      await Promise.allSettled(
        players.map((p) =>
          sendPushToPlayer(
            p.id,
            p.full_name,
            {
              title: "Smart Club",
              body: pushBody,
              url: `${APP_URL}/p/${p.nfc_tag_id}`,
            },
            isDemo
          )
        )
      );

      const label =
        type === "reminder_25" ? "reminder" : "last reminder";
      actions.push(`Sent ${label} to ${players.length} player(s)`);
    } else {
      actions.push("No players with status=warning to notify");
    }
  }

  // ── overdue_1st ───────────────────────────────────────────────────────
  if (type === "overdue_1st") {
    if (isDemo) {
      // ── Demo mode: only notify players already marked 'overdue' ──
      const { data: overduePlayers, error: oErr } = await supabase
        .from("players")
        .select("id, full_name, nfc_tag_id")
        .eq("status", "overdue");

      if (oErr) {
        console.error("[cron] Overdue query error:", oErr.message);
      }

      const targets = overduePlayers ?? [];
      console.log(
        `[cron] DEMO: Found ${targets.length} player(s) with status=overdue`
      );
      targets.forEach((p) =>
        console.log(`[cron]   - ${p.full_name} (already overdue)`)
      );

      if (targets.length > 0) {
        await Promise.allSettled(
          targets.map((p) =>
            sendPushToPlayer(
              p.id,
              p.full_name,
              {
                title: "Smart Club",
                body: "Просрочено плащане! Дължите две такси.",
                url: `${APP_URL}/p/${p.nfc_tag_id}`,
              },
              isDemo
            )
          )
        );

        actions.push(
          `Demo: Sent overdue alerts to ${targets.length} overdue players only`
        );
      } else {
        actions.push("Demo: No players with status=overdue to notify");
      }
    } else {
      // ── Production mode ──
      // Rule B first: warning → overdue (they owe two fees)
      const { data: warningPlayers, error: wErr } = await supabase
        .from("players")
        .select("id, full_name, nfc_tag_id")
        .eq("status", "warning");

      if (wErr) {
        console.error("[cron] Warning query error:", wErr.message);
      }

      const toOverdue = warningPlayers ?? [];
      console.log(
        `[cron] Rule B: ${toOverdue.length} player(s) to mark as overdue (warning → overdue)`
      );
      toOverdue.forEach((p) =>
        console.log(`[cron]   - ${p.full_name} (warning → overdue)`)
      );

      if (toOverdue.length > 0) {
        const { error: updateErr } = await supabase
          .from("players")
          .update({ status: "overdue" })
          .eq("status", "warning");

        if (updateErr) {
          console.error("[cron] Failed to mark overdue:", updateErr.message);
        }

        await Promise.allSettled(
          toOverdue.map((p) =>
            sendPushToPlayer(
              p.id,
              p.full_name,
              {
                title: "Smart Club",
                body: "Просрочено плащане! Дължите две такси.",
                url: `${APP_URL}/p/${p.nfc_tag_id}`,
              },
              isDemo
            )
          )
        );

        actions.push(
          `Marked ${toOverdue.length} player(s) as overdue`
        );
      }

      // Rule A second: paid → warning (new month, new fee due)
      const { data: paidPlayers, error: pErr } = await supabase
        .from("players")
        .select("id, full_name")
        .eq("status", "paid");

      if (pErr) {
        console.error("[cron] Paid query error:", pErr.message);
      }

      const toWarning = paidPlayers ?? [];
      console.log(
        `[cron] Rule A: ${toWarning.length} player(s) to reset (paid → warning)`
      );
      toWarning.forEach((p) =>
        console.log(`[cron]   - ${p.full_name} (paid → warning)`)
      );

      if (toWarning.length > 0) {
        const { error: resetErr } = await supabase
          .from("players")
          .update({ status: "warning" })
          .eq("status", "paid");

        if (resetErr) {
          console.error("[cron] Failed to reset to warning:", resetErr.message);
        }

        actions.push(
          `Reset ${toWarning.length} paid player(s) to warning`
        );
      }

      if (toOverdue.length === 0 && toWarning.length === 0) {
        actions.push("No status changes needed");
      }
    }
  }

  // ── No matching type ──────────────────────────────────────────────────
  if (!type) {
    actions.push(
      `No action — day ${new Date().getUTCDate()} has no scheduled task`
    );
  }

  const response = { ok: true, type, isDemo, actions };
  console.log("[cron] ===== Done =====", JSON.stringify(response));

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
});
