// Dedicated Yemot sub-extension endpoint: 1
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  incoming.searchParams.set("CHOICE", "1");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), CHOICE: "1" };
  return mainHandler(req, res);
}
