#!/usr/bin/env node
/**
 * Builds the Obsidian Excalidraw artifacts from a local checkout and publishes
 * them as the plugin's build input under `vendor/excalidraw/`.
 *
 * The plugin's editor is not written in this repository: it is the
 * `zsviczian/excalidraw` fork. This script makes that local checkout the single
 * source of truth for the editor: edit the checkout, run the plugin build, and
 * the plugin embeds what the checkout produces. Nothing is taken from the npm
 * registry at build time.
 *
 * Behaviour:
 *   default        rebuild when the checkout is newer than the vendored
 *                  artifacts, then copy them in (a no-op build when fresh)
 *   --force        always rebuild from the checkout
 *   --check        report whether the vendored artifacts match the checkout
 *
 * Usage:
 *   node scripts/component-artifacts.mjs [--fork <path>] [--force|--check]
 *
 * `--fork` defaults to `../oh_my_excalidraw` (or `$EXCALIDRAW_FORK`).
 * The checkout must be a `zsviczian/excalidraw` clone with its dependencies
 * installed (`yarn install`); the component build itself is
 * `yarn --cwd packages/excalidraw build:obsidian`.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = [
  "excalidraw.development.css",
  "excalidraw.development.js",
  "excalidraw.production.min.css",
  "excalidraw.production.min.js",
];
const componentPackages = ["common", "element", "excalidraw", "math", "utils"];
const skippedDirectories = new Set(["node_modules", "dist", "types", ".git"]);

/** Markers that prove the built component carries the pointer-release hardening. */
const requiredMarkers = [
  {
    name: "stale-pointer pruning",
    test: (source) => source.includes("nonTouchPointers"),
  },
  {
    name: "pan-session pointercancel teardown",
    test: (source) =>
      /addEventListener\(\s*"pointercancel" \/\* POINTER_CANCEL \*\/,\s*teardown\s*\)/.test(
        source,
      ),
  },
];

function parseArgs(argv) {
  const options = {
    fork: process.env.EXCALIDRAW_FORK ?? "../oh_my_excalidraw",
    force: false,
    check: false,
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--fork") {
      options.fork = argv[++index] ?? "";
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--check") {
      options.check = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]);
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!options.fork) {
    console.error("--fork requires a path");
    process.exit(2);
  }
  return options;
}

const { fork, force, check } = parseArgs(process.argv.slice(2));
const checkout = resolve(root, fork);
const sourceDir = join(checkout, "packages/excalidraw/dist/obsidian");
const vendorDir = join(root, "vendor/excalidraw");
const targetDir = join(vendorDir, "dist/obsidian");
const buildHint =
  `Build the component first:\n` +
  `  cd ${checkout} && yarn install && yarn --cwd packages/excalidraw build:obsidian`;

/** Newest modification time of the editor sources in the checkout. */
function newestSourceMtime() {
  let newest = 0;
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (skippedDirectories.has(entry.name)) {
        continue;
      }
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else {
        const { mtimeMs } = statSync(path);
        if (mtimeMs > newest) {
          newest = mtimeMs;
        }
      }
    }
  };
  for (const name of componentPackages) {
    const directory = join(checkout, "packages", name);
    if (existsSync(directory)) {
      walk(directory);
    }
  }
  for (const script of ["scripts/buildObsidianPackage.js", "scripts/buildPackage.js"]) {
    const path = join(checkout, script);
    if (existsSync(path)) {
      newest = Math.max(newest, statSync(path).mtimeMs);
    }
  }
  return newest;
}

function artifactState(artifact) {
  const vendored = join(targetDir, artifact);
  if (!existsSync(vendored)) {
    return { present: false, digest: null, bytes: null };
  }
  const data = readFileSync(vendored);
  return {
    present: true,
    digest: createHash("sha256").update(data).digest("hex"),
    bytes: data.length,
  };
}

if (!existsSync(checkout)) {
  console.error(
    `No Excalidraw checkout at ${checkout}\n` +
      `Pass --fork <path> or set EXCALIDRAW_FORK to the fork clone you edit.`,
  );
  process.exit(1);
}

const sourceMtime = newestSourceMtime();
const oldestVendored = artifacts
  .map((artifact) => {
    const path = join(targetDir, artifact);
    return existsSync(path) ? statSync(path).mtimeMs : 0;
  })
  .reduce((lowest, value) => Math.min(lowest, value), Number.POSITIVE_INFINITY);
