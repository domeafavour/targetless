import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@targetless/data-access";
import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseConfigErrorMessage,
  hasSupabaseConfig,
  supabaseAnonKey,
  supabaseUrl,
} from "./env";

export const supabase = hasSupabaseConfig
  ? (createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }) as unknown as SupabaseClient)
  : null;

export function requireSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(getSupabaseConfigErrorMessage());
  }
  return supabase;
}
