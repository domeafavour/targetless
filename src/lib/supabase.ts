import { createClient } from "@supabase/supabase-js";
import { Database } from "./api/supabase.types";

// These should be set in your environment variables
// In GitHub Actions, .env file is generated from repository variables before build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseApiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseApiKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseApiKey) missingVars.push("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
    `Please create a .env file with your Supabase configuration. ` +
    `See .env.example for the required variables.`
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);
