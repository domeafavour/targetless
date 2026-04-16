import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types.ts";

/**
 * Create a Supabase client instance.
 * The caller is responsible for supplying validated env values.
 */
export function createSupabaseClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey);
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
