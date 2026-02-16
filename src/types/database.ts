export type PlayerStatus = "paid" | "warning" | "overdue";

export interface Club {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Player {
  id: string;
  club_id: string;
  full_name: string;
  nfc_tag_id: string;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
}

export interface PlayerWithClub extends Player {
  clubs: Pick<Club, "name" | "slug">;
}

export interface PushSubscription {
  id: string;
  player_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
