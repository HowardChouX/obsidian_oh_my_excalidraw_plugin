import {
  TFile,
  App,
  MarkdownView,
  normalizePath,
  Menu,
  MenuItem,
  Notice,
  Command,
  EventRef,
  FileView,
  View,
} from "obsidian";
import {
  ICON_NAME,
  IMAGE_TYPES,
  DEVICE,
  CaptureUpdateAction,
  sceneCoordsToViewportCoords,
  fileid,
} from "../../constants/constants";
import ExcalidrawView from "../../view/ExcalidrawView";
import { TextMode } from "../../shared/TextMode";
import { REGEX_LINK } from "../../shared/ExcalidrawData";
import type { ExcalidrawSettings } from "../settingsDefaults";
import {
  openDialogAction,
  OpenFileDialog,
} from "../../shared/Dialogs/OpenDrawing";
import { InsertLinkDialog } from "../../shared/Dialogs/InsertLinkDialog";
import { InsertCommandDialog } from "../../shared/Dialogs/InsertCommandDialog";
import { InsertImageDialog } from "../../shared/Dialogs/InsertImageDialog";
import { ImportSVGDialog } from "../../shared/Dialogs/ImportSVGDialog";
import { InsertMDDialog } from "../../shared/Dialogs/InsertMDDialog";
import { ExcalidrawAutomate } from "../../shared/ExcalidrawAutomate";
import { templatePromt } from "../../shared/Dialogs/Prompt";
import { t } from "../../lang/helpers";
import {
  createOrOverwriteFile,
  getAliasWithSize,
  getDrawingFilename,
  getEmbedFilename,
  getIMGFilename,
  getLink,
  getListOfTemplateFiles,
  getURLImageExtension,
} from "../../utils/fileUtils";
import { setLeftHandedMode, getImageSize } from "../../utils/utils";
import {
  extractSVGPNGFileName,
  getActivePDFPageNumberFromPDFView,
  getExcalidrawViews,
  isObsidianThemeDark,
  mergeMarkdownFiles,
  setExcalidrawView,
} from "../../utils/obsidianUtils";
import { getAttachmentsFolderAndFilePath } from "../../utils/pathUtils";
import {
  ExcalidrawElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawImageElement,
  FileId,
} from "@zsviczian/excalidraw/types/element/src/types";
import { ReleaseNotes } from "../../shared/Dialogs/ReleaseNotes";
import {
  emulateCTRLClickForLinks,
  linkClickModifierType,
} from "../../utils/modifierkeyHelper";
import { ExportDialog } from "../../shared/Dialogs/ExportDialog";
import { UniversalInsertFileModal } from "../../shared/Dialogs/UniversalInsertFileModal";
import { PublishOutOfDateFilesDialog } from "../../shared/Dialogs/PublishOutOfDateFiles";
import { EmbeddableSettings } from "../../shared/Dialogs/EmbeddableSettings";
import { processLinkText } from "../../utils/customEmbeddableUtils";
import { getEA } from "src/core";
import { Mutable } from "@zsviczian/excalidraw/types/common/src/utility-types";
import { showFrameSettings } from "../../shared/Dialogs/FrameSettings";
import { insertImageToView } from "../../utils/excalidrawViewUtils";
import type ExcalidrawPlugin from "src/core/main";
import { UIModeSettings } from "src/shared/Dialogs/UIModeSettings";
import { PaneTarget } from "src/types/utilTypes";
import { decompress } from "src/utils/sceneDataUtils";

declare const PLUGIN_VERSION: string;

export class CommandManager {
  private app: App;
  private plugin: ExcalidrawPlugin;
  private openDialog: OpenFileDialog;
  public insertLinkDialog: InsertLinkDialog;
  public insertCommandDialog: InsertCommandDialog;
  public insertImageDialog: InsertImageDialog;
  public importSVGDialog: ImportSVGDialog;
  public insertMDDialog: InsertMDDialog;
  public forceSaveCommand: Command;

