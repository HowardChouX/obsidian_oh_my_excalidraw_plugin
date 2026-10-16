/**
 * Plugin settings data model: the persisted-settings interface and its
 * default values, decoupled from `src/core/settings.ts`'s
 * `ExcalidrawSettingTab` UI class.
 *
 * Kept separate so that files needing only the settings shape/defaults
 * (e.g. `PluginSettingsManager`) don't statically pull in the settings-tab
 * UI class and its ~50 dialog/component imports. This is also the natural
 * home for a future declarative `getSettingDefinitions()` array, since that
 * array binds directly against these same keys and defaults.
 */
import { Modifier } from "obsidian";
import { PenStyle } from "src/types/penTypes";
import { DynamicStyle, GridSettings } from "src/types/types";
import { PreviewImageType } from "src/types/utilTypes";
import { PENS } from "src/utils/pens";
import { EmbeddableMDCustomProps } from "src/shared/Dialogs/EmbeddableSettings";
import { ModifierKeySet, ModifierSetType } from "src/utils/modifierkeyHelper";
import { Rank } from "src/constants/actionIcons";
import { UIMode } from "src/shared/Dialogs/UIModeSettingComponent";
import { ScriptSettingValue } from "src/types/excalidrawAutomateTypes";
import { URLs } from "src/constants/safeUrls";
import type {
  StencilLibraryData,
  StencilLibraryMigrationStatus,
  StencilLibraryStorageMode,
} from "src/types/stencilLibraryTypes";

declare const PLUGIN_VERSION: string;

