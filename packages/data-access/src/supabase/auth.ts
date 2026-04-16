import type { SupabaseClient } from "./client.ts";

/**
 * Get the session user, throwing if there is no active session.
 */
export async function getSessionUser(supabase: SupabaseClient) {
  const session = await supabase.auth.getSession();
  if (session.error) throw session.error;
  if (!session.data.session) throw new Error("No active session");
  return session.data.session.user;
}

/**
 * Sign in with email + password.
 */
export async function signIn(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign up with email + password.
 */
export async function signUp(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign the current user out.
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Return the currently authenticated user, or null.
 */
export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Return whether there is an active session.
 * Reads from local storage – no network request.
 */
export async function isLoggedIn(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}
