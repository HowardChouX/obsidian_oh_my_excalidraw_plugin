/**
 * Parsing helpers for the "## Drawing" scene section, the user-editable
 * Markdown header that precedes it, and the marker-delimited local
 * Markdown-image blocks stored inside that header. Extracted intact from
 * `ExcalidrawData.ts`, which remains the primary consumer alongside several
 * other modules that read or write the same Markdown structure.
 */
import { FileId } from "@zsviczian/excalidraw/types/element/src/types";
import {
  compress,
  compressAsync,
  decompress,
  updateFrontmatterInString,
} from "../utils/sceneDataUtils";
import { isObsidianThemeDark } from "../utils/obsidianUtils";
import { MD_MARKDOWN_IMAGES } from "../constants/constants";

type RegExpMatchIteratorResult = IteratorResult<RegExpMatchArray, undefined>;

//added \n at and of DRAWING_REG: https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/357
const DRAWING_REG = /\n##? Drawing\n[^`]*(```json\n)([\s\S]*?)```\n/gm; //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/182
const DRAWING_REG_FALLBACK = /\n##? Drawing\n(```json\n)?(.*)(```)?(%%)?/gm;
export const DRAWING_COMPRESSED_REG =
  /(\n##? Drawing\n[^`]*(?:```compressed-json\n))([\s\S]*?)(```\n)/gm; //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/182
const DRAWING_COMPRESSED_REG_FALLBACK =
  /(\n##? Drawing\n(?:```compressed-json\n)?)(.*)((```)?(%%)?)/gm;

const isCompressedMD = (data: string): boolean => {
  return data.match(/```compressed-json\n/gm) !== null;
};

const getDecompressedScene = (
  data: string,
): [string | null, RegExpMatchIteratorResult] => {
  let res = data.matchAll(DRAWING_COMPRESSED_REG);

  //In case the user adds a text element with the contents "# Drawing\n"
  let parts: RegExpMatchIteratorResult;
  parts = res.next();
  if (parts.done) {
    //did not find a match
    res = data.matchAll(DRAWING_COMPRESSED_REG_FALLBACK);
    parts = res.next();
  }
  if (parts.value && parts.value.length > 1) {
    return [decompress(parts.value[2]), parts];
  }
  return [null, parts];
};

export const changeThemeOfExcalidrawMD = (data: string): string => {
  const compressed = isCompressedMD(data);
  let scene = compressed ? getDecompressedScene(data)[0] : data;
  if (!scene) {
    return data;
  }
  if (isObsidianThemeDark) {
    if ((scene.match(/"theme"\s*:\s*"light"\s*,/g) || []).length === 1) {
      scene = scene.replace(/"theme"\s*:\s*"light"\s*,/, `"theme": "dark",`);
    }
  } else if ((scene.match(/"theme"\s*:\s*"dark"\s*,/g) || []).length === 1) {
    scene = scene.replace(/"theme"\s*:\s*"dark"\s*,/, `"theme": "light",`);
  }
  if (compressed) {
    return data.replace(DRAWING_COMPRESSED_REG, `$1${compress(scene)}$3`);
  }
  return scene;
};

export function getJSON(data: string): { scene: string; pos: number } {
  let res: IterableIterator<RegExpMatchArray>;
  if (isCompressedMD(data)) {
    const [result, parts] = getDecompressedScene(data);
    if (result) {
      return {
        scene: result.substring(0, result.lastIndexOf("}") + 1),
        pos: parts.value.index,
      }; //this is a workaround in case sync merges two files together and one version is still an old version without the ```codeblock
    }
    return { scene: data, pos: parts.value ? parts.value.index : 0 };
  }
  res = data.matchAll(DRAWING_REG);

  //In case the user adds a text element with the contents "# Drawing\n"
  let parts: RegExpMatchIteratorResult;
  parts = res.next();
  if (parts.done) {
    //did not find a match
    res = data.matchAll(DRAWING_REG_FALLBACK);
    parts = res.next();
  }
  if (parts.value && parts.value.length > 1) {
    const result = parts.value[2];
    return {
      scene: result.substring(0, result.lastIndexOf("}") + 1),
      pos: parts.value.index,
    }; //this is a workaround in case sync merges two files together and one version is still an old version without the ```codeblock
  }
  return { scene: data, pos: parts.value ? parts.value.index : 0 };
}

export async function getMarkdownDrawingSectionAsync(
  jsonString: string,
  compressed: boolean,
) {
  const result = compressed
    ? `## Drawing\n\x60\x60\x60compressed-json\n${await compressAsync(
        jsonString,
      )}\n\x60\x60\x60\n%%`
    : `## Drawing\n\x60\x60\x60json\n${jsonString}\n\x60\x60\x60\n%%`;
  return result;
}

export function getMarkdownDrawingSection(
  jsonString: string,
  compressed: boolean,
): string {
  const result = compressed
    ? `## Drawing\n\x60\x60\x60compressed-json\n${compress(
        jsonString,
      )}\n\x60\x60\x60\n%%`
    : `## Drawing\n\x60\x60\x60json\n${jsonString}\n\x60\x60\x60\n%%`;
  return result;
}

//WITHSECTION refers to back of the card note (see this.inputEl.onkeyup in SelectCard.ts)
const RE_EXCALIDRAWDATA_WITHSECTION_OK =
  /^(#\n+)%%\n+# Excalidraw Data(?:\n|$)/m;
const RE_EXCALIDRAWDATA_WITHSECTION_NOTOK =
  /#\n+%%\n+# Excalidraw Data(?:\n|$)/m;
// Also used directly by ExcalidrawData's own text-element-section detection.
export const RE_EXCALIDRAWDATA_NOSECTION_OK =
  /^(%%\n+)?# Excalidraw Data(?:\n|$)/m;

//WITHSECTION refers to back of the card note (see this.inputEl.onkeyup in SelectCard.ts)
const RE_TEXTELEMENTS_WITHSECTION_OK = /^#\n+%%\n+##? Text Elements(?:\n|$)/m;
const RE_TEXTELEMENTS_WITHSECTION_NOTOK = /#\n+%%\n+##? Text Elements(?:\n|$)/m;
// Also used directly by ExcalidrawData's own text-element-section detection.
export const RE_TEXTELEMENTS_NOSECTION_OK =
  /^(%%\n+)?##? Text Elements(?:\n|$)/m;

//The issue is that when editing in markdown embeds the user can delete the last enter causing two sections
//to collide. This is particularly problematic when the user is editing the last section before # Text Elements
const RE_EXCALIDRAWDATA_FALLBACK_1 = /(.*)%%\n+# Excalidraw Data(?:\n|$)/m;
// Also used directly by ExcalidrawData's own text-element-section detection.
export const RE_EXCALIDRAWDATA_FALLBACK_2 = /(.*)# Excalidraw Data(?:\n|$)/m;

const RE_TEXTELEMENTS_FALLBACK_1 = /(.*)%%\n+##? Text Elements(?:\n|$)/m;
// Also used directly by ExcalidrawData's own text-element-section detection.
export const RE_TEXTELEMENTS_FALLBACK_2 = /(.*)##? Text Elements(?:\n|$)/m;

const RE_DRAWING = /^(%%\n+)?##? Drawing\n/m;

export function getExcalidrawMarkdownHeader(data: string): {
  header: string;
  shouldFixTrailingHashtag: boolean;
  processingOk: boolean;
} {
  //The base case scenario is at the top, continued with fallbacks in order of likelihood and file structure
  //change history for sake of backward compatibility

  /* Expected markdown structure:
  bla bla bla
  #
  %%
  # Excalidraw Data
  */

  //trimming the json because in legacy excalidraw files the JSON was a single string resulting in very slow regexp parsing
  const drawingTrimLocation = data.search(RE_DRAWING);
  if (drawingTrimLocation > 0) {
    data = data.substring(0, drawingTrimLocation);
  }

  const m1 = data.match(RE_EXCALIDRAWDATA_WITHSECTION_OK);
  let trimLocation = m1?.index ?? -1; //data.search(RE_EXCALIDRAWDATA_WITHSECTION_OK);
  let shouldFixTrailingHashtag = false;
  if (trimLocation > 0) {
    trimLocation += m1[1].length; //accounts for the "(#\n\s*)" which I want to leave there untouched
  }

  /* Expected markdown structure (this happens when the user deletes the last empty line of the last back-of-the-card note):
  bla bla bla#
  %%
  # Excalidraw Data
  */
  if (trimLocation === -1) {
    trimLocation = data.search(RE_EXCALIDRAWDATA_WITHSECTION_NOTOK);
    if (trimLocation > 0) {
      shouldFixTrailingHashtag = true;
    }
  }
  /* Expected markdown structure
  a)
    bla bla bla
    %%
    # Excalidraw Data
  b)
    bla bla bla
    # Excalidraw Data
  */
  if (trimLocation === -1) {
    trimLocation = data.search(RE_EXCALIDRAWDATA_NOSECTION_OK);
  }
  /* Expected markdown structure:
  bla bla bla%%
  # Excalidraw Data
  */
  if (trimLocation === -1) {
    const res = data.match(RE_EXCALIDRAWDATA_FALLBACK_1);
    if (res && Boolean(res[1])) {
      trimLocation = res.index + res[1].length;
    }
  }
  /* Expected markdown structure:
  bla bla bla# Excalidraw Data
  */
  if (trimLocation === -1) {
    const res = data.match(RE_EXCALIDRAWDATA_FALLBACK_2);
    if (res && Boolean(res[1])) {
      trimLocation = res.index + res[1].length;
    }
  }
  /* Expected markdown structure:
  bla bla bla
  #
  %%
  # Text Elements
  */
  if (trimLocation === -1) {
    trimLocation = data.search(RE_TEXTELEMENTS_WITHSECTION_OK);
    if (trimLocation > 0) {
      trimLocation += 2; //accounts for the "#\n" which I want to leave there untouched
    }
  }
  /* Expected markdown structure:
  bla bla bla#
  %%
  # Text Elements
  */
  if (trimLocation === -1) {
    trimLocation = data.search(RE_TEXTELEMENTS_WITHSECTION_NOTOK);
    if (trimLocation > 0) {
      shouldFixTrailingHashtag = true;
    }
  }
  /* Expected markdown structure
  a)
    bla bla bla
    %%
    # Text Elements
  b)
    bla bla bla
    # Text Elements
  */
  if (trimLocation === -1) {
    trimLocation = data.search(RE_TEXTELEMENTS_NOSECTION_OK);
  }
  /* Expected markdown structure:
  bla bla bla%%
  # Text Elements
  */
  if (trimLocation === -1) {
    const res = data.match(RE_TEXTELEMENTS_FALLBACK_1);
    if (res && Boolean(res[1])) {
      trimLocation = res.index + res[1].length;
    }
  }
  /* Expected markdown structure:
  bla bla bla# Text Elements
  */
  if (trimLocation === -1) {
    const res = data.match(RE_TEXTELEMENTS_FALLBACK_2);
    if (res && Boolean(res[1])) {
      trimLocation = res.index + res[1].length;
    }
  }
  /* Expected markdown structure:
  a)
    bla bla bla
    # Drawing
  b)
    bla bla bla
    %%
    # Drawing
  */
  if (trimLocation === -1) {
    if (drawingTrimLocation > 0) {
      trimLocation = drawingTrimLocation;
    }
  }
  if (trimLocation === -1) {
    return {
      header: data.endsWith("\n") ? data : `${data}\n`,
      shouldFixTrailingHashtag,
      processingOk: false,
    };
  }

  return {
    header: data.substring(0, trimLocation),
    shouldFixTrailingHashtag,
    processingOk: true,
  };
}

export const getExcalidrawMarkdownHeaderSection = (
  data: string,
  keys?: [string, string][],
): string => {
  const { header, shouldFixTrailingHashtag, processingOk } =
    getExcalidrawMarkdownHeader(data);
  if (!processingOk) {
    return header;
  }

  const updatedHeader = updateFrontmatterInString(header, keys);
  //this should be removed at a later time. Left it here to remediate 1.4.9 mistake
  /*const REG_IMG = /(^---[\w\W]*?---\n)(!\[\[.*?]]\n(%%\n)?)/m; //(%%\n)? because of 1.4.8-beta... to be backward compatible with anyone who installed that version
  if (header.match(REG_IMG)) {
    header = header.replace(REG_IMG, "$1");
  }*/
  //end of remove
  return shouldFixTrailingHashtag
    ? `${updatedHeader}\n#\n`
    : updatedHeader.endsWith("\n")
      ? header
      : `${header}\n`;
};
