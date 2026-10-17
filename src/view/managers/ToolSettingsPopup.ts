import type { StrokeWidthKey } from "@zsviczian/excalidraw/types/common/src/constants";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@zsviczian/excalidraw/types/excalidraw/types";
import { CaptureUpdateAction } from "src/constants/constants";
import {
  clampEraserSize,
  ERASER_SIZE_MAX_PX,
  ERASER_SIZE_MIN_PX,
  ERASER_SIZE_STEP_PX,
} from "src/utils/eraserHitTest";
import { t } from "src/lang/helpers";
import { setStyle } from "src/utils/styleUtils";
import { isInstanceOfElement } from "src/utils/typechecks";

/**
 * Toolbar tools that open this popup when their toolbar button is clicked
 * while the tool is already active. Adding a tool here is all that is needed
 * to give it a popup, provided `renderToolContent()` knows its controls.
 */
const TOOL_SETTINGS_TOOLS = ["freedraw", "eraser"] as const;

type ToolSettingsTool = (typeof TOOL_SETTINGS_TOOLS)[number];

/** Buttons of the plugin's own toolbar carry `data-ome-tool="<tool type>"`. */
const TOOL_BUTTON_SELECTOR = "[data-ome-tool]";

/**
 * Only buttons inside the toolbar are intercepted, so unrelated elements
 * carrying the attribute cannot open the panel.
 */
const TOOLBAR_SELECTOR = ".excalidraw-ome-toolbar";

const POPUP_CLASS = "excalidraw-tool-settings-popup";
const ROW_CLASS = "excalidraw-tool-settings-row";
const LABEL_CLASS = "excalidraw-tool-settings-label";
const CONTROL_CLASS = "excalidraw-tool-settings-control";
const SWATCHES_CLASS = "excalidraw-tool-settings-swatches";
const SWATCH_CLASS = "excalidraw-tool-settings-swatch";
const CUSTOM_SWATCH_CLASS = "excalidraw-tool-settings-swatch--custom";
const COLOR_INPUT_CLASS = "excalidraw-tool-settings-color-input";
const ITEM_CLASS = "excalidraw-tool-settings-item";
const SELECTED_CLASS = "is-selected";

/** Gap between the toolbar button and the popup, in pixels. */
const ANCHOR_OFFSET = 6;

/**
 * Excalidraw's own top-picks stroke colours - the row its colour picker shows
 * first. They are literal colours on purpose: the canvas applies the theme
 * filter, so the same values read correctly in light and dark mode.
 */
const STROKE_COLORS = ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#fab005"];

/** `<input type="color">` only accepts literal colours, so keep one for it. */
const FALLBACK_CUSTOM_COLOR = "#e03131";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const SLIDER_CLASS = "excalidraw-tool-settings-slider";
const VALUE_CLASS = "excalidraw-tool-settings-value";

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
  /** Current eraser size preference, in screen pixels. */
  getEraserSize(): number;
  /**
   * Updates the eraser size preference, clamped to the supported range.
   *
   * `persist` writes it to disk; callers pass `false` while a slider is being
   * dragged so the settings file is written once the value settles.
   */
  setEraserSize(sizePx: number, persist: boolean): void;
}

