"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

/**
 * Custom hook that provides all Supabase database operations
 * Centralizes all queries and mutations for better maintainability
 */
export function useSupabase() {
  const supabase = createClient();

  // ==================== Auth Operations ====================

  /**
   * Get the current authenticated user from session (cached, no network request)
   */
  const getUser = useCallback(async (): Promise<User | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  }, [supabase]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, [supabase]);

  /**
   * Sign in with OTP (One-Time Password)
   */
  const signInWithOtp = useCallback(
    async (
      email: string,
      options?: {
        emailRedirectTo?: string;
      }
    ) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options,
      });
      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = useCallback(
    async (provider: "google" | "github", redirectTo?: string) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    },
    [supabase]
  );

  // ==================== Board Operations ====================

  /**
   * Create a new board
   */
  const createBoard = useCallback(
    async (data: {
      user_id: string;
      name: string;
      theme?: string;
    }): Promise<Tables<"boards">> => {
      const { data: board, error } = await supabase
        .from("boards")
        .insert({
          user_id: data.user_id,
          name: data.name.trim(),
          theme: data.theme ?? "default",
        })
        .select()
        .single();

      if (error) throw error;
      return board;
    },
    [supabase]
  );

  /**
   * Update a board
   */
  const updateBoard = useCallback(
    async (
      boardId: string,
      updates: Partial<Pick<Tables<"boards">, "name" | "is_public">>
    ): Promise<void> => {
      const { error } = await supabase
        .from("boards")
        .update(updates)
        .eq("id", boardId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Delete a board
   */
  const deleteBoard = useCallback(
    async (boardId: string): Promise<void> => {
      const { error } = await supabase.from("boards").delete().eq("id", boardId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Get a board by ID
   */
  const getBoard = useCallback(
    async (
      boardId: string,
      userId?: string
    ): Promise<Tables<"boards"> | null> => {
      let query = supabase.from("boards").select("*").eq("id", boardId);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  /**
   * Get all boards for a user
   */
  const getBoards = useCallback(
    async (userId: string): Promise<Tables<"boards">[]> => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    [supabase]
  );

  /**
   * Get a board by public slug
   */
  const getBoardByPublicSlug = useCallback(
    async (publicSlug: string): Promise<Tables<"boards"> | null> => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("public_slug", publicSlug)
        .eq("is_public", true)
        .single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  // ==================== Goal Operations ====================

  /**
   * Create a new goal
   */
  const createGoal = useCallback(
    async (data: {
      board_id: string;
      user_id: string;
      name: string;
      target_amount: number;
      deadline?: number | null;
      recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
      format?: "number" | "currency";
      color: string;
      sort_order: number;
    }): Promise<Tables<"goals">> => {
      const { data: goal, error } = await supabase
        .from("goals")
        .insert({
          board_id: data.board_id,
          user_id: data.user_id,
          name: data.name.trim(),
          target_amount: data.target_amount,
          current_amount: 0,
          deadline: data.deadline ?? null,
          recurrence: data.recurrence ?? "none",
          format: data.format ?? "number",
          color: data.color,
          sort_order: data.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return goal;
    },
    [supabase]
  );

  /**
   * Update a goal
   */
  const updateGoal = useCallback(
    async (
      goalId: string,
      updates: Partial<
        Pick<
          Tables<"goals">,
          | "name"
          | "target_amount"
          | "deadline"
          | "recurrence"
          | "format"
          | "color"
        >
      >
    ): Promise<void> => {
      const updateData: Partial<
        Pick<
          Tables<"goals">,
          | "name"
          | "target_amount"
          | "deadline"
          | "recurrence"
          | "format"
          | "color"
        >
      > = { ...updates };
      if (updates.name) {
        updateData.name = updates.name.trim();
      }

      const { error } = await supabase
        .from("goals")
        .update(updateData)
        .eq("id", goalId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Delete a goal
   */
  const deleteGoal = useCallback(
    async (goalId: string): Promise<void> => {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Get a goal by ID
   */
  const getGoal = useCallback(
    async (goalId: string): Promise<Tables<"goals"> | null> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  /**
   * Get goals by board ID
   */
  const getGoalsByBoard = useCallback(
    async (boardId: string): Promise<Tables<"goals">[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("board_id", boardId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    [supabase]
  );

  /**
   * Get a goal by embed ID
   */
  const getGoalByEmbedId = useCallback(
    async (embedId: string): Promise<Tables<"goals"> | null> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("embed_id", embedId)
        .single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  // ==================== Record Operations ====================

  /**
   * Create a new record
   */
  const createRecord = useCallback(
    async (data: {
      goal_id: string;
      user_id: string;
      amount: number;
      description?: string | null;
      timestamp: number;
    }): Promise<void> => {
      const { error } = await supabase.from("records").insert({
        goal_id: data.goal_id,
        user_id: data.user_id,
        amount: data.amount,
        description: data.description?.trim() || null,
        timestamp: data.timestamp,
      });

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Delete a record
   */
  const deleteRecord = useCallback(
    async (recordId: string): Promise<void> => {
      const { error } = await supabase
        .from("records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Get records by goal ID
   */
  const getRecordsByGoal = useCallback(
    async (goalId: string): Promise<Tables<"records">[]> => {
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("goal_id", goalId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    [supabase]
  );

  // ==================== Profile Operations ====================

  /**
   * Get a profile by user ID
   */
  const getProfile = useCallback(
    async (userId: string): Promise<Tables<"profiles"> | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  /**
   * Update a profile
   */
  const updateProfile = useCallback(
    async (
      userId: string,
      updates: Partial<
        Pick<Tables<"profiles">, "name" | "timezone" | "avatar_url">
      >
    ): Promise<void> => {
      const updateData: Partial<
        Pick<Tables<"profiles">, "name" | "timezone" | "avatar_url">
      > = { ...updates };
      if (updates.name) {
        updateData.name = updates.name.trim();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Upsert a profile (create or update)
   */
  const upsertProfile = useCallback(
    async (data: Partial<Tables<"profiles">> & { id: string }): Promise<void> => {
      const { error } = await supabase.from("profiles").upsert(data);

      if (error) throw error;
    },
    [supabase]
  );

  // ==================== API Token Operations ====================

  /**
   * Create an API token (via API endpoint)
   * Note: This is handled by the API route for security
   */
  const createApiToken = useCallback(
    async (name: string): Promise<{ token: string }> => {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create token");
      }

      return data;
    },
    []
  );

  /**
   * Delete an API token
   */
  const deleteApiToken = useCallback(
    async (tokenId: string): Promise<void> => {
      const { error } = await supabase
        .from("api_tokens")
        .delete()
        .eq("id", tokenId);

      if (error) throw error;
    },
    [supabase]
  );

  /**
   * Get API tokens for a user
   */
  const getApiTokens = useCallback(
    async (userId: string): Promise<Tables<"api_tokens">[]> => {
      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    [supabase]
  );

  return {
    // Auth
    getUser,
    signOut,
    signInWithOtp,
    signInWithOAuth,
    // Boards
    createBoard,
    updateBoard,
    deleteBoard,
    getBoard,
    getBoards,
    getBoardByPublicSlug,
    // Goals
    createGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    getGoalsByBoard,
    getGoalByEmbedId,
    // Records
    createRecord,
    deleteRecord,
    getRecordsByGoal,
    // Profiles
    getProfile,
    updateProfile,
    upsertProfile,
    // API Tokens
    createApiToken,
    deleteApiToken,
    getApiTokens,
  };
}
