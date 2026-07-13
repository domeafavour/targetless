import type { EventTag } from "@targetless/domain";
import { cn } from "@targetless/ui/lib/utils";
import { eventsApi } from "@/lib/query/events";
import { useDashboardActions, useDashboardTags } from "@/lib/store/event-dashboard";
import { TagChip } from "./TagChip";

interface Props {
  className?: string;
}

export type DashboardTagsProps = Props;

export function DashboardTags({ className }: Props) {
  const selectedTags = useDashboardTags() ?? [];
  const { setTags } = useDashboardActions();
  const { data: allTags = [], isLoading } = eventsApi.getAllTags.useQuery();

  const toggleTag = (tagId: string) => {
    const nextTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setTags(nextTags.length > 0 ? nextTags : undefined);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <span className="text-xs text-muted-foreground">Tags</span>
        <span className="rounded-md border px-2.5 py-1 text-xs opacity-50">Loading...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {allTags.length > 0 && (
        <span className="text-xs font-medium text-muted-foreground mr-0.5">Tags</span>
      )}
      {allTags.length === 0 ? (
        <span className="rounded-md border border-dashed px-2.5 py-1 text-xs text-muted-foreground">
          No tags
        </span>
      ) : (
        allTags.map((tag: EventTag) => (
          <TagChip
            key={tag.id}
            label={tag.title}
            selected={selectedTags.includes(tag.id)}
            onToggle={() => toggleTag(tag.id)}
            onClear={() => {
              const nextTags = selectedTags.filter((id) => id !== tag.id);
              setTags(nextTags.length > 0 ? nextTags : undefined);
            }}
            variant="filter"
          />
        ))
      )}
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={() => setTags(undefined)}
          className="rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &times; clear
        </button>
      )}
    </div>
  );
}
