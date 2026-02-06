import { BoardHeader } from "@/components/dashboard/board-header";
import { CreateGoalDialog } from "@/components/dashboard/create-goal-dialog";
import { GoalsList } from "@/components/dashboard/goals-list";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: BoardPageProps) {
  const { boardId } = await params;
  const token = await convexAuthNextjsToken();
  const board = token
    ? await fetchQuery(
        api.boards.getBoard,
        { boardId: boardId as Id<"boards"> },
        { token }
      )
    : null;
  return {
    title: board?.name ?? "Board",
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const token = await convexAuthNextjsToken();
  if (!token) notFound();

  const userId = await fetchQuery(api.profiles.getCurrentUserId, {}, { token });
  if (!userId) notFound();

  const board = await fetchQuery(
    api.boards.getBoard,
    { boardId: boardId as Id<"boards">, userId },
    { token }
  );

  if (!board) {
    notFound();
  }

  const goals = await fetchQuery(
    api.goals.listGoalsByBoard,
    { boardId: board._id },
    { token }
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-6">
      <div className="shrink-0 pb-4">
        <BoardHeader board={board}>
          <CreateGoalDialog
            boardId={board._id}
            existingGoalsCount={goals.length}
          />
        </BoardHeader>
      </div>
      <div className="min-h-0 min-w-0 shrink-0">
        <GoalsList boardId={board._id} />
      </div>
    </div>
  );
}
