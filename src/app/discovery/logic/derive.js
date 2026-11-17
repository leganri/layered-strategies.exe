/* Small derived values shared by sections, the brief, checks and markdown. */
import { FIELDS } from "../content/tips";
import { getIn, normPath, isFilled, SECTIONS } from "../schema";

export const join = (arr, sep = ", ") => (arr || []).filter((x) => x && String(x).trim()).join(sep);

export const primarySegment = (d) => {
  const segs = d.audience.segments;
  return segs.find((s) => s.primary) || (segs.length === 1 ? segs[0] : null);
};

export const onlynessParts = (d) => [d.positioning.category, d.positioning.difference, d.positioning.audience, d.positioning.context];

export const onlynessText = (d, blank = "____") => {
  const [c, f, a, x] = onlynessParts(d).map((v) => (v && v.trim()) || blank);
  return `The only ${c} that ${f} for ${a} ${d.positioning.connector || "in"} ${x}.`;
};

export const hasOnlyness = (d) => onlynessParts(d).some((v) => v && v.trim());

/* Romaniuk grid. Split at 3: 3-5 is high. */
export function quadrant(fame, unique) {
  if (fame == null || unique == null) return null;
  const hiF = fame >= 3, hiU = unique >= 3;
  if (hiF && hiU) return "Use or lose";
  if (!hiF && hiU) return "Invest";
  if (hiF && !hiU) return "Avoid using alone";
  return "Ignore or test";
}

export const axisLabels = (map) => ({
  xl: (map.x[0] || "").trim() || "Left", xr: (map.x[1] || "").trim() || "Right",
  yb: (map.y[0] || "").trim() || "Bottom", yt: (map.y[1] || "").trim() || "Top",
});

export function describePos(map, pos) {
  if (!pos || pos.x == null || pos.y == null) return "";
  const { xr, yt } = axisLabels(map);
  return `${xr} ${pos.x}% · ${yt} ${pos.y}%`;
}

export const truncate = (s, n = 120) => { const t = String(s || "").trim().replace(/\s+/g, " "); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

/* Human label for any path, including list items ("Segment: Weekend ritualist · The job"). */
export function labelFor(d, path) {
  const f = FIELDS[normPath(path)] || {};
  const segs = path.split(".");
  if (segs[0] === "audience" && segs[1] === "segments") {
    const seg = getIn(d, segs.slice(0, 3).join("."));
    const i = d.audience.segments.indexOf(seg);
    return `Segment ${seg && seg.name.trim() ? seg.name.trim() : String(i + 1).padStart(2, "0")} · ${f.label || segs[3]}`;
  }
  if (segs[0] === "positioning" && segs[1] === "rtbs") return `Reason to believe ${Number(segs[2]) + 1}`;
  return f.label || path;
}

export const sectionOf = (path) => (FIELDS[normPath(path)] || {}).section || (SECTIONS.find((s) => s.key === path.split(".")[0]) || {}).id;

const textOf = (v) => (v && typeof v === "object" && "text" in v ? v.text : v);

/* Assumptions register: every field tagged Assumption + every named distinctive asset. */
export function assumptions(d) {
  const out = [];
  for (const [path, level] of Object.entries(d.meta.confidence || {})) {
    if (level !== "assumption") continue;
    const v = textOf(getIn(d, path));
    if (v === undefined) continue; // source removed (e.g. deleted segment)
    out.push({ path, section: sectionOf(path), label: labelFor(d, path), value: truncate(v) });
  }
  d.perception.assets.forEach((a) => {
    if (!isFilled(a.name)) return;
    const q = quadrant(a.fame, a.unique);
    const bits = [a.type, a.fame != null ? `fame ${a.fame}/5` : null, a.unique != null ? `unique ${a.unique}/5` : null, q].filter(Boolean).join(" · ");
    out.push({
      path: `perception.assets.${a.id}.name`, section: "04",
      label: "Distinctive asset · " + a.name.trim(), value: truncate(bits),
      note: "Validate with a buyer recognition survey",
    });
  });
  return out.sort((a, b) => (a.section || "").localeCompare(b.section || ""));
}

export const fmtClock = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = String(m).padStart(2, "0"), ss = String(r).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