export interface ExcalidrawSettings {
  showTabTitlebarButtons: boolean;
  copyLinkToElemenetAnchorTo100: boolean;
  copyFrameLinkByName: boolean;
  disableDoubleClickTextEditing: boolean;
  phoneFooterSafeAreaPadding: boolean;
  tabletFooterSafeAreaPadding: boolean;
  folder: string;
  libraryFolderPath: string;
  libraryFileName: string;
  libraryStorageMode: StencilLibraryStorageMode;
  libraryMigrationStatus: StencilLibraryMigrationStatus;
  libraryMigrationSnoozeUntil: number;
  embedUseExcalidrawFolder: boolean;
  templateFilePath: string;
  scriptFolderPath: string;
  allowJavaScriptFiles: boolean;
  storeScriptFilesAsJavaScript: boolean;
  fontAssetsPath: string;
  loadChineseFonts: boolean;
  loadJapaneseFonts: boolean;
  loadKoreanFonts: boolean;
  compress: boolean;
  decompressForMDView: boolean;
  onceOffCompressFlagReset: boolean; //used to reset compress to true in 2.2.0
  autosaveIntervalDesktop: number;
  autosaveIntervalMobile: number;
  drawingFilenamePrefix: string;
  drawingEmbedPrefixWithFilename: boolean;
  drawingFilnameEmbedPostfix: string;
  drawingFilenameDateTime: string;
  useExcalidrawExtension: boolean;
  displaySVGInPreview: boolean; //No longer used since 1.9.13
  previewImageType: PreviewImageType; //Introduced with 1.9.13
  renderingConcurrency: number;
  imageCacheRetentionDays: number;
  allowImageCache: boolean;
  allowImageCacheInScene: boolean;
  displayExportedImageIfAvailable: boolean;
  previewMatchObsidianTheme: boolean;
  width: string;
  height: string;
  overrideObsidianFontSize: boolean;
  dynamicStyling: DynamicStyle;
  isLeftHanded: boolean;
  desktopUIMode: UIMode;
  tabletUIMode: UIMode;
  phoneUIMode: UIMode;
  iframeMatchExcalidrawTheme: boolean;
  matchTheme: boolean;
  matchThemeAlways: boolean;
  matchThemeTrigger: boolean;
  defaultMode: string;
  defaultPenMode: "never" | "mobile" | "always";
  penModeDoubleTapEraser: boolean;
  penModeSingleFingerPanning: boolean;
  penModeCrosshairVisible: boolean;
  renderImageInMarkdownReadingMode: boolean;
  renderImageInHoverPreviewForMDNotes: boolean;
  renderImageInMarkdownToPDF: boolean;
  allowPinchZoom: boolean;
  allowWheelZoom: boolean;
  zoomToFitOnOpen: boolean;
  zoomToFitOnResize: boolean;
  zoomToFitMaxLevel: number;
  zoomStep: number; // % increment per zoom action (e.g. mouse wheel)
  zoomMin: number; // minimum zoom percentage
  zoomMax: number; // maximum zoom percentage
  openInAdjacentPane: boolean;
  showSecondOrderLinks: boolean;
  focusOnFileTab: boolean;
  openInMainWorkspace: boolean;
  showLinkBrackets: boolean;
  syncElementLinkWithText: boolean;
  linkPrefix: string;
  urlPrefix: string;
  parseTODO: boolean;
  todo: string;
  done: string;
  hoverPreviewWithoutCTRL: boolean;
  linkOpacity: number;
  allowCtrlClick: boolean; //if disabled only the link button in the view header will open links
  forceWrap: boolean;
  pageTransclusionCharLimit: number;
  wordWrappingDefault: number;
  removeTransclusionQuoteSigns: boolean;
  oEmbedAllowed: boolean;
  pngExportScale: number;
  exportWithTheme: boolean;
  exportWithBackground: boolean;
  exportPaddingSVG: number;
  exportEmbedScene: boolean;
  embedType: "excalidraw" | "PNG" | "SVG";
  embedMarkdownCommentLinks: boolean;
  embedWikiLink: boolean;
  /**
   * If true, embed a placeholder image when no drawing is present. If false, do not embed any image.
   */
  embedPlaceholderImage: boolean;
  syncExcalidraw: boolean;
  compatibilityMode: boolean;
  experimentalFileType: boolean;
  experimentalFileTag: string;
  experimentalLivePreview: boolean;
  fadeOutExcalidrawMarkup: boolean;
  loadPropertySuggestions: boolean;
  experimentalEnableFourthFont: boolean;
  experimantalFourthFont: string;
  addDummyTextElement: boolean;
  zoteroCompatibility: boolean;
  fieldSuggester: boolean;
  enableOnloadScripts: boolean;
  enableCommandLinks: boolean;
  //loadCount: number; //version 1.2 migration counter
  drawingOpenCount: number;
  library: string;
  library2: StencilLibraryData;
  //patchCommentBlock: boolean; //1.3.12
  imageElementNotice: boolean; //1.4.0
  //runWYSIWYGpatch: boolean; //1.4.9
  //fixInfinitePreviewLoop: boolean; //1.4.10
  mdSVGwidth: number;
  mdSVGmaxHeight: number;
  mdFont: string;
  mdFontColor: string;
  mdBorderColor: string;
  mdCSS: string;
  scriptEngineSettings: {
    [key: string]: {
      [key: string]: ScriptSettingValue | string | number | boolean;
    };
  };
  //autostart permission registry for scripts calling ExcalidrawAutomate.registerAutostart();
  //deliberately a sibling of scriptEngineSettings, not reused, because this is
  //plugin/user-trusted permission state a script must not be able to silently flip
  autostartScripts: {
    [scriptName: string]: "allow" | "deny" | "unknown";
  };
  //true for a script whose most recent autostart run threw an error; cleared
  //the next time that script's autostart run succeeds. Purely informational
  //(surfaced as a warning in settings) - never removes the script from
  //autostartScripts on its own, the user does that manually.
  autostartScriptFailures: {
    [scriptName: string]: boolean;
  };
  previousRelease: string;
  showReleaseNotes: boolean;
  useDeclarativeSettings: boolean;
  excalidrawMasteryPromoCollapsed: boolean;
  compareManifestToPluginVersion: boolean;
  showNewVersionNotification: boolean;
  //mathjaxSourceURL: string;
  pinnedScripts: string[];
  sidepanelTabs: string[];
  customPens: PenStyle[];
  numberOfCustomPens: number;
  pdfScale: number;
  gridSettings: GridSettings;
  laserSettings: {
    DECAY_TIME: number;
    DECAY_LENGTH: number;
    COLOR: string;
  };
  embeddableMarkdownDefaults: EmbeddableMDCustomProps;
  markdownNodeOneClickEditing: boolean;
  canvasImmersiveEmbed: boolean;
  startupScriptPath: string;
  modifierKeyConfig: {
    Mac: Record<ModifierSetType, ModifierKeySet>;
    Win: Record<ModifierSetType, ModifierKeySet>;
  };
  slidingPanesSupport: boolean;
  areaZoomLimit: number;
  longPressDesktop: number;
  longPressMobile: number;
  doubleClickLinkOpenViewMode: boolean;
  rank: Rank;
  modifierKeyOverrides: { modifiers: Modifier[]; key: string }[];
  showSplashscreen: boolean;
}


