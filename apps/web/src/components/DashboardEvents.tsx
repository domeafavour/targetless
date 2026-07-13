import { eventsApi } from "@/lib/query/events";
import {
  useDashboardFilter,
  useDashboardSortField,
  useDashboardSortOrder,
  useDashboardTags,
} from "@/lib/store/event-dashboard";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardEventItem } from "./DashboardEventItem";

export function DashboardEvents() {
  const filter = useDashboardFilter();
  const tags = useDashboardTags();
  const sortField = useDashboardSortField();
  const sortOrder = useDashboardSortOrder();
  const { data } = eventsApi.list.useSuspenseQuery({
    variables: { filter, sortField, sortOrder, tags },
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