/**
 * The pen appearance popup of the trimmed toolbar: stroke colour, stroke
 * width, and pressure.
 *
 * The Excalidraw component ignores a click on a tool button whose tool is
 * already active (and in compact mode opens its own tool-variant popover
 * instead), so that second click is consumed here and answered with a small
 * panel under the button.
 *
 * A plain DOM popup is used instead of a React component because the panel
 * must outlive toolbar re-renders and is owned by the view rather than by the
 * Excalidraw component tree. Controls are updated in place instead of the
 * panel being re-rendered, so a control the user is interacting with (the
 * native colour picker above all) is never rebuilt mid-interaction.
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
    const tool = button.dataset.omeTool ?? "";
    return (TOOL_SETTINGS_TOOLS as readonly string[]).includes(tool)
      ? (tool as ToolSettingsTool)
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
    if (tool === "eraser") {
      this.renderEraserSizeRow(popupEl);
      return;
    }
    if (tool !== "freedraw") {
      return;
    }
    const appState = this.host.excalidrawAPI?.getAppState();
    this.renderColorRow(popupEl, appState);
    this.renderStrokeWidthRow(popupEl, appState);
    this.renderPressureRow(popupEl, appState);
  }

  /**
   * The eraser size is the reach of the extra eraser pass (see
   * `EraserSizeManager`): the component's own eraser has a fixed reach, so a
   * larger size is what this value adds.
   */
  private renderEraserSizeRow(popupEl: HTMLDivElement): void {
    const controlsEl = this.renderRow(popupEl, t("ERASER_POPUP_SIZE"));
    const sizePx = this.host.getEraserSize();
    const inputEl = controlsEl.createEl("input", {
      cls: SLIDER_CLASS,
      attr: {
        type: "range",
        min: String(ERASER_SIZE_MIN_PX),
        max: String(ERASER_SIZE_MAX_PX),
        step: String(ERASER_SIZE_STEP_PX),
        value: String(sizePx),
        "aria-label": t("ERASER_POPUP_SIZE"),
      },
    });
    const valueEl = controlsEl.createSpan({
      cls: VALUE_CLASS,
      text: `${sizePx}px`,
    });
    // Live while dragging; the preference is written to disk once the value
    // settles, so dragging does not hammer the settings file.
    inputEl.addEventListener("input", () => {
      const nextSize = clampEraserSize(inputEl.value);
      valueEl.setText(`${nextSize}px`);
      this.host.setEraserSize(nextSize, false);
    });
    inputEl.addEventListener("change", () => {
      this.host.setEraserSize(clampEraserSize(inputEl.value), true);
    });
  }

  /** A labeled row; returns the element controls should be added to. */
  private renderRow(popupEl: HTMLDivElement, label: string): HTMLDivElement {
    const rowEl = popupEl.createDiv({ cls: ROW_CLASS });
    rowEl.createSpan({ cls: LABEL_CLASS, text: label });
    return rowEl.createDiv({ cls: CONTROL_CLASS });
  }

  /** Highlights `activeEl` and clears the highlight from its siblings. */
  private markSelected(activeEl: HTMLElement, family: Element[]): void {
    for (const el of family) {
      el.toggleClass(SELECTED_CLASS, el === activeEl);
    }
  }

  private renderColorRow(
    popupEl: HTMLDivElement,
    appState: AppState | undefined,
  ): void {
    const controlsEl = this.renderRow(popupEl, t("PEN_POPUP_COLOR"));
    const swatchesEl = controlsEl.createDiv({ cls: SWATCHES_CLASS });
    const currentColor = (appState?.currentItemStrokeColor ?? "")
      .trim()
      .toLowerCase();

    const swatchEls: HTMLElement[] = [];
    for (const color of STROKE_COLORS) {
      const swatchEl = swatchesEl.createEl("button", {
        cls: SWATCH_CLASS,
        attr: { type: "button", "aria-label": color, title: color },
      });
      setStyle(swatchEl, { backgroundColor: color });
      if (color === currentColor) {
        swatchEl.addClass(SELECTED_CLASS);
      }
      swatchEl.onClickEvent(() => {
        this.markSelected(swatchEl, swatchEls);
        this.applyStrokeColor(color);
      });
      swatchEls.push(swatchEl);
    }

    // Custom colour: the native picker input fills, and therefore opens, the
    // last swatch, which then shows the colour in use.
    const customEl = swatchesEl.createEl("label", {
      cls: `${SWATCH_CLASS} ${CUSTOM_SWATCH_CLASS}`,
      attr: { title: t("PEN_POPUP_COLOR_CUSTOM") },
    });
    if (!STROKE_COLORS.includes(currentColor)) {
      customEl.addClass(SELECTED_CLASS);
      if (HEX_COLOR_PATTERN.test(currentColor)) {
        setStyle(customEl, { backgroundColor: currentColor });
      }
    }
    const inputEl = customEl.createEl("input", {
      cls: COLOR_INPUT_CLASS,
      attr: {
        type: "color",
        value: HEX_COLOR_PATTERN.test(currentColor)
          ? currentColor
          : FALLBACK_CUSTOM_COLOR,
        "aria-label": t("PEN_POPUP_COLOR_CUSTOM"),
      },
    });
    swatchEls.push(customEl);
    inputEl.addEventListener("input", () => {
      setStyle(customEl, { backgroundColor: inputEl.value });
      this.markSelected(customEl, swatchEls);
      this.applyStrokeColor(inputEl.value);
    });
  }

  private renderStrokeWidthRow(
    popupEl: HTMLDivElement,
    appState: AppState | undefined,
  ): void {
    const controlsEl = this.renderRow(popupEl, t("PEN_POPUP_THICKNESS"));
    // An explicit numeric width overrides the preset key, so only a preset
    // width marks a selected entry.
    const activeKey =
      appState && appState.currentItemStrokeWidth == null
        ? appState.currentItemStrokeWidthKey
        : null;
    const options: ReadonlyArray<readonly [StrokeWidthKey, string]> = [
      ["extraThin", t("PEN_SETTINGS_STROKE_PRESET_EXTRA_THIN")],
      ["thin", t("PEN_SETTINGS_STROKE_PRESET_THIN")],
      ["medium", t("PEN_SETTINGS_STROKE_PRESET_MEDIUM")],
      ["bold", t("PEN_SETTINGS_STROKE_PRESET_BOLD")],
      ["extraBold", t("PEN_SETTINGS_STROKE_PRESET_EXTRA_BOLD")],
    ];
    const itemEls: HTMLElement[] = [];
    for (const [key, label] of options) {
      const itemEl = controlsEl.createEl("button", {
        cls: ITEM_CLASS,
        text: label,
        attr: { type: "button", title: label },
      });
      if (key === activeKey) {
        itemEl.addClass(SELECTED_CLASS);
      }
      itemEl.onClickEvent(() => {
        this.markSelected(itemEl, itemEls);
        this.applyStrokeWidth(key);
      });
      itemEls.push(itemEl);
    }
  }

  private renderPressureRow(
    popupEl: HTMLDivElement,
    appState: AppState | undefined,
  ): void {
    const controlsEl = this.renderRow(popupEl, t("PEN_POPUP_PRESSURE"));
    const options: ReadonlyArray<
      readonly [AppState["currentItemStrokeVariability"], string]
    > = [
      ["constant", t("PEN_POPUP_PRESSURE_CONSTANT")],
      ["variable", t("PEN_POPUP_PRESSURE_VARIABLE")],
    ];
    const itemEls: HTMLElement[] = [];
    for (const [value, label] of options) {
      const itemEl = controlsEl.createEl("button", {
        cls: ITEM_CLASS,
        text: label,
        attr: { type: "button", title: label },
      });
      if (appState?.currentItemStrokeVariability === value) {
        itemEl.addClass(SELECTED_CLASS);
      }
      itemEl.onClickEvent(() => {
        this.markSelected(itemEl, itemEls);
        this.applyPressure(value);
      });
      itemEls.push(itemEl);
    }
  }

  private updateAppState(appState: Partial<AppState>): void {
    this.host.excalidrawAPI?.updateScene({
      appState: appState as Pick<AppState, keyof AppState>,
      // Appearance choices are not drawing changes: they stay out of the undo
      // stack, exactly like the component's own property panel.
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }

  private applyStrokeColor(color: string): void {
    this.updateAppState({ currentItemStrokeColor: color });
  }

  private applyStrokeWidth(key: StrokeWidthKey): void {
    // Mirrors the component's own stroke width panel: the explicit numeric
    // width has to be cleared so that the preset key takes effect.
    this.updateAppState({
      currentItemStrokeWidthKey: key,
      currentItemStrokeWidth: null,
    });
  }

  private applyPressure(
    variability: AppState["currentItemStrokeVariability"],
  ): void {
    this.updateAppState({ currentItemStrokeVariability: variability });
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
