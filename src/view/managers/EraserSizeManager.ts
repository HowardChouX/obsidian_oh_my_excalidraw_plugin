import type { ExcalidrawElement } from "@zsviczian/excalidraw/types/element/src/types";
import type { ExcalidrawImperativeAPI } from "@zsviczian/excalidraw/types/excalidraw/types";
import {
  CaptureUpdateAction,
  viewportCoordsToSceneCoords,
} from "src/constants/constants";
import { setElementHidden } from "src/utils/htmlUtils";
import {
  pointRectBorderDistance,
  pointSegmentDistance,
  toElementLocalPoint,
} from "src/utils/eraserHitTest";
import type { ScenePoint } from "src/utils/eraserHitTest";
import { setStyle } from "src/utils/styleUtils";

/** Pointer buttons the Excalidraw eraser reacts to (see `POINTER_BUTTON`). */
const MAIN_BUTTON = 0;
const STYLUS_ERASER_BUTTON = 5;

/**
 * Held-button mask (PointerEvent.buttons) of the buttons that pan the canvas
 * instead of acting on it: secondary (right) and middle.
 */
const PANNING_BUTTONS_MASK = 2 | 4;

/**
 * The reach the Excalidraw component's own eraser already has: its hit test
 * uses a tolerance of `max(2.25, 5 / zoom)` scene units, i.e. ~2-5 screen
 * pixels. The size setting is the eraser's full radius, so this is the part
 * the component already covers; {@link EraserSizeManager} adds the remainder.
 * Sizes at or below it need no plugin-side help, and the extra pass stays out
 * of the way.
 */
const NATIVE_ERASER_REACH_PX = 5;

/** Distance between sweep samples along a drag, in screen pixels. */
const SWEEP_SAMPLE_SPACING_PX = 6;

const CURSOR_CLASS = "excalidraw-eraser-size-cursor";

/** Minimum view surface required by {@link EraserSizeManager}. */
export interface EraserSizeManagerHost {
  readonly ownerDocument: Document;
  readonly excalidrawAPI: ExcalidrawImperativeAPI | null;
  /** Current eraser radius preference, in screen pixels. */
  getEraserSize(): number;
}

/**
 * Purpose:
 *   The eraser size of the trimmed toolbar.
 *
 *   The Excalidraw component's eraser has a fixed reach - `EraserTrail` draws
 *   with `size: 5` and `eraserTest()` decides hits with hard-coded tolerances -
 *   and exposes no setting for it. The size setting is the eraser's radius; this
 *   manager adds the part of that radius the component does not already cover
 *   instead of replacing the eraser: while the eraser is dragged, strokes and
 *   other elements whose geometry comes within the remaining distance of the
 *   pointer are erased as well.
 *
 * Notes:
 *   - The manager never blocks or re-routes pointer events. The component's
 *     eraser keeps working exactly as before; this pass only adds deletions, so
 *     a wrong size can never break erasing itself.
 *   - Hits use each element's own local geometry (stroke polyline, rectangle
 *     border), so erasing near a hand-drawn circle removes the stroke only when
 *     the circle's line is actually reached, not when the pointer is inside it.
 *   - Whole elements are erased, with their group and bound text, matching what
 *     the component's eraser does.
 *   - At or below {@link NATIVE_ERASER_REACH_PX} the manager stays inert, so the
 *     default setting changes nothing about the eraser's behaviour.
 */
export class EraserSizeManager {
  private wrapperEl: HTMLElement | null = null;
  private cursorEl: HTMLDivElement | null = null;
  private activePointerId: number | null = null;
  private lastScenePoint: ScenePoint | null = null;
  private deletedDuringGesture = false;
  private detached = false;
  private lastPointerEvent: PointerEvent | null = null;
  private pointerMoveFrame: number | null = null;

  public constructor(private readonly host: EraserSizeManagerHost) {}

  /** Starts managing the eraser pass inside `container` (the view wrapper). */
  public attach(container: HTMLElement | null): void {
    this.detach();
    this.detached = false;
    if (!container) {
      return;
    }
    this.wrapperEl = container;
    container.addEventListener("pointerdown", this.onPointerDown);
    container.addEventListener("pointermove", this.onPointerMove);
    container.addEventListener("pointerup", this.onPointerUp);
    container.addEventListener("pointercancel", this.onPointerUp);
    container.addEventListener("pointerleave", this.onPointerLeave);
  }

  /** Removes every listener and the size cursor. */
  public detach(): void {
    this.detached = true;
    this.cancelScheduledPointerMove();
    this.endGesture();
    const container = this.wrapperEl;
    if (container) {
      container.removeEventListener("pointerdown", this.onPointerDown);
      container.removeEventListener("pointermove", this.onPointerMove);
      container.removeEventListener("pointerup", this.onPointerUp);
      container.removeEventListener("pointercancel", this.onPointerUp);
      container.removeEventListener("pointerleave", this.onPointerLeave);
    }
    this.wrapperEl = null;
    this.cursorEl?.remove();
    this.cursorEl = null;
  }

