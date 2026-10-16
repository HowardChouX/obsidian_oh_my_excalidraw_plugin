/**
 * Guards the trimmed toolbar in `styles.css` against a component upgrade.
 *
 * Oh My Excalidraw hides the unused tool buttons and the extra-tools ("...")
 * dropdown with CSS that targets the DOM contract of the installed
 * `@zsviczian/excalidraw` artifact: `data-testid="toolbar-<tool>"` on the tool
 * buttons, the `App-toolbar__extra-tools-trigger` class shared by the image and
 * extra-tools dropdown triggers, `App-toolbar__divider`, and
 * `clear-canvas-button` on the component's own "Reset the canvas" menu item.
 *
 * Run this after changing the component version: a renamed hook turns into a
 * silently visible toolbar button rather than a build error.
 *
 * Usage: node scripts/check-trimmed-toolbar.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const STYLES_PATH = "styles.css";
const COMPONENT_PATH =
  "node_modules/@zsviczian/excalidraw/dist/obsidian/excalidraw.production.min.js";

/** Hooks the trim depends on, with the component feature each one hides. */
const REQUIRED_HOOKS = [
  ['data-testid":`toolbar-${', "tool button test id template"],
  ["App-toolbar__extra-tools-trigger", "image and extra-tools triggers"],
  ["App-toolbar__divider", "toolbar dividers"],
  ["clear-canvas-button", "the component's Reset the canvas menu item"],
];

const styles = readFileSync(STYLES_PATH, "utf8");
const component = readFileSync(COMPONENT_PATH, "utf8");

const hiddenTestIds = [
  ...new Set(
    [...styles.matchAll(/\[data-testid="(toolbar-[a-z-]+)"\]/g)].map(
      (match) => match[1],
    ),
  ),
];
assert.ok(
  hiddenTestIds.length > 0,
  "styles.css no longer hides any toolbar button",
);
assert.ok(
  styles.includes(".App-toolbar__extra-tools-trigger"),
  "styles.css no longer hides the extra-tools dropdown",
);

for (const [hook, description] of REQUIRED_HOOKS) {
  assert.ok(
    component.includes(hook),
    `component no longer provides ${description} (${hook})`,
  );
}

for (const testId of hiddenTestIds) {
  const toolType = testId.replace("toolbar-", "");
  const known =
    component.includes(testId) ||
    component.includes(`"${toolType}"`) ||
    component.includes(`${toolType}:`);
  assert.ok(
    known,
    `component no longer knows ${testId}; the trimmed toolbar CSS is out of date`,
  );
}

process.stdout.write(
  `trimmed toolbar hooks verified: ${hiddenTestIds.length} hidden buttons, ${REQUIRED_HOOKS.length} dropdown/menu hooks\n`,
);
