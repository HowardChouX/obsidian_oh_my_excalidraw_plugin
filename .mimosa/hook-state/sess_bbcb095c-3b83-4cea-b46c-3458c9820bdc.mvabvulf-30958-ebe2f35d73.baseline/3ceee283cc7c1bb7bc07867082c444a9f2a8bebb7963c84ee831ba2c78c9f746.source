import type ExcalidrawView from "src/view/ExcalidrawView";

export {
  cloneElement,
  getBoundTextElementId,
  repositionElementsToCursor,
} from "./excalidrawElementUtils";

export const search = async (view: ExcalidrawView) => {
  const ea = view.plugin.ea;
  ea.reset();
  ea.setView(view);
  const elements = ea
    .getViewElements()
    .filter(
      (el) =>
        el.type === "text" ||
        el.type === "frame" ||
        el.link ||
        el.type === "image",
    );
  if (elements.length === 0) {
    return;
  }
  const { inputPrompt } = await import("./promptUtils");
  let text = await inputPrompt(
    view,
    view.plugin,
    view.plugin.app,
    "Search for",
    "use quotation marks for exact match",
    "",
  );
  if (!text) {
    return;
  }
  const res = text.matchAll(/"(.*?)"/g);
  let query: string[] = [];
  let parts;
  while (!(parts = res.next()).done) {
    query.push(parts.value[1]);
  }
  text = text.replaceAll(/"(.*?)"/g, "");
  query = query.concat(text.split(" ").filter((s: string) => s.length !== 0));

  ea.targetView.selectElementsMatchingQuery(elements, query);
};
