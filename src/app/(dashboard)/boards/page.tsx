import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { BoardsTrelloView } from "@/components/dashboard/boards-trello-view";

export const metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const { getBoards, getGoalsByUser } = createServerQueries(supabase);

  const [boards, allGoals] = await Promise.all([
    getBoards(user.id),
    getGoalsByUser(user.id),
  ]);

  const goalsByBoardId = allGoals.reduce<Record<string, typeof allGoals>>(
    (acc, goal) => {
      if (!acc[goal.board_id]) acc[goal.board_id] = [];
      acc[goal.board_id].push(goal);
      return acc;
    },
    {}
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BoardsTrelloView
        boards={boards}
        goalsByBoardId={goalsByBoardId}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
