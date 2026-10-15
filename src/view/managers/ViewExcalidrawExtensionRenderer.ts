import type React from "react";
import type { ExcalidrawEmbeddableElement } from "@zsviczian/excalidraw/types/element/src/types";
import type { UIAppState } from "@zsviczian/excalidraw/types/excalidraw/types";
import {
  excalidrawSword,
  ICONS,
  LogoWrapper,
  saveIcon,
  SwordColors,
} from "../../constants/actionIcons";
import { URLs } from "../../constants/safeUrls";
import { t } from "../../lang/helpers";
import { log } from "../../utils/debugHelper";
import type ExcalidrawView from "../ExcalidrawView";

/** Runtime dependencies and private view actions used by Excalidraw extensions. */
export interface ViewExcalidrawExtensionRendererDependencies {
  CustomEmbeddable: typeof import("../components/CustomEmbeddable").CustomEmbeddable;
  REGEX_LINK: typeof import("../../shared/ExcalidrawData").REGEX_LINK;
  REG_LINKINDEX_HYPERLINK: typeof import("../../shared/ExcalidrawData").REG_LINKINDEX_HYPERLINK;
  openExternalLink: typeof import("../../utils/excalidrawViewUtils").openExternalLink;
  useDefaultExcalidrawFrame: typeof import("../../utils/customEmbeddableUtils").useDefaultExcalidrawFrame;
  openUIModeSettings: () => void;
  openScriptInstallPrompt: () => void;
  openExportImageDialog: () => void;
}

/**
 * Renders the plugin-specific extension points supplied to Excalidraw.
 *
 * All elements are created with the owning view's package-managed React
 * instance so main-window and popout-window runtimes remain isolated. Runtime
 * dependencies that import the concrete view elsewhere are supplied by the
 * composition root to avoid adding a circular import.
 */
export class ViewExcalidrawExtensionRenderer {
  public constructor(
    private readonly view: ExcalidrawView,
    private readonly dependencies: ViewExcalidrawExtensionRendererDependencies,
  ) {}

  /** Renders the optional rank and resource welcome screen. */
  public renderWelcomeScreen() {
    if (!this.view.plugin.settings.showSplashscreen) {
      return null;
    }
    const React = this.view.packages.react;
    const { WelcomeScreen } = this.view.packages.excalidrawLib;
    const filecount = this.view.app.vault
      .getFiles()
      .filter((file) => this.view.plugin.isExcalidrawFile(file)).length;
    const rank =
      filecount < 200
        ? "Bronze"
        : filecount < 750
          ? "Silver"
          : filecount < 2000
            ? "Gold"
            : "Platinum";
    const nextRankDelta =
      filecount < 200
        ? 200 - filecount
        : filecount < 750
          ? 750 - filecount
          : filecount < 2000
            ? 2000 - filecount
            : 0;
    const { title } = SwordColors[rank];
    return React.createElement(
      WelcomeScreen,
      {},
      React.createElement(
        WelcomeScreen.Center,
        {},
        React.createElement(
          WelcomeScreen.Center.Logo,
          {},
          React.createElement(
            LogoWrapper as React.FC<{ children?: React.ReactNode }>,
            {},
            excalidrawSword(rank),
          ),
        ),
        React.createElement(WelcomeScreen.Center.Heading, {
          color: "var(--color-gray-40)",
          message:
            nextRankDelta > 0
              ? `${rank}: ${nextRankDelta} ${t("WELCOME_RANK_NEXT")}`
              : `${rank}: ${t("WELCOME_RANK_LEGENDARY")}`,
          children: title,
        }),
        React.createElement(
          WelcomeScreen.Center.Heading,
          null,
          t("WELCOME_COMMAND_PALETTE"),
          React.createElement("br"),
          t("WELCOME_OBSIDIAN_MENU"),
          React.createElement("br"),
          t("WELCOME_SCRIPT_LIBRARY"),
          React.createElement("br"),
          t("WELCOME_HELP_MENU"),
        ),
        React.createElement(
          WelcomeScreen.Center.Menu,
          {},
          React.createElement(WelcomeScreen.Center.MenuItemLink, {
            icon: ICONS.Learn,
            href: URLs.COMMUNITY_SKETCH_YOUR_MIND_COM,
            shortcut: null,
            "aria-label": t("WELCOME_SYM_ARIA"),
            children: t("WELCOME_SYM_LINK"),
          }),
          React.createElement(WelcomeScreen.Center.MenuItemLink, {
            icon: ICONS.YouTube,
            href: URLs.WWW_YOUTUBE_COM_VISUALPKM,
            shortcut: null,
            "aria-label": t("WELCOME_YOUTUBE_ARIA"),
            children: t("WELCOME_YOUTUBE_LINK"),
          }),
          React.createElement(WelcomeScreen.Center.MenuItemLink, {
            icon: ICONS.twitter,
            href: URLs.TWITTER_COM_ZSVICZIAN,
            shortcut: null,
            "aria-label": t("WELCOME_TWITTER_ARIA"),
            children: t("WELCOME_TWITTER_LINK"),
          }),
          React.createElement(WelcomeScreen.Center.MenuItemLink, {
            icon: ICONS.heart,
            href: URLs.KO_FI_COM_ZSOLT,
            shortcut: null,
            "aria-label": t("WELCOME_DONATE_ARIA"),
            children: t("WELCOME_DONATE_LINK"),
          }),
        ),
      ),
    );
  }

