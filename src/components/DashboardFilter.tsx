import { eventsApi } from "@/lib/api/events";
import {
  useDashboardActions,
  useDashboardFilter,
} from "@/lib/store/event-dashboard";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "./DashboardStatCard";

interface Props {
  className?: string;
}

export type DashboardFilterProps = Props;

export function DashboardFilter({ className }: Props) {
  const filter = useDashboardFilter();
  const { setFilter } = useDashboardActions();
  const statsQuery = eventsApi.stats.useQuery();
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <DashboardStatCard
        label="Active"
        value={statsQuery.data?.active ?? 0}
        active={filter === "active"}
        onClick={() => setFilter("active")}
      />
      <DashboardStatCard
        label="Completed"
        value={statsQuery.data?.completed ?? 0}
        active={filter === "completed"}
        onClick={() => setFilter("completed")}
      />
      <DashboardStatCard
        label="Total"
        value={statsQuery.data?.total ?? 0}
        active={filter === "total"}
        onClick={() => setFilter("total")}
      />
    </div>
  );
}
