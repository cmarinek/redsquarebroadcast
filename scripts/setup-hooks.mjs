#!/usr/bin/env node
import { execSync } from "node:child_process";
import { chmodSync } from "node:fs";
import { resolve } from "node:path";

try {
  // Configure git to use custom hooks directory
  execSync("git config --local core.hooksPath .githooks", { stdio: "inherit" });
  
  // Ensure hooks are executable
  const hookPath = resolve(".githooks/pre-commit");
  chmodSync(hookPath, 0o755);
  
  console.log("✅ Git hooks configured successfully!");
  console.log("\nPre-commit checks enabled:");
  console.log("  • Secret verification");
  console.log("  • SSOT validation");
  console.log("\nℹ️  Run this command once per repository clone.");
  console.log("📖 See docs/GIT_HOOKS_GUIDE.md for more information.");
} catch (error) {
  console.error("❌ Failed to configure git hooks:", error.message);
  process.exit(error.status ?? 1);
}
