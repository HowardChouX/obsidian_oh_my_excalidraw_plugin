import { getIcon } from "obsidian";
import { t } from "src/lang/helpers";
import { clearCanvas } from "src/utils/excalidrawSceneUtils";
import { MultiOptionConfirmationPrompt } from "src/shared/Dialogs/Prompt";
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
 *   The "Reset the canvas" button of the trimmed toolbar.
 *
 *   The Excalidraw component offers no hook for adding a button to its toolbar,
 *   so the button is appended to the toolbar row as a plain DOM node and
 *   re-appended whenever the component re-renders that row (see
 *   {@link scheduleSync}). It reuses the component's own `ToolIcon` classes, so
 *   it looks and hovers like the tool buttons around it.
 *
 *   The button itself clears the drawing through `clearCanvas()` after a
 *   confirmation, which is the same behaviour the component's MainMenu item had.
 */
export class ToolbarResetButton {
  private rowEl: HTMLElement | null = null;
  private buttonEl: HTMLButtonElement | null = null;
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
   * dropped it.
   *
   * Called from the view's render hook, so the cheap connectedness check stays
   * on the render path and the DOM work is deferred to a microtask.
   */
  public scheduleSync(): void {
    if (this.detached || this.syncScheduled || this.isButtonConnected()) {
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

  private isButtonConnected(): boolean {
    return Boolean(this.buttonEl?.isConnected);
  }

  private sync(container: HTMLElement): void {
    if (this.detached) {
      return;
    }
    const rowEl = this.findToolbarRow(container);
    if (!rowEl) {
      // The toolbar is not in the DOM yet; the next render retries.
      this.buttonEl?.remove();
      this.buttonEl = null;
      this.rowEl = null;
      return;
    }
    if (this.buttonEl && this.rowEl === rowEl && rowEl.contains(this.buttonEl)) {
      return;
    }
    this.buttonEl?.remove();
    this.rowEl = rowEl;
    this.buttonEl = this.createButton(rowEl);
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
    const buttonEl = rowEl.createEl("button", {
      cls: BUTTON_CLASS,
      attr: { type: "button", "aria-label": t("RESET_CANVAS_BUTTON") },
    });
    const iconEl = buttonEl.createDiv({ cls: ICON_WRAPPER_CLASS });
    const icon = getIcon("trash-2");
    if (icon) {
      iconEl.appendChild(icon);
    }
    buttonEl.onClickEvent(() => void this.confirmAndReset());
    return buttonEl;
  }

  /**
   * Empties the drawing after confirming, replacing the Excalidraw component's
   * "Reset the canvas" menu item.
   */
  private async confirmAndReset(): Promise<void> {
    const api = this.view.excalidrawAPI;
    if (!api || api.getSceneElements().length === 0) {
      return;
    }
    const confirmationPrompt = new MultiOptionConfirmationPrompt(
      this.view.plugin,
      t("RESET_CANVAS_CONFIRMATION"),
    );
    const confirmed = await confirmationPrompt.waitForClose;
    // The confirmation is modal: the view may have reloaded or migrated while
    // it was open, and the captured API belongs to the drawing it started on.
    if (
      !confirmed ||
      this.detached ||
      this.view.isClosingOrMigrating() ||
      this.view.excalidrawAPI !== api
    ) {
      return;
    }
    clearCanvas(api);
  }
}
