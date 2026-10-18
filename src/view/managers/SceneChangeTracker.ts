/**
 * Tracks element changes reported by Excalidraw without hashing the full scene
 * for app-state-only updates such as viewport panning.
 */
export class SceneChangeTracker {
  private revision = 0;
  private onChangeRevision = 0;
  private hookRevision = -1;

  /** Records one Excalidraw increment that contains element changes. */
  public recordElementChange(): void {
    this.revision += 1;
  }

  /**
   * Returns whether elements changed since the previous `onChange` callback,
   * then advances the callback's baseline.
   */
  public consumeElementChangeForOnChange(): boolean {
    const changed = this.revision !== this.onChangeRevision;
    this.onChangeRevision = this.revision;
    return changed;
  }

  /**
   * Returns whether elements changed since the previous scene-hook check,
   * then advances the hook's baseline.
   */
  public consumeElementChangeForHook(): boolean {
    const changed = this.revision !== this.hookRevision;
    this.hookRevision = this.revision;
    return changed;
  }
}
