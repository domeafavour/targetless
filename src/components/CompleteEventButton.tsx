import { CheckCircle2, X } from "lucide-react";
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
  type CompleteEventInput,
  type EventDetail,
  type EventWithCurrentRecord,
} from "@/lib/event-store";
import { cn } from "@/lib/utils";
import { LoadingOr } from "./LoadingOr";

type CompleteEventButtonProps = {
  event: EventWithCurrentRecord | EventDetail;
  disabled?: boolean;
  className?: string;
  buttonProps?: ComponentProps<typeof Button>;
  onSuccess?: (
    data: EventWithCurrentRecord,
    variables: CompleteEventInput,
  ) => void | Promise<void>;
};

export default function CompleteEventButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: CompleteEventButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createNext, setCreateNext] = useState(false);
  const [nextCount, setNextCount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const mutation = eventsApi.complete.useMutation({
    onSuccess: async (data, variables) => {
      setIsDialogOpen(false);
      if (onSuccess) {
        await onSuccess(data, variables);
      }
    },
  });

  const isActiveMutation =
    mutation.isPending && mutation.variables?.eventId === event.id;

  const computedDisabled =
    disabled || !event.currentRecord || event.completed || isActiveMutation;

  const {
    className: buttonClassName,
    variant,
    ...restButtonProps
  } = buttonProps ?? {};

  const finalClassName = cn(buttonClassName, className);

  const openDialog = () => {
    if (computedDisabled || !event.currentRecord) {
      return;
    }
    setCreateNext(Boolean(event.currentRecord));
    setNextCount(String(event.currentRecord?.count ?? 0));
    setError(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (mutation.isPending) {
      return;
    }
    setIsDialogOpen(false);
  };

  const handleComplete = () => {
    if (!event.currentRecord) {
      return;
    }
    let parsedCount: number | undefined;
    if (createNext) {
      parsedCount = Number(nextCount);
      if (!Number.isFinite(parsedCount) || parsedCount < 0) {
        setError("Count must be a non-negative number");
        return;
      }
    }
    setError(null);
    mutation.mutate({
      eventId: event.id,
      createNext,
      nextCount: parsedCount,
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
        variant={variant ?? "success"}
        {...restButtonProps}
        disabled={computedDisabled}
        onClick={openDialog}
        className={finalClassName}
      >
        <LoadingOr loading={isActiveMutation}>
          <CheckCircle2 className="h-4 w-4" />
        </LoadingOr>
        Complete
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
                Complete Event
              </p>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>
                Confirm the completion and optionally set up the next record.
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
            <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              <input
                type="checkbox"
                checked={createNext}
                onChange={(e) => setCreateNext(e.target.checked)}
                className="h-4 w-4 rounded border border-white/30 bg-transparent text-cyan-400"
                disabled={mutation.isPending}
              />
              Create next record
            </label>

            {createNext ? (
              <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                Starting Count
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={nextCount}
                  onChange={(e) => setNextCount(e.target.value)}
                  disabled={mutation.isPending}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </label>
            ) : null}

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
              variant="success"
              onClick={handleComplete}
              disabled={mutation.isPending}
            >
              <LoadingOr loading={mutation.isPending}>
                <CheckCircle2 className="h-4 w-4" />
              </LoadingOr>
              Confirm Completion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
