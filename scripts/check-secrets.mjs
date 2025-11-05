#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const trackedFiles = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const currentScriptPath = path.relative(process.cwd(), fileURLToPath(import.meta.url));

const issues = [];

const forbiddenFilePattern = /\.env(\..*)?$/;
const forbiddenContentPatterns = [
  {
    regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
    message: "Detected embedded JWT-style secret (e.g., Supabase anon/service key). Store secrets in your secret manager instead.",
  },
  {
    regex: /sk_(live|test)_[0-9a-zA-Z]{20,}/,
    message: "Detected Stripe secret key. Rotate the key and remove it from the repository.",
  },
  {
    regex: /MAPBOX_.*pk\.[0-9a-zA-Z]{16,}/,
    message: "Detected Mapbox token committed to the repository. Regenerate the token and inject it via environment variables.",
  },
  {
    regex: /supabase\.co\/(functions|auth|storage)/,
    message: "Detected hard-coded Supabase domain. Use app_config.supabase_base_url() helpers or environment variables instead.",
  },
];

for (const file of trackedFiles) {
  if (file === currentScriptPath) {
    continue;
  }
  if (forbiddenFilePattern.test(file)) {
    issues.push(`Forbidden environment file tracked in git: ${file}`);
    continue;
  }

  const content = readFileSync(file, "utf8");

  for (const pattern of forbiddenContentPatterns) {
    if (pattern.regex.test(content)) {
      issues.push(`${pattern.message}\n  ↳ ${file}`);
    }
  }
}

if (issues.length > 0) {
  console.error("\u274c Secret scanning failed:\n" + issues.map((issue) => ` - ${issue}`).join("\n"));
  process.exit(1);
}

console.log("\u2705 Secret scanning passed: no high-risk patterns detected.");
