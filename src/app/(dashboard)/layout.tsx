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
  let data = await fetchQuery(api.profiles.getCurrentProfile, {}, { token });
  if (!data?.userId) redirect("/login");

  if (!data.profile) {
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
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <DashboardNav
        user={{ id: data.userId, email: data.email ?? undefined }}
        profile={data.profile}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
