// Dedicated Yemot sub-extension endpoint: 3
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  incoming.searchParams.set("CHOICE", "3");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), CHOICE: "3" };
  return mainHandler(req, res);
}
