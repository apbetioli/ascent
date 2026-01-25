import { DashboardNav } from "@/components/dashboard/nav";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user has paid
  // If profile doesn't exist or hasn't paid, redirect to pricing
  if (profileError || !profile?.has_paid) {
    redirect("/#pricing");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
