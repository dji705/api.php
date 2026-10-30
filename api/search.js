// Dedicated Yemot search sub-extension.
import mainHandler from "./yemot.js";

export default function handler(req, res) {
  const incoming = new URL(req.url, "https://example.invalid");
  const typed = incoming.searchParams.get("CHOICE") || incoming.searchParams.get("choice") || "";
  if (typed && typed !== "3") incoming.searchParams.set("name", typed);
  incoming.searchParams.set("CHOICE", "3");
  req.url = incoming.pathname + incoming.search;
  req.query = { ...(req.query || {}), ...(typed && typed !== "3" ? { name: typed } : {}), CHOICE: "3" };
  return mainHandler(req, res);
}
