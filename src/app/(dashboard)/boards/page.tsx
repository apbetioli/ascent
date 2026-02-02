import { BoardsTrelloView } from "@/components/dashboard/boards-trello-view";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "convex/_generated/api";

export const metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/login");

  const user = await fetchQuery(api.profiles.getCurrentUser, {}, { token });
  if (!user) redirect("/login");

  const boards = await fetchQuery(
    api.boards.listBoards,
    { userId: user.userId },
    { token }
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BoardsTrelloView boards={boards} className="min-h-0 flex-1" />
    </div>
  );
}
