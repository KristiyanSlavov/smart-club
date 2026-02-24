import { createClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

/** True when running on an iPhone / iPad / iPod (any browser). */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** True when the page is running inside an installed PWA (standalone). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export async function subscribeToPush(
  playerId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, error: "Push notifications are not supported in this browser." };
  }

  const permission = await Notification.requestPermission();
  console.log("[push] Notification permission:", permission);
  if (permission !== "granted") {
    return { ok: false, error: `Notification permission: ${permission}` };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return { ok: false, error: "VAPID public key is not configured." };
  }

  console.log("[push] Registering service worker...");
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  console.log("[push] Service worker ready.");

  // Check if there's already an active push subscription
  let subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    console.log("[push] Existing push subscription found, reusing:", subscription.endpoint);
  } else {
    console.log("[push] No existing subscription, creating new one...");
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log("[push] New push subscription created:", subscription.endpoint);
  }

  const json = subscription.toJSON();
  const supabase = createClient();

  // Remove any old/stale subscriptions for this player so only the
  // current device endpoint remains — prevents duplicate notifications.
  console.log("[push] Cleaning old subscriptions for player:", playerId);
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("player_id", playerId)
    .neq("endpoint", json.endpoint!);

  console.log("[push] Saving subscription to database for player:", playerId);
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      player_id: playerId,
      endpoint: json.endpoint!,
      p256dh: json.keys!.p256dh,
      auth: json.keys!.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[push] Supabase upsert failed:", error.message, error.details, error.hint);
    return { ok: false, error: `DB save failed: ${error.message}` };
  }

  console.log("[push] Subscription saved successfully.");
  return { ok: true };
}
