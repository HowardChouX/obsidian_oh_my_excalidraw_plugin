import type { AppState } from "@zsviczian/excalidraw/types/excalidraw/types";

/** How long after the last freedraw point the autosave still waits, in ms. */
export const FREEDRAW_AUTOSAVE_GRACE_MS = 2000;

/**
 * The editor signals the autosave timer checks for in-progress interactions.
 *
 * Fields are optional-tolerant because parts of the plugin read the app state
 * as a partial object.
 */
export interface AutosaveInteractionGateInput {
  activeToolType: string | null | undefined;
  editingTextElement: unknown;
  newElement: unknown;
  /**
   * `"down"` while a pointer gesture is in progress. The Excalidraw component
   * sets it on pointer down - before a pan session starts - and back on
   * pointer up, so it covers drawing, dragging, and panning alike.
   */
  cursorButton: AppState["cursorButton"] | null | undefined;
  /** Timestamp of the last freedraw point in ms; falsy when never. */
  freedrawLastActive: number | null | undefined;
  now: number;
}

/**
 * Whether an in-progress interaction should keep the autosave waiting.
 *
 * Saving is not free: the drawing is serialized on the main thread, so a save
 * landing in the middle of a gesture shows up as a stall. Drawing strokes
 * (freedraw grace, new element) and text editing were already covered.
 * `cursorButton` additionally covers the gestures that carry no element of
 * their own - above all secondary-button (right-button) panning, which marks
 * the drawing dirty through its scroll position and previously let a save fire
 * mid-drag once the autosave interval elapsed.
 *
 * The timer keeps polling, so the save happens right after the gesture ends.
 */
export function isAutosaveBlockedByInteraction(
  input: AutosaveInteractionGateInput,
): boolean {
  if (input.cursorButton === "down") {
    return true;
  }
  if (input.editingTextElement != null) {
    return true;
  }
  if (input.newElement != null) {
    return true;
  }
  if (
    input.activeToolType === "freedraw" &&
    Boolean(input.freedrawLastActive) &&
    input.freedrawLastActive > input.now - FREEDRAW_AUTOSAVE_GRACE_MS
  ) {
    return true;
  }
  return false;
}
