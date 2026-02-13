import { afterEach, describe, expect, it, vi } from "vitest";

describe("supabase fallback client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns empty auth state when env vars are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "");

    const { supabase } = await import("./supabase");

    const session = await supabase.auth.getSession();
    const user = await supabase.auth.getUser();
    const authState = supabase.auth.onAuthStateChange(() => undefined);

    expect(session.data.session).toBeNull();
    expect(user.data.user).toBeNull();
    expect(session.error).toBeInstanceOf(Error);
    expect(session.error?.message).toContain(
      "Missing required environment variables",
    );
    expect(typeof authState.data.subscription.unsubscribe).toBe("function");
  });
});
