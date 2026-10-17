/**
 * Guards the autosave interaction gate (`src/view/managers/autosaveInteractionGate.ts`).
 *
 * Saves serialize the drawing on the main thread, so the autosave timer must
 * wait out every in-progress gesture. Drawing strokes and text editing were
 * covered from the start; `cursorButton` extends that to the gestures that
 * carry no element of their own - above all right-button panning, which marks
 * the drawing dirty through its scroll position.
 *
 * Usage: node scripts/check-autosave-interaction-gate.mjs
 */
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { FREEDRAW_AUTOSAVE_GRACE_MS, isAutosaveBlockedByInteraction } =
  await jiti.import("../src/view/managers/autosaveInteractionGate.ts");

const idle = {
  activeToolType: "selection",
  editingTextElement: null,
  newElement: null,
  cursorButton: "up",
  freedrawLastActive: 0,
  now: 1_000_000,
};

// Nothing in progress: the save may proceed.
assert.equal(isAutosaveBlockedByInteraction(idle), false);

// --- pointer gestures (the right-button pan fix) ---------------------------

assert.equal(
  isAutosaveBlockedByInteraction({ ...idle, cursorButton: "down" }),
  true,
  "any pointer-down gesture blocks the save",
);
assert.equal(
  isAutosaveBlockedByInteraction({
    ...idle,
    cursorButton: "down",
    activeToolType: "hand",
  }),
  true,
  "panning with the hand tool blocks the save",
);
assert.equal(
  isAutosaveBlockedByInteraction({ ...idle, cursorButton: null }),
  false,
  "a missing cursorButton is read as idle, never as blocking",
);

// --- the previously covered interactions -----------------------------------

assert.equal(
  isAutosaveBlockedByInteraction({
    ...idle,
    editingTextElement: { id: "text-1" },
  }),
  true,
  "text editing blocks the save",
);
assert.equal(
  isAutosaveBlockedByInteraction({ ...idle, newElement: { id: "el-1" } }),
  true,
  "an element being created blocks the save",
);

// --- freedraw grace ---------------------------------------------------------

const freedraw = { ...idle, activeToolType: "freedraw" };
assert.equal(
  isAutosaveBlockedByInteraction({
    ...freedraw,
    freedrawLastActive: freedraw.now - FREEDRAW_AUTOSAVE_GRACE_MS + 1,
  }),
  true,
  "freedraw within the grace period blocks the save",
);
assert.equal(
  isAutosaveBlockedByInteraction({
    ...freedraw,
    freedrawLastActive: freedraw.now - FREEDRAW_AUTOSAVE_GRACE_MS,
  }),
  false,
  "freedraw after the grace period lets the save proceed",
);
assert.equal(
  isAutosaveBlockedByInteraction({ ...freedraw, freedrawLastActive: 0 }),
  false,
  "freedraw tool without recent points does not block",
);
assert.equal(
  isAutosaveBlockedByInteraction({
    ...idle,
    freedrawLastActive: idle.now,
  }),
  false,
  "recent freedraw points only matter while the freedraw tool is active",
);

process.stdout.write(
  "autosave interaction gate verified: pointer gestures, text editing, new elements, freedraw grace\n",
);
