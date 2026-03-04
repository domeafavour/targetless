import { eventsApi } from "@/lib/api/events";
import {
  useSortField,
  useSortFilter,
  useSortOrder,
} from "@/lib/store/event-dashboard";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardEventItem } from "./DashboardEventItem";

export function DashboardEvents() {
  const filter = useSortFilter();
  const sortField = useSortField();
  const sortOrder = useSortOrder();
  const { data } = eventsApi.list.useSuspenseQuery({
    variables: { filter, sortField, sortOrder },
  });

  return data.length === 0 ? (
    <DashboardEmptyState filter={filter} />
  ) : (
    <div className="space-y-4">
      {data.map((event) => (
        <DashboardEventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
