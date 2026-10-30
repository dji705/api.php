// Dedicated Yemot sub-extension endpoint: menu
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  incoming.searchParams.set("CHOICE", "menu");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), CHOICE: "menu" };
  return mainHandler(req, res);
}
