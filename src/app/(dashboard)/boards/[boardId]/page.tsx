import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BoardHeader } from "@/components/dashboard/board-header";
import { GoalsList } from "@/components/dashboard/goals-list";
import { CreateGoalDialog } from "@/components/dashboard/create-goal-dialog";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: BoardPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();
  const { data: board } = await supabase
    .from("boards")
    .select("name")
    .eq("id", boardId)
    .single<{ name: string }>();

  return {
    title: board?.name ?? "Board",
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  // Get board with goals
  const { data: board, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .eq("user_id", user.id)
    .single();

  if (error || !board) {
    notFound();
  }

  // Get goals for this board
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("board_id", boardId)
    .order("sort_order", { ascending: true });

  // Get user profile for timezone
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single<{ timezone: string }>();

  return (
    <div className="space-y-6">
      <BoardHeader board={board} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Goals</h2>
          <p className="text-sm text-muted-foreground">
            {goals?.length ?? 0} goal{goals?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateGoalDialog
          boardId={boardId}
          existingGoalsCount={goals?.length ?? 0}
        />
      </div>

      <GoalsList
        goals={goals ?? []}
        boardId={boardId}
        timezone={profile?.timezone ?? "UTC"}
      />
    </div>
  );
}
