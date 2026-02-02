"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function useUser() {
  const userId = useQuery(api.profiles.getCurrentUserId);
  const currentUser = useQuery(api.profiles.getCurrentUser);
  const profile = useQuery(
    api.profiles.getProfile,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );
  const ensureProfile = useMutation(api.profiles.ensureProfileAndDefaultBoard);
  const { signIn, signOut } = useAuthActions();

  const loading = userId === undefined;
  const isAuthenticated = !!userId;
  const user = currentUser
    ? { id: currentUser.userId, email: currentUser.email ?? undefined }
    : null;

  const ensureProfileAndDefaultBoard = async (
    email?: string,
    name?: string,
    image?: string
  ) => {
    if (!userId) return;
    await ensureProfile({ userId: userId as Id<"users">, email, name, image });
  };

  return {
    userId: userId ?? null,
    user,
    profile: profile ?? null,
    loading,
    signOut,
    signIn,
    isAuthenticated,
    hasPaid: profile?.hasPaid ?? false,
    ensureProfileAndDefaultBoard,
  };
}
