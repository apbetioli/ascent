import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BoardsList } from "@/components/dashboard/boards-list";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";

export const metadata = {
  title: "My Boards",
};

export default async function BoardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's boards
  let { data: boards } = await supabase
    .from("boards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // If user has no boards, create a default one
  if (!boards || boards.length === 0) {
    const { data: newBoard, error } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        name: "My Goals",
        theme: "default",
      })
      .select()
      .single();

    if (!error && newBoard) {
      boards = [newBoard];
    }
  }

  // If user has exactly one board, redirect directly to it
  if (boards && boards.length === 1) {
    redirect(`/boards/${boards[0].id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Boards</h1>
          <p className="text-muted-foreground">
            Organize your goals into boards
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      <BoardsList boards={boards ?? []} />
    </div>
  );
}
