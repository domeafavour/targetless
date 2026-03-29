import { cn } from "@/lib/utils";

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
        "rounded-2xl border px-6 py-4 text-left transition-all hover:border-cyan-400/50",
        active
          ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/20"
          : "border-white/10 bg-white/5",
      )}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-[0.3em]",
          active ? "text-cyan-300" : "text-slate-400",
        )}
      >
        {label}
      </p>
      <p className="text-3xl font-black">
        {typeof value === "number" ? value : "-"}
      </p>
    </button>
  );
}