const stale = force || !Number.isFinite(oldestVendored) || sourceMtime > oldestVendored;

console.log(`Component source: ${checkout}`);
console.log(`Vendored input  : ${vendorDir}`);
console.log(
  stale
    ? force
      ? "State           : rebuild requested"
      : "State           : checkout is newer than the vendored artifacts"
    : "State           : up to date",
);

if (check) {
  const markers = readFileSync(
    join(targetDir, "excalidraw.development.js"),
    "utf8",
  );
  const missing = requiredMarkers.filter((marker) => !marker.test(markers));
  for (const artifact of artifacts) {
    const state = artifactState(artifact);
    console.log(
      `  ${artifact}  ${state.present ? `${state.bytes} bytes  ${state.digest.slice(0, 16)}` : "MISSING"}`,
    );
  }
  if (missing.length > 0) {
    console.error(`Vendored artifacts lack: ${missing.map((m) => m.name).join(", ")}`);
    process.exit(1);
  }
  if (stale) {
    console.error("Vendored artifacts are older than the checkout; run npm run component:rebuild");
    process.exit(1);
  }
  console.log("Vendored artifacts match the checkout.");
  process.exit(0);
}

if (stale) {
  console.log("Building the component from the local checkout...");
  const result = spawnSync(
    "yarn",
    ["--cwd", join(checkout, "packages/excalidraw"), "build:obsidian"],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error(`Component build failed (exit ${result.status ?? "unknown"}).\n${buildHint}`);
    process.exit(1);
  }
}

if (!existsSync(sourceDir)) {
  console.error(`No built Obsidian artifacts at ${sourceDir}\n${buildHint}`);
  process.exit(1);
}

const development = readFileSync(join(sourceDir, "excalidraw.development.js"), "utf8");
const missing = requiredMarkers.filter((marker) => !marker.test(development));
if (missing.length > 0) {
  console.error(
    `The checkout build lacks: ${missing.map((m) => m.name).join(", ")}\n` +
      `That editor build predates the pointer-release hardening.\n${buildHint}`,
  );
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
let copied = 0;
const recorded = [];
for (const artifact of artifacts) {
  const from = join(sourceDir, artifact);
  if (!existsSync(from)) {
    console.error(`Missing artifact: ${from}`);
    process.exit(1);
  }
  const bytes = readFileSync(from);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const to = join(targetDir, artifact);
  const before = existsSync(to)
    ? createHash("sha256").update(readFileSync(to)).digest("hex")
    : null;
  if (before !== digest) {
    copyFileSync(from, to);
    copied++;
  }
  // Refresh the timestamp even when the bytes are unchanged. Staleness is
  // derived from source mtimes against these artifacts, and a fresh clone
  // rewrites every source mtime without changing any content; without this the
  // checkout would look newer than artifacts that were just verified.
  const verifiedAt = new Date();
  utimesSync(to, verifiedAt, verifiedAt);
  recorded.push({ artifact, bytes: bytes.length, digest });
  console.log(`  ${artifact}  ${bytes.length} bytes  ${before === digest ? "up to date" : "updated"}`);
}

const git = (args) =>
  spawnSync("git", ["-C", checkout, ...args], { encoding: "utf8" }).stdout?.trim() ?? "";
const head = git(["log", "-1", "--format=%H %s"]);
const dirty = git(["status", "--porcelain"]).length > 0;
writeFileSync(
  join(vendorDir, "PROVENANCE.md"),
  [
    "# Vendored Excalidraw artifacts",
    "",
    "Generated by `scripts/component-artifacts.mjs`; do not edit by hand.",
    "These files are the plugin's editor build input (see `rollup.config.mjs`).",
    "",
    `- Checkout: \`${checkout}\``,
    `- Remote: \`${git(["remote", "get-url", "origin"]) || "unknown"}\``,
    `- Commit: \`${head || "unknown"}\`${dirty ? " (working tree has local modifications)" : ""}`,
    `- Built: ${new Date().toISOString()} via \`yarn --cwd packages/excalidraw build:obsidian\``,
    "",
    "| artifact | bytes | sha256 |",
    "| --- | --- | --- |",
    ...recorded.map((r) => `| ${r.artifact} | ${r.bytes} | ${r.digest} |`),
    "",
  ].join("\n"),
);
console.log(
  `Done (${copied} file${copied === 1 ? "" : "s"} copied). Run the plugin build to embed them.`,
);
