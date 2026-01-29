import { PublicBoardView } from "@/components/public/board-view";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PublicBoardPageProps {
  params: Promise<{ publicSlug: string }>;
}

export async function generateMetadata({ params }: PublicBoardPageProps) {
  const { publicSlug } = await params;
  const supabase = await createServiceClient();
  const { getBoardByPublicSlug } = createServerQueries(supabase);

  const board = await getBoardByPublicSlug(publicSlug);

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
  const { getBoardByPublicSlug, getGoalsByBoard } =
    createServerQueries(supabase);

  const board = await getBoardByPublicSlug(publicSlug);

  if (!board) {
    notFound();
  }

  const goals = await getGoalsByBoard(board.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-3 h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Target className="h-5 w-5 text-primary" />
            <span>GoalTrack</span>
          </Link>
          <span className="font-bold text-center">{board.name}</span>
          <div className="flex items-center gap-2 justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <PublicBoardView board={board} goals={goals} />
      </main>
    </div>
  );
}
