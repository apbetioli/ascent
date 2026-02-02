import { DashboardNav } from "@/components/dashboard/nav";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "convex/_generated/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();

  if (!token) {
    redirect("/login");
  }

  const user = await fetchQuery(api.profiles.getCurrentUser, {}, { token });
  if (!user) {
    redirect("/login");
  }

  let profile = await fetchQuery(
    api.profiles.getProfile,
    { userId: user.userId },
    { token }
  );

  if (!profile) {
    await fetchMutation(
      api.profiles.ensureProfileAndDefaultBoard,
      { userId: user.userId, email: user.email, name: user.name },
      { token }
    );
    profile = await fetchQuery(
      api.profiles.getProfile,
      { userId: user.userId },
      { token }
    );
  }

  if (!profile?.hasPaid) {
    redirect("/#pricing");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <DashboardNav
        user={{ id: user.userId, email: user.email ?? undefined }}
        profile={profile}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
