export type PlayerStatus = "paid" | "warning" | "overdue";

export interface Club {
  id: string;
  name: string;
  slug: string;
  emblem_url: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  club_id: string;
  full_name: string;
  nfc_tag_id: string;
  status: PlayerStatus;
  jersey_number: string | null;
  birth_date: string | null;
  team_group: number | null;
  last_payment_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerWithClub extends Player {
  clubs: Pick<Club, "name" | "slug" | "emblem_url">;
}

export interface PushSubscription {
  id: string;
  player_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
