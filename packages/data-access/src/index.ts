export type { EventsRepository } from "./repositories/events-repository.ts";
export { createSupabaseEventsRepository } from "./supabase/events-repository.ts";
export { createIndexedDbEventsRepository } from "./indexeddb/events-repository.ts";
export { createSupabaseClient } from "./supabase/client.ts";
export type { SupabaseClient } from "./supabase/client.ts";
export {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  isLoggedIn,
} from "./supabase/auth.ts";
