import { cn } from "@targetless/ui/lib/utils";

export function DashboardStatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-5 py-3 text-left transition-all",
        active ? "border-primary bg-primary/10" : "border bg-card hover:border-primary/30",
      )}
    >
      <p className={cn("text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
        {typeof value === "number" ? value : "-"}
      </p>
    </button>
  );
}
