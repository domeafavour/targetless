import { eventsApi } from "@/lib/api/events";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";
import { LoadingOr } from "./LoadingOr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/Button";

interface Props {
  id: string;
  title: string;
  children?: (props: { loading: boolean }) => ReactNode;
  onSuccess?: () => void;
}

export type DeleteEventProps = Props;

export function DeleteEvent({ children, id, title, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = eventsApi.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsApi.list.getKey() });
      onSuccess?.();
    },
  });

  const trigger = children ? (
    children({ loading: deleteMutation.isPending })
  ) : (
    <Button type="button" variant="danger" disabled={deleteMutation.isPending}>
      <LoadingOr loading={deleteMutation.isPending}>
        <Trash2 className="h-4 w-4" />
      </LoadingOr>
      Delete
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Delete Event
          </p>
          <AlertDialogTitle>Remove "{title}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the event and every record in its
            timeline. You cannot undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="danger"
            onClick={() => deleteMutation.mutate(id)}
            disabled={deleteMutation.isPending}
          >
            <LoadingOr loading={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </LoadingOr>
            Delete Event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
