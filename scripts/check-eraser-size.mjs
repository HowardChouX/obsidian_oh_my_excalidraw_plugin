/**
 * Guards the eraser size math: the settings clamp and the hit-test geometry the
 * extra eraser pass uses (see `EraserSizeManager`).
 *
 * The component's own eraser has a fixed reach, so this pass decides on its own
 * which strokes are close enough to the eraser path - the distance helpers are
 * the part of it that must not drift.
 *
 * Usage: node scripts/check-eraser-size.mjs
 */
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const {
  clampEraserSize,
  ERASER_SIZE_MAX_PX,
  ERASER_SIZE_MIN_PX,
  ERASER_SIZE_STEP_PX,
  pointRectBorderDistance,
  pointSegmentDistance,
  toElementLocalPoint,
} = await jiti.import("../src/utils/eraserHitTest.ts");

const close = (actual, expected, label) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${label}: expected ${expected}, got ${actual}`,
  );

// --- settings clamp -------------------------------------------------------

assert.equal(clampEraserSize(ERASER_SIZE_MIN_PX), ERASER_SIZE_MIN_PX);
assert.equal(clampEraserSize(ERASER_SIZE_MAX_PX), ERASER_SIZE_MAX_PX);
assert.equal(clampEraserSize(0), ERASER_SIZE_MIN_PX);
assert.equal(clampEraserSize(-100), ERASER_SIZE_MIN_PX);
assert.equal(clampEraserSize(9999), ERASER_SIZE_MAX_PX);
assert.equal(clampEraserSize("25"), 25);
assert.equal(clampEraserSize("nonsense"), ERASER_SIZE_MIN_PX);
assert.equal(clampEraserSize(undefined), ERASER_SIZE_MIN_PX);
assert.equal(clampEraserSize(null), ERASER_SIZE_MIN_PX);
// Fractional values land on the nearest whole pixel.
assert.equal(clampEraserSize(23), 23);
assert.equal(clampEraserSize(21.4), 21);
assert.equal(clampEraserSize(23.6), 24);
assert.equal(
  clampEraserSize(ERASER_SIZE_MIN_PX + 1) % ERASER_SIZE_STEP_PX,
  0,
  "clamped values are always on a step",
);

// --- point to segment ----------------------------------------------------

const origin = { x: 0, y: 0 };
close(
  pointSegmentDistance({ x: 5, y: 0 }, origin, { x: 10, y: 0 }),
  0,
  "on the segment",
);
close(
  pointSegmentDistance({ x: 5, y: 3 }, origin, { x: 10, y: 0 }),
  3,
  "perpendicular",
);
close(
  pointSegmentDistance({ x: -4, y: 0 }, origin, { x: 10, y: 0 }),
  4,
  "before the start",
);
close(
  pointSegmentDistance({ x: 14, y: 0 }, origin, { x: 10, y: 0 }),
  4,
  "past the end",
);
close(
  pointSegmentDistance({ x: 3, y: 4 }, { x: 1, y: 1 }, { x: 1, y: 1 }),
  Math.hypot(2, 3),
  "zero-length segment",
);

// --- point to rectangle border -------------------------------------------

close(
  pointRectBorderDistance({ x: 3, y: 1 }, 10, 10),
  1,
  "inside, nearest edge",
);
close(
  pointRectBorderDistance({ x: 5, y: 5 }, 10, 10),
  5,
  "centre of the rectangle",
);
close(
  pointRectBorderDistance({ x: 13, y: 5 }, 10, 10),
  3,
  "outside, right of it",
);
close(
  pointRectBorderDistance({ x: -2, y: -2 }, 10, 10),
  Math.sqrt(8),
  "diagonal corner",
);
close(pointRectBorderDistance({ x: 0, y: 5 }, 10, 10), 0, "on the border");

// --- element local coordinates -------------------------------------------

const element = { x: 100, y: 50, angle: 0 };
close(toElementLocalPoint({ x: 110, y: 60 }, element).x, 10, "no rotation, x");
close(toElementLocalPoint({ x: 110, y: 60 }, element).y, 10, "no rotation, y");

// A quarter turn: a point to the right of a rotated element is below it in the
// element's own frame.
const rotated = { x: 0, y: 0, angle: Math.PI / 2 };
close(toElementLocalPoint({ x: 10, y: 0 }, rotated).x, 0, "rotated, x");
close(toElementLocalPoint({ x: 10, y: 0 }, rotated).y, -10, "rotated, y");

// Rotation must be relative to the element's position, not the origin.
const moved = { x: 10, y: 10, angle: Math.PI / 2 };
close(
  toElementLocalPoint({ x: 20, y: 10 }, moved).x,
  0,
  "moved and rotated, x",
);
close(
  toElementLocalPoint({ x: 20, y: 10 }, moved).y,
  -10,
  "moved and rotated, y",
);

process.stdout.write(
  `eraser size math verified: clamp within ${ERASER_SIZE_MIN_PX}-${ERASER_SIZE_MAX_PX}px (step ${ERASER_SIZE_STEP_PX}px), distance and rotation helpers\n`,
);
