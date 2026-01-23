import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardView } from "@/components/public/board-view";
import Link from "next/link";
import { Target } from "lucide-react";

interface PublicBoardPageProps {
  params: Promise<{ publicSlug: string }>;
}

export async function generateMetadata({ params }: PublicBoardPageProps) {
  const { publicSlug } = await params;
  const supabase = await createServiceClient();

  const { data: board } = await supabase
    .from("boards")
    .select("name")
    .eq("public_slug", publicSlug)
    .eq("is_public", true)
    .single();

  return {
    title: board?.name ?? "Public Board",
    description: `View goals on ${board?.name ?? "this public board"}`,
  };
}

export default async function PublicBoardPage({
  params,
}: PublicBoardPageProps) {
  const { publicSlug } = await params;
  const supabase = await createServiceClient();

  // Get board by public_slug
  const { data: board, error } = await supabase
    .from("boards")
    .select("*")
    .eq("public_slug", publicSlug)
    .eq("is_public", true)
    .single();

  if (error || !board) {
    notFound();
  }

  // Get goals for this board
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("board_id", board.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Target className="h-5 w-5 text-primary" />
            <span>GoalTrack</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <PublicBoardView board={board} goals={goals ?? []} />
      </main>
    </div>
  );
}
