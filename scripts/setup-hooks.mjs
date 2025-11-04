#!/usr/bin/env node
import { execSync } from "node:child_process";

try {
  execSync("git config --local core.hooksPath .githooks", { stdio: "inherit" });
  console.log("Configured git to use hooks in .githooks/. Run scripts/setup-hooks.mjs once per clone.");
} catch (error) {
  console.error("Failed to configure git hooks:", error.message);
  process.exit(error.status ?? 1);
}
