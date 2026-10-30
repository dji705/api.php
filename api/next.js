// Dedicated Yemot sub-extension endpoint: 5
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  incoming.searchParams.set("CHOICE", "5");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), CHOICE: "5" };
  return mainHandler(req, res);
}