export const DEFAULT_SETTINGS: ExcalidrawSettings = {
  showTabTitlebarButtons: true,
  copyLinkToElemenetAnchorTo100: false,
  copyFrameLinkByName: false,
  disableDoubleClickTextEditing: false,
  phoneFooterSafeAreaPadding: false,
  tabletFooterSafeAreaPadding: false,
  folder: "Excalidraw",
  libraryFolderPath: "Excalidraw/Libraries",
  libraryFileName: "local-library",
  libraryStorageMode: "vault",
  libraryMigrationStatus: "not-required",
  libraryMigrationSnoozeUntil: 0,
  embedUseExcalidrawFolder: false,
  templateFilePath: "Excalidraw/Template.excalidraw",
  scriptFolderPath: "Excalidraw/Scripts",
  allowJavaScriptFiles: false,
  storeScriptFilesAsJavaScript: false,
  fontAssetsPath: "Excalidraw/CJK Fonts",
  loadChineseFonts: false,
  loadJapaneseFonts: false,
  loadKoreanFonts: false,
  compress: true,
  decompressForMDView: false,
  onceOffCompressFlagReset: false,
  autosaveIntervalDesktop: 60000,
  autosaveIntervalMobile: 30000,
  drawingFilenamePrefix: "Drawing ",
  drawingEmbedPrefixWithFilename: true,
  drawingFilnameEmbedPostfix: " ",
  drawingFilenameDateTime: "YYYY-MM-DD HH.mm.ss",
  useExcalidrawExtension: true,
  displaySVGInPreview: false,
  previewImageType: PreviewImageType.SVG,
  renderingConcurrency: 3,
  imageCacheRetentionDays: 30,
  allowImageCache: true,
  allowImageCacheInScene: true,
  displayExportedImageIfAvailable: false,
  previewMatchObsidianTheme: false,
  width: "400",
  height: "",
  overrideObsidianFontSize: false,
  dynamicStyling: "colorful",
  isLeftHanded: false,
  desktopUIMode: "tray",
  tabletUIMode: "compact",
  phoneUIMode: "mobile",
  iframeMatchExcalidrawTheme: true,
  matchTheme: false,
  matchThemeAlways: false,
  matchThemeTrigger: false,
  defaultMode: "normal",
  defaultPenMode: "never",
  penModeDoubleTapEraser: true,
  penModeSingleFingerPanning: true,
  penModeCrosshairVisible: true,
  renderImageInMarkdownReadingMode: false,
  renderImageInHoverPreviewForMDNotes: false,
  renderImageInMarkdownToPDF: false,
  allowPinchZoom: false,
  allowWheelZoom: false,
  zoomToFitOnOpen: true,
  zoomToFitOnResize: false,
  zoomToFitMaxLevel: 2,
  zoomStep: 0.05,
  zoomMin: 0.1,
  zoomMax: 30,
  linkPrefix: "",
  urlPrefix: "",
  parseTODO: false,
  todo: "☐",
  done: "☑",
  hoverPreviewWithoutCTRL: false,
  linkOpacity: 1,
  openInAdjacentPane: true,
  showSecondOrderLinks: true,
  focusOnFileTab: true,
  openInMainWorkspace: true,
  showLinkBrackets: false,
  syncElementLinkWithText: false,
  allowCtrlClick: true,
  forceWrap: false,
  pageTransclusionCharLimit: 200,
  wordWrappingDefault: 0,
  removeTransclusionQuoteSigns: true,
  oEmbedAllowed: false,
  pngExportScale: 1,
  exportWithTheme: true,
  exportWithBackground: true,
  exportPaddingSVG: 10, //since 1.6.17, not only SVG but also PNG
  exportEmbedScene: false,
  embedType: "excalidraw",
  embedMarkdownCommentLinks: true,
  embedWikiLink: true,
  embedPlaceholderImage: true,
  syncExcalidraw: false,
  experimentalFileType: false,
  experimentalFileTag: "✏️",
  experimentalLivePreview: true,
  fadeOutExcalidrawMarkup: false,
  loadPropertySuggestions: false,
  experimentalEnableFourthFont: false,
  experimantalFourthFont: "Virgil",
  addDummyTextElement: false,
  zoteroCompatibility: false,
  fieldSuggester: true,
  enableOnloadScripts: false,
  enableCommandLinks: false,
  compatibilityMode: false,
  //loadCount: 0,
  drawingOpenCount: 0,
  library: `deprecated`,
  library2: {
    type: "excalidrawlib",
    version: 2,
    source: `${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RELEASES_TAG}/${PLUGIN_VERSION}`,
    libraryItems: [],
  },
  //patchCommentBlock: true,
  imageElementNotice: true,
  //runWYSIWYGpatch: true,
  //fixInfinitePreviewLoop: true,
  mdSVGwidth: 500,
  mdSVGmaxHeight: 800,
  mdFont: "Cascadia",
  mdFontColor: "Black",
  mdBorderColor: "Black",
  mdCSS: "",
  scriptEngineSettings: {},
  autostartScripts: {},
  autostartScriptFailures: {},
  previousRelease: "0.0.0",
  showReleaseNotes: true,
  useDeclarativeSettings: true,
  excalidrawMasteryPromoCollapsed: false,
  compareManifestToPluginVersion: true,
  showNewVersionNotification: true,
  pinnedScripts: [],
  sidepanelTabs: [],
  customPens: [
    { ...PENS.default },
    { ...PENS.highlighter },
    { ...PENS.finetip },
    { ...PENS.fountain },
    { ...PENS.marker },
    { ...PENS["thick-thin"] },
    { ...PENS["thin-thick-thin"] },
    { ...PENS.default },
    { ...PENS.default },
    { ...PENS.default },
  ],
  numberOfCustomPens: 0,
  pdfScale: 4,
  gridSettings: {
    DYNAMIC_COLOR: true,
    COLOR: "#000000",
    OPACITY: 50,
    GRID_DIRECTION: { horizontal: true, vertical: true },
  },
  laserSettings: {
    DECAY_LENGTH: 50,
    DECAY_TIME: 1000,
    COLOR: "#ff0000",
  },
  embeddableMarkdownDefaults: {
    useObsidianDefaults: false,
    backgroundMatchCanvas: false,
    backgroundMatchElement: true,
    backgroundColor: "#fff",
    backgroundOpacity: 60,
    borderMatchElement: true,
    borderColor: "#fff",
    borderOpacity: 0,
    filenameVisible: false,
    lockedReadingMode: false,
  },
  markdownNodeOneClickEditing: false,
  canvasImmersiveEmbed: true,
  startupScriptPath: "",
  modifierKeyConfig: {
    Mac: {
      LocalFileDragAction: {
        defaultAction: "image-import",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-import",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: true,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-url",
          },
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: true,
            meta_ctrl: false,
            result: "embeddable",
          },
        ],
      },
      WebBrowserDragAction: {
        defaultAction: "image-url",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-url",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: true,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: true,
            meta_ctrl: false,
            result: "embeddable",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-import",
          },
        ],
      },
      InternalDragAction: {
        defaultAction: "link",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: true,
            result: "embeddable",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: true,
            result: "image-fullsize",
          },
        ],
      },
      LinkClickAction: {
        defaultAction: "new-tab",
        rules: [
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "active-pane",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "new-tab",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: true,
            meta_ctrl: false,
            result: "new-pane",
          },
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: true,
            meta_ctrl: false,
            result: "popout-window",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: true,
            result: "md-properties",
          },
        ],
      },
    },
    Win: {
      LocalFileDragAction: {
        defaultAction: "image-import",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-import",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-url",
          },
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "embeddable",
          },
        ],
      },
      WebBrowserDragAction: {
        defaultAction: "image-url",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-url",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "embeddable",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image-import",
          },
        ],
      },
      InternalDragAction: {
        defaultAction: "link",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "link",
          },
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "embeddable",
          },
          {
            shift: true,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "image",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: true,
            meta_ctrl: false,
            result: "image-fullsize",
          },
        ],
      },
      LinkClickAction: {
        defaultAction: "new-tab",
        rules: [
          {
            shift: false,
            ctrl_cmd: false,
            alt_opt: false,
            meta_ctrl: false,
            result: "active-pane",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: false,
            result: "new-tab",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: true,
            meta_ctrl: false,
            result: "new-pane",
          },
          {
            shift: true,
            ctrl_cmd: true,
            alt_opt: true,
            meta_ctrl: false,
            result: "popout-window",
          },
          {
            shift: false,
            ctrl_cmd: true,
            alt_opt: false,
            meta_ctrl: true,
            result: "md-properties",
          },
        ],
      },
    },
  },
  slidingPanesSupport: false,
  areaZoomLimit: 1,
  longPressDesktop: 500,
  longPressMobile: 500,
  doubleClickLinkOpenViewMode: true,
  rank: "Bronze",
  modifierKeyOverrides: [
    { modifiers: ["Mod"], key: "Enter" },
    { modifiers: ["Mod"], key: "k" },
    { modifiers: ["Mod"], key: "G" },
  ],
  showSplashscreen: true,

};
