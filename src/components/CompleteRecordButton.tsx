import { useForm } from "@tanstack/react-form";
import { CheckCircle2, X } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { eventsApi } from "@/lib/api/events";
import {
  type CompleteRecordInput,
  type EventDetail,
  type EventWithCurrentRecord,
} from "@/lib/event-store";
import { cn } from "@/lib/utils";
import { LoadingOr } from "./LoadingOr";

type CompleteRecordButtonProps = {
  event: EventWithCurrentRecord | EventDetail;
  disabled?: boolean;
  className?: string;
  buttonProps?: ComponentProps<typeof Button>;
  onSuccess?: (
    data: EventWithCurrentRecord,
    variables: CompleteRecordInput,
  ) => void | Promise<void>;
};

function getCurrentRecordCount(
  event: EventWithCurrentRecord | EventDetail,
  defaultValue = 0,
): number {
  return event.currentRecord?.count ?? defaultValue;
}

const NEXT_COUNT_PATTERN = /^([+-]?)(\d+)$/;
const COMPLETE_RECORD_NEXT_COUNT_STORAGE_KEY_PREFIX =
  "completeRecord.nextCount";

function getCompleteRecordNextCountStorageKey(eventId: string): string {
  return `${COMPLETE_RECORD_NEXT_COUNT_STORAGE_KEY_PREFIX}.${eventId}`;
}

function getDefaultNextCount(
  event: EventWithCurrentRecord | EventDetail,
): string {
  const fallback = getCurrentRecordCount(event) + "";

  try {
    const stored = localStorage.getItem(
      getCompleteRecordNextCountStorageKey(event.id),
    );
    return stored ?? fallback;
  } catch {
    return fallback;
  }
}

function saveEventNextCount(eventId: string, nextCount: string) {
  try {
    localStorage.setItem(
      getCompleteRecordNextCountStorageKey(eventId),
      nextCount,
    );
  } catch {
    // Ignore storage errors
  }
}

function getRealNextCount(
  currentCount: number,
  nextCountInput: string,
): number | null {
  const matches = nextCountInput.match(NEXT_COUNT_PATTERN);
  if (!matches) {
    return null;
  }
  const [, sign, num] = matches;
  const inputNum = Number(num);
  if (sign === "+") {
    return currentCount + inputNum;
  }
  if (sign === "-") {
    return currentCount - inputNum;
  }

  return inputNum;
}

const quickOptions: { label: string; value: "current" | (string & {}) }[] = [
  { label: '"+1"', value: "+1" },
  { label: '"+10"', value: "+10" },
  { label: "current", value: "current" },
  { label: '"-1"', value: "-1" },
  { label: '"-10"', value: "-10" },
];

export default function CompleteRecordButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: CompleteRecordButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = eventsApi.completeRecord.useMutation({});

  const form = useForm({
    defaultValues: {
      createNext: true,
      nextCount: getDefaultNextCount(event),
    } as { createNext: boolean; nextCount: string },
    onSubmit: (p) => {
      if (!event.currentRecord) {
        return;
      }

      mutation.mutate(
        {
          eventId: event.id,
          createNext: p.value.createNext,
          nextCount: p.value.createNext
            ? (getRealNextCount(event.currentRecord.count, p.value.nextCount) ??
              undefined)
            : undefined,
        },
        {
          onSuccess: async (data, variables) => {
            setIsDialogOpen(false);

            if (p.value.nextCount) {
              saveEventNextCount(event.id, p.value.nextCount);
            }

            if (onSuccess) {
              await onSuccess(data, variables);
            }
          },
        },
      );
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
    form.reset();
    mutation.reset();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (mutation.isPending) {
      return;
    }
    setIsDialogOpen(false);
  };

  const handleComplete = () => {
    form.handleSubmit();
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
        Complete Record
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="space-y-0 gap-3">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-3">
              <DialogTitle className="text-cyan-300">
                Complete Record
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <DialogDescription>
            Confirm the completion and optionally set up the next record.
          </DialogDescription>

          <div className="mt-4 flex flex-col gap-4">
            <form.Field name="createNext">
              {(field) => (
                <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 rounded border border-white/30 bg-transparent"
                    disabled={mutation.isPending}
                  />
                  <span className="whitespace-nowrap">Create next record</span>
                </label>
              )}
            </form.Field>

            <form.Field
              name="nextCount"
              validators={{
                onChangeListenTo: ["createNext"],
                onChange: ({ value, fieldApi }) => {
                  if (fieldApi.form.getFieldValue("createNext")) {
                    if (!NEXT_COUNT_PATTERN.test(value)) {
                      return "Enter a valid number, optionally prefixed with + or -";
                    }
                  }
                },
              }}
            >
              {(field) => (
                <fieldset className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-row gap-4 items-center">
                    <input
                      value={field.state.value}
                      name={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={mutation.isPending}
                      placeholder="Please enter the next count (e.g., 10, +5, -3)"
                      className={cn(
                        "text-2xl font-bold flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none",
                        "placeholder:text-lg",
                      )}
                    />
                    <strong className="text-cyan-300 shrink-0 font-semibold font-mono text-2xl">
                      {getRealNextCount(
                        event.currentRecord?.count ?? 0,
                        field.state.value,
                      )}
                    </strong>
                  </div>
                  {!field.state.meta.isValid && (
                    <small className="text-destructive" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </small>
                  )}
                </fieldset>
              )}
            </form.Field>

            <div className="flex flex-row gap-4 items-center">
              {quickOptions.map((opt) => (
                <Button
                  key={opt.value}
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    if (opt.value === "current") {
                      form.setFieldValue(
                        "nextCount",
                        getCurrentRecordCount(event) + "",
                      );
                    } else {
                      form.setFieldValue("nextCount", opt.value);
                    }
                  }}
                >
                  {opt.value === "current"
                    ? `current (${getCurrentRecordCount(event)})`
                    : opt.label}
                </Button>
              ))}
            </div>

            {mutation.error ? (
              <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {mutation.error.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isValid}>
              {(isValid) => (
                <Button
                  type="button"
                  variant="success"
                  onClick={handleComplete}
                  disabled={mutation.isPending || !isValid}
                >
                  <LoadingOr loading={mutation.isPending}>
                    <CheckCircle2 className="h-4 w-4" />
                  </LoadingOr>
                  Confirm Completion
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
