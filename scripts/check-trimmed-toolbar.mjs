/**
 * Guards the trimmed toolbar against a component upgrade.
 *
 * Oh My Excalidraw hides the Excalidraw component's toolbar Island entirely and
 * injects its own toolbar (CustomToolbar.ts) into the same row. What the trim
 * still depends on in the component: the `App-toolbar` class of the Island it
 * hides, the `App-toolbar-container` row it injects into, and the component's
 * own "Reset the canvas" menu item (`clear-canvas-button`), which is hidden in
 * favour of the toolbar's clear button.
 *
 * Run this after changing the component version: a renamed hook turns into a
 * doubled toolbar (or a stale menu item) rather than a build error.
 *
 * Usage: node scripts/check-trimmed-toolbar.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const STYLES_PATH = "styles.css";
const COMPONENT_PATH =
  "vendor/excalidraw/dist/obsidian/excalidraw.production.min.js";

/** Hooks the trim depends on, with the component feature each one stands for. */
const REQUIRED_HOOKS = [
  ["App-toolbar-container", "the row the plugin toolbar is injected into"],
  ["App-toolbar__extra-tools-trigger", "the hidden dropdown triggers"],
  ["clear-canvas-button", "the component's Reset the canvas menu item"],
];

const styles = readFileSync(STYLES_PATH, "utf8");
const component = readFileSync(COMPONENT_PATH, "utf8");

assert.ok(
  styles.includes(".excalidraw .App-toolbar"),
  "styles.css no longer hides the component toolbar",
);
assert.ok(
  styles.includes(".excalidraw-ome-toolbar"),
  "styles.css no longer styles the plugin toolbar",
);
assert.ok(
  styles.includes('[data-testid="clear-canvas-button"]'),
  "styles.css no longer hides the component's Reset the canvas menu item",
);
// The tool panel and the eraser cursor are appended to `.excalidraw-wrapper`,
// which is a sibling of the component's `.excalidraw` root. Scoping their
// styles under `.excalidraw` silently leaves them unstyled and off-screen.
for (const overlayClass of [
  "excalidraw-tool-settings-popup",
  "excalidraw-eraser-size-cursor",
]) {
  assert.ok(
    styles.includes(`.excalidraw-wrapper .${overlayClass}`),
    `styles.css no longer styles .${overlayClass} under .excalidraw-wrapper`,
  );
  assert.ok(
    !styles.includes(`.excalidraw .${overlayClass}`),
    `.${overlayClass} is a sibling of .excalidraw; its styles must not be scoped under .excalidraw`,
  );
}

for (const [hook, description] of REQUIRED_HOOKS) {
  assert.ok(
    component.includes(hook),
    `component no longer provides ${description} (${hook})`,
  );
}

process.stdout.write(
  `trimmed toolbar hooks verified: hidden Island, injected toolbar row, ${REQUIRED_HOOKS.length} component hooks\n`,
);
