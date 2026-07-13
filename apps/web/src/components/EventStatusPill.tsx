import { CheckCircle2, CircleDashed } from "lucide-react";

type EventStatusPillProps = {
  completed: boolean;
};

export default function EventStatusPill({ completed }: EventStatusPillProps) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-2/20 px-2.5 py-0.5 text-xs font-medium text-chart-2">
        <CheckCircle2 className="h-3 w-3" /> Done
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
      <CircleDashed className="h-3 w-3" /> Active
    </span>
  );
}
