import { getIcon } from "obsidian";
import { t } from "src/lang/helpers";
import { clearCanvas } from "src/utils/excalidrawSceneUtils";
import type ExcalidrawView from "../ExcalidrawView";

/**
 * Where the Excalidraw component keeps its tool buttons: the desktop and tray
 * toolbars render them into a horizontal Stack inside the toolbar Island, the
 * phone toolbar renders them into its own container.
 */
const TOOLBAR_ROW_SELECTORS = [
  ".App-toolbar .Stack_horizontal",
  ".excalidraw-mobile-toolbar",
];

/** Classes of the component's own tool buttons, so the button matches them. */
const BUTTON_CLASS = "ToolIcon ToolIcon_type_toggle ToolIcon_size_medium";
const ICON_WRAPPER_CLASS = "ToolIcon__icon";

/**
 * Purpose:
 *   The "Clear canvas (undoable)" button of the trimmed toolbar.
 *
 *   The Excalidraw component offers no hook for adding a button to its toolbar,
 *   so the button is appended to the toolbar row as a plain DOM node and
 *   re-appended whenever the component re-renders that row (see
 *   {@link scheduleSync}). It reuses the component's own `ToolIcon` classes, so
 *   it looks, hovers, and greys out like the tool buttons around it.
 *
 *   Like the clear action of oh-my-pdftion and oh-my-ink, the button clears the
 *   drawing directly: `clearCanvas()` records the change as one undoable step,
 *   so no confirmation dialog is needed. The button is disabled while the
 *   drawing has no elements, matching those plugins' disabled clear button.
 */
export class ToolbarResetButton {
  private rowEl: HTMLElement | null = null;
  private buttonEl: HTMLButtonElement | null = null;
  private iconEl: HTMLDivElement | null = null;
  private syncScheduled = false;
  private detached = false;

  public constructor(private readonly view: ExcalidrawView) {}

  /** Starts managing the button inside `container` (the view wrapper). */
  public attach(container: HTMLElement | null): void {
    this.detach();
    this.detached = false;
    if (!container) {
      return;
    }
    this.sync(container);
  }

  /** Removes the button and stops re-adding it. */
  public detach(): void {
    this.detached = true;
    this.buttonEl?.remove();
    this.buttonEl = null;
    this.rowEl = null;
  }

  /**
   * Re-adds the button if the component re-rendered the toolbar row and
   * dropped it, and refreshes whether the action is currently available.
   *
   * Called from the view's render hook, so only the cheap scheduling stays on
   * the render path and the DOM work is deferred to a microtask.
   */
  public scheduleSync(): void {
    if (this.detached || this.syncScheduled) {
      return;
    }
    const container = this.view.excalidrawWrapperRef?.current;
    if (!container) {
      return;
    }
    this.syncScheduled = true;
    queueMicrotask(() => {
      this.syncScheduled = false;
      if (!this.detached) {
        this.sync(container);
      }
    });
  }

  private sync(container: HTMLElement): void {
    if (this.detached) {
      return;
    }
    const rowEl = this.rowEl?.isConnected
      ? this.rowEl
      : this.findToolbarRow(container);
    if (!rowEl) {
      // The toolbar is not in the DOM yet; the next render retries.
      this.buttonEl?.remove();
      this.buttonEl = null;
      this.rowEl = null;
      this.iconEl = null;
      return;
    }
    if (
      this.buttonEl &&
      this.rowEl === rowEl &&
      rowEl.contains(this.buttonEl)
    ) {
      this.refreshEnabledState();
      return;
    }
    this.buttonEl?.remove();
    this.rowEl = rowEl;
    this.buttonEl = this.createButton(rowEl);
    this.refreshEnabledState();
  }

  private findToolbarRow(container: HTMLElement): HTMLElement | null {
    for (const selector of TOOLBAR_ROW_SELECTORS) {
      const rowEl = container.querySelector<HTMLElement>(selector);
      if (rowEl) {
        return rowEl;
      }
    }
    return null;
  }

  private createButton(rowEl: HTMLElement): HTMLButtonElement {
    const label = t("RESET_CANVAS_BUTTON");
    const buttonEl = rowEl.createEl("button", {
      cls: BUTTON_CLASS,
      attr: { type: "button", "aria-label": label, title: label },
    });
    const iconEl = buttonEl.createDiv({ cls: ICON_WRAPPER_CLASS });
    const icon = getIcon("trash-2");
    if (icon) {
      iconEl.appendChild(icon);
    }
    this.iconEl = iconEl;
    buttonEl.onClickEvent(() => this.clearCanvas());
    return buttonEl;
  }

  /**
   * Mirrors the component's disabled tool buttons: the action is unavailable
   * while the drawing is empty, so the button cannot be clicked by accident.
   */
  private refreshEnabledState(): void {
    if (!this.buttonEl) {
      return;
    }
    const isEmpty =
      (this.view.excalidrawAPI?.getSceneElements().length ?? 0) === 0;
    this.buttonEl.disabled = isEmpty;
    this.iconEl?.setAttribute("aria-disabled", String(isEmpty));
  }

  /**
   * Empties the drawing, replacing the Excalidraw component's "Reset the
   * canvas" menu item. `clearCanvas()` leaves the change on the undo stack, so
   * a single undo brings the drawing back and the button needs no confirmation.
   */
  private clearCanvas(): void {
    const api = this.view.excalidrawAPI;
    if (!api || this.view.isClosingOrMigrating()) {
      return;
    }
    clearCanvas(api);
    this.refreshEnabledState();
  }
}
