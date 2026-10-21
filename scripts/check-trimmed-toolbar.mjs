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
// The tool panel is appended to `.excalidraw-wrapper`, which is a sibling of
// the component's `.excalidraw` root. Scoping its styles under `.excalidraw`
// silently leaves the panel unstyled below the canvas.
assert.ok(
  styles.includes(".excalidraw-wrapper .excalidraw-tool-settings-popup"),
  "styles.css no longer styles the tool popup under .excalidraw-wrapper",
);
assert.ok(
  !styles.includes(".excalidraw .excalidraw-tool-settings-popup"),
  "the tool popup is a sibling of .excalidraw; its styles must not be scoped under .excalidraw",
);

// The eraser cursor is a native CSS cursor on the component's canvas. The
// wrapper class gates it so the component's own cursors return with other
// tools; the image itself comes from a radius-specific custom property.
assert.ok(
  styles.includes(
    ".excalidraw-wrapper.excalidraw-eraser-size-cursor .excalidraw__canvas",
  ),
  "styles.css no longer applies the eraser cursor to .excalidraw__canvas",
);
assert.ok(
  styles.includes("cursor: var(--excalidraw-eraser-cursor"),
  "the eraser cursor no longer uses its radius-specific custom property",
);

for (const [hook, description] of REQUIRED_HOOKS) {
  assert.ok(
    component.includes(hook),
    `component no longer provides ${description} (${hook})`,
  );
}

process.stdout.write(
  `trimmed toolbar hooks verified: hidden Island, injected toolbar row, ${REQUIRED_HOOKS.length} component hooks\n`,
);
