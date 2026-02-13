import { createClient } from "@supabase/supabase-js";
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

const fallbackUrl = "https://example.supabase.co";
const fallbackApiKey = "public-anon-key";

export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl! : fallbackUrl,
  isSupabaseConfigured ? supabaseApiKey! : fallbackApiKey,
);

if (!isSupabaseConfigured) {
  const configError = new Error(configErrorMessage);
  supabase.auth.getSession = async () => ({
    data: { session: null },
    error: configError,
  });
  supabase.auth.getUser = async () => ({
    data: { user: null },
    error: configError,
  });
  supabase.auth.onAuthStateChange = () => ({
    data: { subscription: { unsubscribe: () => undefined } },
  });
  supabase.auth.signInWithPassword = async () => ({
    data: { user: null, session: null },
    error: configError,
  });
  supabase.auth.signUp = async () => ({
    data: { user: null, session: null },
    error: configError,
  });
  supabase.auth.signOut = async () => ({ error: configError });
}
