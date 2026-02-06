import { DashboardNav } from "@/components/dashboard/nav";
import { ViewportLock } from "@/components/dashboard/viewport-lock";
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
  let data = await fetchQuery(api.profiles.getCurrentProfile, {}, { token });

  if (!data?.profile) {
    await fetchMutation(
      api.profiles.ensureProfileAndDefaultBoard,
      {},
      {
        token,
      }
    );
    data = await fetchQuery(api.profiles.getCurrentProfile, {}, { token });
  }
  if (!data?.profile) redirect("/login");
  if (!data.profile.hasPaid) redirect("/#pricing");

  return (
    <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-background">
      <ViewportLock />
      <DashboardNav
        user={{ id: data.userId, email: data.email ?? undefined }}
        profile={data.profile}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
