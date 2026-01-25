import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { notFound } from "next/navigation";
import { EmbedGoalWidget } from "@/components/embed/goal-widget";

interface EmbedPageProps {
  params: Promise<{ embedId: string }>;
}

export async function generateMetadata({ params }: EmbedPageProps) {
  const { embedId } = await params;
  const supabase = await createServiceClient();
  const { getGoalByEmbedId } = createServerQueries(supabase);

  const goal = await getGoalByEmbedId(embedId);

  return {
    title: goal?.name ?? "Goal Widget",
    robots: "noindex, nofollow",
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { embedId } = await params;
  const supabase = await createServiceClient();
  const { getGoalByEmbedIdWithBoard } = createServerQueries(supabase);

  // Get goal by embed_id with board information
  const goal = await getGoalByEmbedIdWithBoard(embedId);

  // Only allow embedding if the board is public
  if (!goal || !goal.boards?.is_public) {
    notFound();
  }

  return <EmbedGoalWidget goal={goal} />;
}
