import { PublicBoardView } from "@/components/public/board-view";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME } from "@/lib/app-name";
import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PublicBoardPageProps {
  params: Promise<{ publicSlug: string }>;
}

export async function generateMetadata({ params }: PublicBoardPageProps) {
  const { publicSlug } = await params;
  const board = await fetchQuery(api.boards.getBoardByPublicSlug, {
    publicSlug,
  });

  return {
    title: board?.name ?? "Public Board",
    description: `View goals on ${board?.name ?? "this public board"}`,
  };
}

export default async function PublicBoardPage({
  params,
}: PublicBoardPageProps) {
  const { publicSlug } = await params;

  const board = await fetchQuery(api.boards.getBoardByPublicSlug, {
    publicSlug,
  });

  if (!board) {
    notFound();
  }

  const goals = await fetchQuery(api.goals.listGoalsByBoard, {
    boardId: board._id,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-3 h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Target className="h-5 w-5 text-primary" />
            <span>{APP_NAME}</span>
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
