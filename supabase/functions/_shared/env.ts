const cache = new Map<string, string | undefined>();

function formatError(name: string) {
  return `Missing required environment variable: ${name}. Configure it in your secret manager before invoking this function.`;
}

export function getEnv(name: string): string {
  if (cache.has(name)) {
    const cached = cache.get(name);
    if (cached) {
      return cached;
    }

    throw new Error(formatError(name));
  }

  const value = Deno.env.get(name);

  if (!value) {
    cache.set(name, undefined);
    throw new Error(formatError(name));
  }

  cache.set(name, value);
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  if (cache.has(name)) {
    return cache.get(name);
  }

  const value = Deno.env.get(name);
  cache.set(name, value ?? undefined);
  return value ?? undefined;
}

export function resetEnvCache() {
  cache.clear();
}
