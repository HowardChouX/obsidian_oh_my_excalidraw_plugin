/**
 * Guards the pointer-release hardening inside the vendored editor artifacts.
 *
 * The plugin embeds the editor built from the local `zsviczian/excalidraw`
 * checkout (see scripts/component-artifacts.mjs). This check fails loudly when
 * those artifacts are missing or come from an editor build that predates the
 * hardening, so a stale vendor directory cannot silently ship the canvas-freeze
 * regression again.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const artifact = resolve(
  import.meta.dirname,
  "../../vendor/excalidraw/dist/obsidian/excalidraw.development.js",
);

const missing = (what) =>
  new Error(
    `The vendored editor artifacts do not contain the pointer-release ` +
      `hardening (${what}). Run \`npm run component:rebuild\` to rebuild them ` +
      `from the local Excalidraw checkout.`,
  );

test("vendored editor artifacts exist", () => {
  assert.ok(
    existsSync(artifact),
    new Error(
      `Missing ${artifact}. Run \`npm run component:rebuild\` (any build also ` +
        `ensures the artifacts first).`,
    ),
  );
});

test("vendored editor carries the stale-pointer pruning", () => {
  const source = readFileSync(artifact, "utf8");
  assert.ok(source.includes("nonTouchPointers"), missing("stale-pointer pruning"));
});

test("vendored editor ends a pan session on pointercancel", () => {
  const source = readFileSync(artifact, "utf8");
  assert.ok(
    /addEventListener\(\s*"pointercancel" \/\* POINTER_CANCEL \*\/,\s*teardown\s*\)/.test(
      source,
    ),
    missing("pan-session pointercancel teardown"),
  );
});
