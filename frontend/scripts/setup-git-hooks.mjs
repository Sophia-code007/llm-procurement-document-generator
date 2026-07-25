import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hookPath = resolve(repoRoot, ".githooks");

if (!existsSync(hookPath)) {
  console.warn("Warning: .githooks directory does not exist. Skipping git hook setup.");
  process.exit(0);
}

try {
  execSync("git rev-parse --is-inside-work-tree", {
    stdio: "ignore",
    cwd: repoRoot,
  });

  execSync("git config core.hooksPath .githooks", {
    stdio: "inherit",
    cwd: repoRoot,
  });
} catch (error) {
  console.warn("Git hook setup skipped: not a git repository or git is unavailable.");
}
