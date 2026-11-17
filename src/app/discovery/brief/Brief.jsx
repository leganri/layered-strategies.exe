"use client";
/* The brief as a paged A4 document, read in a small PDF-style reader.
   The document is built as a flat list of blocks; the blocks are measured once off-screen,
   then flowed onto fixed-size pages. The same pages are what prints, so the PDF matches the screen. */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, isFilled } from "../schema";
import { FIELDS } from "../content/tips";
import { CHARACTER, VOICE_DIMS, VISUAL_DIALS, PRICE } from "../content/options";
import { scalePos, STEPS } from "../ui/controls";
import PerceptualMap from "../ui/PerceptualMap";
import AssetGrid from "../ui/AssetGrid";
import Dropdown from "../ui/Dropdown";
import { SECTION_COLORS } from "../ui/SectionArt";
import { join, primarySegment, onlynessText, hasOnlyness, quadrant, assumptions } from "../logic/derive";
import { checks } from "../logic/checks";
import { briefToMarkdown } from "../logic/markdown";

/* A4 at 96 dpi */
const PAGE_W = 794, PAGE_H = 1123, PAD_X = 64, PAD_TOP = 76, PAD_BOT = 72;
const BODY_W = PAGE_W - PAD_X * 2, BODY_H = PAGE_H - PAD_TOP - PAD_BOT;

/* Copy the brief as Markdown (used by the app header). */
export async function copyBrief(data, onToast) {
  const md = briefToMarkdown(data);
  try {
    await navigator.clipboard.writeText(md);
    onToast && onToast("Copied");
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = md; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (er) {}
    document.body.removeChild(ta);
    onToast && onToast(ok ? "Copied" : "Couldn't copy - your browser blocked clipboard access.", ok ? undefined : "error");
  }
}

/* ---------------- document pieces (styled like the app's section pages) ---------------- */

/* keep ranges like "2-3" together when a question wraps */
const q = (path, fallback) => String((FIELDS[path] && FIELDS[path].label) || fallback || "").replace(/(\d)-(\d)/g, "$1‑$2");
const filled = (v) => (Array.isArray(v) ? v.some((x) => x != null && String(x).trim()) : isFilled(v));

/* lists read as a plain comma-separated line, like a typed document */
const Val = ({ v }) => <div className={"d-ans" + (Array.isArray(v) ? " list" : "")}>{Array.isArray(v) ? join(v) : v}</div>;

const Item = ({ label, v, children, wide }) => (
  <div className={"d-item" + (wide ? " wide" : "")}>
    <div className="d-q">{label}</div>
    {children ? <div className="d-a">{children}</div> : <Val v={v} />}
  </div>
);

const Scale = ({ left, right, value }) => {
  const p = scalePos(value);
  return (
    <div className="d-scale">
      <span className="d-scale-l">{left}</span>
      <span className="d-scale-t">
        {Array.from({ length: STEPS }, (_, i) => <i key={i} className={i === p ? "on" : ""} />)}
      </span>
      <span className="d-scale-r">{right}</span>
    </div>
  );
};

/* plain numbered heading over a hairline rule */
const SecHead = ({ num, title }) => (
  <div className="d-head">
    {num ? <span className="d-num">{num}</span> : null}
    <span className="d-title">{title}</span>
  </div>
);

