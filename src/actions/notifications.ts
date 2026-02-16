"use server";

import { createClient } from "@/lib/supabase/server";
import { webPush } from "@/lib/web-push";

export async function sendPushToPlayer(
  playerId: string,
  payload: { title: string; body: string }
) {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("player_id", playerId);

  if (!subscriptions || subscriptions.length === 0) return;

  const message = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message
      )
    )
  );

  // Clean up expired subscriptions (410 Gone)
  const expiredIds: string[] = [];
  results.forEach((result, i) => {
    if (
      result.status === "rejected" &&
      result.reason?.statusCode === 410
    ) {
      expiredIds.push(subscriptions[i].id);
    }
  });

  if (expiredIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }
}
