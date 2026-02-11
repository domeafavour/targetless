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
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (mutation.isPending) {
      return;
    }
    setIsDialogOpen(false);
  };

  const handleComplete = () => {
    mutation.mutate({
      eventId: event.id,
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
          <CheckCircle2 className="h-4 w-4" />
        </LoadingOr>
        Complete Event
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
                Mark this event as completed.
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
              onClick={handleComplete}
              disabled={mutation.isPending}
            >
              <LoadingOr loading={mutation.isPending}>
                <CheckCircle2 className="h-4 w-4" />
              </LoadingOr>
              Complete Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
