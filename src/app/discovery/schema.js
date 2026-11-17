/* ============================================================
   Schema v2 — sections, defaults, path helpers, completion.
   ============================================================ */

export const FORMAT = "gsx/2.0";
export const AUTOSAVE_KEY = "layered-discovery:autosave";

export const PHASES = ["Frame", "Diagnose", "Decide", "Express"];

/* key = top-level data key. core = paths that count toward completion. */
export const SECTIONS = [
  {
    id: "00", key: "setup", phase: "Frame", title: "Setup", minutes: 5,
    frame: "Decision rights (Bain RAPID, simplified)",
    note: "Set the room. Name who decides, who can block, and who just advises. Unclear decision rights sink more brand projects than bad ideas.",
    core: ["setup.client", "setup.project", "setup.facilitator", "setup.sector", "setup.attendees", "setup.engagement", "setup.decider"],
  },
  {
    id: "01", key: "business", phase: "Frame", title: "Business", minutes: 20,
    frame: "Commercial truth · SCQ problem framing (Minto)",
    note: "Money first. A brand that ignores the business model is decoration. Get the commercial truth before the romance.",
    core: ["business.scq.question", "business.oneLiner", "business.model", "business.stage", "business.revenue", "business.ambition", "business.metrics"],
  },
  {
    id: "02", key: "audience", phase: "Diagnose", title: "Audience", minutes: 30,
    frame: "Jobs-to-be-Done · Forces of Progress · Category Entry Points",
    note: "Find the job, the forces, and the moments. People buy to make progress and to build who they are - and they buy brands that come to mind first.",
    core: ["audience.segments", "audience.ceps", "audience.insight", "audience.notFor"],
  },
  {
    id: "03", key: "landscape", phase: "Diagnose", title: "Landscape", minutes: 25,
    frame: "Neumeier, Zag · perceptual map",
    note: "Name the enemy. Differentiation only exists relative to something. Sometimes the enemy is the old way, not a rival.",
    core: ["landscape.competitors", "landscape.map", "landscape.enemy", "landscape.gap", "landscape.conventions"],
  },
  {
    id: "04", key: "perception", phase: "Diagnose", title: "Perception", minutes: 20,
    frame: "From/To gap · Distinctive Brand Assets (Ehrenberg-Bass)",
    note: "Two audits: the words people use, and the assets they recognise. Don't throw away an asset the market already knows.",
    core: ["perception.now", "perception.future", "perception.misread", "perception.feelings", "perception.assets"],
    coach: {
      ask: "Imagine overhearing a customer describe you to a friend at a bar - the words they really use, not the ones on your website. Now imagine the words you would kill to hear two years from now. The space between those two lists is exactly what we are about to build.",
      egLabel: "A strong pair looks like",
      example: "Today: “cheap, fine, forgettable.” Target: “fresh, welcoming, the-good-stuff.”",
      frame: "Wolff Olins - the gap is the project",
    },
  },
  {
    id: "05", key: "purpose", phase: "Decide", title: "Purpose", minutes: 20,
    frame: "Sinek, Why + 5 Whys · values tested by cost",
    note: "Start with why. If you stopped making money tomorrow, why would this still deserve to exist? Ladder down with why five times.",
    core: ["purpose.why", "purpose.ladder", "purpose.values", "purpose.antiValue"],
  },
  {
    id: "06", key: "positioning", phase: "Decide", title: "Positioning", minutes: 30,
    frame: "Neumeier Onlyness · Aaker value ladder",
    note: "One sentence the competition cannot honestly say. If a rival could claim it too, it is not positioning yet.",
    core: ["positioning.category", "positioning.difference", "positioning.audience", "positioning.context", "positioning.ladder", "positioning.rtbs", "positioning.promise"],
    coach: {
      ask: "We are going to fill one sentence together. The trick is the word ONLY - it has to stay true. If a competitor could say the exact same line, we have not found it yet, and we keep pushing until only you can claim it.",
      egLabel: "A strong result reads like",
      example: "The only specialty coffee roaster that makes great coffee feel welcoming instead of intimidating, for home brewers who care but aren't experts, in a category that mistakes snobbery for quality.",
      frame: "Marty Neumeier - the Onlyness test (Zag)",
    },
  },
  {
    id: "07", key: "character", phase: "Decide", title: "Character", minutes: 15,
    frame: "Personality spectrum · archetype shorthand",
    note: "Read each pair aloud. If the brand were a person walking into a room, how would it behave? The middle is a decision too.",
    core: ["character.sliders", "character.tension"],
    coach: {
      ask: "If the brand walked into a party as a person, how would it act? For each pair, slide toward the side that feels more true. Resist landing everything in the middle - middle is safe, and safe is forgettable. Pick a side.",
      frame: "Personality spectrum",
    },
  },
  {
    id: "08", key: "voice", phase: "Decide", title: "Voice", minutes: 15,
    frame: "Voice vs tone (Nielsen Norman)",
    note: "Voice is what you always sound like; tone bends by moment. Capture the forbidden words - what you would never say defines you.",
    core: ["voice.sliders", "voice.toneWords", "voice.say", "voice.neverSay", "voice.flex"],
    coach: {
      ask: "Voice is your personality in words - it stays constant. Tone is the outfit it wears for the occasion. Set where your voice naturally rests on each dial; tone can flex later for a celebration versus an apology.",
      frame: "Nielsen Norman - voice vs tone",
    },
  },
  {
    id: "09", key: "idea", phase: "Decide", title: "Brand Idea", minutes: 15,
    frame: "Synthesis: answer, trueline & essence",
    note: "Read the chain out loud. Every link should follow from the one before it. If one doesn't, fix the earlier page, not this one.",
    core: ["idea.answer", "idea.trueline", "idea.essence"],
  },
  {
    id: "10", key: "visual", phase: "Express", title: "Visual", minutes: 20,
    frame: "Art direction intake · visual dials",
    note: "Collect allergies, not just appetites. What a client hates is far more reliable data than what they say they like.",
    core: ["visual.territories", "visual.dials", "visual.avoid", "visual.references", "visual.mandatories", "visual.touchpoints"],
  },
  {
    id: "11", key: "scope", phase: "Express", title: "Scope", minutes: 10,
    frame: "Scope, risks & assumptions register",
    note: "Scope agreed out loud in the room survives. Scope assumed over email becomes the fight that kills the relationship.",
    core: ["scope.deliverables", "scope.timeline", "scope.budget", "scope.risks", "scope.openQuestions", "scope.nextSteps"],
  },
];

