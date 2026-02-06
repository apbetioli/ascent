import { BoardsTrelloView } from "@/components/dashboard/boards-trello-view";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";

export const metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const boards = await fetchQuery(
    api.boards.listBoards,
    {},
    { token: await convexAuthNextjsToken() }
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BoardsTrelloView boards={boards} className="min-h-0 flex-1 overflow-hidden" />
    </div>
  );
}
