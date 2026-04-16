import {
  useDashboardActions,
  useDashboardSortField,
  useDashboardSortOrder,
} from "@/lib/store/event-dashboard";
import { EventsSortField } from "@targetless/domain";
import { Button } from "@targetless/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@targetless/ui/components/dropdown-menu";
import { cn } from "@targetless/ui/lib/utils";
import { ArrowDown, ArrowUp, CheckIcon, ChevronDown } from "lucide-react";

interface Props {
  className?: string;
}

export type DashboardSortingProps = Props;

const sortFieldOptions: { label: string; value: EventsSortField }[] = [
  { label: "Created Time", value: "createdAt" },
  { label: "Updated Time", value: "updatedAt" },
];

export function DashboardSorting({ className }: Props) {
  const sortField = useDashboardSortField();
  const sortOrder = useDashboardSortOrder();
  const { toggleSortOrder, setSortField } = useDashboardActions();

  return (
    <div className={cn("flex items-center gap-2 md:ms-auto", className)}>
      <span className="text-sm text-slate-400">Sort by</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            {sortField === "createdAt" ? "Created Time" : "Updated Time"}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sortFieldOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSortField(option.value)}
            >
              {sortField === option.value ? (
                <CheckIcon className="w-3.5 h-3.5" />
              ) : (
                <span className="inline-block w-4 h-4" />
              )}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
      >
        {sortOrder === "desc" ? (
          <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUp className="w-3.5 h-3.5" />
        )}
        {sortOrder === "desc" ? "Newest" : "Oldest"}
      </Button>
    </div>
  );
}
