export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Row types for each table
export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  payment_provider: string | null;
  payment_customer_id: string | null;
  has_paid: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  id: string;
  user_id: string;
  name: string;
  hashed_token: string;
  created_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  public_slug: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  embed_id: string;
  board_id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: number | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  is_reverse: boolean;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  description: string | null;
  timestamp: number;
}

// Database type for Supabase client - use 'any' for flexibility
// In production, generate proper types with: npx supabase gen types typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

// Table type aliases for convenience
export type Tables<T extends "profiles" | "api_tokens" | "boards" | "goals" | "records"> = 
  T extends "profiles" ? Profile :
  T extends "api_tokens" ? ApiToken :
  T extends "boards" ? Board :
  T extends "goals" ? Goal :
  T extends "records" ? Record :
  never;

export type InsertTables<T extends "profiles" | "api_tokens" | "boards" | "goals" | "records"> = 
  Partial<Tables<T>> & Pick<Tables<T>, "id" extends keyof Tables<T> ? never : never>;

export type UpdateTables<T extends "profiles" | "api_tokens" | "boards" | "goals" | "records"> = 
  Partial<Tables<T>>;