  /** Drops a pointer move still waiting for its frame, if any. */
  private cancelScheduledPointerMove(): void {
    if (this.pointerMoveFrame !== null) {
      this.host.ownerDocument.defaultView?.cancelAnimationFrame(
        this.pointerMoveFrame,
      );
      this.pointerMoveFrame = null;
    }
    this.lastPointerEvent = null;
  }

  /**
   * Keeps the size cursor in step with the active tool.
   *
   * Called from the view's render hook so switching away from the eraser (by
   * toolbar, keyboard, or temporary erase) hides the cursor without a poll.
   */
  public refresh(): void {
    if (this.detached) {
      return;
    }
    if (!this.isActive()) {
      this.hideCursor();
    }
  }

  /** Whether the extra reach applies right now. */
  private isActive(): boolean {
    if (this.host.getEraserSize() <= NATIVE_ERASER_REACH_PX) {
      return false;
    }
    return this.host.excalidrawAPI?.getAppState().activeTool.type === "eraser";
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!this.isActive() || !this.isEraserPointer(event)) {
      this.hideCursor();
      return;
    }
    this.activePointerId = event.pointerId;
    this.deletedDuringGesture = false;
    this.lastScenePoint = this.toScenePoint(event);
    this.showCursor(event);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    // Secondary and middle buttons pan the canvas; that is not erasing, and
    // the size circle would follow a pan it does not describe.
    if (event.buttons & PANNING_BUTTONS_MASK) {
      this.hideCursor();
      return;
    }
    if (!this.isActive()) {
      this.hideCursor();
      return;
    }
    // Pointer events can arrive far more often than frames (a stylus reports
    // ~200 times a second). Handle at most one move per frame, keeping the
    // latest one.
    this.lastPointerEvent = event;
    if (this.pointerMoveFrame !== null) {
      return;
    }
    this.pointerMoveFrame =
      this.host.ownerDocument.defaultView?.requestAnimationFrame(
        this.handleScheduledPointerMove,
      ) ?? null;
    if (this.pointerMoveFrame === null) {
      this.handleScheduledPointerMove();
    }
  };

  private readonly handleScheduledPointerMove = (): void => {
    this.pointerMoveFrame = null;
    const event = this.lastPointerEvent;
    this.lastPointerEvent = null;
    if (!event || this.detached) {
      return;
    }
    this.showCursor(event);
    if (this.activePointerId !== event.pointerId) {
      return;
    }
    const scenePoint = this.toScenePoint(event);
    if (!scenePoint) {
      return;
    }
    this.eraseAlongPath(this.lastScenePoint, scenePoint);
    this.lastScenePoint = scenePoint;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.activePointerId !== event.pointerId) {
      return;
    }
    this.endGesture();
    if (!this.deletedDuringGesture) {
      return;
    }
    // The deletions above are recorded along with the next undoable change.
    // Capturing here turns the whole gesture into a single undo step (the
    // component's own eraser records its part the same way).
    this.host.excalidrawAPI?.updateScene({
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };

  private readonly onPointerLeave = (): void => {
    if (this.activePointerId === null) {
      this.hideCursor();
    }
  };

  private endGesture(): void {
    this.activePointerId = null;
    this.lastScenePoint = null;
    this.deletedDuringGesture = false;
  }

  /** Main button, stylus eraser, and touch - the same gate the component uses. */
  private isEraserPointer(event: PointerEvent): boolean {
    return (
      event.button === MAIN_BUTTON ||
      event.button === STYLUS_ERASER_BUTTON ||
      event.pointerType === "touch"
    );
  }

  private toScenePoint(event: PointerEvent): ScenePoint | null {
    const api = this.host.excalidrawAPI;
    if (!api) {
      return null;
    }
    return viewportCoordsToSceneCoords(
      { clientX: event.clientX, clientY: event.clientY },
      api.getAppState(),
    );
  }

  /**
   * Erases everything the eraser path reaches between two pointer positions.
   * The path is sampled so a fast drag cannot jump over a stroke.
   */
  private eraseAlongPath(
    previous: ScenePoint | null,
    current: ScenePoint,
  ): void {
    const api = this.host.excalidrawAPI;
    if (!api) {
      return;
    }
    const appState = api.getAppState();
    const reach = this.reachInSceneUnits(appState.zoom.value);
    const start = previous ?? current;
    const distance = Math.hypot(current.x - start.x, current.y - start.y);
    const steps = Math.max(
      1,
      Math.ceil((distance * appState.zoom.value) / SWEEP_SAMPLE_SPACING_PX),
    );
    for (let step = 1; step <= steps; step++) {
      const sample = {
        x: start.x + ((current.x - start.x) * step) / steps,
        y: start.y + ((current.y - start.y) * step) / steps,
      };
      const hits = this.findHits(sample, reach);
      if (hits.length > 0) {
        this.eraseElements(hits);
      }
    }
  }

  /**
   * The reach the extra pass adds, in scene units: the configured radius minus
   * what the component's own eraser already reaches. The setting is a screen
   * size - like the component's own tolerance - so the eraser keeps feeling
   * the same at any zoom level.
   */
  private reachInSceneUnits(zoom: number): number {
    const extraReachPx = Math.max(
      0,
      this.host.getEraserSize() - NATIVE_ERASER_REACH_PX,
    );
    return extraReachPx / (zoom || 1);
  }

  /** Elements whose geometry comes within `reach` of `point`. */
  private findHits(point: ScenePoint, reach: number): ExcalidrawElement[] {
    const api = this.host.excalidrawAPI;
    if (!api) {
      return [];
    }
    const hits: ExcalidrawElement[] = [];
    for (const element of api.getSceneElements()) {
      if (element.locked) {
        continue;
      }
      // Cheap rejection: nothing outside this box can be within reach.
      if (
        point.x < element.x - reach ||
        point.y < element.y - reach ||
        point.x > element.x + element.width + reach ||
        point.y > element.y + element.height + reach
      ) {
        continue;
      }
      const local = toElementLocalPoint(point, element);
      if (this.isLocalHit(local, element, reach)) {
        hits.push(element);
      }
    }
    return hits;
  }

  private isLocalHit(
    local: ScenePoint,
    element: ExcalidrawElement,
    reach: number,
  ): boolean {
    const strokeWidth = "strokeWidth" in element ? element.strokeWidth : 0;
    const tolerance = reach + strokeWidth / 2;
    const points = "points" in element ? element.points : null;
    if (points && points.length > 0) {
      // Free draws, lines, and arrows: distance to the stroke itself, so the
      // empty inside of a closed shape is not part of the eraser's reach.
      if (points.length === 1) {
        return (
          pointSegmentDistance(
            local,
            { x: points[0][0], y: points[0][1] },
            { x: points[0][0], y: points[0][1] },
          ) <= tolerance
        );
      }
      for (let i = 1; i < points.length; i++) {
        const distance = pointSegmentDistance(
          local,
          { x: points[i - 1][0], y: points[i - 1][1] },
          { x: points[i][0], y: points[i][1] },
        );
        if (distance <= tolerance) {
          return true;
        }
      }
      return false;
    }
    // Shapes, text, images, and frames: the frame of the element counts, its
    // interior does not, which keeps a big shape from being erased from afar.
    return (
      pointRectBorderDistance(local, element.width, element.height) <= tolerance
    );
  }

  /**
   * Marks the hits (with their group and bound text) as deleted, mirroring the
   * component's eraser.
   */
  private eraseElements(hits: ExcalidrawElement[]): void {
    const api = this.host.excalidrawAPI;
    if (!api) {
      return;
    }
    const elements = api.getSceneElementsIncludingDeleted();
    const byId = new Map(elements.map((element) => [element.id, element]));
    const toErase = new Map<string, ExcalidrawElement>();
    for (const hit of hits) {
      toErase.set(hit.id, hit);
      const shallowestGroupId = hit.groupIds.at(-1);
      if (shallowestGroupId) {
        for (const element of elements) {
          if (element.groupIds.includes(shallowestGroupId)) {
            toErase.set(element.id, element);
          }
        }
      }
      // Bound text and its container belong to the element, as in the
      // component's eraser.
      const containerId =
        "containerId" in hit && typeof hit.containerId === "string"
          ? hit.containerId
          : null;
      const container = containerId ? byId.get(containerId) : null;
      if (container) {
        toErase.set(container.id, container);
      }
      for (const bound of hit.boundElements ?? []) {
        const boundElement = byId.get(bound.id);
        if (boundElement) {
          toErase.set(boundElement.id, boundElement);
        }
      }
    }
    for (const element of toErase.values()) {
      if (element.isDeleted) {
        continue;
      }
      api.mutateElement(element, { isDeleted: true });
      this.deletedDuringGesture = true;
    }
  }

  private hideCursor(): void {
    if (this.cursorEl) {
      setElementHidden(this.cursorEl, true);
    }
  }

  private showCursor(event: PointerEvent): void {
    const wrapper = this.wrapperEl;
    if (!wrapper) {
      return;
    }
    if (!this.cursorEl) {
      this.cursorEl = wrapper.createDiv({ cls: CURSOR_CLASS });
    }
    const size = this.host.getEraserSize();
    const wrapperRect = wrapper.getBoundingClientRect();
    setStyle(this.cursorEl, {
      left: `${event.clientX - wrapperRect.left}px`,
      top: `${event.clientY - wrapperRect.top}px`,
      width: `${size * 2}px`,
      height: `${size * 2}px`,
    });
    setElementHidden(this.cursorEl, false);
  }
}
