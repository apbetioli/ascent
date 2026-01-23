import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmbedGoalWidget } from "@/components/embed/goal-widget";

interface EmbedPageProps {
  params: Promise<{ embedId: string }>;
}

export async function generateMetadata({ params }: EmbedPageProps) {
  const { embedId } = await params;
  const supabase = await createServiceClient();

  const { data: goal } = await supabase
    .from("goals")
    .select("name")
    .eq("embed_id", embedId)
    .single();

  return {
    title: goal?.name ?? "Goal Widget",
    robots: "noindex, nofollow",
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { embedId } = await params;
  const supabase = await createServiceClient();

  // Get goal by embed_id
  const { data: goal, error } = await supabase
    .from("goals")
    .select(
      `
      *,
      boards!inner (
        is_public,
        public_slug
      )
    `
    )
    .eq("embed_id", embedId)
    .single();

  // Only allow embedding if the board is public
  if (error || !goal || !goal.boards?.is_public) {
    notFound();
  }

  return <EmbedGoalWidget goal={goal} />;
}
