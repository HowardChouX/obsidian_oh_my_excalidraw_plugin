/** Exercise the view's O(1) scene and viewport change trackers. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadTypeScriptModule(relativePath) {
  const source = readFileSync(
    resolve(import.meta.dirname, "../../src/view", relativePath),
    "utf8",
  );
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(javascript, { exports });
  return exports;
}

const { SceneChangeTracker } = loadTypeScriptModule(
  "managers/SceneChangeTracker.ts",
);
const { ViewportChangeTracker } = loadTypeScriptModule(
  "managers/ViewportChangeTracker.ts",
);
const {
  captureTrackedAppState,
  didTrackedAppStateChange,
  didTrackedNonViewportAppStateChange,
  didTrackedViewportChange,
} = loadTypeScriptModule("trackedAppState.ts");

const trackedState = (overrides = {}) => ({
  theme: "light",
  viewBackgroundColor: "white",
  gridSize: 20,
  gridStep: 5,
  gridModeEnabled: true,
  colorPalette: {},
  colorTopPicks: [],
  frameRendering: {},
  objectsSnapModeEnabled: false,
  bindingPreference: false,
  isMidpointSnappingEnabled: false,
  boxSelectionMode: false,
  scrollX: 0,
  scrollY: 0,
  zoom: { value: 1 },
  ...overrides,
});

test("pure viewport movement is separated from other saved app state", () => {
  const previous = captureTrackedAppState(trackedState());
  const next = captureTrackedAppState(
    trackedState({ scrollX: -120, scrollY: 45, zoom: { value: 1.5 } }),
  );

  assert.equal(didTrackedNonViewportAppStateChange(previous, next), false);
  assert.equal(didTrackedViewportChange(previous, next), true);
  assert.equal(didTrackedAppStateChange(previous, next, false), false);
  assert.equal(didTrackedAppStateChange(previous, next, true), true);
});

test("viewport dirty revisions are coalesced across a long pointer gesture", () => {
  const tracker = new ViewportChangeTracker();
  const update = (pointerDown, viewportChanged, nonViewportChanged = false) =>
    tracker.shouldMarkDirty({
      pointerDown,
      viewportChanged,
      nonViewportChanged,
    });

  assert.equal(update(true, false), false);
  assert.equal(update(true, true), true);
  assert.equal(update(true, true), false);
  assert.equal(update(true, true), false);
  // The final revision catches a forced save that captured an intermediate pan.
  assert.equal(update(false, false), true);
  assert.equal(update(false, false), false);
});

test("non-viewport changes remain dirty during a pointer gesture", () => {
  const tracker = new ViewportChangeTracker();

  assert.equal(
    tracker.shouldMarkDirty({
      pointerDown: true,
      viewportChanged: false,
      nonViewportChanged: true,
    }),
    true,
  );
});

test("element increments coalesce and are consumed independently", () => {
  const tracker = new SceneChangeTracker();

  // The hook-side cursor is initialized on its first callback, then remains
  // quiet until Excalidraw reports an element delta.
  assert.equal(tracker.consumeElementChangeForHook(), true);
  assert.equal(tracker.consumeElementChangeForHook(), false);
  assert.equal(tracker.consumeElementChangeForOnChange(), false);

  tracker.recordElementChange();
  tracker.recordElementChange();

  assert.equal(tracker.consumeElementChangeForOnChange(), true);
  assert.equal(tracker.consumeElementChangeForOnChange(), false);
  assert.equal(tracker.consumeElementChangeForHook(), true);
  assert.equal(tracker.consumeElementChangeForHook(), false);
});
