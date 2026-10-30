// Dedicated Yemot sub-extension endpoint: 2
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  incoming.searchParams.set("CHOICE", "2");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), CHOICE: "2" };
  return mainHandler(req, res);
}