/* Build the flat list of blocks. Each block: { k, node, keep (stay with next), brk (start a new page), sc (section colour) } */
function buildBlocks(s) {
  const out = [];
  const seg0 = primarySegment(s);
  const L = s.landscape;

  /* ---- cover ---- */
  const scq = s.business.scq;
  out.push({
    k: "cover", cover: true, node: (
      <div className="d-cover">
        <div className="d-cover-eyebrow">Brand discovery brief</div>
        <h1 className="d-cover-title">{s.setup.project || s.setup.client || "Untitled project"}</h1>
        {s.setup.project && s.setup.client && <div className="d-cover-sub">{s.setup.client}</div>}
        <table className="d-table">
          <tbody>
            {[["Client", s.setup.client], ["Industry", s.setup.sector], ["Session date", s.setup.date],
              ["Facilitator", s.setup.facilitator], ["Final call", s.setup.decider], ["Engagement", join(s.setup.engagement)]].map(([k, v]) => (
              <tr key={k}><th scope="row">{k}</th><td>{v || "—"}</td></tr>
            ))}
          </tbody>
        </table>
        {isFilled(scq.question) && <Item label="The question" v={scq.question} />}
        {isFilled(s.idea.answer) && <Item label="Our answer" v={s.idea.answer} />}
      </div>
    ),
  });

  /* helper that collects a section's blocks, and only adds the header when there is content */
  const section = (id, title, meta, fill, brk) => {
    const items = [];
    const add = (k, node) => items.push({ k: id + "." + k, node, sc: SECTION_COLORS[id] });
    const one = (k, label, v) => { if (filled(v)) add(k, <Item label={label} v={v} />); };
    const pair = (k, a, b) => { one(k + "a", a[0], a[1]); one(k + "b", b[0], b[1]); };
    const big = one;
    const sub = (k, text) => items.push({ k: id + "." + k, node: <div className="d-sub">{text}</div>, keep: true, sc: SECTION_COLORS[id] });
    fill({ add, one, pair, sub, big });
    if (!items.length) return;
    out.push({ k: "h" + id + title, node: <SecHead num={meta} title={title} />, keep: true, brk, sc: SECTION_COLORS[id], head: true });
    out.push(...items);
  };
  const metaFor = (id) => id;
  const sec = (id, fill) => { const x = SECTIONS.find((y) => y.id === id); section(id, x.title, metaFor(id), fill); };

  /* ---- the platform: the brand on one page ---- */
  section("09", "The platform", "", ({ add, one, pair, big }) => {
    one("essence", q("idea.essence"), s.idea.essence);
    big("trueline", q("idea.trueline", "Trueline"), s.idea.trueline);
    if (hasOnlyness(s)) big("only", "Onlyness", onlynessText(s));
    pair("pw", [q("positioning.promise", "Promise"), s.positioning.promise], [q("purpose.why", "Why"), s.purpose.why]);
    if (s.purpose.values.length) add("values", <Item label={q("purpose.values", "Values")}><Values values={s.purpose.values} /></Item>);
    pair("cv", ["Character", [s.character.archetype.primary, s.character.archetype.secondary].filter(Boolean).join(" + ")], ["Voice", s.voice.toneWords]);
  }, true);

  /* ---- every section, in the app's order and wording ---- */
  sec("00", ({ one, pair }) => {
    pair("a", [q("setup.client"), s.setup.client], [q("setup.project"), s.setup.project]);
    pair("b", [q("setup.facilitator"), s.setup.facilitator], [q("setup.sector"), s.setup.sector]);
    one("att", q("setup.attendees"), s.setup.attendees);
    one("eng", q("setup.engagement"), s.setup.engagement);
    pair("c", [q("setup.decider"), s.setup.decider], [q("setup.approvers"), s.setup.approvers]);
    one("in", q("setup.input"), s.setup.input);
  });
  sec("01", ({ one, pair, big }) => {
    one("sit", q("business.scq.situation"), scq.situation);
    one("com", q("business.scq.complication"), scq.complication);
    big("que", q("business.scq.question"), scq.question);
    one("one", q("business.oneLiner"), s.business.oneLiner);
    pair("ms", [q("business.model"), s.business.model], [q("business.stage"), s.business.stage]);
    one("rev", q("business.revenue"), s.business.revenue);
    one("amb", q("business.ambition"), s.business.ambition);
    one("met", q("business.metrics"), s.business.metrics);
  });
  sec("02", ({ add, one, pair, sub, big }) => {
    s.audience.segments.filter((x) => isFilled({ ...x, primary: false })).forEach((g, i) => {
      sub("sg" + g.id, (g.name || "Segment " + (i + 1)) + (g === seg0 && s.audience.segments.length > 1 ? "  ·  primary" : ""));
      one("d" + g.id, q("audience.segments.*.desc"), g.desc);
      one("j" + g.id, q("audience.segments.*.job"), g.job);
      pair("pp" + g.id, [q("audience.segments.*.push"), g.push], [q("audience.segments.*.pull"), g.pull]);
      pair("ah" + g.id, [q("audience.segments.*.anxiety"), g.anxiety], [q("audience.segments.*.habit"), g.habit]);
      one("i" + g.id, q("audience.segments.*.identity"), g.identity);
    });
    const ceps = s.audience.ceps.filter((c) => c.text.trim());
    if (ceps.length) add("ceps", <Item label={q("audience.ceps")}><div className="d-ans list">{[...ceps.filter((c) => c.star).map((c) => c.text + " (top)"), ...ceps.filter((c) => !c.star).map((c) => c.text)].join(", ")}</div></Item>);
    big("ins", q("audience.insight"), s.audience.insight);
    one("not", q("audience.notFor"), s.audience.notFor);
  });
  sec("03", ({ add, one, pair, sub, big }) => {
    L.competitors.filter((c) => isFilled({ ...c, x: null, y: null })).forEach((c, i) => {
      sub("c" + c.id, (c.name || "Competitor " + (i + 1)) + (c.threat ? "  ·  " + c.threat + " threat" : ""));
      pair("sw" + c.id, [q("landscape.competitors.*.strength"), c.strength], [q("landscape.competitors.*.weakness"), c.weakness]);
    });
    if ([L.map.us, L.map.target, ...L.competitors].some((p) => p.x != null && p.y != null))
      add("map", <Item wide label={q("landscape.map")}><div className="d-fig"><PerceptualMap readOnly data={s} /></div></Item>);
    one("en", q("landscape.enemy"), L.enemy);
    big("gap", q("landscape.gap"), L.gap);
    pair("cv", [q("landscape.conventions.keep"), L.conventions.keep], [q("landscape.conventions.break"), L.conventions.break]);
  });
  sec("04", ({ add, one, pair }) => {
    pair("nf", [q("perception.now"), s.perception.now], [q("perception.future"), s.perception.future]);
    one("mis", q("perception.misread"), s.perception.misread);
    one("fee", q("perception.feelings"), s.perception.feelings);
    const assets = s.perception.assets.filter((a) => a.name.trim());
    if (assets.length) add("as", (
      <Item label={q("perception.assets")}>
        <div className="d-list">{assets.map((a) => (
          <div key={a.id} className="d-row"><span className="d-row-k">{a.name}</span>
            <span className="d-row-v">{[a.type, a.fame != null && "fame " + a.fame + "/5", a.unique != null && "unique " + a.unique + "/5", quadrant(a.fame, a.unique)].filter(Boolean).join("  ·  ")}</span></div>
        ))}</div>
      </Item>
    ));
    if (assets.some((a) => a.fame != null && a.unique != null)) add("asg", <div className="d-wide"><div className="d-fig sm"><AssetGrid assets={assets} /></div></div>);
  });
  sec("05", ({ add, one, big }) => {
    big("why", q("purpose.why"), s.purpose.why);
    one("lad", q("purpose.ladder"), s.purpose.ladder);
    if (s.purpose.values.length) add("val", <Item label={q("purpose.values")}><Values values={s.purpose.values} /></Item>);
    one("anti", q("purpose.antiValue"), s.purpose.antiValue);
  });
  sec("06", ({ add, one, big }) => {
    if (s.positioning.price != null) add("price", <Item wide label={q("positioning.price")}><div className="d-scales"><Scale left={PRICE[0]} right={PRICE[1]} value={s.positioning.price} /></div></Item>);
    if (hasOnlyness(s)) big("only", "Onlyness", onlynessText(s));
    one("f", q("positioning.ladder.functional"), s.positioning.ladder.functional);
    one("e", q("positioning.ladder.emotional"), s.positioning.ladder.emotional);
    one("x", q("positioning.ladder.expressive"), s.positioning.ladder.expressive);
    const rtbs = s.positioning.rtbs.map((r, i) => ({ ...r, i })).filter((r) => r.text.trim());
    if (rtbs.length) add("rtb", <Item label={q("positioning.rtbs")}><div className="d-list">{rtbs.map((r) => (
      <div key={r.i} className="d-row num"><span className="d-n">{r.i + 1}</span><span className="d-ans flat">{r.text}{r.rival === true && <span className="d-flag">A rival could say this</span>}</span></div>
    ))}</div></Item>);
    one("pr", q("positioning.proof"), s.positioning.proof);
    big("pm", q("positioning.promise"), s.positioning.promise);
  });
  sec("07", ({ add, one }) => {
    if (s.character.sliders.some((v) => v != null)) add("sl", <Item wide label={q("character.sliders")}><Scales dims={CHARACTER} vals={s.character.sliders} /></Item>);
    one("ar", q("character.archetype.primary").replace(" (optional)", ""), [s.character.archetype.primary, s.character.archetype.secondary].filter(Boolean).join(" + "));
    one("no", q("character.archetype.notes"), s.character.archetype.notes);
    one("te", q("character.tension"), s.character.tension);
  });
  sec("08", ({ add, one, pair }) => {
    if (s.voice.sliders.some((v) => v != null)) add("sl", <Item wide label={q("voice.sliders")}><Scales dims={VOICE_DIMS} vals={s.voice.sliders} /></Item>);
    one("tw", q("voice.toneWords"), s.voice.toneWords);
    pair("sn", [q("voice.say"), s.voice.say], [q("voice.neverSay"), s.voice.neverSay]);
    one("ce", q("voice.flex.celebrate"), s.voice.flex.celebrate);
    one("so", q("voice.flex.sorry"), s.voice.flex.sorry);
    one("se", q("voice.flex.sell"), s.voice.flex.sell);
  });
  sec("09", ({ one, big }) => {
    big("an", q("idea.answer"), s.idea.answer);
    big("tl", q("idea.trueline"), s.idea.trueline);
    one("es", q("idea.essence"), s.idea.essence);
  });
  sec("10", ({ add, one, pair }) => {
    pair("t", ["Styles that feel right", s.visual.territories.in], ["Styles that feel wrong", s.visual.territories.out]);
    if (s.visual.dials.some((v) => v != null)) add("di", <Item wide label={q("visual.dials")}><Scales dims={VISUAL_DIALS} vals={s.visual.dials} /></Item>);
    one("av", q("visual.avoid"), s.visual.avoid);
    one("re", q("visual.references"), s.visual.references);
    one("ma", q("visual.mandatories"), s.visual.mandatories);
    if (s.visual.touchpoints.length) add("tp", <Item label={q("visual.touchpoints")}><div className="d-list">{s.visual.touchpoints.map((t, i) => (
      <div key={t} className="d-row num"><span className="d-n">{i + 1}</span><span className="d-ans flat">{t}</span></div>
    ))}</div></Item>);
  });
  sec("11", ({ one, pair }) => {
    one("de", q("scope.deliverables"), s.scope.deliverables);
    pair("tb", [q("scope.timeline"), s.scope.timeline], [q("scope.budget"), s.scope.budget]);
    one("ri", q("scope.risks"), s.scope.risks);
    one("no", q("scope.notes"), s.scope.notes);
    one("oq", q("scope.openQuestions"), s.scope.openQuestions);
    one("ns", q("scope.nextSteps"), s.scope.nextSteps);
  });

  /* ---- what still needs checking ---- */
  const asm = assumptions(s), chk = checks(s);
  if (asm.length || chk.length) {
    out.push({ k: "hval", node: <SecHead title="What to check next" />, keep: true, head: true });
    if (asm.length) out.push({ k: "asm", node: <Item label="Assumptions to test"><div className="d-list">{asm.map((a) => (
      <div key={a.path} className="d-row num"><span className="d-n sec">{a.section}</span><span className="d-ans flat"><strong>{a.label}</strong>{a.value ? " — " + a.value : ""}{a.note ? <span className="d-note"> {a.note}</span> : null}</span></div>
    ))}</div></Item> });
    if (chk.length) out.push({ k: "chk", node: <Item label="Checks"><div className="d-list">{chk.map((c) => <div key={c.id} className="d-row"><span className="d-ans flat">{c.text}</span></div>)}</div></Item> });
  }
  return out;
}

