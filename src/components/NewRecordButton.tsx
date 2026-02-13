import { PlusCircle, X } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { eventsApi } from "@/lib/api/events";
import {
  type EventDetail,
  type EventWithCurrentRecord,
} from "@/lib/event-store";
import { cn } from "@/lib/utils";
import { LoadingOr } from "./LoadingOr";

type NewRecordButtonProps = {
  event: EventWithCurrentRecord | EventDetail;
  disabled?: boolean;
  className?: string;
  buttonProps?: ComponentProps<typeof Button>;
  onSuccess?: () => void | Promise<void>;
};

export default function NewRecordButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: NewRecordButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [count, setCount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const mutation = eventsApi.createRecord.useMutation({
    onSuccess: async () => {
      setIsDialogOpen(false);
      if (onSuccess) {
        await onSuccess();
      }
    },
  });

  const isActiveMutation =
    mutation.isPending && mutation.variables?.eventId === event.id;

  const computedDisabled = disabled || event.completed || isActiveMutation;

  const {
    className: buttonClassName,
    variant,
    ...restButtonProps
  } = buttonProps ?? {};

  const finalClassName = cn(buttonClassName, className);

  const openDialog = () => {
    if (computedDisabled) {
      return;
    }
    setCount("0");
    setError(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (mutation.isPending) {
      return;
    }
    setIsDialogOpen(false);
  };

  const handleCreate = () => {
    const parsedCount = Number(count);
    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      setError("Count must be a non-negative number");
      return;
    }
    setError(null);
    mutation.mutate({
      eventId: event.id,
      count: parsedCount,
    });
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant ?? "primary"}
        {...restButtonProps}
        disabled={computedDisabled}
        onClick={openDialog}
        className={finalClassName}
      >
        <LoadingOr loading={isActiveMutation}>
          <PlusCircle className="h-4 w-4" />
        </LoadingOr>
        New Record
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
                Create New Record
              </p>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>
                Create a new record to continue tracking this event.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeDialog}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Starting Count
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                disabled={mutation.isPending}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
              disabled={mutation.isPending}
            >
              <LoadingOr loading={mutation.isPending}>
                <PlusCircle className="h-4 w-4" />
              </LoadingOr>
              Create Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
