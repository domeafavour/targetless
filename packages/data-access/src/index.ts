export { createIndexedDbEventsRepository } from "./indexeddb/events-repository.ts";
export type { EventsRepository } from "./repositories/events-repository.ts";
export {
  getCurrentUser,
  isLoggedIn,
  signIn,
  signOut,
  signUp,
} from "./supabase/auth.ts";
export { createSupabaseClient } from "./supabase/client.ts";
export type { SupabaseClient } from "./supabase/client.ts";
export { createSupabaseEventsRepository } from "./supabase/events-repository.ts";

export * from "./types.ts";