  get settings(): ExcalidrawSettings {
    return this.plugin.settings;
  }

  get ea(): ExcalidrawAutomate {
    return this.plugin.ea;
  }

  private isExcalidrawFile(file: TFile): boolean {
    return this.plugin.isExcalidrawFile(file);
  }

  constructor(plugin: ExcalidrawPlugin) {
    this.app = plugin.app;
    this.plugin = plugin;
  }

  private setAllExcalidrawViewsToViewMode(enabled: boolean) {
    getExcalidrawViews(this.app, true).forEach((view) => {
      view.updateScene({
        appState: {
          viewModeEnabled: enabled,
          zenModeEnabled: enabled
            ? false
            : view.excalidrawAPI?.getAppState()?.zenModeEnabled,
        },
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      view.toolsPanelRef?.current?.setExcalidrawViewMode(enabled);
    });
  }

  public initialize() {
    try {
      this.registerCommands();
    } catch (e) {
      new Notice("Error registering commands", 6000);
      console.error("Error registering commands", e);
    }
    this.plugin.logStartupEvent("Commands registered");
  }

  destroy() {
    this.openDialog.destroy();
    this.openDialog = null;
    this.insertLinkDialog.destroy();
    this.insertLinkDialog = null;
    this.insertCommandDialog.destroy();
    this.insertCommandDialog = null;
    this.importSVGDialog.destroy();
    this.importSVGDialog = null;
    this.insertImageDialog.destroy();
    this.insertImageDialog = null;
    this.insertMDDialog.destroy();
    this.insertMDDialog = null;
    this.forceSaveCommand = null;
  }

  private registerEvent(event: EventRef): void {
    this.plugin.registerEvent(event);
  }

  private addCommand(command: Command): Command {
    return this.plugin.addCommand(command);
  }

  private registerCommands() {
    this.openDialog = new OpenFileDialog(this.app, this.plugin);
    this.insertLinkDialog = new InsertLinkDialog(this.plugin);
    this.insertCommandDialog = new InsertCommandDialog(this.app);
    this.insertImageDialog = new InsertImageDialog(this.plugin);
    this.importSVGDialog = new ImportSVGDialog(this.plugin);
    this.insertMDDialog = new InsertMDDialog(this.plugin);

    const createNewAction = (e: MouseEvent | KeyboardEvent, file: TFile) => {
      let folderpath = file.path;
      if (file instanceof TFile) {
        folderpath = normalizePath(
          file.path.substring(0, file.path.lastIndexOf(file.name)),
        );
      }
      void this.plugin.createAndOpenDrawing(
        getDrawingFilename(this.settings),
        linkClickModifierType(emulateCTRLClickForLinks(e)),
        folderpath,
      );
    };

    const fileMenuHandlerCreateNew = (menu: Menu, file: TFile) => {
      menu.addItem((item: MenuItem) => {
        item
          .setSection("action-primary")
          .setTitle(t("CREATE_NEW"))
          .setIcon(ICON_NAME)
          .onClick((e) => {
            createNewAction(e, file);
          });
      });
    };

    this.registerEvent(
      this.app.workspace.on("file-menu", fileMenuHandlerCreateNew),
    );

    const fileMenuHandlerConvertKeepExtension = (menu: Menu, file: TFile) => {
      if (file instanceof TFile && file.extension == "excalidraw") {
        menu.addItem((item: MenuItem) => {
          item.setTitle(t("CONVERT_FILE_KEEP_EXT")).onClick(() => {
            void this.plugin.convertSingleExcalidrawToMD(file, false, false);
          });
        });
      }
    };

    this.registerEvent(
      this.app.workspace.on("file-menu", fileMenuHandlerConvertKeepExtension),
    );

    const fileMenuHandlerConvertReplaceExtension = (
      menu: Menu,
      file: TFile,
    ) => {
      if (file instanceof TFile && file.extension == "excalidraw") {
        menu.addItem((item: MenuItem) => {
          item.setTitle(t("CONVERT_FILE_REPLACE_EXT")).onClick(() => {
            void this.plugin.convertSingleExcalidrawToMD(file, true, true);
          });
        });
      }
    };

    this.registerEvent(
      this.app.workspace.on(
        "file-menu",
        fileMenuHandlerConvertReplaceExtension,
      ),
    );

    this.addCommand({
      id: "excalidraw-unzip-file",
      name: t("UNZIP_CURRENT_FILE"),
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        const fileIsExcalidraw = this.isExcalidrawFile(activeFile);
        if (!fileIsExcalidraw) {
          return false;
        }

        const excalidrawView =
          this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (excalidrawView) {
          return false;
        }

        if (checking) {
          return true;
        }

        void (async () => {
          const data = await this.app.vault.read(activeFile);
          const parts = data.split("\n## Drawing\n```compressed-json\n");
          if (parts.length !== 2) {
            return;
          }
          const header = `${parts[0]}\n## Drawing\n\`\`\`json\n`;
          const compressed = parts[1].split("\n```\n%%");
          if (compressed.length !== 2) {
            return;
          }
          const decompressed = decompress(compressed[0]);
          if (!decompressed) {
            new Notice(
              "The compressed string is corrupted. Unable to decompress data.",
            );
            return;
          }
          await createOrOverwriteFile(
            this.app,
            activeFile.path,
            `${header + decompressed}\n\`\`\`\n%%${compressed[1]}`,
          );
        })();
      },
    });

    this.addCommand({
      id: "excalidraw-publish-svg-check",
      name: t("PUBLISH_SVG_CHECK"),
      checkCallback: (checking: boolean) => {
        const publish = this.app.internalPlugins.plugins.publish?.instance;
        if (!publish) {
          return false;
        }
        if (checking) {
          return true;
        }
        new PublishOutOfDateFilesDialog(this.plugin).open();
      },
    });

    this.addCommand({
      id: "excalidraw-embeddable-poroperties",
      name: t("EMBEDDABLE_PROPERTIES"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        if (!view.excalidrawAPI) {
          return false;
        }
        const els = view
          .getViewSelectedElements()
          .filter((el) => el.type === "embeddable");
        if (els.length !== 1) {
          if (checking) {
            return false;
          }
          new Notice("Select a single embeddable element and try again");
          return false;
        }
        if (checking) {
          return true;
        }
        const getFile = (el: ExcalidrawEmbeddableElement): TFile => {
          const res = REGEX_LINK.getRes(el.link).next();
          if (!res || (!res.value && res.done)) {
            return null;
          }
          const link = REGEX_LINK.getLink(res);
          const { file } = processLinkText(link, view);
          return file;
        };
        new EmbeddableSettings(
          view.plugin,
          view,
          getFile(els[0]),
          els[0],
        ).open();
      },
    });

    this.addCommand({
      id: "excalidraw-embeddables-relative-scale",
      name: t("EMBEDDABLE_RELATIVE_ZOOM"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        if (!view.excalidrawAPI) {
          return false;
        }
        const els = view
          .getViewSelectedElements()
          .filter((el) => el.type === "embeddable");
        if (els.length === 0) {
          if (checking) {
            return false;
          }
          new Notice("Select at least one embeddable element and try again");
          return false;
        }
        if (checking) {
          return true;
        }
        const ea = getEA(view);
        const api = ea.getExcalidrawAPI();
        ea.copyViewElementsToEAforEditing(els);
        const scale = 1 / api.getAppState().zoom.value;
        ea.getElements().forEach((el: Mutable<ExcalidrawEmbeddableElement>) => {
          el.scale = [scale, scale];
        });
        void ea.addElementsToView().then(() => ea.destroy());
      },
    });

    this.addCommand({
      id: "excalidraw-disable-autosave",
      name: t("TEMPORARY_DISABLE_AUTOSAVE"),
      checkCallback: (checking) => {
        if (!this.plugin.autosaveEnabled) {
          return false;
        } //already disabled
        if (checking) {
          return true;
        }
        this.plugin.autosaveEnabled = false;
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-enable-autosave",
      name: t("TEMPORARY_ENABLE_AUTOSAVE"),
      checkCallback: (checking) => {
        if (this.plugin.autosaveEnabled) {
          return false;
        } //already enabled
        if (checking) {
          return true;
        }
        this.plugin.autosaveEnabled = true;
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-toggle-session-view-mode",
      name: t("TEMPORARY_TOGGLE_VIEW_MODE_FOR_ALL_DRAWINGS"),
      checkCallback: (checking) => {
        if (checking) {
          return true;
        }
        this.plugin.forceExcalidrawViewMode =
          !this.plugin.forceExcalidrawViewMode;
        this.setAllExcalidrawViewsToViewMode(
          this.plugin.forceExcalidrawViewMode,
        );
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-open",
      name: t("OPEN_EXISTING_NEW_PANE"),
      callback: () => {
        this.openDialog.start(openDialogAction.openFile, true);
      },
    });

    this.addCommand({
      id: "excalidraw-open-on-current",
      name: t("OPEN_EXISTING_ACTIVE_PANE"),
      callback: () => {
        this.openDialog.start(openDialogAction.openFile, false);
      },
    });

    this.addCommand({
      id: "excalidraw-insert-transclusion",
      name: t("TRANSCLUDE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        this.openDialog.start(openDialogAction.insertLinkToDrawing, false);
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-insert-last-active-transclusion",
      name: t("TRANSCLUDE_MOST_RECENT"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(MarkdownView)) &&
            this.plugin.lastActiveExcalidrawFilePath !== null
          );
        }
        const file = this.app.vault.getFileByPath(
          this.plugin.lastActiveExcalidrawFilePath,
        );
        if (!(file instanceof TFile)) {
          return false;
        }
        void this.plugin.embedDrawing(file);
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate",
      name: t("NEW_IN_NEW_PANE"),
      callback: () => {
        void this.plugin.createAndOpenDrawing(
          getDrawingFilename(this.settings),
          "new-pane",
        );
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-newtab",
      name: t("NEW_IN_NEW_TAB"),
      callback: () => {
        void this.plugin.createAndOpenDrawing(
          getDrawingFilename(this.settings),
          "new-tab",
        );
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-on-current",
      name: t("NEW_IN_ACTIVE_PANE"),
      callback: () => {
        void this.plugin.createAndOpenDrawing(
          getDrawingFilename(this.settings),
          "active-pane",
        );
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-popout",
      name: t("NEW_IN_POPOUT_WINDOW"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return !DEVICE.isMobile;
        }
        void this.plugin.createAndOpenDrawing(
          getDrawingFilename(this.settings),
          "popout-window",
        );
      },
    });

    const insertDrawingToDoc = async (location: PaneTarget) => {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        return;
      }
      const filename = getEmbedFilename(
        activeView.file.basename,
        this.settings,
      );
      const folder = this.settings.embedUseExcalidrawFolder
        ? null
        : (
            await getAttachmentsFolderAndFilePath(
              this.app,
              activeView.file.path,
              filename,
            )
          ).folder;
      const file = await this.plugin.createDrawing(filename, folder);
      await this.plugin.embedDrawing(file);
      this.plugin.openDrawing(file, location, true, undefined, true);
    };

    this.addCommand({
      id: "excalidraw-autocreate-and-embed",
      name: t("NEW_IN_NEW_PANE_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        void insertDrawingToDoc("new-pane");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-new-tab",
      name: t("NEW_IN_NEW_TAB_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        void insertDrawingToDoc("new-tab");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-on-current",
      name: t("NEW_IN_ACTIVE_PANE_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        void insertDrawingToDoc("active-pane");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-popout",
      name: t("NEW_IN_POPOUT_WINDOW_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            !DEVICE.isMobile &&
            Boolean(this.app.workspace.getActiveViewOfType(MarkdownView))
          );
        }
        void insertDrawingToDoc("popout-window");
        return true;
      },
    });

    this.addCommand({
      id: "fullscreen",
      name: t("TOGGLE_FULLSCREEN"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          if (view.isFullscreen()) {
            view.exitFullscreen();
          } else {
            view.gotoFullscreen();
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-binding",
      name: t("TOGGLE_DISABLEBINDING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleDisableBinding();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-framerendering",
      name: t("TOGGLE_FRAME_RENDERING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleFrameRendering();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "frame-settings",
      name: t("FRAME_SETTINGS_TITLE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          showFrameSettings(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "copy-link-to-drawing",
      name: t("COPY_DRAWING_LINK"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          void navigator.clipboard.writeText(`![[${view.file.path}]]`);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-frameclipping",
      name: t("TOGGLE_FRAME_CLIPPING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleFrameClipping();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "export-image",
      name: t("EXPORT_IMAGE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          if (!view.exportDialog) {
            view.exportDialog = new ExportDialog(this.plugin, view, view.file);
          }
          view.exportDialog.open();
          return true;
        }
        return false;
      },
    });

    this.forceSaveCommand = this.addCommand({
      id: "save",
      name: t("FORCE_SAVE"),
      checkCallback: (checking: boolean) =>
        this.plugin.forceSaveActiveView(checking),
    });

    const id = this.forceSaveCommand.id;
    this.app.hotkeyManager.addDefaultHotkeys(id, [{ modifiers: ["Ctrl"], key: "s" }]); //See also Popscope
    this.forceSaveCommand.hotkeys = [{ modifiers: ["Ctrl"], key: "s" }];

    //removing raw mode. Not required. I never use it. Raw mode can still be enabled
    //via document properties. Only showing command palette action if raw mode is enabled
    this.addCommand({
      id: "toggle-lock",
      name: t("TOGGLE_LOCK"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (checking) {
          if (view) {
            return !view.compatibilityMode && view.textMode === TextMode.raw;
          }
          return false;
        }
        if (view && !view.compatibilityMode) {
          void view.changeTextMode(
            view.textMode === TextMode.parsed ? TextMode.raw : TextMode.parsed,
          );
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "delete-file",
      name: t("DELETE_FILE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.ea.reset();
          this.ea.setView(view);
          const el = this.ea.getViewSelectedElement();
          if (el.type !== "image") {
            new Notice(t("DELETE_IMAGE_NOTICE"), 4000);
            return true;
          }
          const file = this.ea.getViewFileForImageElement(el);
          if (!file) {
            new Notice(t("DELETE_IMAGE_NOTICE"), 4000);
            return true;
          }
          void this.app.fileManager.trashFile(file);
          this.ea.deleteViewElements([el]);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "convert-text2MD",
      name: t("CONVERT_TO_MARKDOWN"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        const selectedTextElements = view
          .getViewSelectedElements()
          .filter((el) => el.type === "text");
        if (selectedTextElements.length !== 1) {
          return false;
        }
        const selectedTextElement = selectedTextElements[0];
        const containerElement = (
          view.getViewElements() as ExcalidrawElement[]
        ).find((el) => el.id === selectedTextElement.containerId);
        if (containerElement && containerElement.type === "arrow") {
          return false;
        }
        if (checking) {
          return true;
        }
        view.convertTextElementToMarkdown(
          selectedTextElement,
          containerElement,
        );
      },
    });

    this.addCommand({
      id: "insert-link",
      name: t("INSERT_LINK"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertLinkDialog.start(
            view.file.path,
            (markdownlink: string, path: string, alias: string) => {
              void view.addLink(markdownlink, path, alias);
            },
          );
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-cmd",
      name: t("INSERT_COMMAND"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertCommandDialog.start(
            (text: string, fontFamily?: 1 | 2 | 3 | 4, save?: boolean) => {
              void view.addText(text, fontFamily, save);
            },
          );
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element",
      name: t("INSERT_LINK_TO_ELEMENT_NORMAL"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-group",
      name: t("INSERT_LINK_TO_ELEMENT_GROUP"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("group=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-frame",
      name: t("INSERT_LINK_TO_ELEMENT_FRAME"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("frame=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-frame-clipped",
      name: t("INSERT_LINK_TO_ELEMENT_FRAME_CLIPPED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("clippedframe=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-area",
      name: t("INSERT_LINK_TO_ELEMENT_AREA"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("area=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "toggle-lefthanded-mode",
      name: t("TOGGLE_LEFTHANDED_MODE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          if (DEVICE.isMobile) {
            return false;
          }
          if (this.app.workspace.getActiveViewOfType(ExcalidrawView)) {
            const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
            const api = view?.excalidrawAPI;
            if (!api || !api.isTrayModeEnabled()) {
              return false;
            }
            return true;
          }
          return false;
        }
        void (async () => {
          const isLeftHanded = this.settings.isLeftHanded;
          await this.plugin.loadSettings();
          this.settings.isLeftHanded = !isLeftHanded;
          await this.plugin.saveSettings();
          setLeftHandedMode(!isLeftHanded);
        })();
        return true;
      },
    });

    this.addCommand({
      id: "toggle-enable-context-menu",
      name: t("TOGGLE_ENABLE_CONTEXT_MENU"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        view.toggleEnableContextMenu();
        return true;
      },
    });

    this.addCommand({
      id: "reset-image-to-100",
      name: t("RESET_IMG_TO_100"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        if (!view.excalidrawAPI) {
          return false;
        }
        const els = view
          .getViewSelectedElements()
          .filter((el) => el.type === "image");
        if (els.length !== 1) {
          if (checking) {
            return false;
          }
          new Notice("Select a single image element and try again");
          return false;
        }
        if (checking) {
          return true;
        }

        void (async () => {
          const el = els[0];
          const ef = view.excalidrawData.getFile(el.fileId);
          if (!ef) {
            await view.forceSave();
            new Notice("Select a single image element and try again");
            return false;
          }

          const ea = new ExcalidrawAutomate(this.plugin, view);
          const size = await ea.getOriginalImageSize(el);
          if (size) {
            ea.copyViewElementsToEAforEditing(els);
            const eaEl = ea.getElement(
              el.id,
            ) as Mutable<ExcalidrawImageElement>;
            if (eaEl.crop) {
              eaEl.width = eaEl.crop.width;
              eaEl.height = eaEl.crop.height;
            } else {
              eaEl.width = size.width;
              eaEl.height = size.height;
            }
            await ea.addElementsToView(false, false, false);
          }
          ea.destroy();
        })();
      },
    });

    this.addCommand({
      id: "open-link-props",
      name: t("OPEN_LINK_PROPS"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        if (!view.excalidrawAPI) {
          return false;
        }
        const els = view
          .getViewSelectedElements()
          .filter((el) => el.type === "image");
        if (els.length !== 1) {
          if (checking) {
            return false;
          }
          new Notice("Select a single image element and try again");
          return false;
        }
        if (checking) {
          return true;
        }

        const el = els[0];
        const ef = view.excalidrawData.getFile(el.fileId);
        if (!ef) {
          void view.forceSave();
          new Notice("Please try again.");
          return false;
        }

        if (ef) {
          void view.openEmbeddedLinkEditor(el.id);
        }
      },
    });

    this.addCommand({
      id: "convert-card-to-file",
      name: t("CONVERT_CARD_TO_FILE"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) {
          return false;
        }
        if (!view.excalidrawAPI) {
          return false;
        }
        const els = view
          .getViewSelectedElements()
          .filter((el) => el.type === "embeddable");
        if (els.length !== 1) {
          if (checking) {
            return false;
          }
          new Notice("Select a single back-of-the-note card and try again");
          return false;
        }
        const embeddableData = view.getEmbeddableLeafElementById(els[0].id);
        const child = embeddableData?.node?.child;
        if (!child || child.file !== view.file) {
          if (checking) {
            return false;
          }
          new Notice("The selected embeddable is not a back-of-the-note card.");
          return false;
        }
        if (checking) {
          return true;
        }
        void view.moveBackOfTheNoteCardToFile();
      },
    });

    this.addCommand({
      id: "refresh-scene-images",
      name: t("REFRESH_SCENE_IMAGES"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        const images = view
          ?.getViewElements()
          .filter((element) => element.type === "image");
        if (!view?.excalidrawAPI || !images?.length) {
          return false;
        }
        if (!checking) {
          const selected = view.getViewSelectedElements();
          const targets: ExcalidrawImageElement[] =
            selected.length === 1 && selected[0].type === "image"
              ? [selected[0]]
              : images;
          const fileIDs = new Set(
            targets.map((element) => element.fileId),
          );
          void view.loadSceneFiles(false, fileIDs, undefined, fileIDs);
        }
        return true;
      },
    });

    this.addCommand({
      id: "insert-image",
      name: t("INSERT_IMAGE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertImageDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "import-svg",
      name: t("IMPORT_SVG"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.importSVGDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "release-notes",
      name: t("READ_RELEASE_NOTES"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        new ReleaseNotes(this.app, this.plugin, PLUGIN_VERSION).open();
        return true;
      },
    });

    this.addCommand({
      id: "tray-mode",
      name: t("UI_MODE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
          if (!view || !view.excalidrawAPI) {
            return false;
          }
          const st = view.excalidrawAPI.getAppState();
          if (st.zenModeEnabled || st.viewModeEnabled) {
            return false;
          }
          return true;
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view && view.excalidrawAPI) {
          const uiModeSettings = new UIModeSettings(this.plugin);
          uiModeSettings.open();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-md",
      name: t("INSERT_MD"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertMDDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "universal-add-file",
      name: t("UNIVERSAL_ADD_FILE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          const insertFileModal = new UniversalInsertFileModal(
            this.plugin,
            view,
          );
          insertFileModal.open();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "universal-card",
      name: t("INSERT_CARD"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(
            this.app.workspace.getActiveViewOfType(ExcalidrawView),
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          void view.insertBackOfTheNoteCard();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "toggle-excalidraw-view",
      name: t("TOGGLE_MODE"),
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        const fileIsExcalidraw = this.isExcalidrawFile(activeFile);

        if (checking) {
          if (this.app.workspace.getActiveViewOfType(ExcalidrawView)) {
            return !this.app.workspace.getActiveViewOfType(ExcalidrawView)
              .compatibilityMode;
          }
          return fileIsExcalidraw;
        }

        const excalidrawView =
          this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (excalidrawView) {
          void this.plugin.ea.toggleViewMode(excalidrawView);
          return;
        }

        const markdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView && fileIsExcalidraw) {
          void this.plugin.ea.toggleViewMode(markdownView);
        }
      },
    });

    this.addCommand({
      id: "convert-to-excalidraw",
      name: t("CONVERT_NOTE_TO_EXCALIDRAW"),
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        if (!activeFile || !activeView) {
          return false;
        }

        if (this.isExcalidrawFile(activeFile)) {
          return false;
        }

        if (checking) {
          return true;
        }

        void (async () => {
          await activeView.save();
          const template = await this.plugin.getBlankDrawing();
          const target = await this.app.vault.read(activeFile);
          const mergedTarget = mergeMarkdownFiles(template, target);
          await createOrOverwriteFile(this.app, activeFile.path, mergedTarget);
          await setExcalidrawView(activeView.leaf);
        })();
      },
    });

    this.addCommand({
      id: "convert-excalidraw",
      name: t("CONVERT_EXCALIDRAW"),
      checkCallback: (checking) => {
        if (checking) {
          const files = this.app.vault
            .getFiles()
            .filter((f) => f.extension == "excalidraw");
          return files.length > 0;
        }
        void this.plugin.convertExcalidrawToMD();
        return true;
      },
    });
  }
}
