/* Rule-based lint (no AI): clichés every rival can say, and words from voice.neverSay. */
import { CLICHES } from "../content/options";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Whole-word, case-insensitive: the term must not touch a letter or digit on either side. */
const hit = (text, term) =>
  new RegExp("(^|[^\\p{L}\\p{N}])" + esc(term).replace(/\s+/g, "\\s+") + "(?=$|[^\\p{L}\\p{N}])", "iu").test(text);

/* Split never-say on commas, newlines and quotes (an apostrophe inside a word is not a quote). */
export function neverSayTerms(neverSay) {
  return String(neverSay || "")
    .split(/[,\n"“”‘]|(?<!\p{L})['’]|['’](?!\p{L})/u)
    .map((t) => t.trim().replace(/^[\s.!?;:\-–—]+|[\s.!?;:\-–—]+$/g, ""))
    .filter((t) => t.length >= 3);
}

export function lint(text, session) {
  const t = String(text || "");
  if (!t.trim()) return [];
  const notes = [];
  const seen = new Set();
  for (const w of CLICHES) {
    if (!seen.has("c:" + w) && hit(t, w)) { seen.add("c:" + w); notes.push(`'${w}' - every rival can say this.`); }
  }
  const never = session && session.voice ? neverSayTerms(session.voice.neverSay) : [];
  for (const w of never) {
    const k = "n:" + w.toLowerCase();
    if (!seen.has(k) && hit(t, w)) { seen.add(k); notes.push(`'${w}' is on your never-say list.`); }
  }
  return notes;
}
