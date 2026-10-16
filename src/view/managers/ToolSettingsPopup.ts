import type { StrokeWidthKey } from "@zsviczian/excalidraw/types/common/src/constants";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@zsviczian/excalidraw/types/excalidraw/types";
import { CaptureUpdateAction } from "src/constants/constants";
import { t } from "src/lang/helpers";
import { setStyle } from "src/utils/styleUtils";
import { isInstanceOfElement } from "src/utils/typechecks";

/**
 * Toolbar tools that open this popup when their toolbar button is clicked
 * while the tool is already active. Adding a tool here is all that is needed
 * to give it a popup, provided `renderToolContent()` knows its controls.
 */
const TOOL_SETTINGS_TOOLS = ["freedraw"] as const;

type ToolSettingsTool = (typeof TOOL_SETTINGS_TOOLS)[number];

/** Toolbar buttons are labelled by the Excalidraw component with
 * `data-testid="toolbar-<tool type>"`. */
const TOOL_BUTTON_SELECTOR = "[data-testid^='toolbar-']";

/**
 * Only buttons inside a toolbar are intercepted: the tool popovers render
 * buttons with the same testids into the canvas container.
 */
const TOOLBAR_SELECTOR = ".App-toolbar, .excalidraw-mobile-toolbar";

const POPUP_CLASS = "excalidraw-tool-settings-popup";
const HEADING_CLASS = "excalidraw-tool-settings-heading";
const ITEM_CLASS = "excalidraw-tool-settings-item";
const SELECTED_ITEM_CLASS = "is-selected";

/** Gap between the toolbar button and the popup, in pixels. */
const ANCHOR_OFFSET = 6;

/**
 * Minimum view surface required by {@link ToolSettingsPopup}.
 *
 * `ownerDocument` must stay view-scoped: the popup element and its dismissal
 * listeners belong to the document hosting the view, so popouts work without
 * a second popup instance.
 */
export interface ToolSettingsPopupHost {
  readonly ownerDocument: Document;
  readonly excalidrawAPI: ExcalidrawImperativeAPI | null;
}

/**
 * The tool settings popup of the trimmed toolbar.
 *
 * The Excalidraw component ignores a click on a tool button whose tool is
 * already active (and in compact mode opens its own tool-variant popover
 * instead), so that second click is consumed here and answered with a small
 * settings panel under the button - currently the freedraw stroke width.
 *
 * A plain DOM popup is used instead of a React component because the panel
 * must outlive toolbar re-renders and is owned by the view rather than by the
 * Excalidraw component tree.
 */
export class ToolSettingsPopup {
  private wrapperEl: HTMLElement | null = null;
  private popupEl: HTMLDivElement | null = null;
  private anchorEl: HTMLElement | null = null;
  private openTool: ToolSettingsTool | null = null;
  private removeOpenListeners: (() => void) | null = null;

  public constructor(private readonly host: ToolSettingsPopupHost) {}

  /**
   * Starts intercepting toolbar clicks on the view's `.excalidraw-wrapper`.
   * Calling it again re-attaches to the given element.
   */
  public attach(wrapperEl: HTMLElement | null): void {
    this.detach();
    if (!wrapperEl) {
      return;
    }
    this.wrapperEl = wrapperEl;
    wrapperEl.addEventListener("click", this.onWrapperClick, true);
  }

  /** Detaches every listener and removes an open popup. */
  public detach(): void {
    this.close();
    this.wrapperEl?.removeEventListener("click", this.onWrapperClick, true);
    this.wrapperEl = null;
  }

  /** Whether `el` is inside this manager's popup. */
  private isPopupElement(el: Element): boolean {
    return Boolean(this.popupEl?.contains(el));
  }

  private readonly onWrapperClick = (event: MouseEvent): void => {
    const button = this.getToolbarButton(event.target);
    if (!button) {
      return;
    }
    const tool = this.getSettingsTool(button);
    if (!tool) {
      return;
    }
    if (this.host.excalidrawAPI?.getAppState().activeTool.type !== tool) {
      // The first click activates the tool through the Excalidraw component.
      return;
    }
    // The component ignores clicks on an already active tool. Consume the click
    // in the capture phase - the wrapper is an ancestor of the React root, so
    // stopping propagation keeps the component from running the button's own
    // onClick (including its compact-mode tool popover) - and show the panel.
    event.preventDefault();
    event.stopPropagation();
    if (this.popupEl && this.openTool === tool && this.anchorEl === button) {
      this.close();
      return;
    }
    this.open(tool, button);
  };

  private getToolbarButton(target: EventTarget | null): HTMLElement | null {
    if (!isInstanceOfElement(target)) {
      return null;
    }
    const button = target.closest<HTMLElement>(TOOL_BUTTON_SELECTOR);
    if (!button || !button.closest(TOOLBAR_SELECTOR)) {
      return null;
    }
    return button;
  }

  private getSettingsTool(button: HTMLElement): ToolSettingsTool | null {
    const testId = button.dataset.testid ?? "";
    const type = testId.startsWith("toolbar-")
      ? testId.slice("toolbar-".length)
      : "";
    return (TOOL_SETTINGS_TOOLS as readonly string[]).includes(type)
      ? (type as ToolSettingsTool)
      : null;
  }

