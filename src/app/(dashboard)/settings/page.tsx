import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata = {
  title: "Settings",
};

export default async function Settings() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const { getProfile, getApiTokensLimited } = createServerQueries(supabase);

  // Get user profile
  const profile = await getProfile(user.id);

  // Get API tokens
  const tokens = await getApiTokensLimited(user.id);

  return (
    <SettingsPage
      user={user}
      profile={profile}
      tokens={tokens}
    />
  );
}
