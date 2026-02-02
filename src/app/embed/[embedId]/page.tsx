import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { notFound } from "next/navigation";
import { EmbedGoalWidget } from "@/components/embed/goal-widget";

interface EmbedPageProps {
  params: Promise<{ embedId: string }>;
}

export async function generateMetadata({ params }: EmbedPageProps) {
  const { embedId } = await params;
  const result = await fetchQuery(api.goals.getGoalByEmbedIdWithBoard, {
    embedId,
  });
  const goal = result?.goal;

  return {
    title: goal?.name ?? "Goal Widget",
    robots: "noindex, nofollow",
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { embedId } = await params;

  const result = await fetchQuery(api.goals.getGoalByEmbedIdWithBoard, {
    embedId,
  });

  if (!result || !result.board.isPublic) {
    notFound();
  }

  return <EmbedGoalWidget goal={result.goal} />;
}
