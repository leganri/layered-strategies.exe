/* ============================================================
   gsx/1.0 -> gsx/2.0 migration. Nothing is lost: anything without a
   v2 home is appended to scope.notes under "--- Imported from v1 ---".
   ============================================================ */
import { FORMAT, newSegment, newCompetitor } from "./schema";
import { V1_PERSONALITY } from "./content/options";

const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const filled = (v) => str(v).trim().length > 0;

function splitConventions(s) {
  const text = str(s);
  const i = text.search(/break\s*:/i);
  if (i === -1) return { keep: text.replace(/^\s*keep\s*:\s*/i, "").trim(), break: "" };
  return {
    keep: text.slice(0, i).replace(/^\s*keep\s*:\s*/i, "").trim(),
    break: text.slice(i).replace(/^break\s*:\s*/i, "").trim(),
  };
}

export function migrate(obj) {
  if (!obj || typeof obj !== "object") throw new Error("Not a session object");
  const { _format, _tool, _saved, ...rest } = obj;
  if (_format === FORMAT || (rest.meta && rest.meta.version === 2)) return rest;
  if (_format && _format !== "gsx/1.0") throw new Error("Unknown format " + _format);

  const v1 = rest;
  const notes = [];
  const note = (label, value) => { if (filled(value)) notes.push(label + ": " + str(value).trim()); };

  const s = v1.setup || {};
  const b = v1.business || {};
  const a = v1.audience || {};
  const l = v1.landscape || {};
  const p = v1.perception || {};
  const pe = v1.personality || {};
  const ar = v1.archetype || {};
  const va = v1.values || {};
  const po = v1.positioning || {};
  const vo = v1.voice || {};
  const wh = v1.wheel || {};
  const vi = v1.visual || {};
  const sc = v1.scope || {};
  const ps = Array.isArray(pe.sliders) ? pe.sliders : [];
  const sl = (i) => (typeof ps[i] === "number" ? ps[i] : null);

  // Dropped personality dials are kept as notes.
  [2, 8].forEach((i) => {
    if (sl(i) != null) note(V1_PERSONALITY[i].join("↔").toUpperCase(), (sl(i) + 1) + "/9");
  });
  note("HOW", va.how);
  note("WHAT", va.what);
  note("WHEEL VALUES", wh.values);
  note("WHEEL PERSONALITY", wh.personality);

  const proofParts = [str(po.proof).trim(), filled(wh.attributes) ? "Attributes: " + str(wh.attributes).trim() : ""].filter(Boolean);

  const segments = (Array.isArray(a.segments) ? a.segments : []).map((x, i) => ({
    ...newSegment(),
    name: str(x.name), desc: str(x.desc), identity: str(x.identity),
    job: str(x.needs), anxiety: str(x.frictions), primary: i === 0,
  }));

  const scopeNotes = [str(sc.notes).trim(), notes.length ? "--- Imported from v1 ---\n" + notes.join("\n") : ""].filter(Boolean).join("\n\n");

  return {
    meta: { version: 2, confidence: {}, timeSpent: {} },
    setup: {
      client: str(s.client), project: str(s.project), date: str(s.date), facilitator: str(s.facilitator),
      sector: str(s.sector), attendees: str(s.attendees), engagement: s.engagement || [],
      decider: str(s.decision), approvers: "", input: "",
    },
    business: {
      oneLiner: str(b.oneLiner), model: b.model || [], stage: b.stage ?? null, revenue: str(b.revenue),
      ambition: str(b.ambition), metrics: str(b.metrics), scq: { situation: "", complication: "", question: "" },
    },
    audience: { segments: segments.length ? segments : [newSegment()], ceps: [], insight: str(a.insight), notFor: str(a.notFor) },
    landscape: {
      competitors: (Array.isArray(l.competitors) ? l.competitors : []).map((c) => ({
        ...newCompetitor(), name: str(c.name), threat: c.threat ?? null, strength: str(c.strength), weakness: str(c.weakness),
      })),
      map: { x: ["", ""], y: ["", ""], us: { x: null, y: null }, target: { x: null, y: null } },
      enemy: str(l.enemy), gap: str(l.gap), conventions: splitConventions(l.conventions),
    },
    perception: {
      now: p.now || ["", "", ""], future: p.future || ["", "", ""], misread: str(p.misread), feelings: str(p.feelings),
      assets: [],
    },
    purpose: {
      why: str(va.why), ladder: str(va.ladder), antiValue: str(va.antiValue),
      values: (Array.isArray(va.picked) ? va.picked : []).map((name) => ({ name, cost: "" })),
    },
    positioning: {
      category: str(po.category), difference: str(po.difference), audience: str(po.audience), context: str(po.context),
      price: sl(10),
      ladder: { functional: str(wh.benefits), emotional: str(wh.emotional), expressive: "" },
      rtbs: (Array.isArray(po.props) ? po.props : []).map((t) => ({ text: str(t), rival: null })),
      proof: proofParts.join("\n"), promise: str(po.promise),
    },
    character: {
      sliders: [0, 1, 3, 4, 7, 9].map(sl),
      archetype: { primary: ar.primary ?? null, secondary: ar.secondary ?? null, notes: str(ar.notes) },
      tension: str(pe.tension),
    },
    voice: {
      sliders: Array.isArray(vo.sliders) ? vo.sliders : [null, null, null, null], toneWords: vo.toneWords || [],
      say: str(vo.say), neverSay: str(vo.neverSay), flex: { celebrate: "", sorry: "", sell: "" },
    },
    idea: { checks: [false, false, false, false, false], trueline: str(po.trueline), essence: str(wh.essence) },
    visual: {
      territories: { in: Array.isArray(vi.territories) ? vi.territories : [], out: [] },
      dials: [6, 5, 11].map(sl), avoid: str(vi.avoid), references: str(vi.references),
      mandatories: str(vi.mandatories), touchpoints: vi.touchpoints || [],
    },
    scope: {
      deliverables: sc.deliverables || [], timeline: str(sc.timeline), budget: sc.budget ?? null,
      risks: str(sc.risks), notes: scopeNotes, openQuestions: "",
    },
  };
}

