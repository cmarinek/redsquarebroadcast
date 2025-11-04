#!/usr/bin/env node
import { z } from "zod";

const schema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
  VITE_MAPBOX_PUBLIC_TOKEN: z.string().min(1),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MAPBOX_PUBLIC_TOKEN: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("\u274c Environment validation failed. The following variables are missing or invalid:");
  for (const issue of result.error.issues) {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error("\nInject the missing variables using your platform's runtime secret manager or CI environment.");
  process.exit(1);
}

console.log("\u2705 Environment validation passed.");
