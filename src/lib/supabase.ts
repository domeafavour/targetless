import { createClient } from "@supabase/supabase-js";
import { Database } from "./api/supabase.types";

// These should be set in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseApiKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);
