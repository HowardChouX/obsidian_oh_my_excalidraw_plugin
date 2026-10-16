// One-off splice B: finish the back-of-the-note card removal.
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);
const drop = (s, from) => {
  if (!s.includes(from)) throw new Error("not found: " + from.slice(0, 70));
  return s.replace(from, "");
};

// ---------- CommandManager ----------
{
  const p = "src/core/managers/CommandManager.ts";
  let s = read(p);
  for (const id of ["insert-md", "universal-card", "convert-card-to-file"]) {
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
  s = drop(
    s,
    `      case "card":
        void this.activeExcalidrawView.insertBackOfTheNoteCard(true);
        break;
`,
  );
  s = s.replace(
    `  public runAction(action: "anyFile" | "card") {`,
    `  public runAction(action: "anyFile") {`,
  );
  write(p, s);
  console.log("main done");
}

// ---------- excalidrawLib.d.ts + adapter type ----------
{
  const p = "src/types/excalidrawLib.d.ts";
  let s = read(p);
  s = s.replace(
    `    runAction: (action: "anyFile" | "card") => void;`,
    `    runAction: (action: "anyFile") => void;`,
  );
  write(p, s);
  console.log("types done");
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

// ---------- EA ----------
{
  const p = "src/shared/ExcalidrawAutomate.ts";
  let s = read(p);
  s = drop(s, "  addBackOfTheNoteCard,\n");
  // 删除 addBackOfTheCardNoteToView（去 docblock + 括号配对）
  const marker = "  async addBackOfTheCardNoteToView(";
  const start = s.indexOf(marker);
  if (start === -1) throw new Error("EA method not found");
  const doc = s.lastIndexOf("/**", start);
  let top = start;
  if (doc !== -1 && s.slice(doc, start).rstrip().endsWith("*/")) top = doc;
  const popen = s.indexOf("(", start);
  let d = 0, i = popen;
  while (true) {
    if (s[i] === "(") d++;
    else if (s[i] === ")") { d--; if (d === 0) break; }
    i++;
  }
  const body = s.indexOf("{", i);
  d = 0;
  let j = body;
  while (true) {
    if (s[j] === "{") d++;
    else if (s[j] === "}") { d--; if (d === 0) break; }
    j++;
  }
  let end = j + 1;
  while (end < s.length && s[end] === "\n") end++;
  s = s.slice(0, top) + s.slice(end);
  write(p, s);
  console.log("EA done");
}

for (const f of [
  "src/shared/Dialogs/SelectCard.ts",
  "src/shared/Dialogs/InsertMDDialog.ts",
]) {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log("deleted", f);
  }
}
