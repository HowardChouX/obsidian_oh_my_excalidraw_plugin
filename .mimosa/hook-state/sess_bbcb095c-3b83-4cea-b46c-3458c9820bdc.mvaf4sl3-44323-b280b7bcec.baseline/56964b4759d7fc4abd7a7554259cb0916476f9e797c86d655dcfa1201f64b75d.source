/**
 * Right-button drag panning.
 *
 * Excalidraw's context menu is disabled plugin-wide (the host adapter reports
 * `isContextMenuDisabled() === true`), so the right mouse button is free to
 * pan the canvas like a graphics application. Listeners are installed on the
 * view's content element in the capture phase and only react to right-button
 * pointer gestures that start on the Excalidraw canvas; text editing targets
 * keep their native behaviour.
 */
import { CaptureUpdateAction } from "src/constants/constants";
import type ExcalidrawView from "../ExcalidrawView";

export class ViewRightDragPanManager {
  private host: HTMLElement | null = null;
  private panning = false;
  private startClientX = 0;
  private startClientY = 0;
  private startScrollX = 0;
  private startScrollY = 0;
  private pendingClientX = 0;
  private pendingClientY = 0;
  private frame: number | null = null;

  public constructor(private readonly view: ExcalidrawView) {}

  public attach(host: HTMLElement): void {
    if (this.host || !host) {
      return;
    }
    this.host = host;
    host.addEventListener("pointerdown", this.onPointerDown, true);
    host.addEventListener("pointermove", this.onPointerMove, true);
    host.addEventListener("pointerup", this.onPointerUp, true);
    host.addEventListener("pointercancel", this.onPointerUp, true);
    host.addEventListener("contextmenu", this.onContextMenu, true);
  }

  public destroy(): void {
    const host = this.host;
    if (!host) {
      return;
    }
    host.removeEventListener("pointerdown", this.onPointerDown, true);
    host.removeEventListener("pointermove", this.onPointerMove, true);
    host.removeEventListener("pointerup", this.onPointerUp, true);
    host.removeEventListener("pointercancel", this.onPointerUp, true);
    host.removeEventListener("contextmenu", this.onContextMenu, true);
    this.endPan();
    this.host = null;
  }

  /**
   * Suppresses the canvas context menu as a capture-phase guard (the fork's
   * own `disableContextMenu` state is asserted on load, this covers any other
   * route that could open a menu). Text editing targets and embedded Obsidian
   * views keep their native menus.
   */
  private onContextMenu = (event: MouseEvent): void => {
    if (this.isEditableTarget(event.target)) {
      return;
    }
    if (!this.isCanvasTarget(event.target)) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private isEditableTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || typeof el.tagName !== "string") {
      return false;
    }
    const tag = el.tagName.toUpperCase();
    return tag === "TEXTAREA" || tag === "INPUT" || el.isContentEditable === true;
  }

  private isCanvasTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || typeof el.closest !== "function") {
      return false;
    }
    return Boolean(el.closest(".excalidraw__canvas"));
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 2 || this.panning) {
      return;
    }
    if (this.isEditableTarget(event.target)) {
      return;
    }
    if (!this.isCanvasTarget(event.target)) {
      return;
    }
    const api = this.view.excalidrawAPI;
    if (!api) {
      return;
    }
    const appState = api.getAppState();
    this.panning = true;
    this.startClientX = event.clientX;
    this.startClientY = event.clientY;
    this.pendingClientX = event.clientX;
    this.pendingClientY = event.clientY;
    this.startScrollX = appState.scrollX;
    this.startScrollY = appState.scrollY;
    try {
      (event.target as Element).setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is best-effort; panning still works without it.
    }
    this.host?.addClass("excalidraw-right-drag-panning");
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.panning) {
      return;
    }
    this.pendingClientX = event.clientX;
    this.pendingClientY = event.clientY;
    if (this.frame !== null) {
      return;
    }
    const win = this.host?.ownerDocument?.defaultView ?? window;
    this.frame = win.requestAnimationFrame(this.applyPan);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.panning || (event.type === "pointerup" && event.button !== 2)) {
      return;
    }
    try {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    } catch {
      // Ignore: capture may never have been taken.
    }
    this.applyPan();
    this.endPan();
  };

  private applyPan = (): void => {
    this.frame = null;
    if (!this.panning) {
      return;
    }
    const api = this.view.excalidrawAPI;
    if (!api) {
      return;
    }
    const zoom = api.getAppState().zoom.value || 1;
    const dx = (this.pendingClientX - this.startClientX) / zoom;
    const dy = (this.pendingClientY - this.startClientY) / zoom;
    // Matches Excalidraw's own pan math (scrollX + delta / zoom): content
    // follows the pointer.
    api.updateScene({
      appState: {
        scrollX: this.startScrollX + dx,
        scrollY: this.startScrollY + dy,
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  };

  private endPan(): void {
    if (!this.panning) {
      return;
    }
    this.panning = false;
    if (this.frame !== null) {
      const win = this.host?.ownerDocument?.defaultView ?? window;
      win.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.host?.removeClass("excalidraw-right-drag-panning");
  }
}
