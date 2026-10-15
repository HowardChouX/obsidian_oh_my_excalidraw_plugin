/**
 * Trimmed from the full YouTube utilities: only the aspect-ratio helper used
 * by ExcalidrawAutomate.addEmbeddable() remains. Live YouTube/Vimeo embedding
 * was removed in the Oh My Excalidraw trim.
 */
const REG_YOUTUBE =
  /^(?:http(?:s)?:\/\/)?(?:www\.)?youtu(?:be\.com|\.be)\/(embed\/|watch\?v=|shorts\/|playlist\?list=|embed\/videoseries\?list=)?([a-zA-Z0-9_-]+)(?:\?t=|.*&t=|\?start=|.*&start=)?([a-zA-Z0-9_-]+)?[^\s]*$/;
const REG_VIMEO =
  /^(?:http(?:s)?:\/\/)?(?:(?:w){3}\.)?(?:player\.)?vimeo\.com\/(?:video\/)?([^?\s]+)(?:\?.*)?$/;

const isYouTube = (url: string): boolean => {
  return Boolean(url.match(REG_YOUTUBE));
};

const isVimeo = (url: string): boolean => {
  return Boolean(url.match(REG_VIMEO));
};

export const getAspectRatio = (url: string): { w: number; h: number } => {
  const normalizedUrl = url.toLowerCase();

  if (isYouTube(url)) {
    const isShorts = normalizedUrl.includes("shorts/");
    return isShorts ? { w: 9, h: 16 } : { w: 16, h: 9 };
  }

  if (isVimeo(url)) {
    return { w: 16, h: 9 };
  }

  return { w: 1, h: 1 };
};
