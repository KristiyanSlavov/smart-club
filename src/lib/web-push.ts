import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:noreply@smartclub.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export { webPush };
