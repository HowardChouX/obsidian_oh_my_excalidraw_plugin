// One-off splice: remove the image-tool command group (crop/annotate/duplicate/
// flip/reset-ar/open-image-source/url-to-file) and carveout support.
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);

// ---------- CommandManager: remove 7 command blocks ----------
{
  const p = "src/core/managers/CommandManager.ts";
  let s = read(p);
  const ids = [
    "excalidraw-convert-image-from-url-to-local-file",
    "open-image-excalidraw-source",
    "flip-image",
    "duplicate-image",
    "reset-image-ar",
    "crop-image",
    "annotate-image",
  ];
  for (const id of ids) {
    let idx = s.indexOf(`id: "${id}"`);
    if (idx === -1) {
      console.log("already absent:", id);
      continue;
    }
    const start = s.lastIndexOf("\n    this.addCommand({", idx);
    if (start === -1) throw new Error("block start not found: " + id);
    const next = s.indexOf("\n    this.addCommand({", idx);
    if (next === -1) throw new Error("block end not found: " + id);
    // Trim trailing whitespace lines before the next command.
    s = s.slice(0, start) + s.slice(next);
    console.log("removed command:", id);
  }
  write(p, s);
}
