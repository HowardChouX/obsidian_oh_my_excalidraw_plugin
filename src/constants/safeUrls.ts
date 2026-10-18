/**
 * Standardized dictionary of URL purposes.
 * Keeps the audit footprint clean and explains exactly why an external resource is needed.
 */
export const UrlPurpose = {
  SUPPORT: "Support link, contact, or Ko-Fi button",
  DOCS: "Background information in Settings or Code Suggester",
  RELEASE_LOG: "Referencing issues, changes, or contributors in release log",
  VIDEO: "Supporting video tutorial or thumbnail",
  APP_LOGIC:
    "Internal application logic (embeddables, UI renders, asset fetching)",
  TRANSLATION: "One-time support message translation",
} as const;

const PLUGIN_REPOSITORY_RAW_BASE_URL =
  "https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master";
const PLUGIN_REPOSITORY_BLOB_BASE_URL =
  "https://github.com/zsviczian/obsidian-excalidraw-plugin/blob/master";

/** Encodes a repository-relative path while leaving the destination visible in source. */
const encodeRepositoryPath = (value: string): string =>
  value
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

export const getPluginRepositoryRawUrl = (repositoryPath: string): string =>
  `${PLUGIN_REPOSITORY_RAW_BASE_URL}/${encodeRepositoryPath(repositoryPath)}`;

export const getPluginRepositoryBlobUrl = (repositoryPath: string): string =>
  `${PLUGIN_REPOSITORY_BLOB_BASE_URL}/${encodeRepositoryPath(repositoryPath)}`;

// Helper to enforce type structure in the registry
const defineUrl = (url: string, purpose: string) => ({ url, purpose });

/**
 * Single source of truth for all external URLs and their security/audit justifications.
 */
