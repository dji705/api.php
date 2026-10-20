// Vercel serverless endpoint for Yemot HaMashiach + FBI Wanted.
// Translation uses Google's public web translation endpoint; it may be rate-limited
// and is not an official or guaranteed translation API.
const FBI_URL = "https://api.fbi.gov/wanted/v1/list";

function clean(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function translateToHebrew(value) {
  const text = clean(value);
  if (!text) return "";
  // Keep short names/identifiers as published; translate descriptions and labels.
  const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q=" + encodeURIComponent(text.slice(0, 500));
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(3500) });
    if (!response.ok) return text;
    const data = await response.json();
    const translated = Array.isArray(data?.[0]) ? data[0].map(part => part?.[0] || "").join("") : "";
    return translated || text;
  } catch {
    return text;
  }
}

function yemotRead(text, digits = "Digits", maxDigits = 1) {
  const safe = String(text || "לא התקבל מידע")
    .replace(/[\r\n]+/g, " ")
    .replace(/[=]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `read=${safe}.n-123.t-${digits}=wm_nav,no,1,1,${maxDigits},Digits,no,no,,,1,Ok`;
}

function menu() {
  return yemotRead("לרשימת המבוקשים הקישו 1. לעשרת המבוקשים הקישו 2. לחיפוש לפי שם הקישו 3. למעבר לעמוד הבא הקישו 5. לחזרה לתפריט הקישו כוכבית.", "choice", 1);
}

async function getFbi(params) {
  const url = new URL(FBI_URL);
  url.searchParams.set("page", String(params.page || 1));
  url.searchParams.set("pageSize", "20");
  if (params.title) url.searchParams.set("title", params.title);
  if (params.field_offices) url.searchParams.set("field_offices", params.field_offices);
  if (params.sort_on) url.searchParams.set("sort_on", params.sort_on);
  if (params.sort_order) url.searchParams.set("sort_order", params.sort_order);
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Yemot-FBI-Wanted/1.0" }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error("FBI API returned " + response.status);
  return response.json();
}

function nonEmpty(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).join(", ");
  return clean(value);
}

async function describeItem(item, index) {
  const title = clean(item.title) || "שם לא ידוע";
  const desc = nonEmpty(item.description || item.details || item.subjects);
  const reward = clean(item.reward_text);
  const status = clean(item.status);
  const translatedDesc = desc ? clean(desc).slice(0, 120) : "";
  // Avoid extra translation requests: these can delay the IVR response and disconnect the call.
  const translatedReward = reward;
  const translatedStatus = status;
  const parts = [`מספר ${index}. ${title}.`];
  if (translatedDesc) parts.push("פרטים: " + translatedDesc + ".");
  if (translatedReward) parts.push(translatedReward + ".");
  if (translatedStatus) parts.push("סטטוס: " + translatedStatus + ".");
  parts.push("לפרטים נוספים באתר האף בי איי.");
  return parts.join(" ");
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") {
    res.status(405).send(yemotRead("הבקשה אינה נתמכת."));
    return;
  }

  const q = req.query || {};
  const key = String(q.choice ?? q.Digits ?? q.digits ?? q.key ?? "");
  const page = Math.max(1, Math.min(100, Number.parseInt(q.page || "1", 10) || 1));
  const searchName = clean(q.name || q.title || "");

  try {
    if (!key || key === "menu" || key === "0") {
      res.status(200).send(menu());
      return;
    }

    if (key === "*") {
      res.status(200).send(menu());
      return;
    }

    if (key === "3" && !searchName) {
      res.status(200).send(yemotRead("כדי לחפש לפי שם, שלחו את השם בפרמטר name בכתובת ה־API.", "name", 40));
      return;
    }

    let data;
    if (key === "2") {
      data = await getFbi({ page: 1, sort_on: "title", sort_order: "asc" });
      const items = (data.items || []).filter(item => /ten most wanted/i.test([item.title, ...(item.subjects || [])].join(" "))).slice(0, 3);
      const chosen = items.length ? items : (data.items || []).slice(0, 3);
      if (!chosen.length) {
        res.status(200).send(yemotRead("לא נמצאו רשומות."));
        return;
      }
      const output = [];
      const descriptions = await Promise.all(chosen.map((item, i) => describeItem(item, i + 1)));
      output.push(...descriptions);
      res.status(200).send(yemotRead(output.join(" הבא. ")));
      return;
    }

    if (key === "5") {
      data = await getFbi({ page: page + 1 });
    } else if (key === "3" && searchName) {
      data = await getFbi({ page: 1, title: searchName });
    } else if (key === "4") {
      const office = clean(q.field_offices || "");
      if (!office) {
        res.status(200).send(yemotRead("לחיפוש לפי משרד, יש לשלוח את שם המשרד בפרמטר field_offices."));
        return;
      }
      data = await getFbi({ page, field_offices: office });
    } else if (key === "1") {
      data = await getFbi({ page });
    } else {
      res.status(200).send(menu());
      return;
    }

    const items = Array.isArray(data.items) ? data.items.slice(0, 3) : [];
    if (!items.length) {
      res.status(200).send(yemotRead("לא נמצאו מבוקשים בעמוד זה."));
      return;
    }

    const output = await Promise.all(items.map((item, i) => describeItem(item, i + 1)));
    output.push(`עמוד ${data.page || page}. נמצאו ${data.total || 0} רשומות בסך הכול.`);
    output.push("להמשך, הקישו 5.");
    res.status(200).send(yemotRead(output.join(" הבא. ")));
  } catch (error) {
    res.status(200).send(yemotRead("אירעה תקלה בקבלת המידע מהאף בי איי. נסו שוב מאוחר יותר."));
  }
}
