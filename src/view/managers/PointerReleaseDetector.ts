/**
 * Tracks pointer presses to detect a release the platform never delivered.
 *
 * A mouse or pen has exactly one pointer: a second non-touch press while an
 * earlier non-touch press is still recorded means the earlier `pointerup`
 * (and its `pointercancel`) never arrived. Excalidraw keeps its own pointer
 * bookkeeping in a module-level map shared by every drawing in the window, so
 * a lost release there is not repaired by reopening the drawing.
 */
export class PointerReleaseDetector {
  private readonly pressed = new Map<number, string>();
  private droppedReleases: number[] = [];
  private lastActivityAt = 0;

  /** Records pointer traffic so an idle press can be told from an active one. */
  public noteActivity(at: number): void {
    this.lastActivityAt = at;
  }

  /** Records a press; reports earlier non-touch presses as lost releases. */
  public notePointerDown(
    pointerId: number,
    pointerType: string,
    at: number,
  ): void {
    this.lastActivityAt = at;
    if (pointerType !== "touch") {
      for (const [otherId, otherType] of this.pressed) {
        if (otherType !== "touch") {
          this.droppedReleases.push(otherId);
        }
      }
      for (const droppedId of this.droppedReleases) {
        this.pressed.delete(droppedId);
      }
    }
    this.pressed.set(pointerId, pointerType);
  }

  /** Records a delivered release for one pointer. */
  public notePointerRelease(pointerId: number, at: number): void {
    this.lastActivityAt = at;
    this.pressed.delete(pointerId);
  }

  /** Presses whose release never arrived; the report is consumed once. */
  public takeDroppedReleases(): number[] {
    const dropped = this.droppedReleases;
    this.droppedReleases = [];
    return dropped;
  }

  /**
   * Live non-touch presses with no pointer traffic for `idleMs`. A gesture the
   * component still believes in, with nothing happening on screen, is the
   * other shape of a lost release.
   */
  public findIdlePresses(now: number, idleMs: number): number[] {
    if (now - this.lastActivityAt < idleMs) {
      return [];
    }
    const idle: number[] = [];
    for (const [pointerId, pointerType] of this.pressed) {
      if (pointerType !== "touch") {
        idle.push(pointerId);
      }
    }
    return idle;
  }

  /** Whether a non-touch press is currently believed to be down. */
  public hasLivePress(): boolean {
    for (const pointerType of this.pressed.values()) {
      if (pointerType !== "touch") {
        return true;
      }
    }
    return false;
  }
}
