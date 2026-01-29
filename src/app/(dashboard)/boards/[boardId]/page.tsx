import { BoardHeader } from "@/components/dashboard/board-header";
import { CreateGoalDialog } from "@/components/dashboard/create-goal-dialog";
import { GoalsList } from "@/components/dashboard/goals-list";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { notFound } from "next/navigation";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: BoardPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();
  const { getBoard } = createServerQueries(supabase);
  const board = await getBoard(boardId);

  return {
    title: board?.name ?? "Board",
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const { getBoard, getGoalsByBoard } = createServerQueries(supabase);

  const board = await getBoard(boardId, user.id);

  if (!board) {
    notFound();
  }

  const goals = await getGoalsByBoard(boardId);

  return (
    <div className="space-y-6">
      <BoardHeader board={board}>
        <CreateGoalDialog
          boardId={boardId}
          existingGoalsCount={goals.length}
        />
      </BoardHeader>

      <GoalsList goals={goals} boardId={boardId} />
    </div>
  );
}
