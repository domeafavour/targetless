import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

import type {
  EventsFilter,
  EventsSortField,
  EventsSortOrder,
} from "@targetless/domain";

interface EventDashboardState {
  filter: EventsFilter;
  tags?: string[]; // filter by tag IDs
  sortField: EventsSortField;
  sortOrder: EventsSortOrder;
  setFilter: (filter: EventsFilter) => void;
  setSortField: (sortField: EventsSortField) => void;
  setSortOrder: (sortOrder: EventsSortOrder) => void;
  setTags: (tags?: string[]) => void;
  toggleSortOrder: () => void;
}

export const useEventDashboardStore = create<EventDashboardState>()(
  persist(
    (set) => ({
      filter: "active",
      sortField: "createdAt",
      sortOrder: "desc",
      setFilter: (filter) => set({ filter }),
      setSortField: (sortField) => set({ sortField }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setTags: (tags) => set({ tags }),
      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
        })),
    }),
    {
      name: "targetless-dashboard",
    },
  ),
);

export function useDashboardFilter() {
  return useEventDashboardStore((state) => state.filter);
}

export function useDashboardSortField() {
  return useEventDashboardStore((state) => state.sortField);
}

export function useDashboardSortOrder() {
  return useEventDashboardStore((state) => state.sortOrder);
}

export function useDashboardTags() {
  return useEventDashboardStore((state) => state.tags);
}

export function useDashboardActions() {
  return useEventDashboardStore(
    useShallow((state) => ({
      setFilter: state.setFilter,
      setSortField: state.setSortField,
      setSortOrder: state.setSortOrder,
      toggleSortOrder: state.toggleSortOrder,
      setTags: state.setTags,
    })),
  );
}
