/* briefToMarkdown(session): the brief as clean markdown, built from data (not the DOM),
   in the same order as brief/Brief.jsx: cover, platform, case, detail, validate. */
import { isFilled } from "../schema";
import { CHARACTER, VOICE_DIMS, VISUAL_DIALS, PRICE } from "../content/options";
import { join, primarySegment, onlynessText, hasOnlyness, quadrant, assumptions, describePos, axisLabels } from "./derive";
import { checks } from "./checks";

const CONF = { fact: "Fact", belief: "Belief", assumption: "Assumption" };
const clean = (v) => String(v == null ? "" : v).trim();
const scale = (l, r, v) => { const p = Math.round((v * 6) / 8); return `${l} — ${"○".repeat(p)}●${"○".repeat(6 - p)} — ${r} (${p + 1}/7)`; };

export function briefToMarkdown(s) {
  const out = [];
  const line = (t = "") => out.push(t);
  const conf = (p) => (s.meta.confidence[p] ? ` _(${CONF[s.meta.confidence[p]]})_` : "");
  const item = (label, v, c = "") => {
    const t = clean(Array.isArray(v) ? join(v) : v);
    if (!t) return;
    if (t.includes("\n")) { line(`**${label}**${c}`); line(); t.split("\n").forEach((x) => line(x ? "> " + x : ">")); line(); }
    else line(`- **${label}:**${c} ${t}`);
  };
  const h2 = (t) => { line(); line("## " + t); line(); };
  const h3 = (t) => { line(); line("### " + t); line(); };

  /* 1. Cover */
  line(`# ${clean(s.setup.project) || clean(s.setup.client) || "Untitled project"}`);
  line();
  line(`_Brand discovery — workshop record · ${s.setup.date}_`);
  if (clean(s.business.scq.question)) { line(); line(`> **${clean(s.business.scq.question)}**`); }
  if (clean(s.idea.answer)) { line(">"); line(`> _Our answer:_ ${clean(s.idea.answer)}`); }
  line();
  [["Client", s.setup.client], ["Sector", s.setup.sector], ["Facilitator", s.setup.facilitator], ["Engagement", join(s.setup.engagement)],
    ["Decides", s.setup.decider], ["Must agree", s.setup.approvers]].forEach(([k, v]) => line(`- **${k}:** ${clean(v) || "—"}`));

  /* 2. Platform */
  const ch = s.character;
  const platform = [s.idea.essence, s.idea.trueline, s.positioning.promise, s.purpose.why, s.purpose.values, ch.tension, ch.archetype.primary, s.voice.toneWords].some(isFilled)
    || hasOnlyness(s) || ch.sliders.some((v) => v != null);
  if (platform) {
    h2("The platform");
    if (clean(s.idea.essence)) { line(`### ★ ${clean(s.idea.essence)}`); line(); }
    item("Trueline", s.idea.trueline);
    if (hasOnlyness(s)) item("Onlyness", onlynessText(s));
    item("Promise", s.positioning.promise);
    item("Why", s.purpose.why);
    if (s.purpose.values.length) {
      line("- **Values:**");
      s.purpose.values.forEach((v) => line(`  - ${v.name}${clean(v.cost) ? " — " + clean(v.cost) : " — _no cost named_"}`));
    }
    if (ch.sliders.some((v) => v != null)) {
      line("- **Character:**");
      CHARACTER.forEach(([l, r], i) => { if (ch.sliders[i] != null) line("  - " + scale(l, r, ch.sliders[i])); });
    }
    if (ch.archetype.primary) item("Archetype", ch.archetype.primary + (ch.archetype.secondary ? " + " + ch.archetype.secondary : ""));
    item("Tension", ch.tension);
    item("Voice", join(s.voice.toneWords));
  }

  /* 3. The case */
  const scq = s.business.scq;
  const seg = primarySegment(s);
  const L = s.landscape;
  const ceps = s.audience.ceps.filter((c) => clean(c.text));
  const assets = s.perception.assets.filter((a) => clean(a.name));
  const placed = [
    ...L.competitors.filter((c) => clean(c.name) && c.x != null && c.y != null).map((c) => [clean(c.name), c]),
    ...(L.map.us.x != null ? [["Us today", L.map.us]] : []),
    ...(L.map.target.x != null ? [["Us target", L.map.target]] : []),
  ];
  const caseBits = [scq, s.audience.insight, s.audience.notFor, L.enemy, L.gap, s.perception.now, s.perception.future].some(isFilled) || (seg && isFilled(seg)) || ceps.length || placed.length || assets.length;
  if (caseBits) {
    h2("The case");
    item("Situation", scq.situation);
    item("Complication", scq.complication);
    item("Question", scq.question);
    item("Answer", s.idea.answer);
    if (seg && isFilled(seg)) {
      const p = "audience.segments." + seg.id;
      h3("Primary segment — " + (clean(seg.name) || "Segment 01"));
      item("Who they are", seg.desc);
      item("The job", seg.job, conf(p + ".job"));
      if ([seg.push, seg.pull, seg.anxiety, seg.habit].some(isFilled)) {
        line();
        line("| Toward you | | Holding them back | |");
        line("|---|---|---|---|");
        const cell = (k) => (clean(seg[k]) || "—").replace(/\|/g, "\\|").replace(/\n/g, " ") + conf(p + "." + k);
        line(`| **Push** | ${cell("push")} | **Anxiety** | ${cell("anxiety")} |`);
        line(`| **Pull** | ${cell("pull")} | **Habit** | ${cell("habit")} |`);
        line();
      }
      item("Identity badge", seg.identity);
    }
    if (ceps.length) {
      line("- **Category entry points:**");
      ceps.filter((c) => c.star).forEach((c) => line(`  - ★ **${clean(c.text)}**`));
      ceps.filter((c) => !c.star).forEach((c) => line(`  - ${clean(c.text)}`));
    }
    item("Sharpest insight", s.audience.insight, conf("audience.insight"));
    item("Not for", s.audience.notFor);
    item("The enemy", L.enemy);
    if (placed.length) {
      const { xl, xr, yb, yt } = axisLabels(L.map);
      line(`- **Perceptual map** (across: ${xl} → ${xr}; up: ${yb} → ${yt}):`);
      placed.forEach(([n, p]) => line(`  - ${n}: ${describePos(L.map, p)}`));
    }
    item("The open space", L.gap, conf("landscape.gap"));
    if (isFilled(s.perception.now) || isFilled(s.perception.future)) item("From → To", `${join(s.perception.now) || "—"} → ${join(s.perception.future) || "—"}`);
    const scored = assets.filter((a) => a.fame != null && a.unique != null);
    if (scored.length) {
      line("- **Distinctive assets:**");
      scored.forEach((a) => line(`  - ${clean(a.name)} — fame ${a.fame}/5, unique ${a.unique}/5 → **${quadrant(a.fame, a.unique)}**`));
    }
  }

  /* 4. Detail */
  if (isFilled(s.setup.attendees) || isFilled(s.setup.input)) { h2("00 Setup"); item("In the room", s.setup.attendees); item("Gives input", s.setup.input); }
  const B = s.business;
  if ([B.oneLiner, B.model, B.stage, B.revenue, B.ambition, B.metrics].some(isFilled)) {
    h2("01 Business");
    item("What the business does", B.oneLiner); item("Model", B.model); item("Stage", B.stage);
    item("Revenue logic", B.revenue); item("Three-year ambition", B.ambition); item("Metrics the brand must move", B.metrics);
  }
  const others = s.audience.segments.filter((x) => x !== seg && isFilled(x));
  if (others.length) {
    h2("02 Other segments");
    others.forEach((x) => {
      const p = "audience.segments." + x.id;
      h3(clean(x.name) || "Segment " + String(s.audience.segments.indexOf(x) + 1).padStart(2, "0"));
      item("Who they are", x.desc); item("The job", x.job, conf(p + ".job"));
      item("Push", x.push, conf(p + ".push")); item("Pull", x.pull, conf(p + ".pull"));
      item("Anxiety", x.anxiety, conf(p + ".anxiety")); item("Habit", x.habit, conf(p + ".habit"));
      item("Identity badge", x.identity);
    });
  }
  const comps = L.competitors.filter((c) => isFilled({ ...c, x: null, y: null }));
  if (comps.length || isFilled(L.conventions)) {
    h2("03 Landscape");
    comps.forEach((c, i) => {
      h3((clean(c.name) || "Competitor " + (i + 1)) + (c.threat ? ` · ${c.threat} threat` : ""));
      item("Strong at", c.strength); item("Weak at", c.weakness);
    });
    item("Codes we keep", L.conventions.keep); item("Codes we break", L.conventions.break);
  }
  if (isFilled(s.perception.misread) || isFilled(s.perception.feelings) || assets.length) {
    h2("04 Perception");
    item("Common misread", s.perception.misread); item("Internal feeling", s.perception.feelings);
    if (assets.length) {
      line("- **Distinctive assets:**");
      assets.forEach((a) => line(`  - ${clean(a.name)}${a.type ? " (" + a.type + ")" : ""}${a.fame != null ? ` · fame ${a.fame}/5` : ""}${a.unique != null ? ` · unique ${a.unique}/5` : ""}${quadrant(a.fame, a.unique) ? " → " + quadrant(a.fame, a.unique) : ""}`));
    }
  }
  if (isFilled(s.purpose.ladder) || isFilled(s.purpose.antiValue)) { h2("05 Purpose"); item("Root (5 whys)", s.purpose.ladder); item("Anti-value", s.purpose.antiValue); }
  const P = s.positioning;
  const rtbs = P.rtbs.map((r, i) => ({ ...r, i })).filter((r) => clean(r.text));
  if (isFilled(P.ladder) || rtbs.length || isFilled(P.proof) || P.price != null) {
    h2("06 Positioning");
    item("Functional benefit", P.ladder.functional); item("Emotional benefit", P.ladder.emotional); item("Self-expressive benefit", P.ladder.expressive);
    if (rtbs.length) {
      line("- **Reasons to believe:**");
      rtbs.forEach((r) => line(`  ${r.i + 1}. ${clean(r.text)}${r.rival === true ? " ⚠ _rival can say_" : ""}${conf("positioning.rtbs." + r.i)}`));
    }
    item("Proof points", P.proof, conf("positioning.proof"));
    if (P.price != null) line("- **Price:** " + scale(PRICE[0], PRICE[1], P.price));
  }
  if (isFilled(ch.archetype.notes)) { h2("07 Character"); item("Why this archetype", ch.archetype.notes); }
  const V = s.voice;
  if (V.sliders.some((v) => v != null) || [V.say, V.neverSay, V.flex].some(isFilled)) {
    h2("08 Voice");
    VOICE_DIMS.forEach(([l, r], i) => { if (V.sliders[i] != null) line("- " + scale(l, r, V.sliders[i])); });
    item("We say", V.say); item("We never say", V.neverSay);
    item("When we celebrate", V.flex.celebrate); item("When we've messed up", V.flex.sorry); item("When we're selling", V.flex.sell);
  }
  const Vi = s.visual;
  if (isFilled(Vi)) {
    h2("10 Visual");
    item("Lean in", Vi.territories.in);
    if (Vi.territories.out.length) line(`- **Wince:** ${Vi.territories.out.map((t) => "~~" + t + "~~").join(", ")}`);
    VISUAL_DIALS.forEach(([l, r], i) => { if (Vi.dials[i] != null) line("- " + scale(l, r, Vi.dials[i])); });
    item("Allergies", Vi.avoid); item("Admiration", Vi.references); item("Mandatories", Vi.mandatories);
    if (Vi.touchpoints.length) line("- **Touchpoints, ranked:** " + Vi.touchpoints.map((t, i) => `${i + 1}. ${t}`).join(" · "));
  }
  const S = s.scope;
  if ([S.deliverables, S.timeline, S.budget, S.notes].some(isFilled)) {
    h2("11 Scope");
    item("Deliverables", S.deliverables); item("Timeline", S.timeline); item("Budget", S.budget); item("Room notes", S.notes);
  }

  /* 5. Validate & resolve */
  const asm = assumptions(s);
  const chk = checks(s);
  if (asm.length || chk.length || isFilled(S.openQuestions) || isFilled(S.risks) || isFilled(S.nextSteps)) {
    h2("Validate & resolve");
    if (asm.length) {
      line("**Assumptions to validate**");
      line();
      asm.forEach((a) => line(`- [ ] ${a.section} · **${a.label}**${a.value ? " — " + a.value : ""}${a.note ? " _(" + a.note + ")_" : ""}`));
      line();
    }
    if (chk.length) {
      line("**Checks**");
      line();
      chk.forEach((c) => line("- ⚠ " + c.text));
      line();
    }
    item("Open questions", S.openQuestions);
    item("Risks & red flags", S.risks);
    item("Next steps & owners", S.nextSteps);
  }

  line();
  line("---");
  line(`_${clean(s.setup.client) || "Client"} × ${clean(s.setup.facilitator) || "Facilitator"} · Discovery record · ${s.setup.date}_`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
