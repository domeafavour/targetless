import type { Database } from "@targetless/adapters-web";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseApiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseApiKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseApiKey) missingVars.push("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY");

  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Please create a .env file with your Supabase configuration. ` +
      `See .env.example for the required variables.`,
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);
