//https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
//https://img.youtube.com/vi/uZz5MgzWXiM/maxresdefault.jpg

import type {
  ExcalidrawElement,
  ExcalidrawImageElement,
  FileId,
} from "@zsviczian/excalidraw/types/element/src/types";
import { DataURL } from "@zsviczian/excalidraw/types/excalidraw/types";
import { App, Component, MarkdownRenderer, Notice, TFile } from "obsidian";
import {
  DEVICE,
  DEFAULT_MD_EMBED_CSS,
  fileid,
  IMAGE_TYPES,
  nanoid,
  THEME_FILTER,
  FRONTMATTER_KEYS,
  getCSSFontDefinition,
  MARKDOWN_TO_SVG_RENDER_CLASS,
} from "../constants/constants";
import { createSVG } from "src/utils/excalidrawAutomateUtils";
import { ExcalidrawData, getTransclusion } from "./ExcalidrawData";
import { t } from "../lang/helpers";
import type ExcalidrawPlugin from "../core/main";
import type { PdfJsDocumentProxy } from "src/types/pdfJsTypes";
import {
  blobToBase64,
  getDataURLFromURL,
  getMimeType,
  getPDFDoc,
  getURLImageExtension,
  hasExcalidrawEmbeddedImagesTreeChanged,
  createNestedFileDependencyGraphContext,
  readLocalFileBinary,
} from "../utils/fileUtils";
import { blobToDataURL, errorlog, getDataURL } from "../utils/coreUtils";
import {
  getExportTheme,
  getLinkParts,
  hasExportTheme,
  LinkParts,
} from "../utils/sceneDataUtils";
import {
  cropCanvas,
  getEmbeddedFilenameParts,
  getExportPadding,
  getFontDataURL,
  getImageSize,
  getWithBackground,
  hasExportBackground,
  isMaskFile,
  promiseTry,
  PromisePool,
  svgToBase64,
} from "../utils/embeddedAssetUtils";
import { ImageKey, getImageCache } from "./ImageCache";
import { FILENAMEPARTS, PreviewImageType } from "../types/utilTypes";
import {
  ColorMap,
  ImgData,
  PDFPageViewProps,
  Size,
  MimeType,
  FileData,
} from "src/types/embeddedFileLoaderTypes";
import { ExportSettings } from "src/types/exportUtilTypes";
import { setStyleText } from "src/utils/htmlUtils";
import { setStyle } from "src/utils/styleUtils";
import {
  isInstanceOfHTMLImageElement,
  isInstanceOfSVGElement,
} from "src/utils/typechecks";
import { getSafeFrontmatter, strictArrayBuffer } from "src/utils/obsidianUtils";
import { addAppendUpdateCustomData } from "src/utils/elementCustomDataUtils";

//declared in rollup.config.mjs
declare const deliberateFetch: (
  payload: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;
declare const deliberateCreateElement: (document: Document, tagName: string) => HTMLElement;
declare const mainDocument: Document;

/** Minimal drawing-owned data required to resolve export/scene assets. */
export interface EmbeddedFilesDataSource {
  file: ExcalidrawData["file"];
  scene: ExcalidrawData["scene"];
  getFileEntries: ExcalidrawData["getFileEntries"];
  getFile: ExcalidrawData["getFile"];
}

/** View-independent state needed to recreate one embedded-file descriptor. */
export interface EmbeddedFileExportState {
  readonly filePath: string | null;
  readonly isSVGwithBitmap: boolean;
  readonly img: string;
  readonly imgInverted: string;
  readonly mtime: number;
  readonly mimeType: MimeType;
  readonly size: Size;
  readonly linkParts: LinkParts | null;
  readonly filenameparts: FILENAMEPARTS | null;
  readonly hostPath: string;
  readonly attemptCounter: number;
  readonly isHyperLink: boolean;
  readonly isLocalLink: boolean;
  readonly isMarkdownSection: boolean;
  readonly hyperlink: DataURL | null;
  readonly colorMap: ColorMap | null;
  readonly pdfPageViewProps: PDFPageViewProps | null;
  readonly renderScale: number;
}
//An ugly workaround for the following situation.
//File A is a markdown file that has an embedded Excalidraw file B
//Later file A is embedded into file B as a Markdown embed
//Because MarkdownRenderer.renderMarkdown does not take a depth parameter as input
//EmbeddedFileLoader cannot track the recursion depth (as it can when Excalidraw drawings are embedded)
//For this reason, the markdown TFile is added to the Watchdog when rendering starts
//and getObsidianImage is aborted if the file is already in the Watchdog stack
const markdownRendererRecursionWatcthdog = new Set<TFile>();

type CacheValidationMode = "validated" | "stale-first";
const SCENE_FILE_LOAD_STALL_TIMEOUT_MS = 30_000;
const SCENE_FILE_PROGRESSIVE_BATCH_SIZE = 8;

export type EmbeddedFilesLoaderTerminalState =
  | "idle"
  | "running"
  | "completed"
  | "terminated"
  | "timed-out"
  | "failed";

/** Describes the lightweight work required after a stale-first cache hit. */
export type DeferredCacheValidation =
  | {
      kind: "excalidraw-dependencies";
      cacheMtime: number;
    }
  | {
      kind: "reload";
    };

type LoadImageOptions = {
  cacheValidation?: CacheValidationMode;
  bypassCache?: boolean;
  onStaleCacheHit?: (validation: DeferredCacheValidation) => void;
  deferUncachedExcalidraw?: boolean;
  onExcalidrawGenerationDeferred?: () => void;
  fileId?: FileId;
  pdfScale?: number;
};


const waitForDocumentFonts = async (doc: Document): Promise<void> => {
  const fontSet = doc.fonts;
  if (!fontSet) {
    return;
  }
  // FontFaceSet.ready can hang on some environments if a face stalls.
  await Promise.race([
    fontSet.ready,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 500);
    }),
  ]);
};

const measureElementHeight = (element: Element | null): number => {
  if (!element) {
    return 0;
  }
  const typedElement = element as HTMLElement;
  const rectHeight = Number(typedElement.getBoundingClientRect?.().height ?? 0);
  return Math.max(
    Number(typedElement.scrollHeight ?? 0),
    Number(typedElement.offsetHeight ?? 0),
    Number(typedElement.clientHeight ?? 0),
    Number.isFinite(rectHeight) ? rectHeight : 0,
  );
};