const Values = ({ values }) => (
  <div className="d-list">{values.filter((v) => v.name).map((v) => (
    <div key={v.name} className="d-row"><span className="d-row-k">{v.name}</span>{v.cost && v.cost.trim() && <span className="d-ans flat">{v.cost}</span>}</div>
  ))}</div>
);
const Scales = ({ dims, vals }) => <div className="d-scales">{dims.map(([l, r], i) => (vals[i] != null ? <Scale key={i} left={l} right={r} value={vals[i]} /> : null))}</div>;

/* ---------------- pagination ---------------- */

function paginate(blocks, heights) {
  const pages = [[]];
  let used = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let need = heights[i];
    /* a header keeps company with what follows it */
    for (let j = i; blocks[j] && blocks[j].keep && j + 1 < blocks.length; j++) need += heights[j + 1];
    const cur = pages[pages.length - 1];
    if (cur.length && (b.brk || blocks[i - 1]?.cover || used + Math.min(need, BODY_H) > BODY_H)) { pages.push([]); used = 0; }
    pages[pages.length - 1].push(i);
    used += heights[i];
  }
  return pages;
}

const ZOOMS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const MODES = ["Fit width", "Fit page", "50%", "75%", "100%", "125%", "150%", "200%"];

export default function Brief({ data }) {
  const blocks = useMemo(() => buildBlocks(data), [data]);
  const measure = useRef(null);
  const scroller = useRef(null);
  const pageRefs = useRef([]);
  const [pages, setPages] = useState(null);
  const [box, setBox] = useState({ w: 900, h: 700 });
  const [mode, setMode] = useState("Fit width");
  const [zoomN, setZoomN] = useState(1);
  const [cur, setCur] = useState(0);
  const [pageIn, setPageIn] = useState("1");

  /* measure every block off-screen, then flow onto pages */
  const layout = useCallback(() => {
    const el = measure.current;
    if (!el) return;
    const hs = [...el.children].map((c) => c.getBoundingClientRect().height);
    setPages(paginate(blocks, hs));
  }, [blocks]);
  useLayoutEffect(() => { layout(); }, [layout]);
  useEffect(() => { if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); }, [layout]);

  /* the reader's own size, for the fit modes */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const fit = () => setBox({ w: el.clientWidth, h: Math.min(el.clientHeight || window.innerHeight, window.innerHeight) });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gutter = box.w < 600 ? 16 : 40;
  const fitW = Math.max(0.3, Math.min(2, (box.w - gutter * 2) / PAGE_W));
  const fitP = Math.max(0.3, Math.min(fitW, (box.h - 120) / PAGE_H));
  const zoom = mode === "Fit width" ? fitW : mode === "Fit page" ? fitP : zoomN;
  const label = mode.startsWith("Fit") ? mode : Math.round(zoom * 100) + "%";
  const setPct = (z) => { setZoomN(Math.round(z * 100) / 100); setMode("custom"); };
  const step = (dir) => {
    const next = dir > 0 ? ZOOMS.find((z) => z > zoom + 0.001) : [...ZOOMS].reverse().find((z) => z < zoom - 0.001);
    if (next) setPct(next);
  };
  const pick = (m) => { if (m.startsWith("Fit")) setMode(m); else setPct(parseInt(m, 10) / 100); };

  /* which page is in view */
  useEffect(() => {
    const el = scroller.current;
    if (!el || !pages) return undefined;
    const onScroll = () => {
      const mid = window.innerHeight * 0.45;
      let best = 0;
      pageRefs.current.forEach((p, i) => { if (p && p.getBoundingClientRect().top <= mid) best = i; });
      setCur(best);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("scroll", onScroll); };
  }, [pages, zoom]);
  useEffect(() => setPageIn(String(cur + 1)), [cur]);

  const total = pages ? pages.length : 0;
  const go = (i) => {
    const n = Math.max(0, Math.min(total - 1, i));
    const p = pageRefs.current[n];
    if (p) p.scrollIntoView({ behavior: "smooth", block: "start" });
    setCur(n);
  };

  const title = data.setup.project || data.setup.client || "Brand discovery brief";

  return (
    <div className="reader">
      <div className="rd-scroll" ref={scroller}>
        {/* off-screen measuring copy, at the page's text width */}
        <div className="doc-body doc-measure" ref={measure} style={{ width: BODY_W }} aria-hidden="true">
          {blocks.map((b) => <div key={b.k} className={"db" + (b.head ? " head" : "") + (b.cover ? " cover" : "")} style={b.sc ? { "--sc": b.sc } : undefined}>{b.node}</div>)}
        </div>

        <div className="rd-pages" style={{ padding: gutter }}>
          {pages && pages.map((idx, pi) => (
            <div key={pi} className="rd-sheet" ref={(el) => (pageRefs.current[pi] = el)} style={{ width: PAGE_W * zoom, height: PAGE_H * zoom }}>
              <article className="doc-page" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${zoom})` }} aria-label={"Page " + (pi + 1) + " of " + total}>
                <header className="doc-run"><span>{title}</span><span>Brand discovery brief</span></header>
                <div className="doc-body" style={{ left: PAD_X, top: PAD_TOP, width: BODY_W, height: BODY_H }}>
                  {idx.map((i) => { const b = blocks[i]; return <div key={b.k} className={"db" + (b.head ? " head" : "") + (b.cover ? " cover" : "")} style={b.sc ? { "--sc": b.sc } : undefined}>{b.node}</div>; })}
                </div>
                <footer className="doc-foot"><span>Layered Studio</span><span className="doc-pg">{pi + 1}</span><span>{data.setup.date}</span></footer>
              </article>
            </div>
          ))}
        </div>

        {/* reader controls */}
        <div className="rd-bar-wrap no-print">
          <div className="rd-bar" role="toolbar" aria-label="Document controls">
            <button type="button" className="rd-b" aria-label="Previous page" disabled={cur <= 0} onClick={() => go(cur - 1)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="rd-page">
              <input className="rd-in" value={pageIn} inputMode="numeric" aria-label="Page number"
                style={{ width: Math.max(1, pageIn.length) + 1.4 + "ch" }}
                onChange={(e) => setPageIn(e.target.value.replace(/\D/g, "").slice(0, 3))}
                onFocus={(e) => e.target.select()}
                onBlur={() => setPageIn(String(cur + 1))}
                onKeyDown={(e) => { if (e.key === "Enter") { const n = parseInt(pageIn, 10); if (n) go(n - 1); e.target.blur(); } }} />
              <span className="rd-of">/ {total}</span>
            </span>
            <button type="button" className="rd-b" aria-label="Next page" disabled={cur >= total - 1} onClick={() => go(cur + 1)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="rd-sep" aria-hidden="true" />
            <button type="button" className="rd-b" aria-label="Zoom out" disabled={zoom <= ZOOMS[0] + 0.001} onClick={() => step(-1)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            <Dropdown className="up rd-zoom" label="Zoom" value={label} options={MODES} onChange={pick} />
            <button type="button" className="rd-b" aria-label="Zoom in" disabled={zoom >= ZOOMS[ZOOMS.length - 1] - 0.001} onClick={() => step(1)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            <span className="rd-sep" aria-hidden="true" />
            <button type="button" className="rd-b" aria-label="Download PDF" title="Download PDF" onClick={() => window.print()}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v8M4.8 7 8 10.2 11.2 7M3 13.5h10" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
