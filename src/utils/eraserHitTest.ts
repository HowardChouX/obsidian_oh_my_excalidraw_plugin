/**
 * Eraser hit-test geometry and the eraser size preference bounds.
 *
 * The Excalidraw component's eraser has a fixed reach, so `EraserSizeManager`
 * adds a configurable one on top of it. These are the pure parts of that pass -
 * settings clamping and distance math - kept in `src/utils` so they can be
 * exercised without an Excalidraw runtime (see `scripts/check-eraser-size.mjs`).
 */

/**
 * Bounds and step of the eraser radius, in screen pixels.
 *
 * The 5-60 range and 1 px step match the eraser slider of oh-my-ink, so the
 * same sizes can be chosen in both editors.
 */
export const ERASER_SIZE_MIN_PX = 5;
export const ERASER_SIZE_MAX_PX = 60;
export const ERASER_SIZE_STEP_PX = 1;

export type ScenePoint = { x: number; y: number };

/**
 * Clamps an eraser size to the supported range and step.
 *
 * Used both when the setting is read and when it is written, so a hand-edited
 * `data.json` cannot put the eraser pass into an unbounded state.
 */
export function clampEraserSize(sizePx: unknown): number {
  const value = Number(sizePx);
  if (!Number.isFinite(value)) {
    return ERASER_SIZE_MIN_PX;
  }
  const clamped = Math.min(
    Math.max(value, ERASER_SIZE_MIN_PX),
    ERASER_SIZE_MAX_PX,
  );
  return Math.round(clamped / ERASER_SIZE_STEP_PX) * ERASER_SIZE_STEP_PX;
}

/**
 * The point in an element's own coordinate system.
 *
 * Rotation is applied to the point rather than to the element, so rotated
 * strokes are hit-tested exactly instead of through their bounding box.
 */
export function toElementLocalPoint(
  point: ScenePoint,
  element: { x: number; y: number; angle: number },
): ScenePoint {
  const dx = point.x - element.x;
  const dy = point.y - element.y;
  return {
    x: dx * Math.cos(element.angle) + dy * Math.sin(element.angle),
    y: -dx * Math.sin(element.angle) + dy * Math.cos(element.angle),
  };
}

/** Distance between a point and a line segment. */
export function pointSegmentDistance(
  point: ScenePoint,
  segmentStart: ScenePoint,
  segmentEnd: ScenePoint,
): number {
  const dx = segmentEnd.x - segmentStart.x;
  const dy = segmentEnd.y - segmentStart.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
  }
  const projection = Math.min(
    1,
    Math.max(
      0,
      ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) /
        lengthSquared,
    ),
  );
  return Math.hypot(
    point.x - (segmentStart.x + projection * dx),
    point.y - (segmentStart.y + projection * dy),
  );
}

/**
 * Distance between a point and a rectangle's border, in the same units.
 *
 * Zero on the border; for a point inside, the distance to the nearest edge.
 */
export function pointRectBorderDistance(
  point: ScenePoint,
  width: number,
  height: number,
): number {
  const inside =
    point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
  if (inside) {
    return Math.min(point.x, width - point.x, point.y, height - point.y);
  }
  return Math.min(
    pointSegmentDistance(point, { x: 0, y: 0 }, { x: width, y: 0 }),
    pointSegmentDistance(point, { x: width, y: 0 }, { x: width, y: height }),
    pointSegmentDistance(point, { x: width, y: height }, { x: 0, y: height }),
    pointSegmentDistance(point, { x: 0, y: height }, { x: 0, y: 0 }),
  );
}
