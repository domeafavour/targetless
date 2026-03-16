import { Pencil, X } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";

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
  type UpdateEventTitleInput,
} from "@/lib/event-store";
import { cn } from "@/lib/utils";
import { LoadingOr } from "./LoadingOr";

type EditEventTitleButtonProps = {
  event: EventWithCurrentRecord | EventDetail;
  disabled?: boolean;
  className?: string;
  buttonProps?: ComponentProps<typeof Button>;
  onSuccess?: (
    data: unknown,
    variables: UpdateEventTitleInput,
  ) => void | Promise<void>;
};

export default function EditEventTitleButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: EditEventTitleButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [error, setError] = useState<string | null>(null);

  const mutation = eventsApi.updateTitle.useMutation({
    onSuccess: async (data, variables) => {
      setIsDialogOpen(false);
      if (onSuccess) {
        await onSuccess(data, variables);
      }
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      setTitle(event.title);
      setError(null);
    }
  }, [isDialogOpen, event.title]);

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

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    setError(null);
    mutation.mutate({ eventId: event.id, title: trimmedTitle });
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
        variant={variant ?? "outline"}
        {...restButtonProps}
        disabled={computedDisabled}
        onClick={openDialog}
        className={finalClassName}
      >
        <LoadingOr loading={isActiveMutation}>
          <Pencil className="h-4 w-4" />
        </LoadingOr>
        Edit Title
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
                Edit Title
              </p>
              <DialogTitle>Rename event</DialogTitle>
              <DialogDescription>
                Use <code className="font-mono text-cyan-300">@count</code> in
                the title to display the current count value.
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
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={mutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
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
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              <LoadingOr loading={mutation.isPending}>
                <Pencil className="h-4 w-4" />
              </LoadingOr>
              Save Title
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
