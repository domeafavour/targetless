import type { EventTag } from "@targetless/domain";
import { Button } from "@targetless/ui/components/Button";
import { cn } from "@targetless/ui/lib/utils";
import { eventsApi } from "@/lib/query/events";
import { useDashboardActions, useDashboardTags } from "@/lib/store/event-dashboard";

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
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button variant="outline" size="sm" disabled>
          Loading tags...
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {allTags.length === 0 ? (
          <Button variant="outline" size="sm" disabled>
            No tags available
          </Button>
        ) : (
          allTags.map((tag: EventTag) => {
            const selected = selectedTags.includes(tag.id);
            return (
              <Button
                key={tag.id}
                type="button"
                variant={selected ? "primary" : "outline"}
                size="sm"
                shape="pill"
                className="normal-case"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.title}
              </Button>
            );
          })
        )}
        {selectedTags.length > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setTags(undefined)}>
            Clear selected tags
          </Button>
        ) : null}
      </div>
    </div>
  );
}
