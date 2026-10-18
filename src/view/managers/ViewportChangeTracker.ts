/** Input used to coalesce persistence notifications during pointer gestures. */
export interface ViewportChangeUpdate {
  pointerDown: boolean;
  viewportChanged: boolean;
  nonViewportChanged: boolean;
}

/**
 * Coalesces viewport dirty notifications while keeping autosave scheduling
 * responsive to long gestures.
 */
export class ViewportChangeTracker {
  private pointerDown = false;
  private viewportChangedDuringGesture = false;

  /**
   * Returns whether the host should advance its dirty revision for this update.
   * A viewport gesture marks dirty on its first movement and once more on
   * release, so an in-flight forced save cannot acknowledge an intermediate
   * viewport as the final one.
   */
  public shouldMarkDirty(update: ViewportChangeUpdate): boolean {
    if (update.pointerDown && !this.pointerDown) {
      this.viewportChangedDuringGesture = false;
    }

    let shouldMarkDirty = update.nonViewportChanged;
    if (update.viewportChanged) {
      if (update.pointerDown) {
        if (!this.viewportChangedDuringGesture) {
          shouldMarkDirty = true;
        }
        this.viewportChangedDuringGesture = true;
      } else {
        shouldMarkDirty = true;
      }
    }

    if (
      this.pointerDown &&
      !update.pointerDown &&
      this.viewportChangedDuringGesture
    ) {
      shouldMarkDirty = true;
      this.viewportChangedDuringGesture = false;
    }

    this.pointerDown = update.pointerDown;
    return shouldMarkDirty;
  }

  /** Resets gesture state when this view starts tracking a different drawing. */
  public reset(): void {
    this.pointerDown = false;
    this.viewportChangedDuringGesture = false;
  }
}