const getCssPixelValue = (value: string | null | undefined): number => {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const measureRenderedContentHeight = (element: Element | null): number => {
  if (!element) {
    return 0;
  }
  const typedElement = element as HTMLElement;
  const ownerWindow = typedElement.ownerDocument.defaultView;
  const hostRect = typedElement.getBoundingClientRect();
  let maxContentBottom = 0;

  typedElement.querySelectorAll("*").forEach((child) => {
    const childElement = child as HTMLElement;
    const childRect = childElement.getBoundingClientRect();
    if (!Number.isFinite(childRect.bottom)) {
      return;
    }
    maxContentBottom = Math.max(maxContentBottom, childRect.bottom - hostRect.top);
  });

  const lastChild = typedElement.lastElementChild as HTMLElement | null;
  const lastChildMarginBottom =
    ownerWindow && lastChild
      ? getCssPixelValue(ownerWindow.getComputedStyle(lastChild).marginBottom)
      : 0;
  const hostPaddingBottom = ownerWindow
    ? getCssPixelValue(ownerWindow.getComputedStyle(typedElement).paddingBottom)
    : 0;

  return Math.max(
    measureElementHeight(typedElement),
    maxContentBottom + lastChildMarginBottom,
    hostRect.height,
  ) + hostPaddingBottom;
};

const appendMarkdownBottomSpacer = (
  container: HTMLElement,
  paddingBottom: number,
): void => {
  const existingSpacer = container.querySelector(
    ".excalidraw-md-padding-spacer",
  );
  if (existingSpacer?.parentElement) {
    existingSpacer.parentElement.removeChild(existingSpacer);
  }
  if (!(paddingBottom > 0)) {
    return;
  }
  // FIX: WebKit/iOS will often return a 0 bounding client rect for completely empty divs.
  // We insert a zero-width space so the layout engine is forced to render the block and measure its height.
  const paddingSpacer = createDiv({text: "&#8203;"});
  paddingSpacer.setAttribute("class", "excalidraw-md-padding-spacer");
  
  setStyle(paddingSpacer, {
    display: "block",
    width: "100%",
    height: `${paddingBottom}px`,
    minHeight: `${paddingBottom}px`,
    color: "transparent",
    lineHeight: "0px"
  });
  container.appendChild(paddingSpacer);
};

const ISOLATED_MARKDOWN_RENDER_CSS = `
.excalidraw-md-host,
.excalidraw-md-host * {
  box-sizing: border-box;
}

.excalidraw-md-host {
  width: 100%;
  max-width: 100%;
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0px;
  word-spacing: 0px;
  text-rendering: geometricPrecision;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  font-kerning: none;
  font-variant-ligatures: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-wrap: break-word;
  word-break: break-word;
}
`;

const snapshotRenderedCanvases = (container: HTMLElement): void => {
  container.querySelectorAll("canvas").forEach((canvas) => {
    try {
      const image = createFragment().createEl("img");
      image.src = canvas.toDataURL("image/png");
      image.width = canvas.width;
      image.height = canvas.height;
      image.alt = canvas.getAttribute("aria-label") ?? "Rendered chart";
      canvas.replaceWith(image);
    } catch {
      // Tainted or WebGL canvases cannot always be exported; retain the canvas.
    }
  });
};

type LoadSceneEmitPolicy = "all" | "changed-only";

const getPDFCacheId = (linkParts: LinkParts, pageNum: number): string => {
  // Different crops of the same PDF page must not overwrite each other in cache,
  // so the cache key uses the full PDF page/reference fragment when present.
  const pdfRef = linkParts.original?.match(/#([^|]*)/)?.[1];
  return pdfRef && pdfRef !== "" ? pdfRef : `page=${pageNum}`;
};

/**
 * Function takes an SVG and replaces all fill and stroke colors with the ones in the colorMap
 * @param svg: SVGSVGElement
 * @param colorMap: {[color: string]: string;} | null
 * @returns svg with colors replaced
 */
const replaceSVGColors = (
  svg: SVGSVGElement | string,
  colorMap: ColorMap | null,
): SVGSVGElement | string => {
  if (!colorMap) {
    return svg;
  }

  if (typeof svg === "string") {
    // Replace colors in the SVG string
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      if (oldColor === "stroke" || oldColor === "fill") {
        const [svgTag, prefix, suffix] = (svg.match(/(<svg[^>]*)(>)/i) ||
          []) as string[];
        if (!svgTag) {
          continue;
        }

        svg = svg.replace(
          svgTag,
          svgTag.match(new RegExp(`${oldColor}=["'][^"']*["']`))
            ? prefix.replace(
                new RegExp(`${oldColor}=["'][^"']*["']`, "i"),
                `${oldColor}="${newColor}"`,
              ) + suffix
            : `${prefix} ${oldColor}="${newColor}"${suffix}`,
        );
        continue;
      }
      const fillRegex = new RegExp(`fill="${oldColor}"`, "gi");
      svg = svg.replaceAll(fillRegex, `fill="${newColor}"`);
      const fillStyleRegex = new RegExp(`fill:${oldColor}`, "gi");
      svg = svg.replaceAll(fillStyleRegex, `fill:${newColor}`);
      const strokeRegex = new RegExp(`stroke="${oldColor}"`, "gi");
      svg = svg.replaceAll(strokeRegex, `stroke="${newColor}"`);
      const strokeStyleRegex = new RegExp(`stroke:${oldColor}`, "gi");
      svg = svg.replaceAll(strokeStyleRegex, `stroke:${newColor}`);
    }
    return svg;
  }

  // Modify the fill and stroke attributes of child nodes
  const childNodes = (node: ChildNode) => {
    if (isInstanceOfSVGElement(node)) {
      const oldFill = node.getAttribute("fill")?.toLocaleLowerCase();
      const oldStroke = node.getAttribute("stroke")?.toLocaleLowerCase();

      if (oldFill && colorMap[oldFill]) {
        node.setAttribute("fill", colorMap[oldFill]);
      }
      if (oldStroke && colorMap[oldStroke]) {
        node.setAttribute("stroke", colorMap[oldStroke]);
      }
    }
    for (const child of node.childNodes) {
      childNodes(child);
    }
  };

  if ("fill" in colorMap) {
    svg.setAttribute("fill", colorMap.fill);
  }
  if ("stroke" in colorMap) {
    svg.setAttribute("stroke", colorMap.stroke);
  }
  for (const child of svg.childNodes) {
    childNodes(child);
  }

  return svg;
};

export class EmbeddedFile {
  public file: TFile = null;
  public isSVGwithBitmap: boolean = false;
  private img: string = ""; //base64
  private imgInverted: string = ""; //base64
  public mtime: number = 0; //modified time of the image
  private plugin: ExcalidrawPlugin;
  public mimeType: MimeType = "application/octet-stream";
  public size: Size = { height: 0, width: 0 };
  public linkParts: LinkParts;
  public filenameparts: FILENAMEPARTS;
  private hostPath: string;
  public attemptCounter: number = 0;
  public isHyperLink: boolean = false;
  public isLocalLink: boolean = false;
  public isMarkdownSection: boolean = false;
  public hyperlink: DataURL;
  public colorMap: ColorMap | null = null;
  public pdfPageViewProps: PDFPageViewProps;
  public renderScale: number = 0;

  /** Captures loader inputs and reusable data URLs without retaining a view. */
  public exportPreparedSaveState(): EmbeddedFileExportState {
    return {
      filePath: this.file?.path ?? null,
      isSVGwithBitmap: this.isSVGwithBitmap,
      img: this.img,
      imgInverted: this.imgInverted,
      mtime: this.mtime,
      mimeType: this.mimeType,
      size: { ...this.size },
      linkParts: this.linkParts ? { ...this.linkParts } : null,
      filenameparts: this.filenameparts ? { ...this.filenameparts } : null,
      hostPath: this.hostPath,
      attemptCounter: this.attemptCounter,
      isHyperLink: this.isHyperLink,
      isLocalLink: this.isLocalLink,
      isMarkdownSection: this.isMarkdownSection,
      hyperlink: this.hyperlink ?? null,
      colorMap: this.colorMap ? { ...this.colorMap } : null,
      pdfPageViewProps: this.pdfPageViewProps
        ? { ...this.pdfPageViewProps }
        : null,
      renderScale: this.renderScale,
    };
  }

  /** Recreates a mutable loader descriptor from detached prepared-save data. */
  public static fromPreparedSaveState(
    plugin: ExcalidrawPlugin,
    state: EmbeddedFileExportState,
  ): EmbeddedFile {
    const descriptor = Object.create(EmbeddedFile.prototype) as EmbeddedFile;
    descriptor.plugin = plugin;
    descriptor.file = state.filePath
      ? plugin.app.vault.getFileByPath(state.filePath)
      : null;
    descriptor.isSVGwithBitmap = state.isSVGwithBitmap;
    descriptor.img = state.img;
    descriptor.imgInverted = state.imgInverted;
    descriptor.mtime = state.mtime;
    descriptor.mimeType = state.mimeType;
    descriptor.size = { ...state.size };
    descriptor.linkParts = state.linkParts ? { ...state.linkParts } : null;
    descriptor.filenameparts = state.filenameparts
      ? { ...state.filenameparts }
      : null;
    descriptor.hostPath = state.hostPath;
    descriptor.attemptCounter = state.attemptCounter;
    descriptor.isHyperLink = state.isHyperLink;
    descriptor.isLocalLink = state.isLocalLink;
    descriptor.isMarkdownSection = state.isMarkdownSection;
    descriptor.hyperlink = state.hyperlink;
    descriptor.colorMap = state.colorMap ? { ...state.colorMap } : null;
    descriptor.pdfPageViewProps = state.pdfPageViewProps
      ? { ...state.pdfPageViewProps }
      : null;
    descriptor.renderScale = state.renderScale;
    return descriptor;
  }

  constructor(
    plugin: ExcalidrawPlugin,
    hostPath: string,
    imgPath: string,
    colorMapJSON?: string,
  ) {
    this.plugin = plugin;
    this.resetImage(hostPath, imgPath);
    if (
      this.file &&
      (this.plugin.isExcalidrawFile(this.file) ||
        this.file.extension.toLowerCase() === "svg")
    ) {
      try {
        this.colorMap = (
          colorMapJSON ? JSON.parse(colorMapJSON.toLocaleLowerCase()) : null
        ) as ColorMap | null;
      } catch (error: unknown) {
        errorlog({
          message: `Error parsing colorMap for file ${imgPath}`,
          context: this.constructor,
          error,
        });
        this.colorMap = null;
      }
    }
  }

  get hasSeparateDarkAndLightVersion(): boolean {
    return (
      this.isSVGwithBitmap || this.file?.extension?.toLowerCase?.() === "pdf"
    );
  }

  public resetImage(hostPath: string, imgPath: string) {
    this.imgInverted = this.img = "";
    this.mtime = 0;
    this.renderScale = 0;

    if (
      imgPath.startsWith("https://") ||
      imgPath.startsWith("http://") ||
      imgPath.startsWith("ftp://") ||
      imgPath.startsWith("ftps://")
    ) {
      this.isHyperLink = true;
      this.hyperlink = imgPath as DataURL;
      return;
    }

    if (imgPath.startsWith("file://")) {
      this.isLocalLink = true;
      this.hyperlink = imgPath as DataURL;
      return;
    }

    this.linkParts = getLinkParts(imgPath);
    this.hostPath = hostPath;
    if (!this.linkParts.path) {
      new Notice(`Excalidraw Error\nIncorrect embedded filename: ${imgPath}`);
      return;
    }
    if (!this.linkParts.width) {
      this.linkParts.width = this.plugin.settings.mdSVGwidth;
    }
    if (!this.linkParts.height) {
      this.linkParts.height = this.plugin.settings.mdSVGmaxHeight;
    }
    this.file = this.plugin.app.metadataCache.getFirstLinkpathDest(
      this.linkParts.path,
      hostPath,
    );
    if (!this.file) {
      if (this.attemptCounter++ === 0) {
        new Notice(
          `Excalidraw Warning: could not find image file: ${imgPath}`,
          5000,
        );
      }
    } else {
      this.filenameparts = getEmbeddedFilenameParts(imgPath);
      this.isMarkdownSection =
        (this.filenameparts.hasBlockref || this.filenameparts.hasSectionref) &&
        !(
          this.filenameparts.hasGroupref ||
          this.filenameparts.hasArearef ||
          this.filenameparts.hasFrameref ||
          this.filenameparts.hasClippedFrameref
        );
      this.filenameparts.filepath = this.file.path;
    }
  }

  private fileChanged(): boolean {
    if (this.isHyperLink || this.isLocalLink) {
      return false;
    }
    if (!this.file) {
      this.file = this.plugin.app.metadataCache.getFirstLinkpathDest(
        this.linkParts.path,
        this.hostPath,
      ); // maybe the file has synchronized in the mean time
      if (!this.file) {
        this.attemptCounter++;
        return false;
      }
    }
    return this.mtime !== this.file.stat.mtime;
  }

  public setImage({
    imgBase64,
    mimeType,
    size,
    isDark,
    isSVGwithBitmap,
    pdfPageViewProps,
    renderScale,
  }: {
    imgBase64: string;
    mimeType: MimeType;
    size: Size;
    isDark: boolean;
    isSVGwithBitmap: boolean;
    pdfPageViewProps?: PDFPageViewProps;
    renderScale?: number;
  }) {
    if (!this.file && !this.isHyperLink && !this.isLocalLink) {
      return;
    }
    if (this.fileChanged()) {
      this.imgInverted = this.img = "";
    }
    this.isSVGwithBitmap = isSVGwithBitmap;
    this.mtime =
      this.isHyperLink || this.isLocalLink ? 0 : this.file.stat.mtime;
    this.pdfPageViewProps = pdfPageViewProps;
    this.renderScale = renderScale ?? 0;
    this.size = size;
    this.mimeType = mimeType;
    switch (isDark && this.hasSeparateDarkAndLightVersion) {
      case true:
        this.imgInverted = imgBase64;
        break;
      case false:
        this.img = imgBase64;
        break; //bitmaps and SVGs without an embedded bitmap do not need a negative image
    }
  }

  public isLoaded(
    isDark: boolean,
    minimumPdfRenderScale: number = this.plugin.settings.pdfScale,
  ): boolean {
    if (!this.isHyperLink && !this.isLocalLink) {
      if (!this.file) {
        this.file = this.plugin.app.metadataCache.getFirstLinkpathDest(
          this.linkParts.path,
          this.hostPath,
        ); // maybe the file has synchronized in the mean time
        if (!this.file) {
          this.attemptCounter++;
          return true;
        }
      }
      if (this.fileChanged()) {
        return false;
      }
      if (
        this.file.extension?.toLowerCase?.() === "pdf" &&
        this.renderScale > 0
      ) {
        const hasImageForTheme =
          this.hasSeparateDarkAndLightVersion && isDark
            ? this.imgInverted !== ""
            : this.img !== "";
        return (
          hasImageForTheme && this.renderScale >= minimumPdfRenderScale
        );
      }
    }
    if (this.hasSeparateDarkAndLightVersion && isDark) {
      return this.imgInverted !== "";
    }
    return this.img !== "";
  }

  public getImage(isDark: boolean) {
    if (!this.file && !this.isHyperLink && !this.isLocalLink) {
      return "";
    }
    if (this.hasSeparateDarkAndLightVersion && isDark) {
      return this.imgInverted;
    }
    return this.img; //images that are not SVGwithBitmap, only the light string is stored, since inverted and non-inverted are ===
  }

  /**
   *
   * @returns true if image should scale such as the updated images has the same area as the previous images, false if the image should be displayed at 100%
   */
  public shouldScale() {
    return (
      this.isHyperLink ||
      this.isLocalLink ||
      !(
        this.linkParts &&
        this.linkParts.original &&
        this.linkParts.original.endsWith("|100%")
      )
    );
  }
}

export class EmbeddedFilesLoader {
  private pdfDocsMap: Map<string, PdfJsDocumentProxy> = new Map();
  private pdfDocs: Set<PdfJsDocumentProxy> = new Set();
  private plugin: ExcalidrawPlugin;
  private isDark: boolean;
  public terminate = false;
  public terminalState: EmbeddedFilesLoaderTerminalState = "idle";
  public uid: string;

  constructor(plugin: ExcalidrawPlugin, isDark?: boolean) {
    this.plugin = plugin;
    this.isDark = isDark;
    this.uid = nanoid();
  }

  public emptyPDFDocsMap() {
    this.pdfDocs.forEach((pdfDoc) => {
      try {
        pdfDoc.destroy();
      } catch (e: unknown) {
        errorlog({ where: "EmbeddedFileLoader.emptyPDFDocsMap", error: e });
      }
    });
    this.pdfDocs.clear();
    this.pdfDocsMap.clear();
  }


  public async getObsidianImage(
    inFile: TFile | EmbeddedFile,
    depth: number,
  ): Promise<{
    mimeType: MimeType;
    fileId: FileId;
    dataURL: DataURL;
    created: number;
    hasSVGwithBitmap: boolean;
    size: { height: number; width: number };
    pdfPageViewProps?: PDFPageViewProps;
  }> {
    try {
      return await this._getObsidianImage(inFile, depth);
    } finally {
      this.emptyPDFDocsMap();
    }
  }

  private async getExcalidrawSVG({
    isDark,
    file,
    depth,
    inFile,
    hasSVGwithBitmap,
    elements = [],
    cacheValidation = "validated",
    bypassCache = false,
    onStaleCacheHit,
    deferUncachedGeneration = false,
  }: {
    isDark: boolean;
    file: TFile;
    depth: number;
    inFile: TFile | EmbeddedFile;
    hasSVGwithBitmap: boolean;
    elements?: ExcalidrawElement[];
    cacheValidation?: CacheValidationMode;
    bypassCache?: boolean;
    onStaleCacheHit?: (validation: DeferredCacheValidation) => void;
    deferUncachedGeneration?: boolean;
  }): Promise<{
    dataURL: DataURL;
    hasSVGwithBitmap: boolean;
    loadedFromCache?: boolean;
    size?: Size;
    generationDeferred?: boolean;
  }> {
    if (this.terminate) {
      return { dataURL: "" as DataURL, hasSVGwithBitmap: false };
    }
    //debug({where:"EmbeddedFileLoader.getExcalidrawSVG",uid:this.uid,file:file.name});
    const isMask = isMaskFile(this.plugin, file);
    const forceTheme = hasExportTheme(this.plugin, file)
      ? getExportTheme(this.plugin, file, "light")
      : undefined;
    const exportSettings: ExportSettings = {
      withBackground: hasExportBackground(this.plugin, file)
        ? getWithBackground(this.plugin, file)
        : false,
      withTheme: !!forceTheme,
      isMask,
      skipInliningFonts: false,
    };

    const hasColorMap = Boolean(
      inFile instanceof EmbeddedFile ? inFile.colorMap : null,
    );
    const shouldUseCache =
      !bypassCache &&
      !hasColorMap &&
      this.plugin.settings.allowImageCacheInScene &&
      file &&
      getImageCache().isReady();
    const hasFilenameParts = Boolean(
      inFile instanceof EmbeddedFile && inFile.filenameparts,
    );
    const filenameParts = hasFilenameParts
      ? (inFile as EmbeddedFile).filenameparts
      : null;
    const cacheKey: ImageKey = {
      ...(hasFilenameParts
        ? {
            ...filenameParts,
            inlineFonts: !exportSettings.skipInliningFonts,
          }
        : {
            filepath: file.path,
            hasBlockref: false,
            hasGroupref: false,
            hasTaskbone: false,
            hasArearef: false,
            hasFrameref: false,
            hasClippedFrameref: false,
            hasSectionref: false,
            inlineFonts: !exportSettings.skipInliningFonts,
            blockref: null,
            sectionref: null,
            linkpartReference: null,
            linkpartAlias: null,
          }),
      isDark,
      previewImageType: PreviewImageType.SVG,
      scale: 1,
      isTransparent: !exportSettings.withBackground,
    };

    let cachedSize: Size | undefined;
    let cachedHasSVGwithBitmap: boolean | undefined;
    const maybeSVG = shouldUseCache
      ? await getImageCache().getImageFromCache(cacheKey, {
          skipDependencyCheck: cacheValidation === "stale-first",
          expectedPayloadKind: "svg",
          requireSvgInspectionMetadata: true,
          svgFormat: "data-url",
          onCacheHit: ({ mtime, size, hasSVGwithBitmap }) => {
            cachedSize = size;
            cachedHasSVGwithBitmap = hasSVGwithBitmap;
            if (cacheValidation === "stale-first") {
              onStaleCacheHit?.({
                kind: "excalidraw-dependencies",
                cacheMtime: mtime,
              });
            }
          },
        })
      : undefined;
    if (this.terminate) {
      return { dataURL: "" as DataURL, hasSVGwithBitmap: false };
    }

    const cachedDataURL =
      typeof maybeSVG === "string" ? (maybeSVG as DataURL) : undefined;
    if (cachedDataURL) {
      return {
        dataURL: cachedDataURL,
        hasSVGwithBitmap: cachedHasSVGwithBitmap ?? hasSVGwithBitmap,
        loadedFromCache: true,
        size: cachedSize,
      };
    }

    if (deferUncachedGeneration) {
      return {
        dataURL: null,
        hasSVGwithBitmap,
        loadedFromCache: false,
        generationDeferred: true,
      };
    }

    const generatedSVG = await createSVG(
      hasFilenameParts
        ? filenameParts.hasGroupref ||
          filenameParts.hasBlockref ||
          filenameParts.hasSectionref ||
          filenameParts.hasFrameref ||
          filenameParts.hasClippedFrameref
          ? filenameParts.filepath + filenameParts.linkpartReference
          : file.path
        : file?.path,
      false, //false
      hasFilenameParts && filenameParts.hasClippedFrameref
        ? {
            ...exportSettings,
            frameRendering: {
              enabled: true,
              name: false,
              outline: false,
              clip: true,
            },
          }
        : exportSettings,
      this,
      forceTheme,
      null,
      null,
      elements,
      this.plugin,
      depth + 1,
      getExportPadding(this.plugin, file),
    );
    const svg = replaceSVGColors(
      generatedSVG,
      inFile instanceof EmbeddedFile ? inFile.colorMap : null,
    ) as SVGSVGElement;
    if (this.terminate) {
      return { dataURL: "" as DataURL, hasSVGwithBitmap: false };
    }

    //https://stackoverflow.com/questions/51154171/remove-css-filter-on-child-elements
    const imageList = svg.querySelectorAll(
      "image:not([href^='data:image/svg'])",
    );
    if (imageList.length > 0) {
      hasSVGwithBitmap = true;
    }

    if (hasSVGwithBitmap && isDark) {
      imageList.forEach((i) => {
        const id = i.parentElement?.id;
        if (id.endsWith("-invert-bitmap")) {
          return;
        }
        svg.querySelectorAll(`use[href='#${id}']`).forEach((u) => {
          u.setAttribute("filter", THEME_FILTER);
        });
      });
    }

    const svgsToInvert = svg.querySelectorAll("symbol[id$='-no-invert-svg']");

    if (svgsToInvert.length > 0) {
      hasSVGwithBitmap = true;
    }

    if (svgsToInvert.length > 0 && isDark) {
      svgsToInvert.forEach((i) => {
        const id = i.id;
        svg.querySelectorAll(`use[href='#${id}']`).forEach((u) => {
          u.setAttribute("filter", THEME_FILTER);
        });
      });
    }

    if (!hasSVGwithBitmap && svg.getAttribute("hasbitmap")) {
      hasSVGwithBitmap = true;
    }
    if (!svg.hasAttribute("width") && svg.hasAttribute("viewBox")) {
      //2024.06.09
      //this addresses backward compatibility issues where the cache does not have the width and height attributes
      //this should be removed in the future
      const vb = svg.getAttr("viewBox").split(" ");
      if (vb[2]) {
        svg.setAttribute("width", vb[2]);
      }
      if (vb[3]) {
        svg.setAttribute("height", vb[3]);
      }
    }
    const width = Number.parseFloat(svg.getAttribute("width") ?? "");
    const height = Number.parseFloat(svg.getAttribute("height") ?? "");
    const size =
      Number.isFinite(width) &&
      width > 0 &&
      Number.isFinite(height) &&
      height > 0
        ? { width, height }
        : undefined;
    const svgBlob = new Blob([svg.outerHTML.replaceAll("&nbsp;", " ")], {
      type: "image/svg+xml",
    });
    const dURL = await blobToDataURL(svgBlob);
    if (shouldUseCache) {
      // Scene cache hits need enough metadata to avoid reparsing the SVG merely
      // to rediscover bitmap content and intrinsic dimensions.
      getImageCache().addImageToCache(cacheKey, "", svgBlob, {
        size,
        hasSVGwithBitmap,
      });
    }
    return {
      dataURL: dURL,
      hasSVGwithBitmap,
      loadedFromCache: Boolean(maybeSVG),
      size,
    };
  }

  //this is a fix for backward compatibility - I messed up with generating the local link
  private getLocalPath(path: string) {
    const localPath = path.split("file://")[1];
    if (localPath.startsWith("/")) {
      return localPath.substring(1);
    }
    return localPath;
  }

  private async _getObsidianImage(
    inFile: TFile | EmbeddedFile,
    depth: number,
    options?: LoadImageOptions,
  ): Promise<ImgData> {
    if (!this.plugin || !inFile) {
      return null;
    }

    try {
      const app = this.plugin.app;

      const isHyperLink =
        inFile instanceof EmbeddedFile ? inFile.isHyperLink : false;
      const isLocalLink =
        inFile instanceof EmbeddedFile ? inFile.isLocalLink : false;
      const isMarkdownSection =
        inFile instanceof EmbeddedFile ? inFile.isMarkdownSection : false;
      const hyperlink = inFile instanceof EmbeddedFile ? inFile.hyperlink : "";
      const file: TFile = inFile instanceof EmbeddedFile ? inFile.file : inFile;
      if (file && markdownRendererRecursionWatcthdog.has(file)) {
        new Notice(
          `Loading of ${file.path}. Please check if there is an inifinite loop of one file embedded in the other.`,
        );
        return null;
      }

      const linkParts = isHyperLink
        ? null
        : inFile instanceof EmbeddedFile
          ? inFile.linkParts
          : {
              original: file.path,
              path: file.path,
              isBlockRef: false,
              ref: null,
              width: this.plugin.settings.mdSVGwidth,
              height: this.plugin.settings.mdSVGmaxHeight,
              page: null,
            };

      let hasSVGwithBitmap = false;
      const isExcalidrawFile =
        !isMarkdownSection &&
        !isHyperLink &&
        !isLocalLink &&
        this.plugin.isExcalidrawFile(file);
      const isPDF =
        !isHyperLink && !isLocalLink && file.extension.toLowerCase() === "pdf";

      if (
        !isHyperLink &&
        !isPDF &&
        !isLocalLink &&
        !(
          IMAGE_TYPES.contains(file.extension) ||
          isExcalidrawFile ||
          file.extension === "md"
        )
      ) {
        return null;
      }
      const ab =
        isHyperLink || isPDF || isExcalidrawFile
          ? null
          : isLocalLink
            ? await readLocalFileBinary(
                this.getLocalPath((inFile as EmbeddedFile).hyperlink),
              )
            : await app.vault.readBinary(file);
      if (this.terminate) {
        return null;
      }

      let dURL: DataURL = null;
      let excalidrawLoadedFromCache = false;
      let excalidrawSize: Size | undefined;
      if (isExcalidrawFile) {
        const res = await this.getExcalidrawSVG({
          isDark: this.isDark,
          file,
          depth,
          inFile,
          hasSVGwithBitmap,
          cacheValidation: options?.cacheValidation,
          bypassCache: options?.bypassCache,
          onStaleCacheHit: options?.onStaleCacheHit,
          deferUncachedGeneration: options?.deferUncachedExcalidraw,
        });
        if (this.terminate) {
          return null;
        }
        if (res.generationDeferred) {
          options?.onExcalidrawGenerationDeferred?.();
          return null;
        }
        dURL = res.dataURL;
        hasSVGwithBitmap = res.hasSVGwithBitmap;
        excalidrawLoadedFromCache = !!res.loadedFromCache;
        excalidrawSize = res.size;
      }

      const excalidrawSVG = isExcalidrawFile ? dURL : null;

      const [
        pdfDataURL,
        pdfSize,
        pdfPageViewProps,
        pdfRenderScale,
        pdfLoadedFromCache,
      ] = isPDF
        ? await this.pdfToDataURL(file, linkParts, options)
        : [null, null, null, null, false];
      if (this.terminate) {
        return null;
      }

      let mimeType: MimeType = isPDF ? "image/png" : "image/svg+xml";

      const extension =
        isHyperLink || isLocalLink
          ? getURLImageExtension(hyperlink)
          : file.extension;
      if (!isExcalidrawFile && !isPDF) {
        mimeType = getMimeType(extension);
      }

      let dataURL = isHyperLink
        ? inFile instanceof EmbeddedFile
          ? await getDataURLFromURL(inFile.hyperlink, mimeType)
          : null
        : (excalidrawSVG ??
          pdfDataURL ??
          (file?.extension === "svg"
            ? await getSVGData(
                app,
                file,
                inFile instanceof EmbeddedFile ? inFile.colorMap : null,
              )
            : file?.extension === "md"
              ? null
              : await getDataURL(ab, mimeType)));
      if (this.terminate) {
        return null;
      }

      const size = isPDF
        ? pdfSize
        : (excalidrawSize ?? (await getImageSize(dataURL)));

      if (this.terminate) {
        return null;
      }

      const generatedFileId =
        options?.fileId ??
        (await generateIdFromFile(
          isHyperLink || isPDF || isExcalidrawFile
            ? new TextEncoder().encode(dataURL).buffer
            : ab,
          inFile instanceof EmbeddedFile
            ? inFile.filenameparts?.linkpartReference
            : undefined,
        ));
      const loadedFromCache = isExcalidrawFile
        ? excalidrawLoadedFromCache
        : pdfLoadedFromCache;
      return {
        mimeType,
        fileId: generatedFileId,
        dataURL,
        created: isHyperLink || isLocalLink ? 0 : file.stat.mtime,
        loadedFromCache,
        hasSVGwithBitmap,
        size,
        pdfPageViewProps,
        renderScale: pdfRenderScale,
      };
    } catch (error: unknown) {
      errorlog({
        where: "EmbeddedFileLoader._getObsidianImage",
        uid: this.uid,
        file:
          inFile instanceof EmbeddedFile
            ? (inFile.file?.path ?? inFile.hyperlink)
            : inFile?.path,
        depth,
        error,
      });
      return null;
    }
  }

  public async loadSceneFiles({
    excalidrawData,
    addFiles,
    depth,
    isThemeChange = false,
    // the fileIDWhitelist is designed to support partial loading of Excalidraw drawings.
    // See getTemplate in excalidrawAutomateUtils. By providing the whitelist loading the scene will skip images
    // not on the list (e.g. when rendering an image fragment based on a groupID or frame reference)
    fileIDWhiteList,
    forceReloadFileIDs,
    cacheValidation = "validated",
    validationConcurrency,
    emitPolicy = "all",
    onDeferredValidationCandidates,
    deferredCacheValidation,
    sceneElements,
    waitForRender,
    prioritizedFileIds,
    pdfScale,
  }: {
    excalidrawData: EmbeddedFilesDataSource;
    addFiles: (files: FileData[], isDark: boolean, final?: boolean) => void;
    depth: number;
    isThemeChange?: boolean;
    fileIDWhiteList?: Set<FileId>;
    forceReloadFileIDs?: Set<FileId>;
    cacheValidation?: CacheValidationMode;
    validationConcurrency?: number;
    emitPolicy?: LoadSceneEmitPolicy;
    onDeferredValidationCandidates?: (
      candidates: Map<FileId, DeferredCacheValidation>,
    ) => void;
    deferredCacheValidation?: ReadonlyMap<FileId, DeferredCacheValidation>;
    sceneElements?: readonly ExcalidrawElement[];
    waitForRender?: () => Promise<void>;
    prioritizedFileIds?: ReadonlySet<FileId>;
    pdfScale?: number;
  }) {
    this.terminalState = "running";
    if (this.isDark === undefined) {
      this.isDark = excalidrawData?.scene?.appState?.theme === "dark";
    }
    if (depth > 7) {
      this.terminalState = "failed";
      new Notice(t("INFINITE_LOOP_WARNING") + depth.toString(), 6000);
      try {
        addFiles([], this.isDark, true);
      } catch (error: unknown) {
        errorlog({
          where: "EmbeddedFileLoader.loadSceneFiles",
          uid: this.uid,
          phase: "depth-limit",
          error,
        });
      }
      return;
    }
    const entries = Array.from(excalidrawData.getFileEntries());
    if (prioritizedFileIds?.size) {
      entries.sort(
        ([fileIdA], [fileIdB]) =>
          Number(prioritizedFileIds.has(fileIdB)) -
          Number(prioritizedFileIds.has(fileIdA)),
      );
    }
    //debug({where:"EmbeddedFileLoader.loadSceneFiles",uid:this.uid,isDark:this.isDark,sceneTheme:excalidrawData.scene.appState.theme});
    let onLoadTaskSettled: (() => void) | null = null;
    const createSafeLoadTask = (
      task: () => Promise<void>,
      context: Record<string, unknown>,
    ) =>
      promiseTry(async () => {
        try {
          await task();
        } catch (error: unknown) {
          errorlog({
            where: "EmbeddedFileLoader.loadSceneFiles",
            uid: this.uid,
            ...context,
            error,
          });
        } finally {
          onLoadTaskSettled?.();
        }
      });
    const files: FileData[][] = [];
    files.push([]);
    let batch = 0;
    // Carry cache metadata into the second pass so unchanged Excalidraw
    // dependencies can be validated without reading the image payload again.
    const deferredValidationCandidates = new Map<
      FileId,
      DeferredCacheValidation
    >();
    // Deferred candidates frequently share most of the same nested graph.
    // Scope this cache to one load so metadata is parsed once without retaining
    // dependency state across synchronization operations.
    const deferredDependencyGraphContext =
      createNestedFileDependencyGraphContext(true);
    const deferredGenerationEntries: typeof entries = [];
    function* loadIterator(
      loader: EmbeddedFilesLoader,
      embeddedEntries: typeof entries = entries,
      deferUncachedExcalidraw = false,
      includeAdditionalAssets = true,
    ): Generator<Promise<void>> {
      for (const entry of embeddedEntries) {
        if (fileIDWhiteList && !fileIDWhiteList.has(entry[0])) {
          continue;
        }
        const embeddedFile: EmbeddedFile = entry[1];
        const id = entry[0];
        yield createSafeLoadTask(
          async () => {
            if (loader.terminate) {
              return;
            }
            const shouldForceReload = forceReloadFileIDs?.has(id);
            const deferredValidation = deferredCacheValidation?.get(id);
            if (
              cacheValidation === "validated" &&
              emitPolicy === "changed-only" &&
              shouldForceReload &&
              deferredValidation?.kind === "excalidraw-dependencies"
            ) {
              const file = embeddedFile.file;
              const cacheIsValid = Boolean(
                file &&
                file.stat.mtime <= deferredValidation.cacheMtime &&
                !hasExcalidrawEmbeddedImagesTreeChanged(
                  file,
                  deferredValidation.cacheMtime,
                  loader.plugin,
                  deferredDependencyGraphContext,
                ),
              );
              if (cacheIsValid) {
                return;
              }
            }
            if (
              shouldForceReload ||
              !embeddedFile.isLoaded(loader.isDark, pdfScale)
            ) {
              //debug({where:"EmbeddedFileLoader.loadSceneFiles",uid:this.uid,status:"embedded Files are not loaded"});
              let excalidrawGenerationDeferred = false;
              const data = await loader._getObsidianImage(embeddedFile, depth, {
                cacheValidation,
                bypassCache: shouldForceReload,
                fileId: id,
                deferUncachedExcalidraw,
                onExcalidrawGenerationDeferred: () => {
                  excalidrawGenerationDeferred = true;
                },
                onStaleCacheHit:
                  cacheValidation === "stale-first"
                    ? (validation) =>
                        deferredValidationCandidates.set(id, validation)
                    : undefined,
                pdfScale,
              });
              if (loader.terminate) {
                return null;
              }

              if (excalidrawGenerationDeferred) {
                deferredGenerationEntries.push(entry);
                return;
              }

              if (data) {
                const fileData: FileData = {
                  mimeType: data.mimeType,
                  id,
                  dataURL: data.dataURL,
                  created: data.created,
                  loadedFromCache: data.loadedFromCache,
                  size: data.size,
                  hasSVGwithBitmap: data.hasSVGwithBitmap,
                  shouldScale: embeddedFile.shouldScale(),
                  pdfPageViewProps: data.pdfPageViewProps,
                  renderScale: data.renderScale,
                };
                files[batch].push(fileData);
              }
            } else if (
              embeddedFile.hasSeparateDarkAndLightVersion &&
              (depth !== 0 || isThemeChange)
            ) {
              //this will reload the image in light/dark mode when switching themes
              const fileData: FileData = {
                mimeType: embeddedFile.mimeType,
                id,
                dataURL: embeddedFile.getImage(loader.isDark) as DataURL,
                created: embeddedFile.mtime,
                size: embeddedFile.size,
                hasSVGwithBitmap: embeddedFile.isSVGwithBitmap,
                shouldScale: embeddedFile.shouldScale(),
                pdfPageViewProps: embeddedFile.pdfPageViewProps,
                renderScale: embeddedFile.renderScale,
              };
              files[batch].push(fileData);
            }
          },
          {
            phase: "embedded-file",
            fileId: id,
            filepath: embeddedFile.file?.path ?? embeddedFile.hyperlink,
            depth,
          },
        );
      }

      if (!includeAdditionalAssets) {
        return;
      }

    }

    const runLoadPool = async (
      iterator: Generator<Promise<void>>,
      concurrency: number,
    ): Promise<boolean> => {
      let stallTimer: number | null = null;
      let resolveStall!: () => void;
      const stalled = new Promise<"stalled">((resolve) => {
        resolveStall = () => resolve("stalled");
      });
      const resetStallTimer = () => {
        if (stallTimer !== null) {
          window.clearTimeout(stallTimer);
        }
        stallTimer = window.setTimeout(
          resolveStall,
          SCENE_FILE_LOAD_STALL_TIMEOUT_MS,
        );
      };

      onLoadTaskSettled = resetStallTimer;
      resetStallTimer();
      const poolCompleted = new PromisePool(iterator, concurrency)
        .all()
        .then(() => "completed" as const);
      const result = await Promise.race([poolCompleted, stalled]);
      onLoadTaskSettled = null;
      if (stallTimer !== null) {
        window.clearTimeout(stallTimer);
      }
      if (result === "completed") {
        return true;
      }

      this.terminalState = "timed-out";
      this.terminate = true;
      return false;
    };

    let finalFlushed = false;
    const flushFiles = (
      batchFiles: FileData[] | undefined,
      final: boolean,
    ) => {
      if (final && finalFlushed) {
        return;
      }
      if (final) {
        finalFlushed = true;
      }
      try {
        addFiles(batchFiles, this.isDark, final);
      } catch (e: unknown) {
        errorlog({ where: "EmbeddedFileLoader.loadSceneFiles", error: e });
      }
    };

    let progressivePaintPromise: Promise<void> | null = null;
    const flushProgressiveBatch = (): boolean => {
      if (
        !waitForRender ||
        files[batch].length <= SCENE_FILE_PROGRESSIVE_BATCH_SIZE
      ) {
        return false;
      }

      if (prioritizedFileIds?.size) {
        files[batch].sort(
          (fileA, fileB) =>
            Number(prioritizedFileIds.has(fileB.id)) -
            Number(prioritizedFileIds.has(fileA.id)),
        );
      }
      const batchFiles = files[batch]
        .splice(0, SCENE_FILE_PROGRESSIVE_BATCH_SIZE)
        .filter((f) => emitPolicy === "all" || !f.loadedFromCache);
      if (batchFiles.length === 0) {
        return false;
      }

      flushFiles(batchFiles, false);
      const paintPromise = Promise.resolve()
        .then(waitForRender)
        .catch((error: unknown) => {
          errorlog({
            where: "EmbeddedFileLoader.loadSceneFiles",
            phase: "progressive-batch-paint",
            error,
          });
        });
      progressivePaintPromise = paintPromise;
      void paintPromise.finally(() => {
        if (progressivePaintPromise === paintPromise) {
          progressivePaintPromise = null;
        }
      });
      return true;
    };

    const waitForProgressivePaint = async () => {
      if (progressivePaintPromise !== null) {
        await progressivePaintPromise;
      }
    };

    const drainProgressiveBatches = async () => {
      await waitForProgressivePaint();
      while (flushProgressiveBatch()) {
        await waitForProgressivePaint();
      }
    };

    const addFilesTimer = window.setInterval(() => {
      if (this.terminate) {
        window.clearInterval(addFilesTimer);
        return;
      }
      if (files[batch].length === 0) {
        return;
      }
      if (progressivePaintPromise !== null) {
        return;
      }
      if (flushProgressiveBatch()) {
        return;
      }
      // During deferred validation, only regenerated results should reach addFiles.
      const batchFiles = files[batch].filter(
        (f) => emitPolicy === "all" || !f.loadedFromCache,
      );
      flushFiles(batchFiles, false);
      files.push([]);
      batch++;
    }, 1200);

    try {
      const concurency =
        validationConcurrency ?? this.plugin.settings.renderingConcurrency;
      const iterator = loadIterator(this, entries, true, true);
      if (!this.terminate) {
        await runLoadPool(iterator, concurency);
      }

      if (this.terminate) {
        if (this.terminalState === "running") {
          this.terminalState = "terminated";
        }
        flushFiles(undefined, true);
        return;
      }
      if (deferredGenerationEntries.length > 0) {
        // Publish everything that was available from cache or direct file reads
        // before expensive generated SVG work can monopolize the main thread.
        await drainProgressiveBatches();
        const fastFiles = files[batch].filter(
          (f) => emitPolicy === "all" || !f.loadedFromCache,
        );
        if (fastFiles.length > 0) {
          flushFiles(fastFiles, false);
        }
        files.push([]);
        batch++;

        // Yield a browser task after addFiles so the fast batch can paint before
        // starting potentially long synchronous sections of SVG generation.
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
        if (!this.terminate) {
          const deferredIterator = loadIterator(
            this,
            deferredGenerationEntries,
            false,
            false,
          );
          await runLoadPool(deferredIterator, concurency);
        }
      }

      if (this.terminate) {
        if (this.terminalState === "running") {
          this.terminalState = "terminated";
        }
        flushFiles(undefined, true);
        return;
      }
      //debug({where:"EmbeddedFileLoader.loadSceneFiles",uid:this.uid,status:"add Files"});
      if (deferredValidationCandidates.size > 0) {
        onDeferredValidationCandidates?.(deferredValidationCandidates);
      }
      await drainProgressiveBatches();
      // Same filter for the final flush so validated cache hits remain a no-op.
      const batchFiles = files[batch].filter(
        (f) => emitPolicy === "all" || !f.loadedFromCache,
      );
      // The helper retains the try/catch because the user may have closed the
      // view by the time the asynchronous image work completes.
      this.terminalState = "completed";
      flushFiles(batchFiles, true);
    } catch (error: unknown) {
      this.terminalState = "failed";
      errorlog({
        where: "EmbeddedFileLoader.loadSceneFiles",
        uid: this.uid,
        phase: "pool",
        error,
      });
      const batchFiles = files[batch].filter(
        (f) => emitPolicy === "all" || !f.loadedFromCache,
      );
      flushFiles(batchFiles, true);
    } finally {
      onLoadTaskSettled = null;
      window.clearInterval(addFilesTimer);
      if (!finalFlushed) {
        if (this.terminalState === "running") {
          this.terminalState = this.terminate ? "terminated" : "failed";
        }
        const batchFiles = this.terminate
          ? undefined
          : files[batch].filter(
              (f) => emitPolicy === "all" || !f.loadedFromCache,
            );
        flushFiles(batchFiles, true);
      }
      this.emptyPDFDocsMap();
    }
  }

  private async pdfToDataURL(
    file: TFile,
    linkParts: LinkParts,
    options?: LoadImageOptions,
  ): Promise<[DataURL, Size, PDFPageViewProps, number, boolean]> {
    try {
      let width = 0;
      let height = 0;
      const pageNum = isNaN(linkParts.page) ? 1 : (linkParts.page ?? 1);
      const requestedScale =
        options?.pdfScale ?? this.plugin.settings.pdfScale;
      const shouldUseCache =
        !options?.bypassCache &&
        getImageCache().isReady() &&
        (!options || this.plugin.settings.allowImageCacheInScene);
      const cacheKey: ImageKey = {
        filepath: file.path,
        cacheId: getPDFCacheId(linkParts, pageNum),
        hasBlockref: false,
        hasGroupref: false,
        hasTaskbone: false,
        hasArearef: false,
        hasFrameref: false,
        hasClippedFrameref: false,
        hasSectionref: false,
        blockref: null,
        sectionref: null,
        linkpartReference: null,
        linkpartAlias: null,
        isDark: !!this.isDark,
        previewImageType: PreviewImageType.PNG,
        scale: 0,
        isTransparent: false,
        inlineFonts: false,
      };
      const cachedData = shouldUseCache
        ? await getImageCache().getImageCacheData(cacheKey, {
            skipDependencyCheck: options?.cacheValidation === "stale-first",
            expectedPayloadKind: "raster",
            minRenderScale:
              options?.cacheValidation === "stale-first"
                ? undefined
                : requestedScale,
          })
        : undefined;

      if (cachedData?.blob) {
        const cachedScale = cachedData.renderScale ?? requestedScale;
        // Stale-first accepts an older PDF raster immediately, but still marks it
        // for deferred validation when the requested scale has increased.
        if (
          options?.cacheValidation === "stale-first" &&
          cachedScale < requestedScale
        ) {
          options?.onStaleCacheHit?.({ kind: "reload" });
        }
        return [
          `data:image/png;base64,${await blobToBase64(cachedData.blob)}` as DataURL,
          cachedData.size,
          cachedData.pdfPageViewProps,
          cachedScale,
          true,
        ];
      }

      let pdfDoc = this.pdfDocsMap.get(file.path);
      if (!pdfDoc) {
        pdfDoc = await getPDFDoc(file);
        if (!pdfDoc) {
          return [null, null, null, null, false];
        }
        this.pdfDocs.add(pdfDoc);
        if (!this.pdfDocsMap.has(file.path)) {
          this.pdfDocsMap.set(file.path, pdfDoc);
        }
      } else {
        this.pdfDocs.add(pdfDoc);
      }

      const scale = requestedScale;
      const cropRect = linkParts.ref
        .split("rect=")[1]
        ?.split(",")
        .map((x) => parseInt(x));
      const validRect =
        cropRect && cropRect.length === 4 && cropRect.every((x) => !isNaN(x));
      let viewProps: PDFPageViewProps;

      const shouldRetryWithFreshDoc = (e: unknown): boolean => {
        let message = "";

        if (e instanceof Error) {
          // Standard JS Errors are guaranteed to have a string .message
          message = e.message;
        } else if (typeof e === "string") {
          // If someone threw a raw string
          message = e;
        } else if (e !== null && typeof e === "object" && "message" in e) {
          // If it's a custom object with a message property
          const maybeMessage = (e as { message?: unknown }).message;
          if (typeof maybeMessage === "string") {
            message = maybeMessage;
          }
        }

        return (
          message.includes("sendWithPromise") ||
          message.includes("WorkerTransport") ||
          message.includes("Cannot read properties of null")
        );
      };

      // Render the page
      const renderPage = async (num: number) => {
        //when obsidian loads there seems to be an occasional race condition where the rendering is cancelled
        //this is a workaround for that
        const maxRetries = 4;
        for (let i = 0; i < maxRetries; i++) {
          const canvas = createEl("canvas");
          try {
            if (this.terminate) {
              return null;
            }

            const ctx = canvas.getContext("2d");
            // Get page
            const page = await pdfDoc.getPage(num);
            // Set scale
            const viewport = page.getViewport({ scale });
            height = canvas.height = Math.round(viewport.height);
            width = canvas.width = Math.round(viewport.width);

            const renderCtx = {
              canvasContext: ctx,
              background: "rgba(0,0,0,0)",
              viewport,
            };

            await page.render(renderCtx).promise;

            const [left, bottom, right, top] = page.view;
            viewProps = { left, bottom, right, top };
            viewProps.rotate = page.rotate;

            if (validRect) {
              const pageHeight = top - bottom;
              const pageWidth = right - left;

              if (!page.rotate || page.rotate === 0) {
                width = (cropRect[2] - cropRect[0]) * scale;
                height = (cropRect[3] - cropRect[1]) * scale;

                const crop = {
                  left: (cropRect[0] - left) * scale,
                  top: (bottom + pageHeight - cropRect[3]) * scale,
                  width,
                  height,
                };
                return cropCanvas(canvas, crop);
              }
              if (page.rotate === 90) {
                width = (cropRect[3] - cropRect[1]) * scale;
                height = (cropRect[2] - cropRect[0]) * scale;
                const crop = {
                  left: cropRect[1] * scale,
                  top: (pageHeight - cropRect[2]) * scale,
                  width,
                  height,
                };
                return cropCanvas(canvas, crop);
              }

              if (page.rotate === 180) {
                width = (cropRect[2] - cropRect[0]) * scale;
                height = (cropRect[3] - cropRect[1]) * scale;
                const crop = {
                  left: (pageWidth - cropRect[2]) * scale,
                  top: cropRect[1] * scale,
                  width,
                  height,
                };
                return cropCanvas(canvas, crop);
              }

              if (page.rotate === 270) {
                width = (cropRect[3] - cropRect[1]) * scale;
                height = (cropRect[2] - cropRect[0]) * scale;
                const crop = {
                  left: (pageWidth - cropRect[3]) * scale,
                  top: cropRect[0] * scale,
                  width,
                  height,
                };
                return cropCanvas(canvas, crop);
              }
            }

            return canvas;
          } catch (e) {
            canvas.width = 0;
            canvas.height = 0;

            if (i === maxRetries - 1) {
              throw e;
            } // Throw on last retry

            if (shouldRetryWithFreshDoc(e)) {
              const previousDoc = pdfDoc;
              const freshDoc = await getPDFDoc(file);
              if (freshDoc) {
                pdfDoc = freshDoc;
                this.pdfDocs.add(freshDoc);
                if (this.pdfDocsMap.get(file.path) === previousDoc) {
                  this.pdfDocsMap.set(file.path, freshDoc);
                }
              }
            }

            await sleep(50 * (i + 1));
            continue;
          }
        }
        return null;
      };

      const canvas = await renderPage(pageNum);
      if (this.terminate) {
        return [null, null, null, null, false];
      }
      if (canvas) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              reject(new Error("Failed to convert PDF canvas to blob."));
              return;
            }
            resolve(pngBlob);
          });
        });
        const base64 = await blobToBase64(blob);
        if (shouldUseCache) {
          getImageCache().addImageToCache(cacheKey, "", blob, {
            renderScale: requestedScale,
            size: { width, height },
            pdfPageViewProps: viewProps,
          });
        }
        const result: [DataURL, Size, PDFPageViewProps, number, boolean] = [
          `data:image/png;base64,${base64}` as DataURL,
          { width, height },
          viewProps,
          requestedScale,
          false,
        ];
        canvas.width = 0; //free memory iOS bug
        canvas.height = 0;
        return result;
      }
    } catch (e: unknown) {
      errorlog({
        where: "EmbeddedFileLoader.pdfToDataURL",
        uid: this.uid,
        error: e,
      });
      return [null, null, null, null, false];
    }
  }
}

