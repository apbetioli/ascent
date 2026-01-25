import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { BoardsList } from "@/components/dashboard/boards-list";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";

export const metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const { getBoards } = createServerQueries(supabase);

  // Get user's boards (single board created only on signup via DB trigger)
  const boards = await getBoards(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground">
            Organize your goals into boards
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      <BoardsList boards={boards} />
    </div>
  );
}
