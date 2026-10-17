import { t } from "src/lang/helpers";
import { clearCanvas } from "src/utils/excalidrawSceneUtils";
import type ExcalidrawView from "../ExcalidrawView";

/**
 * Where the toolbar is injected: the row holding the component's toolbar
 * Island on desktop and in the tray, and the phone toolbar's bottom bar.
 */
const CONTAINER_SELECTORS = [".App-toolbar-container", ".App-bottom-bar"];

const TOOLBAR_CLASS = "excalidraw-ome-toolbar";
const BUTTON_CLASS = "excalidraw-ome-toolbar-button";
const ACTION_CLASS = "excalidraw-ome-toolbar-action";
const ACTIVE_CLASS = "is-active";

/** Toolbar tools, in oh-my-ink's order. The value is the Excalidraw tool type. */
const TOOLS = ["hand", "selection", "freedraw", "eraser"] as const;

type ToolbarTool = (typeof TOOLS)[number];

/**
 * Material Symbols Rounded icons, as used by the oh-my-ink toolbar the look is
 * taken from (hand: pan_tool, select: arrow_selector_tool, pen: gesture,
 * eraser: ink_eraser, clear: delete_sweep, undo/redo).
 */
const TOOLBAR_ICONS: Record<string, { viewBox: string; path: string }> = {
  hand: {
    viewBox: "0 0 24 24",
    path: "M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z",
  },
  selection: {
    viewBox: "0 -960 960 960",
    path: "m320-410 79-110h170L320-716v306Zm286 305q-23 11-46 2.5T526-134L406-392l-93 130q-17 24-45 15t-28-38v-513q0-25 22.5-36t42.5 5l404 318q23 17 13.5 44T684-440H516l119 255q11 23 2.5 46T606-105ZM399-520Z",
  },
  freedraw: {
    viewBox: "0 -960 960 960",
    path: "M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-5 0-12 3t-15 11q-15 14-34.5 15T155-724q-15-16-15.5-37.5T155-797q24-21 48-32t47-11q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h49q21 0 35.5 14.5T840-415q0 21-14.5 35.5T790-365h-49q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z",
  },
  eraser: {
    viewBox: "0 -960 960 960",
    path: "M690-240h150q17 0 28.5 11.5T880-200q0 17-11.5 28.5T840-160H610l80-80Zm-483 80q-8 0-15.5-3t-13.5-9l-73-73q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L532-172q-6 6-13.5 9t-15.5 3H207Zm279-80 314-322-198-198-442 456 64 64h262Zm-6-240Z",
  },
  clear: {
    viewBox: "0 0 24 24",
    path: "M15 16h4v2h-4zM15 8h7v2h-7zM15 12h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z",
  },
  undo: {
    viewBox: "0 -960 960 960",
    path: "M320-200q-17 0-28.5-11.5T280-240q0-17 11.5-28.5T320-280h244q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11L188-572q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l144-144q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H320Z",
  },
  redo: {
    viewBox: "0 -960 960 960",
    path: "M648-560H396q-63 0-109.5 40T240-420q0 60 46.5 100T396-280h244q17 0 28.5 11.5T680-240q0 17-11.5 28.5T640-200H396q-97 0-166.5-63T160-420q0-94 69.5-157T396-640h252l-76-76q-11-11-11-28t11-28q11-11 28-11t28 11l144 144q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L628-428q-11 11-28 11t-28-11q-11-11-11-28t11-28l76-76Z",
  },
};

/**
 * Purpose:
 *   The toolbar of the trimmed plugin, in the look of the oh-my-ink toolbar:
 *   round icon buttons in one row - hand, select, pen, eraser, then clear,
 *   undo, redo - replacing the Excalidraw component's own toolbar, which is
 *   hidden (see styles.css).
 *
 * Notes:
 *   - The component offers no hook for replacing its toolbar, so this toolbar
 *     is injected into the component's toolbar row as a plain DOM node and
 *     re-injected whenever the component re-renders that row (see
 *     {@link scheduleSync}). Styling is the plugin's own, modelled on
 *     oh-my-ink's `ink_tool-menu` (button and active colours come from
 *     Obsidian's interactive/color variables).
 *   - Clicking the active pen or eraser opens the appearance popup; that
 *     interception lives in `ToolSettingsPopup`, which watches this toolbar's
 *     buttons. The first click on a tool activates it through the component's
 *     API, keeping pen-mode detection and keyboard shortcuts intact.
 */
export class CustomToolbar {
  private containerEl: HTMLElement | null = null;
  private toolbarEl: HTMLDivElement | null = null;
  private syncScheduled = false;
  private detached = false;

  public constructor(private readonly view: ExcalidrawView) {}

  /** Starts managing the toolbar inside `container` (the view wrapper). */
  public attach(container: HTMLElement | null): void {
    this.detach();
    this.detached = false;
    if (!container) {
      return;
    }
    this.containerEl = container;
    this.sync();
  }

  /** Removes the toolbar and stops re-adding it. */
  public detach(): void {
    this.detached = true;
    this.toolbarEl?.remove();
    this.toolbarEl = null;
    this.containerEl = null;
  }