export const sectionById = (id) => SECTIONS.find((s) => s.id === id);
export const sectionByKey = (key) => SECTIONS.find((s) => s.key === key);

/* ---------- ids ---------- */

export function uid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  // Fallback: Date.now()+Math.random(), encoded without dots so it is path-safe.
  return "id" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ---------- item factories ---------- */

export const newSegment = () => ({ id: uid(), name: "", desc: "", job: "", push: "", pull: "", anxiety: "", habit: "", identity: "", primary: false });
export const newCompetitor = () => ({ id: uid(), name: "", threat: null, strength: "", weakness: "", x: null, y: null });
export const newAsset = () => ({ id: uid(), name: "", type: null, fame: null, unique: null });
export const newCep = (text = "") => ({ id: uid(), text, star: false });
export const newRtb = () => ({ text: "", rival: null });

const nulls = (n) => Array(n).fill(null);

export const defaults = () => ({
  meta: { version: 2, confidence: {}, timeSpent: {} },
  setup: { client: "", project: "", date: new Date().toISOString().slice(0, 10), facilitator: "", sector: "", attendees: "", engagement: [], decider: "", approvers: "", input: "" },
  business: { oneLiner: "", model: [], stage: null, revenue: "", ambition: "", metrics: "", scq: { situation: "", complication: "", question: "" } },
  audience: { segments: [newSegment()], ceps: [], insight: "", notFor: "" },
  landscape: {
    competitors: [newCompetitor()],
    map: { x: ["", ""], y: ["", ""], us: { x: null, y: null }, target: { x: null, y: null } },
    enemy: "", gap: "", conventions: { keep: "", break: "" },
  },
  perception: { now: ["", "", ""], future: ["", "", ""], misread: "", feelings: "", assets: [newAsset()] },
  purpose: { why: "", ladder: "", values: [], antiValue: "" },
  positioning: {
    category: "", difference: "", audience: "", connector: "in", context: "", price: null,
    ladder: { functional: "", emotional: "", expressive: "" },
    rtbs: [newRtb(), newRtb(), newRtb()], proof: "", promise: "",
  },
  character: { sliders: nulls(6), archetype: { primary: null, secondary: null, notes: "" }, tension: "" },
  voice: { sliders: nulls(4), toneWords: [], say: "", neverSay: "", flex: { celebrate: "", sorry: "", sell: "" } },
  idea: { checks: [false, false, false, false, false], answer: "", trueline: "", essence: "" },
  visual: { territories: { in: [], out: [] }, dials: nulls(3), avoid: "", references: "", mandatories: "", touchpoints: [] },
  scope: { deliverables: [], timeline: "", budget: null, risks: "", notes: "", openQuestions: "", nextSteps: "" },
});

/* ---------- deep merge & normalisation ---------- */

const isPlain = (v) => v != null && typeof v === "object" && !Array.isArray(v);

/* Plain objects merge recursively; arrays and primitives from src replace base. */
export function deepMerge(base, src) {
  if (!isPlain(base) || !isPlain(src)) return src === undefined ? base : src;
  const out = { ...base };
  for (const k of Object.keys(src)) {
    if (src[k] === undefined) continue;
    out[k] = isPlain(base[k]) && isPlain(src[k]) ? deepMerge(base[k], src[k]) : src[k];
  }
  return out;
}

