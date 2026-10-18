import { log } from "src/utils/debugHelper";
import { PointerReleaseDetector } from "./PointerReleaseDetector";

/** How long a live press may stay silent before it is treated as lost. */
const IDLE_PRESS_TIMEOUT_MS = 15000;

/** How often the watchdog checks for a pointer gesture that cannot end. */
const CHECK_INTERVAL_MS = 2000;

/** Minimum gap between two recoveries, so a stuck state cannot loop. */
const RECOVERY_COOLDOWN_MS = 30000;

/** Delay before a cursor state that survived the cancel dispatch is cleared. */
const CURSOR_BUTTON_CLEAR_DELAY_MS = 80;

/** Searchable prefix for the one diagnostic line a recovery emits. */
export const GESTURE_RECOVERY_LOG_PREFIX = "[OME-gesture-recovery]";

/** What the watchdog needs from its owning Excalidraw view. */
export interface PointerGestureWatchdogHost {
  readonly ownerDocument: Document;
  /** Whether Excalidraw currently believes a pointer button is held. */
  getCursorButton(): "up" | "down" | null | undefined;
  /** The canvas that owns Excalidraw's own pointer handlers. */
  getInteractiveCanvas(): HTMLElement | null;
  /** True while the view is loaded and its Excalidraw API is usable. */
  isRecoverable(): boolean;
  /** Clears a `cursorButton` the component left behind after a lost release. */
  releaseStuckCursorButton(): void;
}

/**
 * Purpose:
 *   Recover a drawing whose canvas stopped responding because the platform
 *   never delivered a pointer release.
 *
 *   Excalidraw ends its pan/gesture state from the canvas element's own
 *   `pointerup`/`pointercancel` handlers, and keeps its live-pointer map in a
 *   module-level object that is shared by every drawing in the window. A
 *   stylus or mouse whose release is lost (button state reported on a move,
 *   the pen leaving hover range, a release outside the canvas) therefore
 *   leaves that map holding a pointer forever: the component then refuses new
 *   presses, so the drawing can neither be edited nor panned, and reopening
 *   the file does not help because the map outlives the view.
 *
 * Notes:
 *   - The watchdog only replays the event the platform dropped: it dispatches
 *     `pointercancel` for the lost pointer on the interactive canvas, which
 *     runs the component's own cleanup. It never reimplements that cleanup.
 *   - Detection is deliberately narrow. A second non-touch press while an
 *     earlier one is still open is impossible for a mouse or pen, and a press
 *     that stays silent for {@link IDLE_PRESS_TIMEOUT_MS} while the component
 *     still reports a held button has nothing left to drive it.
 *   - Recoveries are rate-limited and logged with
 *     {@link GESTURE_RECOVERY_LOG_PREFIX} so a recurrence can be reported.
 */
export class PointerGestureWatchdog {
  private readonly detector = new PointerReleaseDetector();
  private container: HTMLElement | null = null;
  private checkTimer: number | null = null;
  private lastRecoveryAt = Number.NEGATIVE_INFINITY;
  private detached = true;

  public constructor(private readonly host: PointerGestureWatchdogHost) {}

  /** Starts watching pointer traffic for the given Excalidraw container. */
  public attach(container: HTMLElement | null): void {
    this.detach();
    if (!container) {
      return;
    }
    this.detached = false;
    this.container = container;
    const doc = this.host.ownerDocument;
    doc.addEventListener("pointerdown", this.onPointerDown, true);
    doc.addEventListener("pointerup", this.onPointerUp, true);
    doc.addEventListener("pointercancel", this.onPointerUp, true);
    doc.addEventListener("pointermove", this.onPointerMove, {
      capture: true,
      passive: true,
    });
    this.scheduleCheck();
  }

  /** Removes every listener and stops the watchdog. */
  public detach(): void {
    this.detached = true;
    if (this.checkTimer !== null) {
      this.host.ownerDocument.defaultView?.clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
    const doc = this.host.ownerDocument;
    doc.removeEventListener("pointerdown", this.onPointerDown, true);
    doc.removeEventListener("pointerup", this.onPointerUp, true);
    doc.removeEventListener("pointercancel", this.onPointerUp, true);
    doc.removeEventListener("pointermove", this.onPointerMove, true);
    this.container = null;
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.detector.notePointerDown(
      event.pointerId,
      event.pointerType,
      Date.now(),
    );
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.detector.notePointerRelease(event.pointerId, Date.now());
  };

  private readonly onPointerMove = (): void => {
    this.detector.noteActivity(Date.now());
  };

  private scheduleCheck(): void {
    if (this.detached) {
      return;
    }
    this.checkTimer = this.host.ownerDocument.defaultView?.setTimeout(
      this.check,
      CHECK_INTERVAL_MS,
    );
    if (this.checkTimer === null) {
      return;
    }
  }

  private readonly check = (): void => {
    this.checkTimer = null;
    if (this.detached) {
      return;
    }
    const now = Date.now();
    const dropped = this.detector.takeDroppedReleases();
    if (dropped.length > 0) {
      this.recover(dropped, "dropped-release", now);
    } else if (this.host.getCursorButton() === "down") {
      const idle = this.detector.findIdlePresses(now, IDLE_PRESS_TIMEOUT_MS);
      if (idle.length > 0) {
        this.recover(idle, "silent-press", now);
      }
    }
    this.scheduleCheck();
  };

  private recover(pointerIds: number[], reason: string, now: number): void {
    if (
      !this.host.isRecoverable() ||
      now - this.lastRecoveryAt < RECOVERY_COOLDOWN_MS
    ) {
      return;
    }
    const canvas = this.host.getInteractiveCanvas();
    if (!canvas) {
      return;
    }
    const win = this.host.ownerDocument.defaultView;
    if (!win) {
      return;
    }
    this.lastRecoveryAt = now;
    for (const pointerId of pointerIds) {
      // The component's own `pointercancel` cleanup is the only supported way
      // to drop a pointer it still holds.
      canvas.dispatchEvent(
        new win.PointerEvent("pointercancel", {
          pointerId,
          pointerType: "mouse",
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    log(
      `${GESTURE_RECOVERY_LOG_PREFIX} reason=${reason} pointerIds=${pointerIds.join(",")}`,
    );
    win.setTimeout(() => {
      if (this.detached || !this.host.isRecoverable()) {
        return;
      }
      if (this.host.getCursorButton() === "down") {
        this.host.releaseStuckCursorButton();
      }
    }, CURSOR_BUTTON_CLEAR_DELAY_MS);
  }
}
