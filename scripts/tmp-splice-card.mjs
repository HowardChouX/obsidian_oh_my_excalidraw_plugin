// One-off splice: remove the back-of-the-note card feature and the leftover
// insert-md (markdown-as-image) command.
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);
const drop = (s, from) => {
  if (!s.includes(from)) throw new Error("not found: " + from.slice(0, 70));
  return s.replace(from, "");
};
const cutMethod = (s, signaturePrefix, closing = "\n  }\n") => {
  const start = s.indexOf(signaturePrefix);
  if (start === -1) throw new Error("method not found: " + signaturePrefix);
  const end = s.indexOf(closing, start) + closing.length;
  return s.slice(0, start) + s.slice(end);
};

// ---------- ExcalidrawView ----------
{
  const p = "src/view/ExcalidrawView.ts";
  let s = read(p);

  drop(s, "");
  s = drop(s, "  addBackOfTheNoteCard,\n");
  s = drop(s, "  insertBackOfTheNoteContent,\n");
  s = drop(s, 'import { SelectCard } from "../shared/Dialogs/SelectCard";\n');

  // blockref link resolution: drop the back-of-note check
  s = drop(
    s,
    `            if (
              !this.getScene()?.elements.find(
                (el: ExcalidrawElement) => el.id === filenameParts.blockref,
              )
            ) {
              const cleanQuery = cleanSectionHeading(
                filenameParts.blockref,
              ).replaceAll(" ", "");
              const blocks = await this.getBackOfTheNoteBlocks();
              if (blocks.includes(cleanQuery)) {
                void this.setMarkdownView(state);
                return;
              }
            }
`,
  );

  // sectionref link resolution simplify
  s = drop(
    s,
    `            const cleanQuery = cleanSectionHeading(query[0]);
            const sections = await this.getBackOfTheNoteSections();
            if (sections.includes(cleanQuery) || this.data.includes(query[0])) {
              void this.setMarkdownView(state);
            }
`,
  );
  s = s.replace(
    `            if (
              !this.zoomToElementId(
                filenameParts.blockref,
                filenameParts.hasGroupref,
              )
            ) {`,
    `            if (
              !this.zoomToElementId(
                filenameParts.blockref,
                filenameParts.hasGroupref,
              )
            ) {`,
  );

  // paste codeblock branch
  s = drop(
    s,
    `      if (isCodeblock) {
        const clipboardText = data.text;
        window.setTimeout(() => {
          void this.pasteCodeBlock(clipboardText);
        });
        return false;
      }

`,
  );
  // 移除 isCodeblock 计算
  s = drop(
    s,
    `      const isCodeblock = Boolean(
        data.text
          .replaceAll("\\r\\n", "\\n")
          .replaceAll("\\r", "\\n")
          .match(/^\`{3}[^\\n]*\\n.+\\n\`{3}\\s*$/ms),
      );
`,
  );

  // 方法：pasteCodeBlock / insertBackOfTheNoteCard / moveBackOfTheNoteCardToFile /
  //      getBackOfTheNoteSections / getBackOfTheNoteBlocks
  for (const sig of [
    "  public async pasteCodeBlock(data: string) {",
    "  public async insertBackOfTheNoteCard(center: boolean = false) {",
    "  public async moveBackOfTheNoteCardToFile(id?: string) {",
    "  public async getBackOfTheNoteSections() {",
    "  private async getBackOfTheNoteBlocks() {",
  ]) {
    s = cutMethod(s, sig);
    console.log("view method removed:", sig.trim());
  }

  // context menu：CONVERT_CARD_TO_FILE 块 + INSERT_CARD 项
  s = drop(
    s,
    `      if (
        this.getViewSelectedElements().filter((el) => el.type === "embeddable")
          .length === 1
      ) {
        const embeddableData = this.getEmbeddableLeafElementById(
          this.getViewSelectedElements().find((el) => el.type === "embeddable")
            .id,
        );
        if (embeddableData?.node?.child?.file === this.file) {
          contextMenuActions.push([
            renderContextMenuAction(
              React,
              t("CONVERT_CARD_TO_FILE"),
              () => {
                void this.moveBackOfTheNoteCardToFile();
              },
              onClose,
              "convertCardToFile",
            ),
          ]);
        }
      }

`,
  );
  s = drop(
    s,
    `      contextMenuActions.push([
        renderContextMenuAction(
          React,
          t("INSERT_CARD"),
          () => {
            void this.insertBackOfTheNoteCard();
          },
          onClose,
          "insertCard",
        ),
      ]);
`,
  );

  write(p, s);
  console.log("ExcalidrawView done");
}

