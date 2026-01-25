import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./types";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Server-side Supabase query helpers
 * Provides reusable query functions for server components and API routes
 * 
 * Usage:
 *   const supabase = await createClient(); // or createServiceClient()
 *   const { getBoards } = createServerQueries(supabase);
 *   const boards = await getBoards(userId);
 */
export function createServerQueries(supabase: SupabaseClientType) {
  // ==================== Board Operations ====================

  /**
   * Get a board by ID, optionally verifying user ownership
   */
  async function getBoard(
    boardId: string,
    userId?: string
  ): Promise<Tables<"boards"> | null> {
    let query = supabase.from("boards").select("*").eq("id", boardId);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) return null;
    return data;
  }

  /**
   * Get all boards for a user
   */
  async function getBoards(userId: string): Promise<Tables<"boards">[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get a board by public slug
   */
  async function getBoardByPublicSlug(
    publicSlug: string
  ): Promise<Tables<"boards"> | null> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("public_slug", publicSlug)
      .eq("is_public", true)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== Goal Operations ====================

  /**
   * Get a goal by ID, optionally verifying user ownership
   */
  async function getGoal(
    goalId: string,
    userId?: string
  ): Promise<Tables<"goals"> | null> {
    let query = supabase.from("goals").select("*").eq("id", goalId);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) return null;
    return data;
  }

  /**
   * Get all goals for a user
   */
  async function getGoalsByUser(userId: string): Promise<Tables<"goals">[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get all goals for a board
   */
  async function getGoalsByBoard(boardId: string): Promise<Tables<"goals">[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get a goal by embed ID
   */
  async function getGoalByEmbedId(
    embedId: string
  ): Promise<Tables<"goals"> | null> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("embed_id", embedId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get a goal by embed ID with board information
   */
  async function getGoalByEmbedIdWithBoard(
    embedId: string
  ): Promise<(Tables<"goals"> & { boards: Tables<"boards"> | null }) | null> {
    const { data, error } = await supabase
      .from("goals")
      .select(
        `
        *,
        boards!inner (
          is_public,
          public_slug
        )
      `
      )
      .eq("embed_id", embedId)
      .single();

    if (error) return null;
    return data as (Tables<"goals"> & { boards: Tables<"boards"> | null }) | null;
  }

  /**
   * Verify that a goal belongs to a user
   */
  async function verifyGoalOwnership(
    goalId: string,
    userId: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from("goals")
      .select("id")
      .eq("id", goalId)
      .eq("user_id", userId)
      .single();

    return !!data;
  }

  // ==================== Record Operations ====================

  /**
   * Get all records for a goal
   */
  async function getRecordsByGoal(goalId: string): Promise<Tables<"records">[]> {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("goal_id", goalId)
      .order("timestamp", { ascending: false });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get a record by ID
   */
  async function getRecord(recordId: string): Promise<Tables<"records"> | null> {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("id", recordId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Verify that a record belongs to a user and goal
   */
  async function verifyRecordOwnership(
    recordId: string,
    goalId: string,
    userId: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from("records")
      .select("id")
      .eq("id", recordId)
      .eq("goal_id", goalId)
      .eq("user_id", userId)
      .single();

    return !!data;
  }

  /**
   * Create a new record
   */
  async function createRecord(data: {
    goal_id: string;
    user_id: string;
    amount: number;
    description?: string | null;
    timestamp: number;
  }): Promise<Tables<"records">> {
    const { data: record, error } = await supabase
      .from("records")
      .insert({
        goal_id: data.goal_id,
        user_id: data.user_id,
        amount: data.amount,
        description: data.description?.trim() || null,
        timestamp: data.timestamp,
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  /**
   * Update a record
   */
  async function updateRecord(
    recordId: string,
    updates: Partial<
      Pick<Tables<"records">, "amount" | "description" | "timestamp">
    >
  ): Promise<Tables<"records">> {
    const { data: record, error } = await supabase
      .from("records")
      .update(updates)
      .eq("id", recordId)
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  /**
   * Delete a record
   */
  async function deleteRecord(recordId: string): Promise<void> {
    const { error } = await supabase.from("records").delete().eq("id", recordId);

    if (error) throw error;
  }

  // ==================== Profile Operations ====================

  /**
   * Get a profile by user ID
   */
  async function getProfile(
    userId: string
  ): Promise<Tables<"profiles"> | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== API Token Operations ====================

  /**
   * Get all API tokens for a user
   */
  async function getApiTokens(
    userId: string
  ): Promise<Tables<"api_tokens">[]> {
    const { data, error } = await supabase
      .from("api_tokens")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get API tokens with limited fields (for display)
   */
  async function getApiTokensLimited(
    userId: string
  ): Promise<Pick<Tables<"api_tokens">, "id" | "name" | "created_at">[]> {
    const { data, error } = await supabase
      .from("api_tokens")
      .select("id, name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  }

  /**
   * Get API token by hashed token
   */
  async function getApiTokenByHash(
    hashedToken: string
  ): Promise<Tables<"api_tokens"> | null> {
    const { data, error } = await supabase
      .from("api_tokens")
      .select("user_id")
      .eq("hashed_token", hashedToken)
      .single();

    if (error) return null;
    return data as Tables<"api_tokens"> | null;
  }

  return {
    // Boards
    getBoard,
    getBoards,
    getBoardByPublicSlug,
    // Goals
    getGoal,
    getGoalsByUser,
    getGoalsByBoard,
    getGoalByEmbedId,
    getGoalByEmbedIdWithBoard,
    verifyGoalOwnership,
    // Records
    getRecordsByGoal,
    getRecord,
    verifyRecordOwnership,
    createRecord,
    updateRecord,
    deleteRecord,
    // Profiles
    getProfile,
    // API Tokens
    getApiTokens,
    getApiTokensLimited,
    getApiTokenByHash,
  };
}
