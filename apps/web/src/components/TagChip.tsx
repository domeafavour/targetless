import { cn } from "@targetless/ui/lib/utils";
import { X } from "lucide-react";

type TagChipProps = {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
  variant?: "filter" | "badge";
};

export function TagChip({
  label,
  selected = false,
  onToggle,
  onClear,
  variant = "filter",
}: TagChipProps) {
  if (variant === "badge") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border-l-2 border-primary/50 bg-primary/[0.06] px-2 py-0.5 text-xs font-medium text-primary/80">
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
      {selected && onClear && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onClear();
            }
          }}
          className="ml-0.5 rounded-sm p-0.5 hover:bg-primary-foreground/20"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