// ---------- excalidrawViewUtils ----------
{
  const p = "src/utils/excalidrawViewUtils.ts";
  let s = read(p);
  s = cutMethod(s, "export async function addBackOfTheNoteCard(");
  s = cutMethod(s, "export function insertBackOfTheNoteContent(");
  write(p, s);
  console.log("excalidrawViewUtils done");
}

// ---------- EA ----------
{
  const p = "src/shared/ExcalidrawAutomate.ts";
  let s = read(p);
  s = drop(s, "  addBackOfTheNoteCard,\n");
  s = cutMethod(s, "  async addBackOfTheNoteCardToView(");
  write(p, s);
  console.log("EA done");
}

// ---------- CommandManager ----------
{
  const p = "src/core/managers/CommandManager.ts";
  let s = read(p);
  const ids = ["insert-md", "universal-card", "convert-card-to-file"];
  for (const id of ids) {
    let idx = s.indexOf(`id: "${id}"`);
    if (idx === -1) {
      console.log("already absent:", id);
      continue;
    }
    const start = s.lastIndexOf("\n    this.addCommand({", idx);
    const next = s.indexOf("\n    this.addCommand({", idx);
    if (start === -1 || next === -1) throw new Error("block not found: " + id);
    s = s.slice(0, start) + s.slice(next);
    console.log("removed command:", id);
  }
  s = drop(s, 'import { InsertMDDialog } from "../../shared/Dialogs/InsertMDDialog";\n');
  s = drop(s, "  public insertMDDialog: InsertMDDialog;\n");
  s = drop(s, "    this.insertMDDialog.destroy();\n    this.insertMDDialog = null;\n");
  s = drop(s, "    this.insertMDDialog = new InsertMDDialog(this.plugin);\n");
  write(p, s);
  console.log("CommandManager done");
}

// ---------- main.ts ----------
{
  const p = "src/core/main.ts";
  let s = read(p);
  s = drop(
    s,
    `  get insertMDDialog() {
    return this.commandManager?.insertMDDialog;
  }

`,
  );
  write(p, s);
  console.log("main done");
}

// ---------- ToolsPanel ----------
{
  const p = "src/view/components/menu/ToolsPanel.tsx";
  let s = read(p);
  s = drop(
    s,
    `  actionInsertBackOfNote() {
    const view = this.getView();
    if (!view) {
      return;
    }
    this.props.centerPointer();
    void view.insertBackOfTheNoteCard();
  }

`,
  );
  s = drop(
    s,
    `  actionInsertMarkdown() {
    const view = this.getView();
    const plugin = view?.plugin;
    if (!view || !plugin) {
      return;
    }
    this.props.centerPointer();
    plugin.insertMDDialog.start(view);
  }

`,
  );
  s = drop(
    s,
    `                  <ActionButton
                    key={"insertMD"}
                    title={t("INSERT_MD")}
                    action={() => this.actionInsertMarkdown()}
                    icon={ICONS.insertMD}
                  />
`,
  );
  s = drop(
    s,
    `                  <ActionButton
                    key={"insertBackOfNote"}
                    title={t("INSERT_CARD")}
                    action={() => this.actionInsertBackOfNote()}
                    icon={ICONS.BackOfNote}
                  />
`,
  );
  write(p, s);
  console.log("ToolsPanel done");
}

for (const f of [
  "src/shared/Dialogs/SelectCard.ts",
  "src/shared/Dialogs/InsertMDDialog.ts",
]) {
  fs.unlinkSync(f);
  console.log("deleted", f);
}
