import { DashboardNav } from "@/components/dashboard/nav";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const { getProfile } = createServerQueries(supabase);

  // Get user profile
  const profile = await getProfile(user.id);

  // Check if user has paid
  // If profile doesn't exist or hasn't paid, redirect to pricing
  if (!profile?.has_paid) {
    redirect("/#pricing");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
