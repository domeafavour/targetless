export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const missingSupabaseEnvVars = [
  !supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : null,
  !supabaseAnonKey ? "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" : null,
].filter((value): value is string => value !== null);

export const hasSupabaseConfig = missingSupabaseEnvVars.length === 0;

export function getSupabaseConfigErrorMessage() {
  return `Missing required environment variables: ${missingSupabaseEnvVars.join(
    ", ",
  )}`;
}
