import {
  LOCALE,
  DEVICE,
  FRONTMATTER_KEYS,
  CJK_FONTS,
} from "src/constants/constants";
import {
  TAG_AUTOEXPORT,
  TAG_MDREADINGMODE,
  TAG_PDFEXPORT,
} from "src/constants/constSettingsTags";
import { URLs } from "src/constants/safeUrls";
import {
  labelALT,
  labelCTRL,
  labelMETA,
  labelSHIFT,
} from "src/utils/modifierKeyLabels";
import en from "./locale/en";
import { errorHandler } from "src/utils/ErrorHandler";

declare const PLUGIN_LANGUAGES: Record<string, string>;
declare const PLUGIN_VERSION: string;

let locale: Partial<typeof en> | null = null;

type LocaleFactory = (
  device: typeof DEVICE,
  frontmatterKeys: typeof FRONTMATTER_KEYS,
  cjkFonts: typeof CJK_FONTS,
  tagAutoexport: typeof TAG_AUTOEXPORT,
  tagMdReadingMode: typeof TAG_MDREADINGMODE,
  tagPdfExport: typeof TAG_PDFEXPORT,
  safeUrls: typeof URLs,
  altLabel: typeof labelALT,
  ctrlLabel: typeof labelCTRL,
  metaLabel: typeof labelMETA,
  shiftLabel: typeof labelSHIFT,
  pluginVersion: string,
) => Partial<typeof en>;

type LocaleRuntimeGlobals = {
  unpackBase64Deflate?: (value: string) => string;
};

function loadLocale(lang: string): Partial<typeof en> {
  if (lang === "zh") {
    lang = "zh-cn";
  } //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/2247

  if (!Object.prototype.hasOwnProperty.call(PLUGIN_LANGUAGES, lang)) {
    return en;
  }

  try {
    const compressed = PLUGIN_LANGUAGES[lang];
    const runtimeGlobals = window as Window & LocaleRuntimeGlobals;
    const unpack = runtimeGlobals.unpackBase64Deflate;
    if (typeof unpack !== "function") {
      return en;
    }
    const decompressed = unpack(compressed);

    // Construct a factory function string.
    // This allows safeEval (which runs in the global scope) to access our imported variables
    // because we pass them explicitly as arguments to this function.
    const factoryCode = `(function(
      DEVICE, FRONTMATTER_KEYS, CJK_FONTS,
      TAG_AUTOEXPORT, TAG_MDREADINGMODE, TAG_PDFEXPORT,
      URLs,
      labelALT, labelCTRL, labelMETA, labelSHIFT,
      PLUGIN_VERSION
    ) {
      let x = {};
      ${decompressed}
      return x;
    })`;

    // Evaluate the function declaration using your ErrorHandler
    const factoryResult = errorHandler.safeEval<unknown>(
      factoryCode,
      "loadLocale - parsing language pack",
      window,
    );
    if (typeof factoryResult !== "function") {
      return en;
    }
    const factory = factoryResult as LocaleFactory;

    // Execute the evaluated function, injecting the actual imported dependencies
    const x = factory(
      DEVICE,
      FRONTMATTER_KEYS,
      CJK_FONTS,
      TAG_AUTOEXPORT,
      TAG_MDREADINGMODE,
      TAG_PDFEXPORT,
      URLs,
      labelALT,
      labelCTRL,
      labelMETA,
      labelSHIFT,
      PLUGIN_VERSION,
    );

    return x || en;
  } catch (error) {
    console.error("Error loading locale", loadLocale, error);
    return en;
  }
}

export function t(str: keyof typeof en): string {
  if (!locale) {
    locale = loadLocale(LOCALE);
  }
  return (locale && locale[str]) || en[str];
}