  /**
   * Re-adds the toolbar if the component re-rendered its row and dropped it,
   * and refreshes button states (active tool, clear availability).
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
        this.containerEl = container;
        this.sync();
      }
    });
  }

  private sync(): void {
    if (this.detached) {
      return;
    }
    const rowEl =
      this.toolbarEl?.isConnected && this.toolbarEl.parentElement
        ? this.toolbarEl.parentElement
        : this.findContainerRow();
    if (!rowEl) {
      // The toolbar row is not in the DOM (view mode, loading); the next
      // render retries.
      this.toolbarEl?.remove();
      this.toolbarEl = null;
      return;
    }
    if (!this.toolbarEl || this.toolbarEl.parentElement !== rowEl) {
      this.toolbarEl?.remove();
      this.toolbarEl = this.createToolbar(rowEl);
    }
    this.refreshButtonStates();
  }

  private findContainerRow(): HTMLElement | null {
    const container = this.containerEl;
    if (!container) {
      return null;
    }
    for (const selector of CONTAINER_SELECTORS) {
      const rowEl = container.querySelector<HTMLElement>(selector);
      if (rowEl) {
        return rowEl;
      }
    }
    return null;
  }

  private createToolbar(rowEl: HTMLElement): HTMLDivElement {
    const toolbarEl = rowEl.createDiv({ cls: TOOLBAR_CLASS });
    for (const tool of TOOLS) {
      toolbarEl.appendChild(this.createToolButton(tool));
    }
    toolbarEl.appendChild(this.createActionButton("clear"));
    toolbarEl.appendChild(this.createActionButton("undo"));
    toolbarEl.appendChild(this.createActionButton("redo"));
    return toolbarEl;
  }

  private createToolButton(tool: ToolbarTool): HTMLButtonElement {
    const label = this.toolLabel(tool);
    const buttonEl = this.toolbarButtonEl(tool, label);
    buttonEl.onClickEvent(() => {
      const api = this.view.excalidrawAPI;
      if (!api || this.view.isClosingOrMigrating()) {
        return;
      }
      api.setActiveTool({ type: tool });
    });
    return buttonEl;
  }

  private createActionButton(
    action: "clear" | "undo" | "redo",
  ): HTMLButtonElement {
    const label =
      action === "clear"
        ? t("RESET_CANVAS_BUTTON")
        : action === "undo"
          ? t("OME_TOOLBAR_UNDO")
          : t("OME_TOOLBAR_REDO");
    const buttonEl = this.toolbarButtonEl(action, label);
    buttonEl.addClass(ACTION_CLASS);
    buttonEl.dataset.omeAction = action;
    buttonEl.onClickEvent(() => {
      const api = this.view.excalidrawAPI;
      if (!api || this.view.isClosingOrMigrating()) {
        return;
      }
      if (action === "clear") {
        clearCanvas(api);
        this.refreshButtonStates();
      } else if (action === "undo") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- `history.undo` resolves to `any` through the component's class-typed API surface; this is its documented undo entry point.
        api.history.undo();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- `history.redo` resolves to `any` through the component's class-typed API surface; this is its documented redo entry point.
        api.history.redo();
      }
    });
    return buttonEl;
  }

  /** A round icon button with a Material Symbols glyph, as in oh-my-ink. */
  private toolbarButtonEl(key: string, label: string): HTMLButtonElement {
    const buttonEl = createFragment().createEl("button", {
      cls: BUTTON_CLASS,
      attr: { type: "button", "aria-label": label, title: label },
    });
    buttonEl.dataset.omeTool = key;
    const icon = TOOLBAR_ICONS[key];
    buttonEl.createSvg(
      "svg",
      { attr: { viewBox: icon.viewBox, "aria-hidden": "true" } },
      (svgEl) => {
        svgEl.createSvg("path", { attr: { d: icon.path } });
      },
    );
    return buttonEl;
  }

  private toolLabel(tool: ToolbarTool): string {
    switch (tool) {
      case "hand":
        return t("OME_TOOLBAR_HAND");
      case "selection":
        return t("OME_TOOLBAR_SELECT");
      case "freedraw":
        return t("OME_TOOLBAR_PEN");
      case "eraser":
        return t("OME_TOOLBAR_ERASER");
    }
  }

  /**
   * Highlights the active tool and disables the clear action while the
   * drawing is empty, mirroring oh-my-ink's toolbar states.
   */
  private refreshButtonStates(): void {
    const toolbarEl = this.toolbarEl;
    const api = this.view.excalidrawAPI;
    if (!toolbarEl || !api) {
      return;
    }
    const activeTool = api.getAppState().activeTool.type;
    toolbarEl
      .querySelectorAll<HTMLButtonElement>(`.${BUTTON_CLASS}[data-ome-tool]`)
      .forEach((buttonEl) => {
        const tool = buttonEl.dataset.omeTool ?? "";
        const isActive =
          tool === activeTool ||
          (tool === "selection" && activeTool === "lasso");
        buttonEl.toggleClass(ACTIVE_CLASS, isActive);
      });
    const clearButton = toolbarEl.querySelector<HTMLButtonElement>(
      `.${ACTION_CLASS}[data-ome-action="clear"]`,
    );
    if (clearButton) {
      clearButton.disabled = api.getSceneElements().length === 0;
    }
  }
}
