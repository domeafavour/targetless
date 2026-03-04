import { eventsApi } from "@/lib/api/events";
import {
  useDashboardFilter,
  useDashboardSortField,
  useDashboardSortOrder,
} from "@/lib/store/event-dashboard";
import { cn } from "@/lib/utils";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";

export function RefreshEventsButton() {
  const queryClient = useQueryClient();
  const filter = useDashboardFilter();
  const sortField = useDashboardSortField();
  const sortOrder = useDashboardSortOrder();

  const isFetching = useIsFetching({
    queryKey: eventsApi.list.getKey({ filter, sortField, sortOrder }),
  });

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        queryClient.invalidateQueries({
          queryKey: eventsApi.list.getKey(),
        })
      }
      disabled={isFetching > 0}
    >
      <RefreshCw className={cn("w-4 h-4", isFetching > 0 && "animate-spin")} />
      Refresh
    </Button>
  );
}
