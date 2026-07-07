import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@targetless/ui/components/Button";
import { RouteView } from "@targetless/ui/components/RouteView";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useState } from "react";
import { LoadingOr } from "@/components/LoadingOr";
import { eventsApi } from "@/lib/query/events";

export const Route = createFileRoute("/events/new")({
  component: CreateEventPage,
  head: () => ({
    meta: [{ title: "Create Event | Targetless" }],
  }),
});

function CreateEventPage() {
  const navigate = useNavigate({ from: "/events/new" });
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const mutation = eventsApi.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: eventsApi.list.getKey(),
      });
      navigate({ to: "/" });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const parsedCount = Number(count);

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      setError("Count must be a non-negative number");
      return;
    }

    mutation.mutate({ title: trimmedTitle, count: parsedCount });
  };

  return (
    <RouteView>
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground">Create an event</h1>
          <p className="text-sm text-muted-foreground">
            Name it and set the starting count for the first record.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning Run"
                className="rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Initial Count
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" shape="soft" size="lg" disabled={mutation.isPending} fullWidth>
              <LoadingOr loading={mutation.isPending}>
                <PlusCircle className="h-4 w-4" />
              </LoadingOr>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </RouteView>
  );
}