// ─── MathJax CHTML stylesheet helpers ────────────────────────────────────────

// Cache keyed by "<rule-count>:<last-rule-text>" — cheap to compute and sufficient
// for MathJax's append-only glyph stylesheet: every new character adds a new rule
// at the end, so a change in count or last entry signals a cache miss.
const mjxScopedStyleCache = new Map<string, Promise<string>>();

/**
 * Fetches a font file and returns it as a base64 data URI.
 * This is necessary because fonts referenced by relative/app:// URLs in
 * @font-face rules are blocked when the SVG is loaded as a data: URL.
 */
const fetchFontAsDataURI = async (url: string): Promise<string | null> => {
  if (url.startsWith("data:")) return url;
  try {
    const res = await deliberateFetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // Build base64 in 8 KB chunks to avoid call-stack overflow on large fonts.
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    const mime =
      ext === "woff2"
        ? "font/woff2"
        : ext === "woff"
          ? "font/woff"
          : ext === "ttf"
            ? "font/ttf"
            : ext === "otf"
              ? "font/otf"
              : "font/woff2";
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
};

/**
 * Processes the live MathJax CHTML <style> element so it is safe to embed in the SVG.
 *
 * WHY we accept the element instead of its textContent: MathJax adds per-glyph CSS
 * rules via sheet.insertRule(), which updates sheet.cssRules but NOT the element's
 * textContent. Reading textContent would therefore miss every glyph rule added after
 * initial load, explaining why only the very last character in a formula appeared.
 *
 * What this function does:
 * 1. Scopes every style rule to `scope` (e.g. ".excalidraw-md-host") so that broad
 *    selectors cannot bleed outside the math container and underline regular text.
 * 2. Inlines every @font-face src URL as a base64 data URI so the mathematical fonts
 *    (needed for correct radical-bar vertical metrics) load inside a data: SVG, where
 *    the browser blocks all external URL references for security reasons.
 *
 * Results are cached by rule-count + last-rule text to avoid re-fetching fonts on
 * every embed of the same formula set.
 */
const scopeAndInlineMathJaxCSS = (
  styleEl: HTMLStyleElement | null,
  scope: string,
): Promise<string> => {
  const sheet = styleEl?.sheet;
  if (!sheet?.cssRules.length) return Promise.resolve("");

  // Cheap cache key: rule count + last rule text (MathJax only ever appends rules).
  const lastRule = sheet.cssRules[sheet.cssRules.length - 1]?.cssText ?? "";
  const cacheKey = `${sheet.cssRules.length}:${lastRule.slice(0, 80)}`;

  const cached = mjxScopedStyleCache.get(cacheKey) ?? null;
  if (cached !== null) return cached;

  const work = (async (): Promise<string> => {
    // Snapshot the live rules array before any await so we process the state
    // that existed when typesetPromise resolved, not a later state.
    const rules = Array.from(sheet.cssRules);
    let result = "";
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) {
        // Inline each src URL as base64 so fonts work inside data: SVGs.
        let ruleText = rule.cssText;
        const urlRe = /url\(["']?([^"')]+)["']?\)/g;
        for (const m of [...ruleText.matchAll(urlRe)]) {
          const dataURI = await fetchFontAsDataURI(m[1]);
          if (dataURI) ruleText = ruleText.replace(m[0], `url("${dataURI}")`);
        }
        result += ruleText + "\n";
      } else if (rule instanceof CSSStyleRule) {
        // Prefix every selector with `scope` so rules cannot bleed to elements
        // outside the math container (e.g. causing underlines on regular text).
        const sr = rule;
        const scoped = sr.selectorText
          .split(",")
          .map((s) => `${scope} ${s.trim()}`)
          .join(", ");
        result += `${scoped} { ${sr.style.cssText} }\n`;
      } else {
        // @media, @keyframes, @supports, etc. — pass through unchanged.
        result += rule.cssText + "\n";
      }
    }
    return result;
  })();

  mjxScopedStyleCache.set(cacheKey, work);
  return work;
};