const fixLen = (arr, n, fill) => {
  const a = Array.isArray(arr) ? arr.slice(0, n) : [];
  while (a.length < n) a.push(typeof fill === "function" ? fill() : fill);
  return a;
};
const items = (arr, make) => (Array.isArray(arr) ? arr : []).map((x) => {
  const base = make();
  const merged = isPlain(x) ? { ...base, ...x } : base;
  if (!merged.id && "id" in base) merged.id = base.id;
  return merged;
});

/* Guarantees every list item has its full shape and a stable id, and fixed arrays have their length. */
export function normalize(d) {
  const n = deepMerge(defaults(), d || {});
  n.meta = { version: 2, confidence: {}, timeSpent: {}, ...(n.meta || {}) };
  n.audience.segments = items(n.audience.segments, newSegment);
  if (!n.audience.segments.length) n.audience.segments = [newSegment()];
  n.audience.ceps = items(n.audience.ceps, newCep);
  n.landscape.competitors = items(n.landscape.competitors, newCompetitor);
  if (!n.landscape.competitors.length) n.landscape.competitors = [newCompetitor()];
  n.landscape.map.x = fixLen(n.landscape.map.x, 2, "");
  n.landscape.map.y = fixLen(n.landscape.map.y, 2, "");
  n.perception.now = fixLen(n.perception.now, 3, "");
  n.perception.future = fixLen(n.perception.future, 3, "");
  n.perception.assets = items(n.perception.assets, newAsset);
  if (!n.perception.assets.length) n.perception.assets = [newAsset()];
  n.purpose.values = (Array.isArray(n.purpose.values) ? n.purpose.values : []).map((v) => (typeof v === "string" ? { name: v, cost: "" } : { name: "", cost: "", ...v }));
  n.positioning.rtbs = fixLen(items(n.positioning.rtbs, newRtb), 3, newRtb);
  n.character.sliders = fixLen(n.character.sliders, 6, null);
  n.voice.sliders = fixLen(n.voice.sliders, 4, null);
  n.visual.dials = fixLen(n.visual.dials, 3, null);
  n.idea.checks = fixLen(n.idea.checks, 5, false);
  if (!["in", "during", "where", "when", "at"].includes(n.positioning.connector)) n.positioning.connector = "in";
  if (!isPlain(n.visual.territories)) n.visual.territories = { in: Array.isArray(n.visual.territories) ? n.visual.territories : [], out: [] };
  n.visual.territories = { in: n.visual.territories.in || [], out: n.visual.territories.out || [] };
  return n;
}

/* ---------- paths ----------
   Dotted paths. A segment that follows an array may be a numeric index or an item id. */

function resolveKey(container, seg) {
  if (Array.isArray(container)) {
    if (/^\d+$/.test(seg)) return Number(seg);
    return container.findIndex((x) => x && x.id === seg);
  }
  return seg;
}

export function getIn(obj, path) {
  let cur = obj;
  for (const seg of path.split(".")) {
    if (cur == null) return undefined;
    const k = resolveKey(cur, seg);
    if (k === -1) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function setIn(obj, path, value) {
  const segs = path.split(".");
  const rec = (cur, i) => {
    const k = resolveKey(cur, segs[i]);
    if (k === -1) return cur;
    const next = i === segs.length - 1 ? value : rec(cur == null ? {} : cur[k], i + 1);
    if (Array.isArray(cur)) { const c = cur.slice(); c[k] = next; return c; }
    return { ...(cur || {}), [k]: next };
  };
  return rec(obj, 0);
}

const LIST_KEYS = new Set(["segments", "competitors", "ceps", "assets", "rtbs", "values"]);

/* "audience.segments.<id>.job" -> "audience.segments.*.job" (used to look up labels and tips). */
export function normPath(path) {
  const segs = path.split(".");
  return segs.map((s, i) => (i > 0 && LIST_KEYS.has(segs[i - 1]) ? "*" : s)).join(".");
}

export const fieldId = (path) => "f-" + path.replace(/\./g, "-");

/* ---------- completion ---------- */

export function isFilled(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.some(isFilled);
  if (typeof v === "object") return Object.entries(v).some(([k, x]) => k !== "id" && isFilled(x));
  return false;
}

export function completion(data, sec) {
  const total = sec.core.length;
  const filled = sec.core.filter((p) => isFilled(getIn(data, p))).length;
  return { filled, total, done: filled === total };
}

/* Has the user entered anything at all? (ignores meta and the auto-filled date) */
export function hasContent(data) {
  if (!data) return false;
  return SECTIONS.some((s) => {
    const part = data[s.key];
    if (s.key === "setup" && part) { const { date, ...rest } = part; return isFilled(rest); }
    return isFilled(part);
  });
}
