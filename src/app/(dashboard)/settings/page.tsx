import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata = {
  title: "Settings",
};

export default async function Settings() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get API tokens
  const { data: tokens } = await supabase
    .from("api_tokens")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <SettingsPage
      user={user}
      profile={profile}
      tokens={tokens ?? []}
    />
  );
}