  /** Renders the plugin-specific items in Excalidraw's main actions menu. */
  public renderCustomActionsMenu() {
    const React = this.view.packages.react;
    const { MainMenu } = this.view.packages.excalidrawLib;

    return React.createElement(
      MainMenu,
      {},
      React.createElement(MainMenu.DefaultItems.ChangeCanvasBackground),
      React.createElement(MainMenu.DefaultItems.Preferences),
      React.createElement(MainMenu.DefaultItems.ToggleTheme),
      React.createElement(MainMenu.Separator),
      React.createElement(MainMenu.Item, {
        icon: ICONS.tray,
        "aria-label": t("ARIA_LABEL_TRAY_MODE"),
        onSelect: () => this.dependencies.openUIModeSettings(),
        children: t("TRAY_TRAY_MODE"),
      }),
      React.createElement(MainMenu.Item, {
        icon: saveIcon(false),
        "aria-label": t("FORCE_SAVE"),
        onSelect: () => {
          void this.view.forceSave();
        },
        children: t("TRAY_SAVE"),
      }),
      React.createElement(MainMenu.Item, {
        icon: ICONS.scriptEngine,
        "aria-label": t("TRAY_SCRIPT_LIBRARY_ARIA"),
        onSelect: () => this.dependencies.openScriptInstallPrompt(),
        children: t("TRAY_SCRIPT_LIBRARY"),
      }),
      React.createElement(MainMenu.Item, {
        icon: ICONS.ExportImage,
        "aria-label": t("TRAY_EXPORT_ARIA"),
        onSelect: () => this.dependencies.openExportImageDialog(),
        children: t("TRAY_EXPORT"),
      }),
      React.createElement(MainMenu.Item, {
        icon: ICONS.switchToMarkdown,
        "aria-label": t("TRAY_SWITCH_TO_MD_ARIA"),
        onSelect: () => {
          void this.view.openAsMarkdown();
        },
        children: t("TRAY_SWITCH_TO_MD"),
      }),
      React.createElement(MainMenu.Separator),
      React.createElement(MainMenu.Item, {
        icon: ICONS.Learn,
        "aria-label": t("LINKS_JOIN_SYM_ARIA"),
        onSelect: () =>
          this.dependencies.openExternalLink(
            URLs.COMMUNITY_SKETCH_YOUR_MIND_COM,
            this.view.app,
          ),
        children: t("LINKS_JOIN_SYM"),
      }),
      React.createElement(MainMenu.DefaultItems.Help),
      React.createElement(MainMenu.DefaultItems.ClearCanvas),
    );
  }

  /** Renders Obsidian links and custom content as embeddables. */
  public renderEmbeddable(
    element: ExcalidrawEmbeddableElement,
    appState: UIAppState,
  ) {
    const React = this.view.packages.react;
    try {
      const useExcalidrawFrame =
        this.dependencies.useDefaultExcalidrawFrame(element);

      if (
        !this.view.file ||
        !element ||
        !element.link ||
        element.link.length === 0 ||
        useExcalidrawFrame
      ) {
        return null;
      }

      // Live web/iframe embeds were removed in the Oh My Excalidraw trim:
      // hyperlinks fall through to the default static frame rendering.
      if (
        element.link.match(this.dependencies.REG_LINKINDEX_HYPERLINK) ||
        element.link.startsWith("data:")
      ) {
        return null;
      }

      const res = this.dependencies.REGEX_LINK.getRes(element.link).next();
      if (!res || (!res.value && res.done)) {
        return null;
      }

      const linkText = this.dependencies.REGEX_LINK.getLink(res);

      if (linkText.match(this.dependencies.REG_LINKINDEX_HYPERLINK)) {
        return null;
      }

      return React.createElement(this.dependencies.CustomEmbeddable, {
        element,
        view: this.view,
        appState,
        linkText,
      });
    } catch (error) {
      console.error(
        "unexpected error in renderEmbeddable",
        this.renderEmbeddable.bind(this),
        error,
      );
      return null;
    }
  }
}
