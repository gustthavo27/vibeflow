import { KanbanBoard } from "@/components/kanban/kanban-board";
import { mockDeals } from "@/lib/mock-data";

export default function PipelinePage() {
  return (
    <div className="h-full min-h-0">
      <KanbanBoard initialDeals={mockDeals} />
    </div>
  );
}
