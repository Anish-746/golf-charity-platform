// types/database.ts
// These types mirror your Supabase table columns exactly.
// Whenever you fetch data from a table, TypeScript will use these
// to tell you exactly what fields are available.

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "subscriber" | "admin";
  subscription_status: "active" | "inactive" | "cancelled" | "lapsed";
  stripe_customer_id: string | null;
  selected_charity_id: string | null;
  charity_percentage: number;
  created_at: string;
};

export type Score = {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website: string | null;
  is_featured: boolean;
  is_active: boolean;
  total_raised: number;
};

export type Draw = {
  id: string;
  draw_month: string;
  status: "draft" | "simulated" | "published";
  draw_type: "random" | "algorithmic";
  winning_numbers: number[] | null;
  jackpot_amount: number;
  four_match_pool: number;
  three_match_pool: number;
  total_entries: number;
  published_at: string | null;
};

export type Winner = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  verification_status: "pending" | "approved" | "rejected";
  proof_url: string | null;
  payout_status: "pending" | "paid";
  paid_at: string | null;
};
