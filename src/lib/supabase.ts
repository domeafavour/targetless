import { createClient } from "@supabase/supabase-js";
import { Database } from "./api/supabase.types";

// These should be set in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseApiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Validate that required environment variables are set
if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_URL. Please create a .env file with your Supabase project URL."
  );
}

if (!supabaseApiKey) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY. Please create a .env file with your Supabase publishable API key."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);