  private open(tool: ToolSettingsTool, anchorEl: HTMLElement): void {
    this.close();
    const wrapper = this.wrapperEl;
    if (!wrapper) {
      return;
    }
    const popupEl = wrapper.createDiv({ cls: POPUP_CLASS });
    this.popupEl = popupEl;
    this.anchorEl = anchorEl;
    this.openTool = tool;
    this.renderToolContent(tool, popupEl);
    this.positionPopup(popupEl, anchorEl);
    this.removeOpenListeners = this.registerDismissHandlers();
  }

  private renderToolContent(
    tool: ToolSettingsTool,
    popupEl: HTMLDivElement,
  ): void {
    if (tool !== "freedraw") {
      return;
    }
    popupEl.createDiv({
      cls: HEADING_CLASS,
      text: t("PEN_SETTINGS_STROKE_WIDTH"),
    });
    const appState = this.host.excalidrawAPI?.getAppState();
    // An explicit numeric width overrides the preset key, so only a preset
    // width marks a selected entry.
    const activeKey =
      appState && appState.currentItemStrokeWidth == null
        ? appState.currentItemStrokeWidthKey
        : null;
    const strokeWidths: ReadonlyArray<readonly [StrokeWidthKey, string]> = [
      ["extraThin", t("PEN_SETTINGS_STROKE_PRESET_EXTRA_THIN")],
      ["thin", t("PEN_SETTINGS_STROKE_PRESET_THIN")],
      ["medium", t("PEN_SETTINGS_STROKE_PRESET_MEDIUM")],
      ["bold", t("PEN_SETTINGS_STROKE_PRESET_BOLD")],
      ["extraBold", t("PEN_SETTINGS_STROKE_PRESET_EXTRA_BOLD")],
    ];
    for (const [key, label] of strokeWidths) {
      const itemEl = popupEl.createEl("button", {
        cls: ITEM_CLASS,
        text: label,
        attr: { type: "button", "aria-pressed": String(key === activeKey) },
      });
      if (key === activeKey) {
        itemEl.addClass(SELECTED_ITEM_CLASS);
      }
      itemEl.onClickEvent(() => {
        this.applyStrokeWidth(key);
        this.close();
      });
    }
  }

  private applyStrokeWidth(key: StrokeWidthKey): void {
    const api = this.host.excalidrawAPI;
    if (!api) {
      return;
    }
    api.updateScene({
      appState: {
        // Mirrors the component's own stroke width panel: the explicit numeric
        // width has to be cleared so that the preset key takes effect.
        currentItemStrokeWidthKey: key,
        currentItemStrokeWidth: null,
      } as Pick<AppState, keyof AppState>,
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }

  private positionPopup(popupEl: HTMLDivElement, buttonEl: HTMLElement): void {
    const wrapper = this.wrapperEl;
    if (!wrapper) {
      return;
    }
    const wrapperRect = wrapper.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();
    // Centre the panel on its button, keeping it inside the view.
    const centredLeft =
      buttonRect.left -
      wrapperRect.left +
      buttonRect.width / 2 -
      popupEl.offsetWidth / 2;
    const maxLeft = wrapperRect.width - popupEl.offsetWidth - ANCHOR_OFFSET;
    // The toolbar sits above the canvas on the desktop and below it on mobile,
    // so the panel opens on whichever side has room.
    const spaceBelow = wrapperRect.bottom - buttonRect.bottom;
    const opensDown =
      spaceBelow >= popupEl.offsetHeight + ANCHOR_OFFSET ||
      spaceBelow >= buttonRect.top - wrapperRect.top;
    setStyle(popupEl, {
      left: `${Math.max(ANCHOR_OFFSET, Math.min(centredLeft, maxLeft))}px`,
      top: `${
        opensDown
          ? buttonRect.bottom - wrapperRect.top + ANCHOR_OFFSET
          : buttonRect.top -
            wrapperRect.top -
            popupEl.offsetHeight -
            ANCHOR_OFFSET
      }px`,
    });
  }

  /**
   * Closes the popup on the first interaction outside it, on Escape, and when
   * the window is resized (the toolbar moves away from the anchor).
   *
   * @returns a remover for every listener registered here
   */
  private registerDismissHandlers(): () => void {
    const doc = this.host.ownerDocument;
    const win = doc.defaultView ?? window;
    const onPointerDown = (event: PointerEvent) => {
      if (
        isInstanceOfElement(event.target) &&
        (this.isPopupElement(event.target) ||
          Boolean(this.anchorEl?.contains(event.target)))
      ) {
        return;
      }
      this.close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // The popup owns this key press while it is open.
        event.preventDefault();
        event.stopPropagation();
        this.close();
        return;
      }
      if (
        isInstanceOfElement(event.target) &&
        this.isPopupElement(event.target)
      ) {
        return;
      }
      // Tool shortcuts and anything else typed outside the popup leave it.
      this.close();
    };
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("keydown", onKeyDown, true);
    win.addEventListener("resize", this.onLayoutChange);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("keydown", onKeyDown, true);
      win.removeEventListener("resize", this.onLayoutChange);
    };
  }

  private readonly onLayoutChange = (): void => {
    // A resize moves the toolbar; anchoring to stale coordinates would leave
    // the popup floating in the wrong place.
    this.close();
  };

  private close(): void {
    this.removeOpenListeners?.();
    this.removeOpenListeners = null;
    this.popupEl?.remove();
    this.popupEl = null;
    this.anchorEl = null;
    this.openTool = null;
  }
}
