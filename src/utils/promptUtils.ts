/**
 * Shared prompt/suggester helpers that used to live on the removed
 * script engine's `ScriptEngine` class. Core (non-script) features still use
 * them, so they are kept here as thin wrappers over the generic dialogs.
 */
import type { App } from "obsidian";
import type { Instruction } from "obsidian";
import type ExcalidrawView from "src/view/ExcalidrawView";
import type ExcalidrawPlugin from "src/core/main";
import { GenericInputPrompt, GenericSuggester } from "src/shared/Dialogs/Prompt";
import type { ButtonDefinition } from "src/types/promptTypes";
import { errorlog } from "./coreUtils";

export const inputPrompt = async (
  view: ExcalidrawView,
  plugin: ExcalidrawPlugin,
  app: App,
  header: string,
  placeholder?: string,
  value?: string,
  buttons?: ButtonDefinition[],
  lines?: number,
  displayEditorButtons?: boolean,
  customComponents?: (container: HTMLElement) => void,
  blockPointerInputOutsideModal?: boolean,
  controlsOnTop?: boolean,
  draggable: boolean = false,
): Promise<string | undefined> => {
  try {
    return await GenericInputPrompt.Prompt(
      view,
      plugin,
      app,
      header,
      placeholder,
      value,
      buttons,
      lines,
      displayEditorButtons,
      customComponents,
      blockPointerInputOutsideModal,
      controlsOnTop,
      draggable,
    );
  } catch {
    return undefined;
  }
};

export const suggester = async <T>(
  app: App,
  displayItems: string[],
  items: T[],
  hint?: string,
  instructions?: Instruction[],
): Promise<T | undefined> => {
  try {
    return await GenericSuggester.Suggest(
      app,
      displayItems,
      items,
      hint,
      instructions,
    );
  } catch (error: unknown) {
    errorlog({
      message: "unexpected error in suggester",
      where: "promptUtils.suggester",
      error,
    });
    return undefined;
  }
};
