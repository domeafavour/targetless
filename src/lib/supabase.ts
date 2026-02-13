import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./api/supabase.types";

// These should be set in your environment variables
// In GitHub Actions, .env file is generated from repository variables before build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseApiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const missingVars = [];
if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
if (!supabaseApiKey) missingVars.push("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY");

const configErrorMessage =
  missingVars.length > 0
    ? `Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Please create a .env file with your Supabase configuration. ` +
      `See .env.example for the required variables.`
    : "Supabase is not configured.";

const isSupabaseConfigured = missingVars.length === 0;

const createFallbackClient = (): SupabaseClient<Database> => {
  const configError = new Error(configErrorMessage);
  const subscription = { unsubscribe: () => undefined };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: configError as Error,
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: configError as Error,
      }),
      signOut: async () => ({ error: configError as Error }),
    },
    from: () => {
      throw configError;
    },
  } as SupabaseClient<Database>;
};

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseApiKey!)
  : createFallbackClient();