// ─────────────────────────────────────────────────────────────────────────────

const getSVGData = async (
  app: App,
  file: TFile,
  colorMap: ColorMap | null,
): Promise<DataURL> => {
  const svgString = replaceSVGColors(
    await app.vault.read(file),
    colorMap,
  ) as string;
  return svgToBase64(svgString) as DataURL;
};

export const generateIdFromFile = async (
  file: ArrayBuffer,
  key?: string,
): Promise<FileId> => {
  let id: FileId;
  try {
    // Convert the file ArrayBuffer to a Uint8Array
    const fileArray = new Uint8Array(file);

    // If a key is provided, concatenate it to the file data
    let dataToHash: Uint8Array;
    if (key) {
      const encoder = new TextEncoder();
      const keyArray = encoder.encode(key);
      dataToHash = new Uint8Array(fileArray.length + keyArray.length);
      dataToHash.set(fileArray);
      dataToHash.set(keyArray, fileArray.length);
    } else {
      dataToHash = fileArray;
    }

    // Hash the combined data (file and key, if provided)
    // Ensure we pass an ArrayBuffer (not ArrayBufferLike) to subtle.digest
    const buffer = strictArrayBuffer(
      dataToHash.buffer.slice(
        dataToHash.byteOffset,
        dataToHash.byteOffset + dataToHash.byteLength,
      ),
    );
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", buffer);
    id = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("") as FileId;
  } catch (error: unknown) {
    errorlog({
      where: "EmbeddedFileLoader.generateIdFromFile",
      error: error,
    });
    id = fileid() as FileId;
  }
  return id;
};

// This function is for converting blob:app://obsidian.md image URLs (from Obsidian's image cache) to base64 data URLs.
// fetch is used here because requestUrl does not support blob: URLs, and fetch is the only browser API that can read them directly.
const replaceBlobWithBase64 = async (
  divElement: HTMLDivElement,
): Promise<void> => {
  const images = divElement.querySelectorAll<HTMLImageElement>(
    'img[src^="blob:app://obsidian.md"]',
  );

  for (const img of images) {
    const blobUrl = img.src;
    try {
      // fetch is the only way to read blob: URLs in browser/Obsidian context.
      const response = await deliberateFetch(blobUrl);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      img.src = `data:${blob.type};base64,${base64}`;
    } catch (error) {
      // fallback: use canvas if fetch fails (should be rare)
      const canvas = createEl("canvas");
      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          img.src = canvas.toDataURL();
        }
        canvas.width = 0;
        canvas.height = 0;
      }
      console.error(`Failed to fetch or convert blob: ${blobUrl}`, error);
    }
  }
};
