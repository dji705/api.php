// Main Yemot menu endpoint. Initial call shows the menu; later calls
// preserve the key pressed by the caller and let the main handler route it.
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  const hasInput = ["CHOICE", "choice", "wm_nav", "Digits", "digits", "key"].some(k => incoming.searchParams.has(k));
  if (!hasInput) incoming.searchParams.set("CHOICE", "menu");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), ...(!hasInput ? { CHOICE: "menu" } : {}) };
  return mainHandler(req, res);
}
