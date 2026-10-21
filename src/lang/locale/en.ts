import { DEVICE, FRONTMATTER_KEYS, CJK_FONTS } from "src/constants/constants";
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

// English
export default {
  // Native CLI and agent discovery
  INITIALIZATION_MESSAGE:
    "Excalidraw is waiting for Obsidian to initialize all of your plugins...",
  // Sugester
  SELECT_FILE_TO_INSERT: "Select a file to insert",
  // main.ts
  ERROR_INITIALIZING_EA: "Error initializing Excalidraw Automate",
  SETTINGS_DATA_INVALID:
    "Excalidraw is waiting for a valid replacement data.json. Setting changes will not be saved until that file is restored, or you restart Obsidian and choose Reset to defaults.",
  SETTINGS_DATA_REPAIRED_FROM_MEMORY:
    "An empty or unreadable Excalidraw settings file was received and rejected. The active settings were written back to repair data.json.",
  SETTINGS_DATA_RECOVERED:
    "Excalidraw data.json was empty or unreadable. The last known good settings were restored automatically.",
  SETTINGS_RECOVERY_MISSING_TITLE: "Excalidraw settings file is missing",
  SETTINGS_RECOVERY_MISSING_DESC:
    "A last known good settings backup exists on this device. Restore that backup, or reset Excalidraw to factory defaults. Closing this message restores the backup.",
  SETTINGS_RECOVERY_CORRUPT_TITLE: "Excalidraw settings file is corrupted",
  SETTINGS_RECOVERY_CORRUPT_DESC:
    "The settings file is empty or unreadable, and no recovery backup is available on this device. Reset Excalidraw to factory defaults, or leave the file unchanged while you restore a valid data.json from another source. Closing this message waits for a replacement file.",
  SETTINGS_RECOVERY_RESTORE_BACKUP: "Restore backup",
  SETTINGS_RECOVERY_RESET_DEFAULTS: "Reset to defaults",
  SETTINGS_RECOVERY_WAIT_FOR_FILE: "Wait for restored file",
  UNZIP_CURRENT_FILE: "Decompress current Excalidraw file",
  PUBLISH_SVG_CHECK:
    "Obsidian Publish: Find SVG and PNG exports that are out of date",
  EMBEDDABLE_PROPERTIES: "Embeddable Properties",
  EMBEDDABLE_RELATIVE_ZOOM:
    "Scale selected embeddable elements to 100% relative to the current canvas zoom",
  OPEN_AS_EXCALIDRAW: "Open as Excalidraw Drawing",
  TOGGLE_MODE: "Toggle between Excalidraw and Markdown mode",
  CONVERT_NOTE_TO_EXCALIDRAW: "Convert markdown note to Excalidraw Drawing",
  CONVERT_EXCALIDRAW: "Convert *.excalidraw to *.md files",
  CREATE_NEW: "New drawing",
  CONVERT_FILE_KEEP_EXT: "*.excalidraw => *.excalidraw.md",
  CONVERT_FILE_REPLACE_EXT: "*.excalidraw => *.md (Logseq compatibility)",
  LIBRARY_PATH_MISSING: "This path does not currently exist in the vault.",
  CREATE_FOLDER: "Create folder",
  CREATE_FOLDER_CONFIRM: "Do you want to create the folder <b>{PATH}</b>?",
  CREATE_FOLDER_NEVER_MIND: "Never mind",
  CREATE_FOLDER_YES: "Yes",
  CREATE_FOLDER_SUCCESS: "Created folder: {PATH}",
  CREATE_FOLDER_FAILED: "Could not create folder: {PATH}",
  CREATE_FOLDER_PATH_IS_FILE:
    "The folder cannot be created because a file already exists at: {PATH}",
  OPEN_EXISTING_NEW_PANE: "Open existing drawing - IN A NEW PANE",
  OPEN_EXISTING_ACTIVE_PANE:
    "Open existing drawing - IN THE CURRENT ACTIVE PANE",
  TRANSCLUDE: "Embed a drawing",
  TRANSCLUDE_MOST_RECENT: "Embed the most recently edited drawing",
  TOGGLE_LEFTHANDED_MODE: "Toggle left-handed mode",
  TOGGLE_SPLASHSCREEN: "Show splash screen in new drawings",
  NEW_IN_NEW_PANE: "Create new drawing - IN AN ADJACENT WINDOW",
  NEW_IN_NEW_TAB: "Create new drawing - IN A NEW TAB",
  NEW_IN_ACTIVE_PANE: "Create new drawing - IN THE CURRENT ACTIVE WINDOW",
  NEW_IN_POPOUT_WINDOW: "Create new drawing - IN A POPOUT WINDOW",
  NEW_IN_NEW_PANE_EMBED:
    "Create new drawing - IN AN ADJACENT WINDOW - and embed into active document",
  NEW_IN_NEW_TAB_EMBED:
    "Create new drawing - IN A NEW TAB - and embed into active document",
  NEW_IN_ACTIVE_PANE_EMBED:
    "Create new drawing - IN THE CURRENT ACTIVE WINDOW - and embed into active document",
  NEW_IN_POPOUT_WINDOW_EMBED:
    "Create new drawing - IN A POPOUT WINDOW - and embed into active document",
  TOGGLE_LOCK: "Toggle Text Element between edit RAW and PREVIEW",
  DELETE_FILE: "Delete selected image or Markdown file from Obsidian Vault",
  DELETE_IMAGE_NOTICE: "Please select an image or embedded markdown document",
  FRAME_WITH_NAME: "Copy frame link by name",
  COPY_DRAWING_LINK: "Copy ![[embed link]] for this drawing",
  INSERT_LINK_TO_ELEMENT: `Copy [[link]] for selected element to clipboard. ${labelCTRL()}+CLICK to copy 'group=' link. ${labelSHIFT()}+CLICK to copy an 'area=' link.`,
  INSERT_LINK_TO_ELEMENT_GROUP:
    "Copy 'group=' ![[link]] for selected element to clipboard.",
  INSERT_LINK_TO_ELEMENT_AREA:
    "Copy 'area=' ![[link]] for selected element to clipboard.",
  INSERT_LINK_TO_ELEMENT_FRAME:
    "Copy 'frame=' ![[link]] for selected element to clipboard.",
  INSERT_LINK_TO_ELEMENT_FRAME_CLIPPED:
    "Copy 'clippedframe=' ![[link]] for selected element to clipboard.",
  INSERT_LINK_TO_ELEMENT_NORMAL:
    "Copy [[link]] for selected element to clipboard.",
  INSERT_LINK_TO_ELEMENT_ERROR: "Select a single element in the scene",
  INSERT_LINK_TO_ELEMENT_READY: "Link is READY and available on the clipboard",
  INSERT_LINK: "Insert link to file",
  INSERT_COMMAND: "Insert Obsidian Command as a link",
  INSERT_IMAGE: "Insert image or Excalidraw drawing from your vault",
  IMPORT_SVG:
    "Import an SVG file as Excalidraw strokes (limited SVG support, TEXT currently not supported)",
  INSERT_MD: "Insert markdown file from vault",
  FILE_AND_FOLDER_SELECTOR_FOLDER: "Folder",
  FILE_AND_FOLDER_SELECTOR_FILENAME: "File name",
  FILE_AND_FOLDER_SELECTOR_EXPORT_TITLE: "Export to Vault",
  FILE_AND_FOLDER_SELECTOR_EXPORT: "Export",
  UNIVERSAL_ADD_FILE: "Insert ANY file",
  // Compatibility keys consumed by upstream Excalidraw via ExcalidrawPlugin.getLabel().
  // Keep this group in sync across maintained locales.
  ABOUT_LIBRARIES: "How to load libraries",
  INSERT_CARD: "Add back-of-note card",
  COMP_IMG: "Image & Files",
  COMP_IMG_FROM_SYSTEM: "Import from system",
  COMP_IMG_ANY_FILE: "ANY file from Vault",
  COMP_IMG_LaTeX: "LaTeX formula",
  COMP_FRAME: "Frame Actions",
  COMP_FRAME_HINT:
    "Toggle Marker Frame. Guide-only frames to define slides/print areas/image references. " +
    "Hidden in image exports; doesn't contain elements. Hide/show frames via canvas context menu.",
  CONVERT_CARD_TO_FILE: "Move back-of-note card to File",
  READ_RELEASE_NOTES: "Read latest release notes",
  ABOUT_EXCALIDRAW: "About Excalidraw",
  UI_MODE: "Toggle UI-mode",
  SEARCH: "Search for text in drawing",
  CROP_PAGE: "Crop and mask selected page",
  RESET_IMG_TO_100: "Set selected image element size to 100% of original",
  TEMPORARY_DISABLE_AUTOSAVE:
    "Disable autosave until next time Obsidian starts (only set this if you know what you are doing)",
  TEMPORARY_ENABLE_AUTOSAVE: "Enable autosave",
  TEMPORARY_TOGGLE_VIEW_MODE_FOR_ALL_DRAWINGS:
    "Toggle view mode for all Excalidraw drawings until Obsidian restarts",
  FONTS_LOADED: "Excalidraw: CJK Fonts loaded",
  FONTS_LOAD_ERROR:
    "Excalidraw: Could not find CJK Fonts in the assets folder\n",
  //Prompt.ts
  SELECT_LINK_TO_OPEN: "Select a link to open",

  //ExcalidrawView.ts
  ERROR_CANT_READ_FILEPATH:
    "Error, can't read file path. Importing file instead",
  NO_SEARCH_RESULT: "Didn't find a matching element in the drawing",
  FORCE_SAVE_ABORTED: "Force Save aborted because saving is in progress",
  DRAWING_RELOAD_FAILED:
    "Excalidraw rejected invalid incoming Drawing data. The drawing currently open on the canvas was preserved. Save or export it before closing this view, and review the synchronized file or its version history.",
  LINKLIST_SECOND_ORDER_LINK: "Second Order Link",
  MARKDOWN_EMBED_CUSTOMIZE_LINK_PROMPT_TITLE:
    "Customize the Embedded File link",
  MARKDOWN_EMBED_CUSTOMIZE_LINK_PROMPT:
    "Do not add [[square brackets]] around the filename!<br>" +
    "For markdown-page images follow this format when editing your link: <mark>filename#^blockref|WIDTHxMAXHEIGHT</mark><br>" +
    "You can anchor Excalidraw images to 100% of their size by adding <code>|100%</code> to the end of the link.<br>" +
    "You can change the PDF page by changing <code>#page=1</code> to <code>#page=2</code> etc.<br>" +
    "PDF rect crop values are: <code>left, bottom, right, top</code>. Eg.: <code>#rect=0,0,500,500</code><br>",
  FRAME_CLIPPING_ENABLED: "Frame Rendering: Enabled",
  FRAME_CLIPPING_DISABLED: "Frame Rendering: Disabled",
  ARROW_BINDING_INVERSE_MODE:
    "Inverted Mode: Default arrow binding is now disabled. Use CTRL/CMD to temporarily enable binding when needed.",
  ARROW_BINDING_NORMAL_MODE:
    "Normal Mode: Arrow binding is now enabled. Use CTRL/CMD to temporarily disable binding when needed.",
  WARNING_SERIOUS_ERROR:
    "WARNING: Excalidraw ran into an unknown problem!\n\n" +
    "There is a risk that your most recent changes cannot be saved.\n\n" +
    "To be on the safe side...\n" +
    "1) Please select your drawing using CTRL/CMD+A and make a copy with CTRL/CMD+C.\n" +
    "2) Then create an empty drawing in a new pane by CTRL/CMD+clicking the Excalidraw ribbon button,\n" +
    "3) and paste your work to the new document with CTRL/CMD+V.",
  ARIA_LABEL_TRAY_MODE:
    "You can choose from 3 different desktop and tablet UI modes: Full, Compact, and Tray. On Phones only the Phone mode is available.",
  TRAY_TRAY_MODE: "Toggle UI-mode",
  TRAY_EXPORT: "Export Image...",
  TRAY_EXPORT_ARIA: "Export image as PNG, SVG, or Excalidraw file",
  TRAY_SAVE: "Save",
  TRAY_SWITCH_TO_MD: "Open as Markdown",
  TRAY_SWITCH_TO_MD_ARIA: "Switch to markdown view",
  MASK_FILE_NOTICE:
    "This is a mask file. It is used to crop images and mask out parts of the image. Press and hold notice to open the help video.",
  OPEN_AS_MD: "Open as Markdown",
  EXPORT_IMAGE: `Export Image`,
  SHOW_TAB_TITLEBAR_BUTTONS: "Show tab titlebar buttons",
  OPEN_LINK: "Open selected text as link\n(SHIFT+CLICK to open in a new pane)",
  LINK_BUTTON_CLICK_NO_TEXT:
    "Select an element that contains an internal or external link.\n",
  LINEAR_ELEMENT_LINK_CLICK_ERROR:
    `Arrow- and Line-Element links cannot be navigated by ${labelCTRL()} + CLICKing on the element because that also activates the line editor.\n` +
    `Use the right-click context menu to open the link, or click the link indicator in the top right corner of the element.\n`,
  FILENAME_INVALID_CHARS:
    'File name cannot contain any of the following characters: * " \\ < > : | ? #',
  FORCE_SAVE: "Save (will also update transclusions)",
  RAW: "Change to PREVIEW mode (only affects text-elements with links or transclusions)",
  PARSED:
    "Change to RAW mode (only affects text-elements with links or transclusions)",
  NOFILE: "Excalidraw (no file)",
  COMPATIBILITY_MODE:
    "*.excalidraw file opened in compatibility mode. Convert to new format for full plugin functionality.",
  CONVERT_FILE: "Convert to new format",
  DRAWING_LOAD_ERROR_TITLE: "Cannot load drawing: {filename}",
  DRAWING_LOAD_ERROR_MESSAGE: "This file could not be loaded as an Excalidraw drawing.",
  DRAWING_LOAD_ERROR_NO_BACKUP: "No local backup is available on this device.",
  DRAWING_LOAD_ERROR_CACHE_WAIT: "The local backup cache is still loading. Select OK to check again, or Cancel to continue.",
  DRAWING_LOAD_ERROR_BACKUP_AVAILABLE: "A local backup is available. Would you like to load it?",
  DRAWING_LOAD_ERROR_MORE_INFO: "More information",
  DRAWING_LOAD_ERROR_DISMISS: "Dismiss",
  DRAWING_LOAD_ERROR_REPORTED_ERROR: "Reported error",
  DRAWING_LOAD_ERROR_DETAILS: "A note with the excalidraw-plugin frontmatter property is treated as an Excalidraw drawing. If its drawing-data section is missing or malformed, the drawing cannot be loaded. An ordinary Markdown note may have this property by mistake.\n\nA sync conflict or interrupted reconciliation between devices is one possible cause of malformed drawing JSON. The error alone does not establish the cause.\n\nA local backup may contain a readable earlier version of the drawing. Backups are stored separately on each device, so the device where you last edited may have a newer copy. Loading a backup replaces the drawing file. This information view does not change the file.",
  BACKUP_SAVE_AS_FILE:
    "This drawing is empty. A non-empty backup is available. Would you like to restore it as a new file and open it in a new tab?",
  BACKUP_SAVE: "Restore",
  BACKUP_DELETE: "Delete Backup",
  BACKUP_CANCEL: "Cancel",
  OBSIDIAN_TOOLS_PANEL: "Obsidian Tools Panel",
  ERROR_SAVING_IMAGE:
    "Unknown error occurred while fetching the image. It could be that for some reason the image is not available or rejected the fetch request from Obsidian",
  WARNING_PASTING_ELEMENT_AS_TEXT:
    "PASTING EXCALIDRAW ELEMENTS AS A TEXT ELEMENT IS NOT ALLOWED",
  USE_INSERT_FILE_MODAL: "Use 'Insert Any File' to embed a markdown note",
  RECURSIVE_INSERT_ERROR:
    "You may not recursively insert part of an image into the same image as it would create an infinite loop",
  CONVERT_TO_MARKDOWN: "Convert to file...",
  WELCOME_RANK_NEXT: "more drawings until the next rank!",
  WELCOME_RANK_LEGENDARY: "You're at the top. Keep on being legendary!",
  WELCOME_COMMAND_PALETTE: 'Type "Excalidraw" in the Command Palette',
  WELCOME_OBSIDIAN_MENU: "Explore the Obsidian Menu in the top right",
  WELCOME_SCRIPT_LIBRARY: "Visit the Script Library",
  WELCOME_HELP_MENU: "Find help in the hamburger-menu",
  WELCOME_YOUTUBE_ARIA: "Visual PKM YouTube Channel",
  WELCOME_YOUTUBE_LINK: "Check out the Visual PKM YouTube channel.",
  WELCOME_SYM_ARIA: "Learn Excalidraw, Master PKM, Join the Community",
  WELCOME_SYM_LINK: "Learn Excalidraw, Master PKM, Join the Community",
  WELCOME_TWITTER_ARIA: "Follow me on Twitter",
  WELCOME_TWITTER_LINK: "Follow me on Twitter",
  WELCOME_DONATE_ARIA: "Donate to support Excalidraw-Obsidian",
  WELCOME_DONATE_LINK: 'Say "Thank You" & support the plugin.',
  SAVE_IS_TAKING_LONG:
    "Saving your previous file is taking a long time. Please wait...",
  SAVE_IS_TAKING_VERY_LONG:
    "For better performance, consider splitting large drawings into several smaller files.",

  //ContentSearcher.ts
  SEARCH_COPIED_TO_CLIPBOARD: "Markdown ready on clipboard",
  SEARCH_COPY_TO_CLIPBOARD_ARIA:
    "Copy the entire dialog to the clipboard as Markdown. Ideal for use with tools like ChatGPT to search and understand.",
  SEARCH_SHOWHIDE_ARIA: "Show/Hide search bar",
  SEARCH_NEXT: "Next",
  SEARCH_PREVIOUS: "Previous",
  SETTINGS_TOOLBAR_COPY: "Copy settings",
  USE_DECLARATIVE_SETTINGS_NAME: "Use searchable settings",
  USE_DECLARATIVE_SETTINGS_DESC:
    "Use Obsidian's searchable, multi-page settings interface. Turn this off to use Excalidraw's legacy single-page settings. Requires restarting Obsidian.",

  //settings.ts
  FOLDER_PLACEHOLDER: "e.g.: Excalidraw",
  TEMPLATE_PLACEHOLDER: "e.g.: Excalidraw/Template",
  FILENAME_PREFIX_PLACEHOLDER: "e.g.: Drawing ",
  DYNAMICSTYLE_OPTION_NONE: "Dynamic Styling OFF",
  DYNAMICSTYLE_OPTION_COLORFUL: "Match color",
  DYNAMICSTYLE_OPTION_GRAY: "Gray, match tone",
  DEFAULT_OPEN_MODE_OPTION_NORMAL: "Always in normal-mode",
  DEFAULT_OPEN_MODE_OPTION_ZEN: "Always in zen-mode",
  DEFAULT_OPEN_MODE_OPTION_VIEW: "Always in view-mode",
  DEFAULT_OPEN_MODE_OPTION_VIEW_MOBILE:
    "Usually normal, but view-mode on Phone",
  DEFAULT_PEN_MODE_OPTION_NEVER: "Never",
  DEFAULT_PEN_MODE_OPTION_MOBILE: "On Obsidian Mobile",
  DEFAULT_PEN_MODE_OPTION_ALWAYS: "Always",
  EMBED_PREVIEW_IMAGETYPE_OPTION_PNG: "PNG Image",
  EMBED_PREVIEW_IMAGETYPE_OPTION_SVG: "Native SVG",
  EMBED_PREVIEW_IMAGETYPE_OPTION_SVGIMG: "SVG Image",
  CJK_ASSETS_FOLDER_PLACEHOLDER: "e.g.: Excalidraw/FontAssets",
  LINKS_JOIN_SYM_ARIA:
    "Learn Excalidraw, Master Visual Thinking, Join the Community",
  LINKS_JOIN_SYM: "Learn Excalidraw",
  RELEASE_NOTES_NAME: "Display Release Notes after update",
  RELEASE_NOTES_DESC:
    "<b><u>Toggle ON:</u></b> Display release notes each time you update Excalidraw to a newer version.<br>" +
    `<b><u>Toggle OFF:</u></b> Silent mode. You can still read release notes on <a href="${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RELEASES}">GitHub</a>.`,
  WARN_ON_MANIFEST_MISMATCH_NAME: "Warn about incomplete plugin updates",
  WARN_ON_MANIFEST_MISMATCH_DESC:
    "Checks that the installed Excalidraw executable matches the version shown in Obsidian's plugin list. If they don't match (often after partial sync), you'll see a warning and can update. Disable to stop checking.",

  BASIC_HEAD: "Basic",
  BASIC_UPDATES_STARTUP_HEAD: "Updates and startup",
  BASIC_UPDATES_STARTUP_DESC:
    "Release notes, update checks and notifications, and the startup splash screen.",
  BASIC_FILES_FOLDERS_HEAD: "Files and folders",
  BASIC_FILES_FOLDERS_DESC:
    "Default folders and paths for drawings, crops, annotations, templates, and Excalidraw Automate scripts.",
  BASIC_DESC: `In the "Basic" settings, you can configure options such as displaying release notes after updates, receiving plugin update notifications, setting the default location for new drawings, specifying the Excalidraw folder for embedding drawings into active documents, defining an Excalidraw template file, and designating an Excalidraw Automate script folder for managing automation scripts.`,
  FOLDER_NAME: "Excalidraw folder (CAsE sEnsITive!)",
  FOLDER_DESC:
    "Default location for new drawings. If empty, drawings will be created in the Vault root.",
  FOLDER_EMBED_NAME:
    "Use Excalidraw folder when embedding a drawing into the active document",
  FOLDER_EMBED_DESC:
    "Define which folder to place the newly inserted drawing into " +
    "when using the command palette action: 'Create a new drawing and embed into active document'.<br>" +
    "<b><u>Toggle ON:</u></b> Use Excalidraw folder<br><b><u>Toggle OFF:</u></b> Use the attachments folder defined in Obsidian settings.",
  TEMPLATE_NAME: "Excalidraw template file or folder (caSe SenSiTive!)",
  TEMPLATE_DESC:
    "Full filepath or folderpath to the Excalidraw template.<br>" +
    "<b>Template File:</b>E.g.: If your template is in the default Excalidraw folder and its name is " +
    "Template.md, the setting would be: Excalidraw/Template.md (or just Excalidraw/Template - you may omit the .md file extension). " +
    "If you are using Excalidraw in compatibility mode, then your template must be a legacy Excalidraw file as well " +
    "such as Excalidraw/Template.excalidraw. <br><b>Template Folder:</b> You can also set a folder as your template. " +
    "In this case you will be prompted which template to use when creating a new drawing.<br>" +
    "<b>Pro Tip:</b> If you are using the Obsidian Templater plugin, you can add Templater code to your different Excalidraw " +
    "templates to automate configuration of your drawings.",
  // AI Usage Metering - AIUsageModal
  // AI Usage button - Settings
  SAVING_HEAD: "Saving",
  SAVING_STORAGE_AUTOSAVE_HEAD: "Storage and autosave",
  SAVING_STORAGE_AUTOSAVE_DESC:
    "Control drawing JSON compression and choose desktop and mobile autosave intervals.",
  SAVING_DESC:
    "In the 'Saving' section of Excalidraw Settings, you can configure how your drawings are saved. This includes options for compressing Excalidraw JSON in Markdown, setting autosave intervals for both desktop and mobile, defining filename formats, and choosing whether to use the .excalidraw.md or .md file extension. ",
  COMPRESS_NAME: "Compress Excalidraw JSON in Markdown",
  COMPRESS_DESC:
    "By enabling this feature Excalidraw will store the drawing JSON in a Base64 compressed " +
    `format using the <a href="${URLs.PIEROXY_NET_BLOG_PAGES_LZ_STRING_INDEX_HTML}">LZ-String</a> algorithm. ` +
    "This will reduce the chance of Excalidraw JSON cluttering your search results in Obsidian. " +
    "As a side effect, this will also reduce the filesize of Excalidraw drawings. " +
    "When you switch an Excalidraw drawing to Markdown view, using the options menu in Excalidraw, the file will " +
    "be saved without compression, so that you can read and edit the JSON string. The drawing will be compressed again " +
    "once you switch back to Excalidraw view. " +
    "The setting only has effect 'point forward', meaning, existing drawings will not be affected by the setting " +
    "until you open them and save them.<br><b><u>Toggle ON:</u></b> Compress drawing JSON<br><b><u>Toggle OFF:</u></b> Leave drawing JSON uncompressed",
  DECOMPRESS_FOR_MD_NAME: "Decompress Excalidraw JSON in Markdown View",
  DECOMPRESS_FOR_MD_DESC:
    "By enabling this feature Excalidraw will automatically decompress the drawing JSON when you switch to Markdown view. " +
    "This will allow you to easily read and edit the JSON string. The drawing will be compressed again " +
    "once you switch back to Excalidraw view and save the drawing (CTRL+S).<br>" +
    "I recommend switching this feature off as it will result in smaller file sizes and avoiding unnecessary results in Obsidian search. " +
    "You can always use the 'Excalidraw: Decompress current Excalidraw file' command from the command palette " +
    "to manually decompress the drawing JSON when you need to read or edit it.",
  AUTOSAVE_INTERVAL_DESKTOP_NAME: "Interval for autosave on Desktop",
  AUTOSAVE_INTERVAL_DESKTOP_DESC:
    "The time interval between saves. Autosave will skip if there are no changes in the drawing. " +
    "Excalidraw will also save the file when closing a workspace tab or navigating within Obsidian, but away from the active Excalidraw tab (i.e. clicking on the Obsidian ribbon or checking backlinks, etc.). " +
    "Excalidraw will not be able to save your work when terminating Obsidian directly either by killing the Obsidian process, or clicking to close Obsidian altogether.",
  AUTOSAVE_INTERVAL_MOBILE_NAME: "Interval for autosave on Mobile",
  AUTOSAVE_INTERVAL_MOBILE_DESC:
    "I recommend a more frequent interval for Mobiles. " +
    "Excalidraw will also save the file when closing a workspace tab or navigating within Obsidian, but away from the active Excalidraw tab (i.e. tapping on the Obsidian ribbon or checking backlinks, etc.). " +
    "Excalidraw will not be able to save your work when terminating Obsidian directly (i.e. swiping it away). Also note, that when you switch apps on a Mobile device, sometimes Android and iOS closes " +
    "Obsidian in the background to save system resources. In such a case Excalidraw will not be able to save the latest changes.",
  FILENAME_HEAD: "Filename",
  FILENAME_GROUP_DESC:
    "Configure how new, embedded, cropped, and annotated drawing filenames are generated.",
  FILENAME_DESC:
    `<p>Click this link for the <a href="${URLs.MOMENTJS_COM_DOCS}">` +
    "date and time format reference</a>.</p>",
  FILENAME_SAMPLE: "Filename for a new drawing is: ",
  FILENAME_EMBED_SAMPLE: "Filename for a new embedded drawing is: ",
  FILENAME_PREFIX_NAME: "Filename prefix",
  FILENAME_PREFIX_DESC: "The first part of the filename",
  FILENAME_PREFIX_EMBED_NAME:
    "Filename prefix when embedding a new drawing into a markdown note",
  FILENAME_PREFIX_EMBED_DESC:
    "Should the filename of the newly inserted drawing start with the name of the active markdown note " +
    "when using the command palette action: <code>Create a new drawing and embed into active document</code>?<br>" +
    "<b><u>Toggle ON:</u></b> Yes, the filename of a new drawing should start with filename of the active document<br><b><u>Toggle OFF:</u></b> No, filename of a new drawing should not include the filename of the active document",
  FILENAME_POSTFIX_NAME:
    "Custom text after markdown Note's name when embedding",
  FILENAME_POSTFIX_DESC:
    "Affects filename only when embedding into a markdown document. This text will be inserted after the note's name, but before the date.",
  FILENAME_DATE_NAME: "Filename Date",
  FILENAME_DATE_DESC:
    "The last part of the filename. Leave empty if you do not want a date.",
  FILENAME_EXCALIDRAW_EXTENSION_NAME: ".excalidraw.md or .md",
  FILENAME_EXCALIDRAW_EXTENSION_DESC:
    "This setting does not apply if you use Excalidraw in compatibility mode, " +
    "i.e. you are not using Excalidraw markdown files.<br><b><u>Toggle ON:</u></b> filename ends with .excalidraw.md<br><b><u>Toggle OFF:</u></b> filename ends with .md",
  DISPLAY_HEAD: "Excalidraw appearance and behavior",
  DISPLAY_DESC:
    "In the 'appearance and behavior' section of Excalidraw Settings, you can fine-tune how Excalidraw appears and behaves. This includes options for dynamic styling, left-handed mode, matching Excalidraw and Obsidian themes, default modes, and more.",
  DISPLAY_EDITOR_PREVIEWS_HEAD: "Editing and previews",
  DISPLAY_EDITOR_PREVIEWS_DESC:
    "Configure canvas editing gestures and how Excalidraw files appear in reading mode and hover previews.",
  OVERRIDE_OBSIDIAN_FONT_SIZE_NAME: "Limit Obsidian Font Size to Editor Text",
  OVERRIDE_OBSIDIAN_FONT_SIZE_DESC:
    "Obsidian's custom font size setting affects the entire interface, including Excalidraw and themes that depend on the default font size. " +
    "Enabling this option restricts font size changes to editor text, which will improve the look of Excalidraw. " +
    "If parts of the UI look incorrect after enabling, try turning this setting off.",
  DYNAMICSTYLE_NAME: "Dynamic styling",
  DYNAMICSTYLE_DESC: "Change Excalidraw UI colors to match the canvas color",
  LEFTHANDED_MODE_NAME: "Left-handed mode",
  LEFTHANDED_MODE_DESC:
    "Currently only has effect in tray-mode. If turned on, the tray will be on the right side." +
    "<br><b><u>Toggle ON:</u></b> Left-handed mode.<br><b><u>Toggle OFF:</u></b> Right-handed mode.",
  IFRAME_MATCH_THEME_NAME: "Markdown embeds to match Excalidraw theme",
  IFRAME_MATCH_THEME_DESC:
    "<b><u>Toggle ON:</u></b> Set this to true if for example you are using Obsidian in dark-mode but use excalidraw with a light background. " +
    "With this setting the embedded Obsidian markdown document will match the Excalidraw theme (i.e. light colors if Excalidraw is in light mode).<br>" +
    "<b><u>Toggle OFF:</u></b> Set this to false if you want the embedded Obsidian markdown document to match the Obsidian theme (i.e. dark colors if Obsidian is in dark mode).",
  MATCH_THEME_NAME: "New drawing to match Obsidian theme",
  MATCH_THEME_DESC:
    "If theme is dark, new drawing will be created in dark mode. This does not apply when you use a template for new drawings. " +
    "Also this will not affect when you open an existing drawing. Those will follow the theme of the template/drawing respectively." +
    "<br><b><u>Toggle ON:</u></b> Follow Obsidian Theme<br><b><u>Toggle OFF:</u></b> Follow theme defined in your template",
  MATCH_THEME_ALWAYS_NAME: "Existing drawings to match Obsidian theme",
  MATCH_THEME_ALWAYS_DESC:
    "If theme is dark, drawings will be opened in dark mode. If your theme is light, they will be opened in light mode. " +
    "<br><b><u>Toggle ON:</u></b> Match Obsidian theme<br><b><u>Toggle OFF:</u></b> Open with the same theme as last saved",
  MATCH_THEME_TRIGGER_NAME: "Excalidraw to follow when Obsidian Theme changes",
  MATCH_THEME_TRIGGER_DESC:
    "If this option is enabled open Excalidraw pane will switch to light/dark mode when Obsidian theme changes. " +
    "<br><b><u>Toggle ON:</u></b> Follow theme changes<br><b><u>Toggle OFF:</u></b> Drawings are not affected by Obsidian theme changes",
  DEFAULT_OPEN_MODE_NAME: "Default mode when opening Excalidraw",
  DEFAULT_OPEN_MODE_DESC:
    "Specifies the mode how Excalidraw opens: Normal, Zen, or View mode. You may also set this behavior on a file level by " +
    "adding the excalidraw-default-mode frontmatter key with a value of: normal, view, or zen to your document.",
  PHONE_FOOTER_SAFE_AREA_PADDING_NAME:
    "Extra bottom padding for phone controls",
  PHONE_FOOTER_SAFE_AREA_PADDING_DESC:
    "Adds extra bottom padding to the Excalidraw footer controls so zoom and undo buttons stay above the system navigation bar on phones. This setting only applies on phones.",
  TABLET_FOOTER_SAFE_AREA_PADDING_NAME:
    "Extra bottom padding for tablet controls",
  TABLET_FOOTER_SAFE_AREA_PADDING_DESC:
    "Adds extra bottom padding to the Excalidraw footer controls so zoom and undo buttons stay above the system navigation bar on tablets. This setting only applies on tablets.",
  DEFAULT_PEN_MODE_NAME: "Pen mode",
  DEFAULT_PEN_MODE_DESC:
    "Should pen mode be automatically enabled when opening Excalidraw?",
  ENABLE_DOUBLE_CLICK_TEXT_EDITING_NAME: "Enable double-click text create",
  DISABLE_DOUBLE_TAP_ERASER_NAME: "Enable double-tap eraser in pen mode",
  DISABLE_SINGLE_FINGER_PANNING_NAME:
    "Enable single-finger panning in pen mode",
  SHOW_PEN_MODE_FREEDRAW_CROSSHAIR_NAME: "Show (+) crosshair in pen mode",
  SHOW_PEN_MODE_FREEDRAW_CROSSHAIR_DESC:
    "Show crosshair in pen mode when using the freedraw tool. <b><u>Toggle ON:</u></b> SHOW <b><u>Toggle OFF:</u></b> HIDE<br>" +
    "The effect depends on the device. Crosshair is typically visible on drawing tablets, MS Surface, but not on iOS.",
  ERASER_SIZE_NAME: "Eraser size",
  ERASER_SIZE_DESC:
    "The eraser's radius in screen pixels, from <b>5</b> to <b>60</b>. The Excalidraw eraser itself has a fixed reach, so a larger radius lets the plugin erase anything the eraser path passes this close to - strokes erase when their line is reached, not when the pointer is inside an enclosed area. At <b>5</b> the eraser behaves exactly as the component defines it. The same value can be set from the eraser panel in the toolbar, which shows the diameter (10-120px).",
  SHOW_DRAWING_OR_MD_IN_HOVER_PREVIEW_NAME:
    "Render Excalidraw file as an image in hover preview...",
  SHOW_DRAWING_OR_MD_IN_HOVER_PREVIEW_DESC:
    "...even if the file has the <b>excalidraw-open-md: true</b> frontmatter key.<br>" +
    "When this setting is off and the file is set to open in md by default, the hover preview will show the " +
    "markdown side of the document.<br>" +
    "Note: <b>excalidraw-open-md</b> is different from <b>excalidraw-embed-md</b>. If <b>excalidraw-embed-md</b> is set to true, the hover preview will always show the markdown side, regardless of this setting. To force image rendering when embedding, use <code>![[drawing#^as-image]]</code> in your markdown file.",
  SHOW_DRAWING_OR_MD_IN_READING_MODE_NAME:
    "Render as image when in markdown reading mode of an Excalidraw file",
  SHOW_DRAWING_OR_MD_IN_READING_MODE_DESC:
    `When you are in markdown reading mode (aka. reading the back side of the drawing) should the Excalidraw drawing be rendered as an image? ` +
    `This setting will not affect the display of the drawing when you are in Excalidraw mode or when you embed the drawing into a markdown document or when rendering hover preview.<br><ul>` +
    `<li>See other related setting for <a href='#${
      TAG_PDFEXPORT
    }'>PDF Export</a> under 'Embedding and Exporting' further below.</li></ul><br>` +
    `You must close the active excalidraw/markdown file and reopen it for this change to take effect.`,
  SHOW_DRAWING_OR_MD_IN_EXPORTPDF_NAME:
    "Render Excalidraw as Image in Obsidian PDF Export",
  SHOW_DRAWING_OR_MD_IN_EXPORTPDF_DESC:
    `This setting controls how Excalidraw files are exported to PDF using Obsidian's built-in <b>Export to PDF</b> feature.<br>` +
    `<ul><li><b>Enabled:</b> The PDF will include the Excalidraw drawing as an image.</li>` +
    `<li><b>Disabled:</b> The PDF will include the markdown content as text.</li></ul>` +
    `Note: This setting does not affect the PDF export feature within Excalidraw itself.<br>` +
    `See the other related setting for <a href='#${
      TAG_MDREADINGMODE
    }'>Markdown Reading Mode</a> under 'Appearance and Behavior' further above.<br>` +
    `⚠️ You must close and reopen the Excalidraw/markdown file for changes to take effect. ⚠️`,
  MODES_HEAD: "UI Modes",
  MODES_DESC:
    "Choose device-specific Excalidraw interface layouts, title-bar controls, and left- or right-handed tray placement.",
  DESKTOP_UI_MODE_NAME: "Preferred Desktop Mode",
  DESKTOP_UI_MODE_DESC: "Select the default UI mode for desktop devices.",
  TABLET_UI_MODE_NAME: "Preferred Tablet Mode",
  TABLET_UI_MODE_DESC: "Select the default UI mode for tablet devices.",
  PHONE_UI_MODE_NAME: "Preferred Phone Mode",
  PHONE_UI_MODE_DESC: "Select the default UI mode for phone devices.",
  MODE_FULL: "Desktop-mode",
  MODE_COMPACT: "Compact-mode",
  MODE_TRAY: "Tray-mode",
  MODE_PHONE: "Phone-mode",
  REAPPLY_UI_MODE_BUTTON: "Reapply UI mode now",
  HOTKEY_OVERRIDE_HEAD: "Hotkey overrides",
  HOTKEY_OVERRIDE_GROUP_DESC:
    "Manage Excalidraw key combinations that should take priority over conflicting Obsidian hotkeys.",
  HOTKEY_OVERRIDE_CONTROL_NAME: "Manage hotkey overrides",
  HOTKEY_OVERRIDE_DESC:
    `Some of the Excalidraw hotkeys such as <code>${labelCTRL()}+Enter</code> to edit text or <code>${labelCTRL()}+K</code> to create an element link ` +
    "conflict with Obsidian hotkey settings. The hotkey combinations you add below will override Obsidian's hotkey settings while using Excalidraw, thus " +
    `you can add <code>${labelCTRL()}+G</code> if you want to default to Group Object in Excalidraw instead of opening Graph View.`,
  THEME_HEAD: "Theme and styling",
  THEME_DESC:
    "Control interface styling, drawing and embed themes, opening mode, and mobile safe-area spacing.",
  ZOOM_AND_PAN_HEAD: "Zoom and Pan",
  ZOOM_AND_PAN_DESC:
    "Configure mouse, touch, opening, resizing, and zoom-range behavior.",
  DEFAULT_PINCHZOOM_NAME: "Allow pinch zoom in pen mode",
  DEFAULT_PINCHZOOM_DESC:
    "Pinch zoom in pen mode when using the freedraw tool is disabled by default to prevent unwanted accidental zooming with your palm.<br>" +
    "<b><u>Toggle ON:</u></b> Enable pinch zoom in pen mode<br><b><u>Toggle OFF:</u></b>Disable pinch zoom in pen mode",

  DEFAULT_WHEELZOOM_NAME: "Invert the drawing's wheel zoom preference",
  DEFAULT_WHEELZOOM_DESC:
    "Applies to all drawings and inverts the drawing's <b>Input device</b> preference (whether the mouse wheel zooms or scrolls). The drawing preference applies only to the current drawing and can be saved in a template.",

  ZOOM_TO_FIT_NAME: "Zoom to fit on view resize",
  ZOOM_TO_FIT_DESC:
    "Zoom to fit drawing when the pane is resized" +
    "<br><b><u>Toggle ON:</u></b> Zoom to fit<br><b><u>Toggle OFF:</u></b> Auto zoom disabled",
  ZOOM_TO_FIT_ONOPEN_NAME: "Zoom to fit on file open",
  ZOOM_TO_FIT_ONOPEN_DESC:
    "Zoom to fit drawing when the drawing is first opened" +
    "<br><b><u>Toggle ON:</u></b> Zoom to fit<br><b><u>Toggle OFF:</u></b> Auto zoom disabled",
  ZOOM_TO_FIT_MAX_LEVEL_NAME: "Zoom to fit max ZOOM level",
  ZOOM_TO_FIT_MAX_LEVEL_DESC:
    "Set the maximum level to which zoom to fit will enlarge the drawing. Minimum is 0.5 (50%) and maximum is 10 (1000%).",
  ZOOM_STEP_NAME: "Zoom increment",
  ZOOM_STEP_DESC:
    "Zoom increment (in percentage points) for actions like mouse wheel zoom. Smaller values give finer control but may require excessive scrolling. Default: 5%.",
  ZOOM_MIN_NAME: "Minimum zoom",
  ZOOM_MIN_DESC:
    "How far you can zoom out (fit more of the drawing on screen). Default: 10%. Values below 10% were historically unstable—lower with caution and reset to 10% if issues occur.",
  ZOOM_MAX_NAME: "Maximum zoom",
  ZOOM_MAX_DESC:
    "Upper zoom limit. Default: 3000%. Usually no need to change; included for completeness.",
  PEN_HEAD: "Pen",
  PEN_DESC:
    "Configure automatic pen mode, touch gestures, the eraser, and the freedraw crosshair.",
  GRID_HEAD: "Grid",
  GRID_DESC:
    "Configure grid direction, automatic or custom color, and opacity.",
  GRID_DYNAMIC_COLOR_NAME: "Dynamic grid color",
  GRID_DYNAMIC_COLOR_DESC:
    "<b><u>Toggle ON:</u></b>Change grid color to match the canvas color<br><b><u>Toggle OFF:</u></b>Use the color below as the grid color",
  GRID_COLOR_NAME: "Grid color",
  GRID_OPACITY_NAME: "Grid opacity",
  GRID_OPACITY_DESC:
    "Sets the opacity of the grid. 0 is transparent, 100 is opaque.",
  GRID_DIRECTION_NAME: "Grid direction",
  GRID_DIRECTION_DESC:
    "The first toggle shows/hides the horizontal grid, the second toggle shows/hides the vertical grid.",
  GRID_HORIZONTAL: "Render horizontal grid",
  GRID_VERTICAL: "Render vertical grid",
  LASER_HEAD: "Laser pointer",
  LASER_DESC:
    "Configure the laser pointer color and how quickly and how far its trail fades.",
  LASER_COLOR: "Laser pointer color",
  LASER_DECAY_TIME_NAME: "Laser pointer decay time",
  LASER_DECAY_TIME_DESC:
    "Laser pointer decay time in milliseconds. Default is 1000 (i.e. 1 second).",
  LASER_DECAY_LENGTH_NAME: "Laser pointer decay length.",
  LASER_DECAY_LENGTH_DESC:
    "Laser pointer decay length in line points. Default is 50.",
  LINKS_HEAD: "Links, transclusion and TODOs",
  LINKS_HEAD_DESC:
    "In the 'Links, transclusion and TODOs' section of Excalidraw Settings, you can configure how Excalidraw handles links, transclusions, and TODO items. This includes options for opening links, managing panes, displaying links with brackets, customizing link prefixes, handling TODO items, and more. ",
  LINKS_DESC:
    `${labelCTRL()}+CLICK on <code>[[Text Elements]]</code> to open them as links. ` +
    "If the selected text has more than one <code>[[valid Obsidian links]]</code>, only the first will be opened. " +
    "If the text starts as a valid web link (i.e. <code>http" +
    "s://</code> or <code>http://</code>), then " +
    "the plugin will open it in a browser. " +
    "When Obsidian files change, the matching <code>[[link]]</code> in your drawings will also change. " +
    "If you don't want text accidentally changing in your drawings use <code>[[links|with aliases]]</code>.",
  DRAG_MODIFIER_NAME: "Link Click and Drag&Drop Modifier Keys",
  DRAG_MODIFIER_GROUP_DESC:
    "Configure link-opening gestures and platform-specific modifier combinations for clicks and drag-and-drop actions.",
  LINK_OPENING_GESTURES_HEAD: "Link-opening gestures",
  LINK_OPENING_GESTURES_DESC:
    "Configure long-press delays and double-click link opening for embedded drawings and view mode.",
  WEB_BROWSER_DRAG_ACTION_DESC:
    "Choose modifier combinations for links, images, imports, and embeddables dragged from a web browser.",
  LOCAL_FILE_DRAG_ACTION_DESC:
    "Choose modifier combinations for links, images, imports, and embeddables dragged from the operating system.",
  INTERNAL_DRAG_ACTION_DESC:
    "Choose modifier combinations for links, images, full-size images, and embeddables dragged inside Obsidian.",
  PANE_TARGET_DESC:
    "Choose modifier combinations that determine where clicked links open.",
  MODIFIER_KEY_USAGE_NAME: "Configuring modifier keys",
  MODIFIER_KEY_COMBINATIONS: "Modifier combinations",
  DRAG_MODIFIER_DESC:
    `Modifier key behavior when clicking links and dragging and dropping elements. ` +
    `Excalidraw will not validate your configuration... pay attention to avoid conflicting settings. ` +
    `These settings are different for Apple and non-Apple. If you use Obsidian on multiple platforms, you'll need to make the settings separately. ` +
    `The toggles follow the order of ${
      DEVICE.isIOS || DEVICE.isMacOS
        ? "SHIFT, CMD, OPT, CONTROL."
        : "SHIFT, CTRL, ALT, META (Windows key)."
    }`,
  LONG_PRESS_DESKTOP_NAME: "Long press to open desktop",
  LONG_PRESS_DESKTOP_DESC:
    "Long press delay in milliseconds to open an Excalidraw Drawing embedded in a Markdown file. ",
  LONG_PRESS_MOBILE_NAME: "Long press to open mobile",
  LONG_PRESS_MOBILE_DESC:
    "Long press delay in milliseconds to open an Excalidraw Drawing embedded in a Markdown file. ",
  DOUBLE_CLICK_LINK_OPEN_VIEW_MODE:
    "Allow double-click to open links in view mode",
  ELEMENT_LINK_SYNC_NAME: "Sync text-element link with text",
  ELEMENT_LINK_SYNC_DESC:
    "When enabled, Excalidraw matches pre-2.19.0 behavior: the first link in the text body is always copied to the element link field. SVG/PNG exports only keep links when the element link field holds a single link (not links inside the text body). Turn this ON if you rely on text-body links and want the element link to always mirror the first one. Turn it OFF if you manage the element link separately: for metadata like tags, inline link ontologies, or multiple links, e.g., dataview-style notes like '(reminds me of:: [[link]]) #noteToSelf'.",
  FOCUS_ON_EXISTING_TAB_NAME: "Focus on Existing Tab",
  FOCUS_ON_EXISTING_TAB_DESC:
    "When opening a link, Excalidraw will focus on the existing tab if the file is already open. " +
    "Enabling this setting overrides 'Reuse Adjacent Pane' when the file is already open except for the 'Open the back-of-the-note of the selected excalidraw image' command palette action.",
  SECOND_ORDER_LINKS_NAME: "Show second-order links",
  SECOND_ORDER_LINKS_DESC:
    "Show links when clicking on a link in Excalidraw. Second-order link are backlinks pointing to the link being clicked. " +
    "When using image icons to connect similar notes, second order links allow you to get to related notes in one click instead of two. " +
    `See <a href="${URLs.YOUTUBE_COM_SHORTS_O_1LS9C6WBY}">YT Short</a> to understand.`,
  ADJACENT_PANE_NAME: "Reuse adjacent pane",
  ADJACENT_PANE_DESC:
    `When ${labelCTRL()}+${labelALT()} clicking a link in Excalidraw, by default the plugin will open the link in a new pane. ` +
    "Turning this setting on, Excalidraw will first look for an existing pane, and try to open the link there. " +
    "Excalidraw will look for the other workspace pane based on your focus/navigation history, i.e. the workpane that was active before you " +
    "activated Excalidraw.",
  MAINWORKSPACE_PANE_NAME: "Open in main workspace",
  MAINWORKSPACE_PANE_DESC:
    `When ${labelCTRL()}+${labelALT()} clicking a link in Excalidraw, by default the plugin will open the link in a new pane in the current active window. ` +
    "Turning this setting on, Excalidraw will open the link in an existing or new pane in the main workspace. ",
  LINK_BRACKETS_NAME: "Show <code>[[brackets]]</code> around links",
  LINK_BRACKETS_DESC: `${
    "In PREVIEW mode, when parsing Text Elements, place brackets around links. " +
    "You can override this setting for a specific drawing by adding <code>"
  }${FRONTMATTER_KEYS["link-brackets"].name}: true/false</code> to the file's frontmatter.`,
  LINK_PREFIX_NAME: "Link prefix",
  LINK_PREFIX_DESC: `${
    "In PREVIEW mode, if the Text Element contains a link, precede the text with these characters. " +
    "You can override this setting for a specific drawing by adding <code>"
  }${FRONTMATTER_KEYS["link-prefix"].name}: "📍 "</code> to the file's frontmatter.`,
  URL_PREFIX_NAME: "URL prefix",
  URL_PREFIX_DESC: `${
    "In PREVIEW mode, if the Text Element contains a URL link, precede the text with these characters. " +
    "You can override this setting for a specific drawing by adding <code>"
  }${FRONTMATTER_KEYS["url-prefix"].name}: "🌐 "</code> to the file's frontmatter.`,
  PARSE_TODO_NAME: "Parse todo",
  PARSE_TODO_DESC:
    "Convert '- [ ] ' and '- [x] ' to checkbox and tick in the box.",
  TODO_NAME: "Open TODO icon",
  TODO_DESC: "Icon to use for open TODO items",
  DONE_NAME: "Completed TODO icon",
  DONE_DESC: "Icon to use for completed TODO items",
  HOVERPREVIEW_NAME: `Hover preview without pressing the ${labelCTRL()} key`,
  HOVERPREVIEW_DESC:
    `<b><u>Toggle ON:</u></b> In Exalidraw <u>view mode</u> the hover preview for [[wiki links]] will be shown immediately, without the need to hold the ${labelCTRL()} key. ` +
    "In Excalidraw <u>normal mode</u>, the preview will be shown immediately only when hovering the blue link icon in the top right of the element.<br> " +
    `<b><u>Toggle OFF:</u></b> Hover preview is shown only when you hold the ${labelCTRL()} key while hovering the link.`,
  LINKOPACITY_NAME: "Opacity of link icon",
  LINKOPACITY_DESC:
    "Opacity of the link indicator icon in the top right corner of an element. 1 is opaque, 0 is transparent.",
  LINK_CTRL_CLICK_NAME: `${labelCTRL()}+CLICK on text with [[links]] or [](links) to open them`,
  LINK_CTRL_CLICK_DESC:
    "You can turn this feature off if it interferes with default Excalidraw features you want to use. If " +
    `this is turned off, you can either use ${labelCTRL()} + ${labelMETA()} or the link indicator in the top right of the element to open links.`,
  TRANSCLUSION_WRAP_NAME: "Overflow wrap behavior of transcluded text",
  TRANSCLUSION_WRAP_DESC:
    "Number specifies the character count where the text should be wrapped. " +
    "Set the text wrapping behavior of transcluded text. Turn this ON to force-wrap " +
    "text (i.e. no overflow), or OFF to soft-wrap text (at the nearest whitespace).",
  TRANSCLUSION_DEFAULT_WRAP_NAME: "Transclusion word wrap default",
  TRANSCLUSION_DEFAULT_WRAP_DESC:
    "You can manually set/override word wrapping length using the `![[page#^block]]{NUMBER}` format. " +
    "Normally you will not want to set a default, because if you transclude text inside a sticky note, then Excalidraw will automatically take care of word wrapping. " +
    "Set this value to `0` if you do not want to set a default. ",
  PAGE_TRANSCLUSION_CHARCOUNT_NAME: "Page transclusion max char count",
  PAGE_TRANSCLUSION_CHARCOUNT_DESC:
    "The maximum number of characters to display from the page when transcluding an entire page with the " +
    "![[markdown page]] format.",
  QUOTE_TRANSCLUSION_REMOVE_NAME:
    "Quote translusion: remove leading '> ' from each line",
  QUOTE_TRANSCLUSION_REMOVE_DESC:
    "Remove the leading '> ' from each line of the transclusion. This will improve readability of quotes in text only transclusions<br>" +
    "<b><u>Toggle ON:</u></b> Remove leading '> '<br><b><u>Toggle OFF:</u></b> Do not remove leading '> ' (note it will still be removed from the first row due to Obsidian API functionality)",
  GET_URL_TITLE_NAME: "Use oEmbed to resolve page title",
  GET_URL_TITLE_DESC:
    "Use the <code>http" +
    "s://noembed" +
    ".com/embed?url=</code> to get title of page when dropping an HTTPS link into Excalidraw",
  LINK_BEHAVIOR_HEAD: "Link behavior",
  LINK_BEHAVIOR_DESC:
    "Configure link synchronization, related links, hover previews, click handling, and web-page title lookup.",
  LINK_USAGE_NAME: "Using links in Excalidraw",
  LINK_OPENING_HEAD: "Pane and tab behavior",
  LINK_OPENING_DESC:
    "Choose whether opened links reuse, focus, or move between panes, tabs, and the main workspace.",
  LINK_APPEARANCE_HEAD: "Link appearance",
  LINK_APPEARANCE_DESC:
    "Configure brackets, prefixes, icons, and opacity used when links are displayed.",
  TODO_HEAD: "TODOs",
  TODO_GROUP_DESC:
    "Configure TODO parsing and the icons used for open and completed tasks.",
  TRANSCLUSION_HEAD: "Text transclusions",
  TRANSCLUSION_DESC:
    "Configure character limits, wrapping, and quote cleanup for transcluded Markdown text.",
  PDF_TO_IMAGE_SCALE_NAME: "PDF to Image conversion scale",
  PDF_TO_IMAGE_SCALE_DESC:
    "Sets the resolution of the image that is generated from the PDF page. Higher resolution will result in bigger images in memory and consequently a higher load on your system (slower performance), but sharper image. " +
    "Additionally, if you want to copy PDF pages (as images) to Excalidraw.com, the bigger image size may result in exceeding the 2MB limit on Excalidraw.com.",
  EMBED_TOEXCALIDRAW_HEAD: "Embed files into Excalidraw",
  EMBED_TOEXCALIDRAW_DESC:
    "In the Embed Files section of Excalidraw Settings, you can configure how various files are embedded into Excalidraw. This includes options for embedding interactive markdown files, PDFs, and markdown files as images.",
  MD_EMBED_CUSTOMDATA_HEAD_NAME: "Interactive Markdown Files",
  MD_EMBED_CUSTOMDATA_GROUP_DESC:
    "Configure editing and default appearance for future interactive Markdown embeds.",
  MD_EMBED_DEFAULTS_CONTROL_NAME: "Interactive Markdown appearance defaults",
  MD_EMBED_CUSTOMDATA_HEAD_DESC: `The below settings will only effect future embeds. Current embeds remain unchanged. The theme setting of embedded frames is under the "Excalidraw appearance and behavior" section.`,
  MD_EMBED_SINGLECLICK_EDIT_NAME: "Single click to edit embedded markdown",
  MD_EMBED_SINGLECLICK_EDIT_DESC:
    "Single click on an embedded markdown file to edit it. " +
    "When turned off, the markdown file will first open in preview mode, then switch to edit mode when you click on it again.",
  EMBED_HEAD: "Embedding Excalidraw into your Notes and Exporting",
  EMBED_DESC: `In the "Embed & Export" settings, you can configure how images and Excalidraw drawings are embedded and exported within your documents. Key settings include choosing the image type for markdown preview (such as Native SVG or PNG), specifying the type of file to insert into the document (original Excalidraw, PNG, or SVG), and managing image caching for embedding in markdown. You can also control image sizing, whether to embed drawings using wiki links or markdown links, and adjust settings related to image themes, background colors, and Obsidian integration. 
    Additionally, there are settings for auto-export, which automatically generates SVG and/or PNG files to match the title of your Excalidraw drawings, keeping them in sync with file renames and deletions.`,
  EMBED_PREVIEW_LINKS_HEAD: "Previews, links, and Canvas",
  EMBED_PREVIEW_LINKS_DESC:
    "Choose preview and inserted-file formats, source-link behavior, placeholders, and immersive Canvas embeds.",
  EMBED_CANVAS_NAME: "Immersive embedding",
  EMBED_CANVAS_DESC:
    "Hide canvas node border and background when embedding an Excalidraw drawing to Canvas. " +
    "Note that for a full transparent background for your image, you will still need to configure Excalidraw to export images with transparent background.",
  EMBED_CACHING: "Image caching and rendering optimization",
  EMBED_CACHING_DESC:
    "Tune rendering concurrency and local image caches, purge cached images or backups, and optionally reuse exported previews.",
  RENDERING_CONCURRENCY_NAME: "Image rendering concurrency",
  RENDERING_CONCURRENCY_DESC:
    "Number of parallel workers to use for image rendering. Increasing this number will speed up the rendering process, but may slow down the rest of the system. " +
    "The default value is 3. You can increase this number if you have a powerful system.",
  IMAGE_CACHE_RETENTION_DAYS_NAME: "Local image cache retention",
  IMAGE_CACHE_RETENTION_DAYS_DESC:
    "How many days Excalidraw should keep locally cached rendered assets such as nested Excalidraw images and PDF pages before unused cache entries are purged. " +
    "Cached items remain available while they are being used, and their timer is refreshed when they are read from cache.<br><br>" +
    "This only affects Excalidraw's local cache on the current device. It does <b>not</b> change your vault size, your attachments, or your sync payload. " +
    "The practical impact is local disk or browser-storage usage inside Obsidian. This can matter on phones and on desktops with tighter browser storage quotas or limited free disk space.<br><br>" +
    "Lower values reclaim local cache space sooner but may force more rerendering of PDFs and embedded drawings. Higher values keep repeat loads faster at the cost of more local cache storage.",
  EXPORT_SUBHEAD: "Export Settings",
  EXPORT_SUBHEAD_DESC:
    "Configure PDF rendering and exported scene data, image dimensions, theme and background, PDF defaults, and automatic PNG/SVG copies.",
  EMBED_SIZING: "Image sizing",
  EMBED_SIZING_DESC:
    "Set default embedded-image dimensions, PNG scale, and export padding.",
  EMBED_THEME_BACKGROUND: "Image theme and background color",
  EMBED_THEME_BACKGROUND_DESC:
    "Choose exported-image background and theme behavior and whether previews follow Obsidian's theme.",
  EMBED_IMAGE_CACHE_NAME: "Cache images for embedding in markdown",
  EMBED_IMAGE_CACHE_DESC:
    "Cache images for embedding in markdown. Cached drawings are refreshed when the drawing or one of its nested vault-file dependencies changes.",
  SCENE_IMAGE_CACHE_NAME: "Cache nested Excalidraws in Scene",
  SCENE_IMAGE_CACHE_DESC:
    "Cache nested Excalidraws in the Scene for faster scene rendering. This will speed up the rendering process, especially if you have deeply nested Excalidraws in your scene. " +
    "Excalidraw will identify changes to nested drawings and their embedded vault-file sources and update the cache accordingly. " +
    "You may want to turn this off, in case you are suspecting that the cache is not updating properly.",
  EMBED_IMAGE_CACHE_CLEAR: "Purge Cache",
  REFRESH_SCENE_IMAGES:
    "Refresh selected image or all images in the current drawing",
  BACKUP_CACHE_CLEAR: "Purge Backups",
  BACKUP_CACHE_CLEAR_CONFIRMATION:
    "This action will delete all Excalidraw drawing backups. Backups are used as a safety measure in case your drawing file gets damaged. Each time you open Obsidian the plugin automatically deletes backups for files that no longer exist in your Vault. Are you sure you want to clear all backups?",
  EMBED_REUSE_EXPORTED_IMAGE_NAME:
    "If found, use the already exported image for preview",
  EMBED_REUSE_EXPORTED_IMAGE_DESC:
    `This setting works in conjunction with the <a href='#${
      TAG_AUTOEXPORT
    }'>Auto-export SVG/PNG</a> setting. If an exported image that matches the file name of the drawing ` +
    `is available, use that image instead of generating a preview image on the fly. This will result in faster previews especially when you have many embedded objects in the drawing, however, ` +
    `it may happen that your latest changes are not displayed and that the image will not automatically match your Obsidian theme in case you have changed the ` +
    `Obsidian theme since the export was created. This setting only applies to embedding images into markdown documents. ` +
    `For a number of reasons, the same approach cannot be used to expedite the loading of drawings with many embedded objects. See demonstration <a href="${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RELEASES_TAG}/1.6.23" target='_blank'>here</a>.`,
  EMBED_PREVIEW_IMAGETYPE_NAME: "Image type in markdown preview",
  EMBED_PREVIEW_IMAGETYPE_DESC:
    "<b><u>Native SVG</u></b>: High Image Quality. Embedded Websites, YouTube videos, Obsidian Links, and external images embedded via a URL will all work. Embedded Obsidian pages will not<br>" +
    "<b><u>SVG Image</u></b>: High Image Quality. Embedded elements and images embedded via URL only have placeholders, links don't work<br>" +
    `<b><u>PNG Image</u></b>: Lower Image Quality, but in some cases better performance with large drawings. Embedded elements and images embedded via URL only have placeholders, links don't work. Also some of the <a href="${URLs.WWW_YOUTUBE_COM_WATCH_1}" target='_blank'>image block referencing features</a> do not work with PNG embeds.`,
  PREVIEW_MATCH_OBSIDIAN_NAME: "Excalidraw preview to match Obsidian theme",
  PREVIEW_MATCH_OBSIDIAN_DESC:
    "Image preview in documents should match the Obsidian theme. If enabled, when Obsidian is in dark mode, Excalidraw images will render in dark mode. " +
    "When Obsidian is in light mode, Excalidraw will render light mode as well. You may want to switch 'Export image with background' off for a more Obsidian-integrated look and feel.",
  EMBED_WIDTH_NAME: "Default width of embedded (transcluded) image",
  EMBED_WIDTH_DESC:
    "The default width of an embedded drawing. This applies to live preview edit and reading mode, as well as to hover previews. You can specify a custom " +
    "width when embedding an image using the <code>![[drawing.excalidraw|100]]</code> or " +
    "<code>[[drawing.excalidraw|100x100]]</code> format.",
  EMBED_HEIGHT_NAME: "Default height of embedded (transcluded) image",
  EMBED_HEIGHT_DESC:
    "The default height of an embedded drawing. This applies to live preview edit and reading mode, as well as to hover previews. You can specify a custom " +
    "height when embedding an image using the <code>![[drawing.excalidraw|100]]</code> or " +
    "<code>[[drawing.excalidraw|100x100]]</code> format.",
  EMBED_TYPE_NAME: "Type of file to insert into the document",
  EMBED_TYPE_DESC:
    `When you embed an image into a document using the command palette this setting will specify if Excalidraw should embed the original Excalidraw file ` +
    `or a PNG or an SVG copy. You need to enable <a href='#${
      TAG_AUTOEXPORT
    }'>auto-export PNG / SVG</a> (see below under Export Settings) for those image types to be available in the dropdown. For drawings that do not have a ` +
    `a corresponding PNG or SVG readily available the command palette action will insert a broken link. You need to open the original drawing and initiate export manually. ` +
    `This option will not autogenerate PNG/SVG files, but will simply reference the already existing files.`,
  EMBED_MARKDOWN_COMMENT_NAME: "Embed link to drawing as comment",
  EMBED_MARKDOWN_COMMENT_DESC:
    "Embed the link to the original Excalidraw file as a markdown link under the image, e.g.:<code>%%[[drawing.excalidraw]]%%</code>.<br>" +
    "Instead of adding a markdown comment you may also select the embedded SVG or PNG line and use the command palette action: " +
    "'<code>Excalidraw: Open Excalidraw drawing</code>' to open the drawing.",
  EMBED_WIKILINK_NAME: "Embed Drawing using Wiki link",
  EMBED_WIKILINK_DESC:
    "<b><u>Toggle ON:</u></b> Excalidraw will embed a [[wiki link]].<br><b><u>Toggle OFF:</u></b> Excalidraw will embed a [markdown](link).",
  EMBED_PLACEHOLDER_NAME: "Embed placeholder image",
  EMBED_PLACEHOLDER_DESC:
    "If enabled, embeds a placeholder image when no drawing is present. If disabled, no image is embedded.",
  EXPORT_PNG_SCALE_NAME: "PNG export image scale",
  EXPORT_PNG_SCALE_DESC: "The size-scale of the exported PNG image",
  EXPORT_BACKGROUND_NAME: "Export image with background",
  EXPORT_BACKGROUND_DESC:
    "If turned off, the exported image will be transparent.",
  EXPORT_PADDING_NAME: "Image Padding",
  EXPORT_PADDING_DESC:
    "The padding (in pixels) around the exported SVG or PNG image. Padding is set to 0 for clippedFrame references." +
    "If you have curved lines close to the edge of the image they might get cropped during image export. You can increase this value to avoid cropping. " +
    "You can also override this setting at a file level by adding the <code>excalidraw-export-padding: 5<code> frontmatter key.",
  EXPORT_THEME_NAME: "Export image with theme",
  EXPORT_THEME_DESC:
    "Export the image matching the dark/light theme of your drawing. If turned off, " +
    "drawings created in dark mode will appear as they would in light mode.",
  EXPORT_EMBED_SCENE_NAME: "Embed scene in exported image",
  EXPORT_EMBED_SCENE_DESC:
    "Embed Excalidraw scene in exported image. Can be overridden at a file level by adding the <code>excalidraw-export-embed-scene: true/false</code> frontmatter key. " +
    "The setting only takes effect the next time you (re)open drawings.",
  SETTINGS_NAVIGATION_OPEN: "Open",
  SETTINGS_BREADCRUMB_ARIA: "Settings path",
  COMPATIBILITY_HEAD: "Compatibility features",
  COMPATIBILITY_DESC:
    "You should only enable these features if you have a strong reason for wanting to work with excalidraw.com files instead of markdown files. Many of the plugin features are not supported on legacy files. Typical usecase would be if you use set your vault up on top of a Visual Studio Code project folder and you have .excalidraw drawings you want to access from Visual Studio Code as well. Another usecase might be using Excalidraw in Logseq and Obsidian in parallel.",
  DUMMY_TEXT_ELEMENT_LINT_SUPPORT_NAME: "Linter compatibility",
  DUMMY_TEXT_ELEMENT_LINT_SUPPORT_DESC:
    "Excalidraw is sensitive to the file structure below <code># Excalidraw Data</code>. Automatic linting of documents can create errors in Excalidraw Data. " +
    "While I've made some effort to make the data loading resilient to " +
    "lint changes, this solution is not foolproof.<br><mark>The best is to avoid linting or otherwise automatically changing Excalidraw documents using different plugins.</mark><br>" +
    "Use this setting if for good reasons you have decided to ignore my recommendation and configured linting of Excalidraw files.<br> " +
    "The <code>## Text Elements</code> section is sensitive to empty lines. A common linting approach is to add an empty line after section headings. In case of Excalidraw this will break/change the first text element in your drawing. " +
    "To overcome this, you can enable this setting. When enabled, Excalidraw will add a dummy element to the beginning of <code>## Text Elements</code> that the linter can safely modify.",
  PRESERVE_TEXT_AFTER_DRAWING_NAME: "Zotero and Footnotes compatibility",
  PRESERVE_TEXT_AFTER_DRAWING_DESC:
    "Preserve text after the ## Drawing section of the markdown file. This may have a very slight performance impact when saving very large drawings.",
  SLIDING_PANES_NAME: "Sliding panes plugin support",
  SLIDING_PANES_DESC:
    "Need to restart Obsidian for this change to take effect.<br>" +
    `If you use the <a href="${URLs.GITHUB_COM_DEATHAU_SLIDING_PANES_OBSIDIAN}" target='_blank'>Sliding Panes plugin</a> ` +
    "you can enable this setting to make Excalidraw drawings work with the Sliding Panes plugin.<br>" +
    "Note, that Excalidraw Sliding Panes support causes compatibility issues with Obsidian Workspaces.<br>" +
    "Note also, that the 'Stack Tabs' feature is now available in Obsidian, providing native support for most of the Sliding Panes functionality.",
  SYNC_EXCALIDRAW_NAME:
    "Sync *.excalidraw with *.md version of the same drawing",
  SYNC_EXCALIDRAW_DESC:
    "If the modified date of the *.excalidraw file is more recent than the modified date of the *.md file " +
    "then update the drawing in the .md file based on the .excalidraw file",
  COMPATIBILITY_MODE_NAME: "New drawings as legacy files",
  COMPATIBILITY_MODE_DESC:
    "⚠️ Enable this only if you know what you are doing. In 99.9% of the cases you DO NOT want this on. " +
    "By enabling this feature drawings you create with the ribbon icon, the command palette actions, " +
    "and the file explorer are going to be all legacy *.excalidraw files. This setting will also turn off the reminder message " +
    "when you open a legacy file for editing.",
  NONSTANDARD_HEAD: "Non-Excalidraw.com supported features",
  NONSTANDARD_DESC: `These settings in the "Non-Excalidraw.com Supported Features" section provide customization options beyond the default Excalidraw.com features. These features are not available on excalidraw.com. When exporting the drawing to Excalidraw.com these features will appear different.
    You can configure the number of custom pens displayed next to the Obsidian Menu on the canvas, allowing you to choose from a range of options. Additionally, you can enable a local font option, which adds a local font to the list of fonts on the element properties panel for text elements. `,
  MAX_IMAGE_ZOOM_IN_NAME: "Maximum image zoom in resolution",
  MAX_IMAGE_ZOOM_IN_DESC:
    "To save on memory and because Apple Safari (Obsidian on iOS) has some hard-coded limitations, Excalidraw.com limits the max resolution of images and large objects when zooming in. You can override this limitation using a multiplicator. " +
    "This means you are multiplying the limit set by default in Excalidraw, the larger the multiplier the better the image zoom in resolution will be, and the more memory it will consume. " +
    "I recommend playing with multiple values for this setting. You know you've hit the wall, when zooming in to a larger PNG image suddenly the image disappears from view. The default value is 1. The setting has no effect on iOS.",
  CUSTOM_PEN_NAME: "Number of custom pens",
  CUSTOM_PEN_DESC:
    "You will see these pens next to the Obsidian Menu on the canvas. You can customize the pens on the canvas by long-pressing the pen button.",
  EXPERIMENTAL_HEAD: "Miscellaneous features",
  EXPERIMENTAL_DESC:
    "Configure LaTeX defaults, file type indicators, live preview behavior, property suggestions, and the experimental Taskbone OCR integration.",
  EA_HEAD: "Excalidraw Automate",
  EA_GROUP_DESC:
    "Configure Excalidraw Automate scripting, startup and autostart behavior, command links, and settings exposed by installed scripts.",
  EA_DESC:
    "ExcalidrawAutomate is a scripting and automation API for Excalidraw. Unfortunately, the documentation of the API is sparse. " +
    `I recommend reading the <a href="${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_BLOB_MASTER_DOCS_API_EXCALIDRAWAUTOMATE_D_TS}">ExcalidrawAutomate.d.ts</a> file, ` +
    `visiting the <a href="${URLs.ZSVICZIAN_GITHUB_IO_OBSIDIAN_EXCALIDRAW_PLUGIN}">ExcalidrawAutomate How-to</a> page - though the information ` +
    `here has not been updated for a long while -, and finally to enable the field suggester below. The field suggester will show you the available ` +
    `functions, their parameters and short description as you type. The field suggester is the most up-to-date documentation of the API.`,
  AUTOSTART_SCRIPT_PROMPT:
    "wants to run automatically every time you open an Excalidraw drawing. Do you want to allow this?",
  AUTOSTART_SCRIPT_PROMPT_MANAGE_HINT:
    'You can change this later from the Command Palette ("Autostart scripts") or in Settings → Excalidraw Automate → Autostart scripts.',
  AUTOSTART_SCRIPT_ALLOW: "Autostart",
  AUTOSTART_SCRIPT_DENY: "Manual start only",
  AUTOSTART_SCRIPT_ASK_LATER: "Ask every time",
  ENABLE_COMMAND_LINKS_NAME: "Enable command links (cmd://)",
  ENABLE_COMMAND_LINKS_CONFIRMATION:
    "This link triggers an Obsidian command via <code>cmd://</code>. Do you want to enable command links?",
  ENABLE_COMMAND_LINKS_CONFIRM_ENABLE: "Enable command links",
  ENABLE_COMMAND_LINKS_CONFIRM_DENY: "Do not allow",
  ENABLE_COMMAND_LINKS_DESC:
    "If enabled, Excalidraw will allow links starting with <code>cmd://</code> to execute Obsidian command palette actions in drawings you open from now on, until you disable this setting. " +
    "This creates a risk if you open drawings from unknown sources: a malicious drawing can make a normal click trigger privileged commands. " +
    "Only enable this if you trust the file and its source.",
  FILETYPE_NAME: "Display type (✏️) for excalidraw.md files in File Explorer",
  FILETYPE_DESC:
    "Excalidraw files will receive an indicator using the emoji or text defined in the next setting.",
  FILETAG_NAME: "Set the type indicator for excalidraw.md files",
  FILETAG_DESC: "The text or emoji to display as type indicator.",
  INSERT_EMOJI: "Insert an emoji",
  FADE_OUT_EXCALIDRAW_MARKUP_NAME: "Fade out Excalidraw markup",
  FADE_OUT_EXCALIDRAW_MARKUP_DESC:
    "In Markdown view mode, the section after the markdown comment %% " +
    "fades out. The text is still there, but the visual clutter is reduced. Note, you can place the %% in the line right above # Text Elements, " +
    "in this case the entire drawing markdown will fade out including # Text Elements. The side effect is you won't be able to block reference text in other markdown notes, that is after the %% comment section. This is seldom an issue. " +
    "Should you want to edit the Excalidraw markdown script, simply switch to markdown view mode and temporarily remove the %% comment.",
  EXCALIDRAW_PROPERTIES_NAME:
    "Load Excalidraw Properties into Obsidian Suggester",
  EXCALIDRAW_PROPERTIES_DESC:
    "Toggle this setting to load Excalidraw document properties into Obsidian's property suggester at plugin startup. " +
    "Enabling this feature simplifies the use of Excalidraw front matter properties, allowing you to leverage many powerful settings. If you prefer not to load these properties automatically, " +
    "you can disable this feature, but you will need to manually remove any unwanted properties from the suggester. " +
    "Note that turning on this setting requires restarting the plugin as properties are loaded at startup.",
  FONTS_HEAD: "Fonts",
  FONTS_DESC:
    "Configure local fontfaces and downloaded CJK fonts for Excalidraw.",
  ENABLE_FOURTH_FONT_NAME: "Enable local font option",
  ENABLE_FOURTH_FONT_DESC:
    "Enabling this option will add a local font to the font list in the properties panel for text elements. " +
    "Be aware that using this local font may compromise platform independence. " +
    "Files using the custom font might render differently when opened in a different vault or at a later time, depending on the font settings. " +
    "Additionally, the 4th font will default to the system font on excalidraw.com or other Excalidraw versions.",
  FOURTH_FONT_NAME: "Local font file",
  FOURTH_FONT_DESC:
    "Select a .otf, .ttf, .woff, or .woff2 font file from your vault to use as the local font. " +
    "If no file is selected, Excalidraw will default to the Virgil font. " +
    "For optimal performance, it is recommended to use a .woff2 file, as Excalidraw will encode only the necessary glyphs when exporting images to SVG. " +
    "Other font formats will embed the entire font in the exported file, potentially resulting in significantly larger file sizes.",
  OFFLINE_CJK_NAME: "Offline CJK font support",
  OFFLINE_CJK_GROUP_DESC:
    "Download and selectively preload Chinese, Japanese, and Korean fonts so Excalidraw can render them without an internet connection.",
  OFFLINE_CJK_DESC: `<strong>Changes you make here will only take effect after restarting Obsidian.</strong><br>
     Excalidraw.com offers handwritten CJK fonts. By default these fonts are not included in the plugin locally, but are served from the Internet. 
     If you prefer to keep Excalidraw fully local, allowing it to work without Internet access you can download the necessary <a href="${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RAW_REFS_HEADS_MASTER_ASSETS_EXCALIDRAW_FONTS_ZIP}" target="_blank">font files from GitHub</a>.
     After downloading, unzip the contents into a folder within your Vault.<br>
     Pre-loading fonts will impact startup performance. For this reason you can select which fonts to load.`,
  CJK_ASSETS_FOLDER_NAME: "CJK Font Folder (cAsE sENsiTIvE!)",
  CJK_ASSETS_FOLDER_DESC: `You can set the location of the CJK fonts folder here. For example, you may choose to place it under <code>Excalidraw/CJK Fonts</code>.<br><br>
    <strong>Important:</strong> Do not set this folder to the Vault root! Do not put other fonts in this folder.<br><br>
    <strong>Note:</strong> If you're using Obsidian Sync and want to synchronize these font files across your devices, ensure that Obsidian Sync is set to synchronize "All other file types".`,
  LOAD_CHINESE_FONTS_NAME: "Load Chinese fonts from file at startup",
  LOAD_JAPANESE_FONTS_NAME: "Load Japanese fonts from file at startup",
  LOAD_KOREAN_FONTS_NAME: "Load Korean fonts from file at startup",
  //HotkeyEditor
  HOTKEY_PRESS_COMBO_NANE: "Press your hotkey combination",
  HOTKEY_PRESS_COMBO_DESC: "Please press the desired key combination",
  HOTKEY_BUTTON_ADD_OVERRIDE: "Add New Override",
  HOTKEY_BUTTON_REMOVE: "Remove",

  //openDrawings.ts
  SELECT_FILE: "Select a file then press enter.",
  SELECT_COMMAND: "Select a command then press enter.",
  SELECT_FILE_WITH_OPTION_TO_SCALE: `Select a file then press ENTER, or ${labelSHIFT()}+${labelMETA()}+ENTER to insert at 100% scale.`,
  NO_MATCH: "No file matches your query.",
  NO_MATCHING_COMMAND: "No command matches your query.",
  SELECT_FILE_TO_LINK: "Select the file you want to insert the link for.",
  SELECT_COMMAND_PLACEHOLDER:
    "Select the command you want to insert the link for.",
  SELECT_DRAWING: "Select the image or drawing you want to insert",
  TYPE_FILENAME: "Type name of drawing to select.",
  SELECT_FILE_OR_TYPE_NEW:
    "Select existing drawing or type name of a new drawing then press Enter.",
  SELECT_TO_EMBED: "Select the drawing to insert into active document.",
  //SelectCard.ts
  //EmbeddedFileLoader.ts
  INFINITE_LOOP_WARNING:
    "EXCALIDRAW WARNING\nAborted loading embedded images due to infinite loop in file:\n",

  //Scripts.ts
  //ScriptInstallPrompt.ts
  //ExcalidrawViewUtils.ts
  MARKER_FRAME_RENDERING_DISABLED_NOTICE:
    "There are hidden marker-frames in the scene.",
  //DRAWING_HAS_BACK_OF_THE_CARD: "There are notes on the back of this drawing.",

  //ExcalidrawData.ts
  FONT_LOAD_SLOW:
    "Loading Fonts...\n\n This is taking longer than expected. If this delay occurs regularly then you may download the fonts locally to your Vault. \n\n" +
    "(click=dismiss, right-click=Info)",
  FONT_INFO_TITLE: "Starting v2.5.3 fonts load from the Internet",
  FONT_INFO_DETAILED: `
      <p>
        To improve Obsidian's startup time and manage the large <strong>CJK font family</strong>, 
        I've moved the CJK fonts out of the plugin's <code>main.js</code>. CJK fonts will be loaded from the internet by default.
        This typically shouldn't cause issues as Obsidian caches these files after first use.
      </p>
      <p>
        If you prefer to keep Obsidian 100% local or experience performance issues, you can download the font assets.
      </p>
      <h3>Instructions:</h3>
      <ol>
        <li>Download the fonts from <a href="${URLs.GITHUB_COM_ZSVICZIAN_OBSIDIAN_EXCALIDRAW_PLUGIN_RAW_REFS_HEADS_MASTER_ASSETS_EXCALIDRAW_FONTS_ZIP}">GitHub</a>.</li>
        <li>Unzip and copy files into a Vault folder (default: <code>Excalidraw/${CJK_FONTS}</code>; folder names are cAse-senSITive).</li>
        <li><mark>DO NOT</mark> set this folder to the Vault root or mix with other local fonts.</li>
      </ol>
      <h3>For Obsidian Sync Users:</h3>
      <p>
        Ensure Obsidian Sync is set to synchronize "All other file types" or download and unzip the file on all devices.
      </p>
      <h3>Note:</h3>
      <p>
        If you find this process cumbersome, please submit a feature request to Obsidian.md for supporting assets in the plugin folder. 
        Currently, only a single <code>main.js</code> is supported, which leads to large files and slow startup times for complex plugins like Excalidraw. 
        I apologize for the inconvenience.
      </p>
    `,

  //ObsidianMenu.tsx
  GOTO_FULLSCREEN: "Goto fullscreen mode",
  EXIT_FULLSCREEN: "Exit fullscreen mode",
  TOGGLE_FULLSCREEN: "Toggle fullscreen mode",
  TOGGLE_DISABLEBINDING: "Toggle to invert default binding behavior",
  TOGGLE_FRAME_RENDERING: "Toggle frame rendering",
  TOGGLE_FRAME_CLIPPING: "Toggle frame clipping",
  OPEN_LINK_CLICK: "Open Link",
  OPEN_LINK_PROPS: "Open the image-link or LaTeX-formula editor",

  //ToolbarResetButton.ts
  RESET_CANVAS_BUTTON: "Clear canvas (undoable)",

  //CustomToolbar.ts
  OME_TOOLBAR_HAND: "Hand (pan)",
  OME_TOOLBAR_SELECT: "Select",
  OME_TOOLBAR_PEN: "Pen",
  OME_TOOLBAR_ERASER: "Eraser",
  OME_TOOLBAR_UNDO: "Undo",
  OME_TOOLBAR_REDO: "Redo",

  //ToolSettingsPopup.ts
  PEN_POPUP_COLOR: "Color",
  PEN_POPUP_COLOR_CUSTOM: "Custom color",
  PEN_POPUP_THICKNESS: "Thickness",
  PEN_POPUP_PRESSURE: "Pressure",
  PEN_POPUP_PRESSURE_CONSTANT: "Constant",
  PEN_POPUP_PRESSURE_VARIABLE: "Variable",
  ERASER_POPUP_SIZE: "Size",

  //IFrameActionsMenu.tsx
  NARROW_TO_HEADING: "Narrow to heading...",
  PIN_VIEW: "Pin view",
  DO_NOT_PIN_VIEW: "Do not pin view",
  NARROW_TO_BLOCK: "Narrow to block...",
  SHOW_ENTIRE_FILE: "Show entire file",
  SELECT_SECTION: "Select section from document",
  SELECT_VIEW: "Select view from base",
  ZOOM_TO_FIT: "Zoom to fit",
  RELOAD: "Reload original link",
  OPEN_IN_BROWSER: "Open current link in browser",
  PROPERTIES: "Properties",
  COPYCODE: "Copy source to clipboard",

  //EmbeddableSettings.tsx
  ES_TITLE: "Embeddable Element Settings",
  ES_RENAME: "Rename File",
  ES_ZOOM: "Embedded Content Scaling",
  ES_FILENAME_VISIBLE: "Filename Visible",
  ES_LOCKED_READING_MODE_HEAD: "Locked Reading Mode",
  ES_LOCKED_READING_MODE_DESC:
    "When enabled, interacting with the markdown embeddable will not switch it to edit mode. This is useful for checklists and habit trackers.",
  LOCK_READING_MODE: "Lock Reading Mode",
  UNLOCK_READING_MODE: "Unlock Reading Mode",
  ES_BACKGROUND_HEAD: "Embedded note background color",
  ES_BACKGROUND_DESC_INFO: "Click here for more info on colors",
  ES_BACKGROUND_DESC_DETAIL:
    "Background color affects only the preview mode of the markdown embeddable. When editing, it follows the Obsidian light/dark theme as set for the scene (via document property) or in plugin settings. The background color has two layers: the element background color (lower layer) and a color on top (upper layer). Selecting 'Match Element Background' means both layers follow the element color. Selecting 'Match Canvas' or a specific background color keeps the element background layer. Setting opacity (e.g., 50%) mixes the canvas or selected color with the element background color. To remove the element background layer, set the element color to transparent in Excalidraw's element properties editor. This makes only the upper layer effective.",
  ES_BACKGROUND_MATCH_ELEMENT: "Match Element Background Color",
  ES_BACKGROUND_MATCH_CANVAS: "Match Canvas Background Color",
  ES_BACKGROUND_COLOR: "Background Color",
  ES_BORDER_HEAD: "Embedded note border color",
  ES_BORDER_COLOR: "Border Color",
  ES_BORDER_MATCH_ELEMENT: "Match Element Border Color",
  ES_BACKGROUND_OPACITY: "Background Opacity",
  ES_BORDER_OPACITY: "Border Opacity",
  ES_EMBEDDABLE_SETTINGS: "Embeddable Markdown Settings",
  ES_USE_OBSIDIAN_DEFAULTS: "Use Obsidian Defaults",
  ES_ZOOM_100_RELATIVE_DESC:
    "The button will adjust the element scale so it will show the content at 100% relative to the current zoom level of your canvas",
  ES_ZOOM_100: "Relative 100%",
  ES_PROPERTIES_VISIBLE_HEAD: "Properties visible",
  ES_PROPERTIES_VISIBLE_DESC:
    "Show document properties (YAML frontmatter) at the top of the embedded file.",
  ES_PROPERTIES_VISIBLE_WARNING:
    "Global Obsidian settings are hiding document properties. This setting cannot reveal them. Please change your Obsidian settings to 'Visible' or 'Source' first.",
  SHOW_PROPERTIES: "Show properties",
  HIDE_PROPERTIES: "Hide properties",

  //Prompts.ts
  PROMPT_FILE_DOES_NOT_EXIST: "File does not exist. Do you want to create it?",
  PROMPT_ERROR_NO_FILENAME: "Error: Filename for new file may not be empty",
  PROMPT_ERROR_DRAWING_CLOSED:
    "Unknown error. It seems as if your drawing was closed or the drawing file is missing",
  PROMPT_TITLE_NEW_FILE: "New File",
  PROMPT_TITLE_CONFIRMATION: "Confirmation",
  PROMPT_BUTTON_CREATE_EXCALIDRAW: "Create EX",
  PROMPT_BUTTON_CREATE_EXCALIDRAW_ARIA:
    "Create Excalidraw drawing and open in new tab",
  PROMPT_BUTTON_CREATE_MARKDOWN: "Create MD",
  PROMPT_BUTTON_CREATE_MARKDOWN_ARIA:
    "Create markdown document and open in new tab",
  PROMPT_BUTTON_EMBED_MARKDOWN: "Embed MD",
  PROMPT_BUTTON_EMBED_MARKDOWN_ARIA:
    "Replace selected element with embedded markdown document",
  PROMPT_BUTTON_NEVERMIND: "Nevermind",
  PROMPT_BUTTON_OK: "OK",
  PROMPT_BUTTON_CANCEL: "Cancel",
  PROMPT_BUTTON_CLOSE: "Close",
  PROMPT_BUTTON_INSERT_LINE: "Insert new line",
  PROMPT_BUTTON_INSERT_SPACE: "Insert space",
  PROMPT_BUTTON_INSERT_LINK: "Insert markdown link to file",
  PROMPT_BUTTON_UPPERCASE: "Uppercase",
  PROMPT_BUTTON_SPECIAL_CHARS: "Special Characters",
  PROMPT_SELECT_TEMPLATE: "Select a template",
  //ModifierKeySettings
  WEB_BROWSER_DRAG_ACTION: "Web Browser Drag Action",
  LOCAL_FILE_DRAG_ACTION: "OS Local File Drag Action",
  INTERNAL_DRAG_ACTION: "Obsidian Internal Drag Action",
  PANE_TARGET: "Link click behavior",
  DEFAULT_ACTION_DESC:
    "In case none of the combinations apply the default action for this group is: ",

  //FrameSettings.ts
  FRAME_SETTINGS_TITLE: "Frame Settings",
  FRAME_SETTINGS_ENABLE: "Enable Frames",
  FRAME_SETTIGNS_NAME: "Display Frame Name",
  FRAME_SETTINGS_OUTLINE: "Display Frame Outline",
  FRAME_SETTINGS_CLIP: "Enable Frame Clipping",

  //InsertPDFModal.ts
  //Utils.ts
  ERROR_PNG_TOO_LARGE:
    "Error exporting PNG - PNG too large, try a smaller resolution",

  //modifierkeyHelper.ts
  // WebBrowserDragAction
  WEB_DRAG_IMPORT_IMAGE: "Import Image to Vault",
  WEB_DRAG_IMAGE_URL: "Insert Image or YouTube Thumbnail with URL",
  WEB_DRAG_LINK: "Insert Link",
  WEB_DRAG_EMBEDDABLE: "Insert Interactive-Frame",

  // LocalFileDragAction
  LOCAL_DRAG_IMPORT:
    "Import external file or reuse existing file if path is from the Vault",
  LOCAL_DRAG_IMAGE:
    "Insert Image: with local URI or internal-link if from Vault",
  LOCAL_DRAG_LINK: "Insert Link: local URI or internal-link if from Vault",
  LOCAL_DRAG_EMBEDDABLE:
    "Insert Interactive-Frame: local URI or internal-link if from Vault",

  // InternalDragAction
  INTERNAL_DRAG_IMAGE: "Insert Image",
  INTERNAL_DRAG_IMAGE_FULL: "Insert Image @100%",
  INTERNAL_DRAG_LINK: "Insert Link",
  INTERNAL_DRAG_EMBEDDABLE: "Insert Interactive-Frame",

  // LinkClickAction
  LINK_CLICK_ACTIVE: "Open in current active window",
  LINK_CLICK_NEW_PANE: "Open in a new adjacent window",
  LINK_CLICK_POPOUT: "Open in a popout window",
  LINK_CLICK_NEW_TAB: "Open in a new tab",
  LINK_CLICK_MD_PROPS:
    "Show the Markdown image-properties dialog (only relevant if you have embedded a markdown document as an image)",

  //ExportDialog
  // Dialog and tabs
  EXPORTDIALOG_TITLE: "Export Drawing",
  EXPORTDIALOG_TAB_IMAGE: "Image",
  // Settings persistence
  EXPORTDIALOG_SAVE_SETTINGS: "Save image settings to file doc.properties?",
  EXPORTDIALOG_SAVE_SETTINGS_SAVE: "Save as preset",
  EXPORTDIALOG_SAVE_SETTINGS_ONETIME: "One-time use",
  // Image settings
  EXPORTDIALOG_IMAGE_SETTINGS: "Image",
  EXPORTDIALOG_IMAGE_DESC:
    "PNG supports transparency. External files can include Excalidraw scene data.",
  EXPORTDIALOG_PADDING: "Padding",
  EXPORTDIALOG_SCALE: "Scale",
  EXPORTDIALOG_CURRENT_PADDING: "Current padding:",
  EXPORTDIALOG_SIZE_DESC: "Scale affects output size",
  EXPORTDIALOG_SCALE_VALUE: "Scale:",
  EXPORTDIALOG_IMAGE_SIZE: "Size:",
  // Theme and background
  EXPORTDIALOG_EXPORT_THEME: "Theme",
  EXPORTDIALOG_THEME_LIGHT: "Light",
  EXPORTDIALOG_THEME_DARK: "Dark",
  EXPORTDIALOG_BACKGROUND: "Background",
  EXPORTDIALOG_BACKGROUND_TRANSPARENT: "Transparent",
  EXPORTDIALOG_BACKGROUND_USE_COLOR: "Use scene color",
  EXPORTDIALOG_INCLUDE_INTERNAL_LINKS: "Export internal links to SVG/PDF?",
  // Selection
  EXPORTDIALOG_SELECTED_ELEMENTS: "Export",
  EXPORTDIALOG_SELECTED_ALL: "Entire scene",
  EXPORTDIALOG_SELECTED_SELECTED: "Selection only",
  // Export options
  EXPORTDIALOG_EMBED_SCENE: "Include scene data?",
  EXPORTDIALOG_EMBED_YES: "Yes",
  EXPORTDIALOG_EMBED_NO: "No",
  // PDF settings
  // Buttons
  EXPORTDIALOG_PNGTOFILE: "Export PNG",
  EXPORTDIALOG_SVGTOFILE: "Export SVG",
  EXPORTDIALOG_PNGTOVAULT: "PNG to Vault",
  EXPORTDIALOG_SVGTOVAULT: "SVG to Vault",
  EXPORTDIALOG_EXCALIDRAW: "Excalidraw",
  EXPORTDIALOG_PNGTOCLIPBOARD: "PNG to Clipboard",
  EXPORTDIALOG_SVGTOCLIPBOARD: "SVG to Clipboard",
  EXPORTDIALOG_PDF_PROGRESS_NOTICE:
    "Exporting PDF. If this image is large, it may take a while.",
  EXPORTDIALOG_PDF_PROGRESS_DONE: "Export complete",
  EXPORTDIALOG_PDF_PROGRESS_ERROR:
    "Error exporting PDF, check developer console for details",

  // Screenshot tab
  EXPORTDIALOG_NOT_AVAILALBE:
    "Sorry, this feature is only available when the drawing is open in the main Obsidian workspace.",
  EXPORTDIALOG_TAB_SCREENSHOT: "Screenshot",
  EXPORTDIALOG_SCREENSHOT_DESC:
    "Screenshots will include embeddables such as markdown pages, YouTube, websites, etc. They are only available on desktop, cannot be automatically exported, and only support PNG format.",
  SCREENSHOT_DESKTOP_ONLY: "Screenshot feature is only available on desktop",
  SCREENSHOT_ERROR: "Error capturing screenshot - see console log",

  //exportUtils.ts
  PDF_EXPORT_DESKTOP_ONLY: "PDF export is only available on desktop",

  //UniversalInsertFileModal.ts
  UIFM_TITLE: "Insert File From Vault",
  UIFM_SECTION_HEAD: "Select section heading",
  UIFM_ANCHOR: "Anchor to 100% of original size",
  UIFM_ANCHOR_DESC:
    "This is a pro feature, use it only if you understand how it works. If enabled even if you change the size of the imported image in Excalidraw, the next time you open the drawing this image will pop back to 100% size. This is useful when embedding an atomic Excalidraw idea into another note and preserving relative sizing of text and icons.",
  UIFM_BTN_EMBEDDABLE: "as Embeddable",
  UIFM_BTN_IMAGE: "as Image",

  //ReleaseNotes.ts
  RN_WELCOME: "Welcome to Excalidraw",
  FIRST_RUN: `
The Excalidraw Obsidian plugin is much more than "just" a drawing tool. Because it integrates deeply with Obsidian, it opens up a whole new paradigm for Visual Personal Knowledge Management.

<div style="text-align:center;margin-top:10px;">
<a href="${URLs.COMMUNITY_SKETCH_YOUR_MIND_COM_EE}" target="_blank"><img src="${URLs.SKETCH_YOUR_MIND_COM_IMAGES_LOGO_EE_PNG}" style="width:50%;"></a>
</div>

To help you get started without the overwhelm, I highly recommend taking the free **[Excalidraw Essentials](${URLs.COMMUNITY_SKETCH_YOUR_MIND_COM_EE})** mini-course. It cuts through the noise and teaches you the fundamentals in a fast, structured way.

You also don't have to figure it all out alone! Come join the **[Sketch Your Mind Community](${URLs.COMMUNITY_SKETCH_YOUR_MIND_COM})** to connect with fellow visual thinkers, share your workflows, and build a frictionless PKM system together.

If you'd like to see what's possible right now, here is a showcase of the key features. To keep abreast of the latest updates and to explore visual PKM, please subscribe to my YouTube channel: [Visual PKM](${URLs.WWW_YOUTUBE_COM_VISUALPKM}).

Thank you & Enjoy!

<div class="excalidraw-videoWrapper">
<a href="${URLs.WWW_YOUTUBE_COM_WATCH}" target="_blank"><img src="${URLs.I_YTIMG_COM_VI_P_Q6AVJGOWI_MAXRESDEFAULT_JPG}" style="width:100%;"></a>
</div>
`,

  //CustomEmbeddable.tsx
  NOTICE_PDF_THEME:
    "PDF theme overridden.\n" +
    "Control via this file's 'excalidraw-embeddable-theme' document property (overrides plugin).\n\n" +
    "Values: dark, light, auto=Excalidraw, default=Obsidian.",

  //EmbeddableActionsMenu.tsx
  BOOKMARK_PAGE: "Save current position in document",
  CAPTURE_PAGE: "Capture current page as image",

  //VersionMismatch.ts
  //WARNING: Do not change the {VAL_RECORDED} and {VAL_ACTUAL} strings, they are replaced by the actual version values at runtime!
  VERSION_MISMATCH_NOTICE: `The version recorded by Obsidian is <b>{VAL_RECORDED}</b>, but the installed Excalidraw code is <b>{VAL_ACTUAL}</b>.`,

  VERSION_MISMATCH_HEADING: "Excalidraw version mismatch",
  VERSION_MISMATCH_CAUSE:
    "This usually happens after a partial sync (e.g. Obsidian Sync Standard) where large files (main.js > 5MB) did not sync, so only <code>manifest.json</code> updated.",
  VERSION_MISMATCH_OPTIONS:
    "Options:<br><b>1.</b> Re-download the plugin (recommended).<br><b>2.</b> Ignore for now.",
  VERSION_MISMATCH_NOTE:
    "Note: Updating version info manually may affect tools that read manifest.json directly (e.g. Plugin Update Tracker, BRAT) until a full reinstall.",
  VERSION_MISMATCH_DISABLE_NAME: "Disable future mismatch warnings",
  VERSION_MISMATCH_DISABLE_DESC:
    "You can re-enable this under: Settings → Excalidraw → Basic → Warn about incomplete plugin updates.",
  VERSION_MISMATCH_REDOWNLOAD: "Re-download plugin",
  VERSION_MISMATCH_IGNORE: "Ignore",

  //InlineLinkSuggester.ts
  INLINE_HINT: "Type [[ to search and insert a link",

  //SuggestionModal.ts
  SUGGESTION_NOMATCH: "No matches found",

  // Excalidraw Extras Gateway Components
  EXTRAS_GATEWAY_COMP_MATHJAX: "MathJax (LaTeX)",
  EXTRAS_GATEWAY_COMP_MERMAID: "Mermaid to Excalidraw",
  EXTRAS_GATEWAY_COMP_PDF: "PDF Export",
  EXTRAS_GATEWAY_COMP_FILESYSTEM: "Local File System Access",

  // Gateway Modals & Texts
  EXTRAS_GATEWAY_TITLE: "Excalidraw Extras Required",
  EXTRAS_GATEWAY_DESC:
    "The '{component}' feature has been moved to the Excalidraw Extras companion plugin to keep Excalidraw lightweight, stay within Obsidian Sync Basic size restrictions, and give you explicit control over the additional libraries and elevated-permission functionality it requires.",
  EXTRAS_GATEWAY_INSTALL_BTN: "Install from Community Plugins",
  EXTRAS_GATEWAY_MANUAL_ENABLE_NOTICE:
    "I had implemented a smoother workflow that allowed Excalidraw Extras to be enabled and disabled automatically when needed. Unfortunately, I was forced to remove that feature after it was flagged by the Obsidian code scanner as a high-risk issue, accompanied by an automated explanation that I believe does not accurately reflect what the code does. Please enable Excalidraw Extras manually in Community Plugins. If you'd like to see a more convenient experience in the future, please consider contacting Obsidian and asking for plugin-developer-friendly support for safe automation workflows, including companion plugin management.",
  EXTRAS_GATEWAY_ENABLE_FEATURE_PERM_BTN: "Enable {component} Permanently",
  EXTRAS_GATEWAY_TEMP_ENABLE_TITLE: "Enable Temporarily",
  EXTRAS_GATEWAY_TEMP_ENABLE_DESC:
    "Turn on the feature temporarily. It will automatically turn off when the timer expires.",
  EXTRAS_GATEWAY_SESSION_ENABLE_DESC:
    "Enable this feature for the current Obsidian session only.",
  EXTRAS_GATEWAY_ENABLE_CURRENT_SESSION: "Enable for this session",
  EXTRAS_GATEWAY_API_MISSING:
    "Excalidraw Extras is enabled, but the API failed to load. Please update the plugin.",
  EXTRAS_GATEWAY_FEATURE_TITLE: "Feature Disabled",
  EXTRAS_GATEWAY_FEATURE_DESC:
    "The '{component}' feature is currently disabled in your Excalidraw Extras settings.",
  EXTRAS_GATEWAY_IGNORE_SESSION: "Ignore for this session",
  EXTRAS_GATEWAY_UPDATE_EXACT:
    "Excalidraw Extras Update Required. {component} requires EXACTLY v{reqVersion} (Found v{currentVersion})",
  EXTRAS_GATEWAY_UPDATE_MIN:
    "Excalidraw Extras Update Required. {component} requires >= v{reqVersion} (Found v{currentVersion})",
  EXTRAS_GATEWAY_COMP_PLUGIN: "Excalidraw Extras Plugin",
  EXTRAS_GATEWAY_UPDATE_TITLE:
    "Excalidraw requires a new version of the Extras plugin",
  EXTRAS_GATEWAY_UPDATE_BTN: "Open Community Plugins",
  // PenSettingsModal.ts
  PEN_SETTINGS_TITLE: "Pen Settings",
  PEN_SETTINGS_HEADING: "Pen settings",
  PEN_SETTINGS_TYPE_NAME: "Pen type",
  PEN_SETTINGS_TYPE_DESC: "Select type of pen",
  PEN_SETTINGS_TYPE_DEFAULT: "Excalidraw Default",
  PEN_SETTINGS_TYPE_HIGHLIGHTER: "Highlighter",
  PEN_SETTINGS_TYPE_FINETIP: "Fine tip pen",
  PEN_SETTINGS_TYPE_FOUNTAIN: "Fountain pen",
  PEN_SETTINGS_TYPE_MARKER: "Marker with Outline",
  PEN_SETTINGS_TYPE_THICK_THIN: "Mindmap Thick-Thin",
  PEN_SETTINGS_TYPE_THIN_THICK_THIN: "Mindmap Thin-Thick-Thin",
  PEN_SETTINGS_APPLY: "Apply New Template",
  PEN_SETTINGS_SCOPE_FREEDRAW_ONLY:
    "Stroke & fill applies to: <b>Freedraw only</b>",
  PEN_SETTINGS_SCOPE_ALL_SHAPES: "Stroke & fill applies to: <b>All shapes</b>",
  PEN_SETTINGS_SCOPE_DESC: `<b>"All shapes"</b> means that if for example, you select a blue pen with dashed fill and then switch to a different tool (e.g. to a line, a circle, an arrow - i.e. not the freedraw tool), those will all have the same blue line and dashed fill.<br><b>"Only applies to the freedraw line"</b> means that if for example you are writing black text, and you select a custom pen (e.g. a yellow highlighter), then after using the highlighter you switch to another tool, the previous settings (e.g. black stroke color) will apply to the new shape.`,
  PEN_SETTINGS_STROKE_CURRENT: "Stroke color: <b>Current</b>",
  PEN_SETTINGS_STROKE_PRESET: "Stroke color: <b>Preset color</b>",
  PEN_SETTINGS_STROKE_DESC:
    "Use <b>current</b> stroke color of the canvas, or set a specific <b>preset color</b> for the pen",
  PEN_SETTINGS_STROKE_SELECT: "Select stroke color",
  PEN_SETTINGS_USE_CANVAS_CURRENT: "Use Canvas Current",
  PEN_SETTINGS_BG_CURRENT: "Background color: <b>Current</b>",
  PEN_SETTINGS_BG_PRESET: "Background color: <b>Preset color</b>",
  PEN_SETTINGS_BG_DESC:
    "Toggle to use the <b>current background color</b> of the canvas; or a <b>preset color</b>",
  PEN_SETTINGS_BG_TRANSPARENT: "Background: <b>Transparent</b>",
  PEN_SETTINGS_BG_COLOR_PRESET: "Color: <b>Preset color</b>",
  PEN_SETTINGS_BG_TRANSPARENT_DESC: "Background has color or is transparent",
  PEN_SETTINGS_BG_COLOR: "Background color",
  PEN_SETTINGS_FILL_STYLE: "Fill Style",
  PEN_SETTINGS_FILL_UNSET: "Unset",
  PEN_SETTINGS_FILL_DOTS: "Dots (⚠ VERY SLOW performance on large objects!)",
  PEN_SETTINGS_FILL_ZIGZAG: "Zigzag",
  PEN_SETTINGS_FILL_ZIGZAG_LINE: "Zigzag-line",
  PEN_SETTINGS_FILL_DASHED: "Dashed",
  PEN_SETTINGS_FILL_HACHURE: "Hachure",
  PEN_SETTINGS_FILL_CROSS_HATCH: "Cross-hatch",
  PEN_SETTINGS_FILL_SOLID: "Solid",
  PEN_SETTINGS_SLOPPINESS: "Sloppiness:",
  PEN_SETTINGS_NOT_SET: "Not Set",
  PEN_SETTINGS_SLOPPINESS_ARCHITECT: "Architect",
  PEN_SETTINGS_SLOPPINESS_ARTIST: "Artist",
  PEN_SETTINGS_SLOPPINESS_CARTOONIST: "Cartoonist",
  PEN_SETTINGS_SLOPPINESS_DESC: "Line sloppiness of the shape fill pattern",
  PEN_SETTINGS_STROKE_WIDTH: "Stroke Width",
  PEN_SETTINGS_STROKE_PRESET_UNSET: "---",
  PEN_SETTINGS_STROKE_PRESET_EXTRA_THIN: "Extra thin",
  PEN_SETTINGS_STROKE_PRESET_THIN: "Thin",
  PEN_SETTINGS_STROKE_PRESET_MEDIUM: "Medium",
  PEN_SETTINGS_STROKE_PRESET_BOLD: "Bold",
  PEN_SETTINGS_STROKE_PRESET_EXTRA_BOLD: "Extra bold",
  PEN_SETTINGS_HIGHLIGHTER: "Highlighter pen?",
  PEN_SETTINGS_PRESSURE: "Pressure sensitive pen?",
  PEN_SETTINGS_PRESSURE_DESC:
    "<b>toggle on</b>: pressure sensitive<br><b>toggle off</b>: constant pressure",
  PEN_SETTINGS_OUTLINE_NONE: "No outline",
  PEN_SETTINGS_OUTLINE_WIDTH: "Outline width",
  PEN_SETTINGS_OUTLINE_DESC:
    "If the stroke has an outline, this will mean the stroke color is the outline color, and the background color is the pen stroke's fill color. If the pen does not have an outline then the pen color is the stroke color. The Fill Style setting applies to the fill style of the enclosed shape, not of the line itself. The line can only have solid fill.",
  PEN_SETTINGS_PF_HEADING: "Perfect Freehand settings",
  PEN_SETTINGS_PF_DOCS: `Read the Perfect Freehand documentation following <a href="${URLs.GITHUB_COM_STEVERUIZOK_PERFECT_FREEHAND}" target="_blank">this link</a>.`,
  PEN_SETTINGS_PF_THINNING: "Thinning",
  PEN_SETTINGS_PF_THINNING_DESC: `The effect of pressure on the stroke's size.<br>To create a stroke with a steady line, set the thinning option to 0.<br>To create a stroke that gets thinner with pressure instead of thicker, use a negative number for the thinning option.`,
  PEN_SETTINGS_PF_SMOOTHING: "Smoothing",
  PEN_SETTINGS_PF_SMOOTHING_DESC: "How much to soften the stroke's edges.",
  PEN_SETTINGS_PF_STREAMLINE: "Streamline",
  PEN_SETTINGS_PF_STREAMLINE_DESC: "How much to streamline the stroke.",
  PEN_SETTINGS_EASING: "Easing function",
  PEN_SETTINGS_EASING_DESC: `An easing function for the tapering effect. For more info <a href="${URLs.EASINGS_NET}" target="_blank">click here</a>`,
  PEN_SETTINGS_SIMULATE_PRESSURE: "Simulate Pressure",
  PEN_SETTINGS_SIMULATE_PRESSURE_DESC:
    "Whether to simulate pressure based on velocity.",
  PEN_SETTINGS_SIMULATE_PRESSURE_ALWAYS: "Always",
  PEN_SETTINGS_SIMULATE_PRESSURE_NEVER: "Never",
  PEN_SETTINGS_SIMULATE_PRESSURE_MOUSE: "Yes for mouse, No for pen",
  PEN_SETTINGS_START_HEADING: "Start",
  PEN_SETTINGS_START_DESC: "Tapering options for the start of the line.",
  PEN_SETTINGS_CAP_START: "Cap Start",
  PEN_SETTINGS_CAP_DESC: "Whether to draw a cap",
  PEN_SETTINGS_TAPER: "Taper:",
  PEN_SETTINGS_TAPER_DESC:
    "The distance to taper. If set to true, the taper will be the total length of the stroke.",
  PEN_SETTINGS_END_HEADING: "End",
  PEN_SETTINGS_END_DESC: "Tapering options for the end of the line.",
  PEN_SETTINGS_CAP_END: "Cap End",
  PEN_SETTINGS_SAVE: "Save Changes",
  PEN_SETTINGS_CANCEL: "Cancel",

  //ObserverManager.ts
  ERROR_ADDING_OBSERVER_MANAGER: "Error adding ObserverManager",

  //PublishOutOfDateFiles.ts
  POODF_TITLE: "Out of date SVG files",
  POODF_CHECK_RECURSIVE: "Check recursive",
  POODF_OPEN_SELECTED: "Open selected",

  //ImageCache.ts
  IMAGE_CACHE_INITIALIZED:
    "Excalidraw image cache is initialized - you may now retry opening your damaged drawing.",
};
