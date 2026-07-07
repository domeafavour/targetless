import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@targetless/ui/components/Button";
import { RouteView } from "@targetless/ui/components/RouteView";
import { useState } from "react";
import { authApi } from "../lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign In | Targetless" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, error, isPending, isError } = authApi.signIn.useMutation({
    onSuccess: () => {
      navigate({ to: "/" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <RouteView>
      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col items-center justify-center px-4">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your email and password to continue
            </p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <p className="text-sm text-destructive">
                  {error instanceof Error ? error.message : "Login failed"}
                </p>
              </div>
            )}

            <Button type="submit" disabled={isPending} fullWidth>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </RouteView>
  );
}
