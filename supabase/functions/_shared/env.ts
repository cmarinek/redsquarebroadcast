const cache = new Map<string, string>();

function formatError(name: string) {
  return `Missing required environment variable: ${name}. Configure it in your secret manager before invoking this function.`;
}

export function getEnv(name: string): string {
  if (cache.has(name)) {
    return cache.get(name)!;
  }

  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(formatError(name));
  }

  cache.set(name, value);
  return value;
}

export function resetEnvCache() {
  cache.clear();
}
