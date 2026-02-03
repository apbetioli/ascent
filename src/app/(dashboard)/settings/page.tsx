import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { SettingsPage } from "@/components/dashboard/settings-page";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
};

export default async function Settings() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/login?redirect=/settings");
  }

  const userId = await fetchQuery(api.profiles.getCurrentUserId, {}, { token });
  if (!userId) {
    redirect("/login?redirect=/settings");
  }

  const profile = await fetchQuery(
    api.profiles.getProfile,
    { userId },
    { token }
  );
  const tokens = await fetchQuery(
    api.apiTokens.listApiTokensLimited,
    { userId },
    { token }
  );

  const user = await fetchQuery(api.profiles.getCurrentUser, {}, { token });
  if (!user) {
    redirect("/login?redirect=/settings");
  }

  return (
    <SettingsPage
      user={{ id: userId, email: user.email ?? undefined }}
      profile={profile}
      tokens={tokens.map(
        (t: { _id: Id<"apiTokens">; _creationTime: number; name: string }) => ({
          id: t._id,
          name: t.name,
          created_at: new Date(t._creationTime).toISOString(),
        })
      )}
    />
  );
}
