import { z } from "zod";

type EnvSource = Record<string, string | undefined>;

type RuntimeEnv = EnvSource & {
  [key: string]: string | undefined;
};

const importMetaEnv: EnvSource = typeof import.meta !== "undefined" && import.meta.env
  ? (import.meta.env as unknown as EnvSource)
  : {};

const windowEnv: EnvSource = typeof window !== "undefined" && (window as unknown as { __APP_ENV__?: EnvSource }).__APP_ENV__
  ? ((window as unknown as { __APP_ENV__?: EnvSource }).__APP_ENV__ as EnvSource)
  : {};

const runtimeEnv: RuntimeEnv = {
  ...("process" in globalThis ? process.env : {}),
  ...importMetaEnv,
  ...windowEnv,
};

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1, "VITE_SUPABASE_PROJECT_ID is required"),
  VITE_MAPBOX_PUBLIC_TOKEN: z.string().min(1, "VITE_MAPBOX_PUBLIC_TOKEN is required"),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "VITE_STRIPE_PUBLISHABLE_KEY is required"),
});

const parsedEnv = EnvSchema.safeParse(runtimeEnv);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    [
      "Invalid runtime environment configuration detected.",
      "Ensure the following variables are defined via your deployment platform or secret manager:",
      formattedErrors,
    ].join("\n"),
  );
}

export const env = {
  supabaseUrl: parsedEnv.data.VITE_SUPABASE_URL,
  supabaseAnonKey: parsedEnv.data.VITE_SUPABASE_ANON_KEY,
  supabaseProjectId: parsedEnv.data.VITE_SUPABASE_PROJECT_ID,
  mapboxPublicToken: parsedEnv.data.VITE_MAPBOX_PUBLIC_TOKEN,
  stripePublishableKey: parsedEnv.data.VITE_STRIPE_PUBLISHABLE_KEY,
};

export type AppEnv = typeof env;
