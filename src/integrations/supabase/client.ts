import { createClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "./types";

export const SUPABASE_PROJECT_REF = env.supabaseProjectId;

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