export const URL_REGISTRY = {
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_CLI: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-cli",
    UrlPurpose.DOCS,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_ISSUES: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-plugin/issues",
    UrlPurpose.DOCS,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_EXTRAS_ISSUES: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-extras/issues",
    UrlPurpose.RELEASE_LOG,
  ),
  COMMUNITY_SKETCH_YOUR_MIND_COM_EM: defineUrl(
    "https://community.sketch-your-mind.com/em",
    UrlPurpose.SUPPORT,
  ),
  KO_FI_COM_ZSOLT: defineUrl("https://ko-fi.com/zsolt", UrlPurpose.SUPPORT),
  CDN_KO_FI_COM_CDN_KOFI3_PNG: defineUrl(
    "https://cdn.ko-fi.com/cdn/kofi3.png?v=3",
    UrlPurpose.SUPPORT,
  ),
  WWW_YOUTUBE_COM_VISUALPKM: defineUrl(
    "https://www.youtube.com/@visualPKM",
    UrlPurpose.SUPPORT,
  ),
  COMMUNITY_SKETCH_YOUR_MIND_COM_EE: defineUrl(
    "https://community.sketch-your-mind.com/ee",
    UrlPurpose.SUPPORT,
  ),
  TWITTER_COM_ZSVICZIAN: defineUrl(
    "https://twitter.com/zsviczian",
    UrlPurpose.SUPPORT,
  ),
  COMMUNITY_SKETCH_YOUR_MIND_COM_SYM: defineUrl(
    "https://community.sketch-your-mind.com/sym",
    UrlPurpose.SUPPORT,
  ),
  WWW_W3SCHOOLS_COM_COLORS_COLORS_NAMES_ASP: defineUrl(
    "https://www.w3schools.com/colors/colors_names.asp",
    UrlPurpose.DOCS,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RAW_REFS_HEADS_MASTER_ASSETS_EXCALIDRAW_FONTS_ZIP:
    defineUrl(
      "https://github.com/zsviczian/obsidian-excalidraw-plugin/raw/refs/heads/master/assets/excalidraw-fonts.zip",
      UrlPurpose.DOCS,
    ),
  SKETCH_YOUR_MIND_COM_IMAGES_LOGO_EE_PNG: defineUrl(
    "https://sketch-your-mind.com/images/logo-EE.png",
    UrlPurpose.APP_LOGIC,
  ),
  WWW_YOUTUBE_COM_WATCH: defineUrl(
    "https://www.youtube.com/watch?v=P_Q6avJGoWI",
    UrlPurpose.VIDEO,
  ),
  I_YTIMG_COM: defineUrl("https://i.ytimg.com", UrlPurpose.APP_LOGIC),
  I_YTIMG_COM_VI_P_Q6AVJGOWI_MAXRESDEFAULT_JPG: defineUrl(
    "https://i.ytimg.com/vi/P_Q6avJGoWI/maxresdefault.jpg",
    UrlPurpose.VIDEO,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RELEASES: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases",
    UrlPurpose.RELEASE_LOG,
  ),
  PIEROXY_NET_BLOG_PAGES_LZ_STRING_INDEX_HTML: defineUrl(
    "https://pieroxy.net/blog/pages/lz-string/index.html",
    UrlPurpose.DOCS,
  ),
  MOMENTJS_COM_DOCS: defineUrl(
    "https://momentjs.com/docs/#/displaying/format",
    UrlPurpose.DOCS,
  ),
  YOUTUBE_COM_SHORTS_O_1LS9C6WBY: defineUrl(
    "https://youtube.com/shorts/O_1ls9c6wBY?feature=share",
    UrlPurpose.VIDEO,
  ),
  WWW_YOUTUBE_COM_WATCH_1: defineUrl(
    "https://www.youtube.com/watch?v=yZQoJg2RCKI&t=633s",
    UrlPurpose.VIDEO,
  ),
  GITHUB_COM_DEATHAU_SLIDING_PANES_OBSIDIAN: defineUrl(
    "https://github.com/deathau/sliding-panes-obsidian",
    UrlPurpose.DOCS,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_BLOB_MASTER_DOCS_API_EXCALIDRAWAUTOMATE_D_TS:
    defineUrl(
      "https://github.com/zsviczian/obsidian-excalidraw-plugin/blob/master/docs/API/ExcalidrawAutomate.d.ts",
      UrlPurpose.DOCS,
    ),
  ZSVICZIAN_GITHUB_IO_OBSIDIAN_EXCALIDRAW_PLUGIN: defineUrl(
    "https://zsviczian.github.io/obsidian-excalidraw-plugin",
    UrlPurpose.DOCS,
  ),
  COMMUNITY_SKETCH_YOUR_MIND_COM: defineUrl(
    "https://community.sketch-your-mind.com",
    UrlPurpose.SUPPORT,
  ),
  COMMUNITY_OBSIDIAN_MD_PLUGINS_OBSIDIAN_EXCALIDRAW_PLUGIN: defineUrl(
    "https://community.obsidian.md/plugins/obsidian-excalidraw-plugin",
    UrlPurpose.RELEASE_LOG,
  ),
  GITHUB_COM: defineUrl("https://github.com", UrlPurpose.RELEASE_LOG),
  GITHUB_COM_EXCALIDRAW_EXCALIDRAW_PULL: defineUrl(
    "https://github.com/excalidraw/excalidraw/pull",
    UrlPurpose.RELEASE_LOG,
  ),
  GITHUB_COM_EXCALIDRAW_EXCALIDRAW_CHANGELOG: defineUrl(
    "https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/CHANGELOG.md",
    UrlPurpose.RELEASE_LOG,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_PULL: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-plugin/pull",
    UrlPurpose.RELEASE_LOG,
  ),
  GITHUB_COM_STEVERUIZOK_PERFECT_FREEHAND: defineUrl(
    "https://github.com/steveruizok/perfect-freehand#documentation",
    UrlPurpose.DOCS,
  ),
  EASINGS_NET: defineUrl("https://easings.net", UrlPurpose.DOCS),
  VISUAL_THINKING_WORKSHOP_COM: defineUrl(
    "https://community.sketch-your-mind.com/vtw",
    UrlPurpose.SUPPORT,
  ),
  GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RELEASES_TAG: defineUrl(
    "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag",
    UrlPurpose.RELEASE_LOG,
  ),
  TRANSLATE_GOOGLE_COM: defineUrl(
    "https://translate.google.com/?sl=en&tl=zh-CN&text=This%20file%20contains%20embedded%20frames%20which%20will%20be%20migrated%20to%20a%20newer%20version%20for%20compatibility%20with%20excalidraw.com.%0A%0AIf%20you%27re%20using%20Obsidian%20on%20multiple%20devices%2C%20you%20may%20proceed%20now%2C%20but%20please%2C%20before%20opening%20this%20file%20on%20your%20other%20devices%2C%20update%20Excalidraw%20on%20those%20as%20well.%0A%0AMore%20info%20is%20available%20here%3A%20https%3A%2F%2Fgithub.com%2Fzsviczian%2Fobsidian-excalidraw-plugin%2Freleases%2Ftag%2F1.9.9%27%3Ehere%3C%2Fa%3E.&op=translate",
    UrlPurpose.TRANSLATION,
  ),
  WWW_YOUTUBE_COM: defineUrl("https://www.youtube.com", UrlPurpose.APP_LOGIC),
  YOUTUBE_COM: defineUrl("https://youtube.com", UrlPurpose.APP_LOGIC),
  PLAYER_VIMEO_COM: defineUrl("https://player.vimeo.com", UrlPurpose.APP_LOGIC),
  NOEMBED_COM_EMBED_URL: defineUrl(
    "https://noembed.com/embed?url=",
    UrlPurpose.APP_LOGIC,
  ),
} as const;

/**
 * Backward compatibility map.
 * This unpacks the URL_REGISTRY so `URLs.YOUR_KEY` correctly returns the expected string
 * throughout the existing codebase without requiring a mass refactor.
 */
export const URLs = Object.fromEntries(
  Object.entries(URL_REGISTRY).map(([key, data]) => [key, data.url]),
) as { [K in keyof typeof URL_REGISTRY]: string };

export const getYouTubeThumbnailUrl = (id: string) =>
  `${URLs.I_YTIMG_COM}/vi/${id}/maxresdefault.jpg`;
export const getYouTubeUrl = (id: string) =>
  `${URLs.YOUTUBE_COM}/watch?v=${id}`;
