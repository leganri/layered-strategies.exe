"use client";
/* Section icons, drawn to the design sheet: hairline ink, gray secondary
   lines, dotted connectors. One small detail per icon carries the accent
   colour; locked sections render in ink and gray only. Parts move between
   "rest" and "hover" variants, which the parent card propagates. */
import React, { useEffect, useId, useRef } from "react";
import { motion } from "motion/react";

export const ACCENT = "#FF5E1A";
/* One colour per section for the icon detail: muted, distinct around the wheel, and at least
   3.3:1 against the card gray (#F4F3EF) so the small details stay legible. */
export const SECTION_COLORS = {
  "00": "#ED401E", // Setup: vermilion
  "01": "#17725E", // Business: emerald
  "02": "#6B81CE", // Audience: periwinkle
  "03": "#AF7C0E", // Landscape: amber
  "04": "#E23F77", // Perception: hot pink
  "05": "#2E3880", // Purpose: royal navy
  "06": "#D0171E", // Positioning: red
  "07": "#298FB3", // Character: cyan
  "08": "#7C4FBE", // Voice: violet
  "09": "#FF5E1A", // Brand Idea: the original bright orange
  "10": "#D35F76", // Visual: rose
  "11": "#F5B700", // Scope: bright yellow (boxes keep an ink outline so they still read)
};
const INK = "#686664"; // icon outlines: the app ink lightened 30% toward white
const GRAY = "#8E8E8A";

/* Smooth, unbouncy timing: a long ease-out that settles softly. */
export const EASE = [0.32, 0.72, 0, 1];
const t = (d = 0.55, delay = 0) => ({ duration: d, ease: EASE, delay });
const v = (rest, hover, tr = t()) => ({ rest: { ...rest, transition: tr }, hover: { ...hover, transition: tr } });
const pivot = (x, y) => ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` });

const L = { fill: "none", stroke: INK, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" };
const G = { ...L, stroke: GRAY };
const W = { ...L, fill: "#FDFDFB" };
const dots = { strokeDasharray: "1.5 3.5" };
/* accent-or-white fill for nodes that carry the colour */
const AW = (a) => ({ ...L, fill: a === INK ? "#FDFDFB" : a, stroke: a === INK ? INK : a });

/* cubic-bezier(EASE) as a function, so each circle can ease on its own */
const easeFn = (() => {
  const [x1, y1, x2, y2] = EASE;
  const bx = (s) => 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
  const by = (s) => 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
  const dx = (s) => 3 * (1 - s) * (1 - s) * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s * s * (1 - x2);
  return (t) => {
    if (t <= 0) return 0; if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) { const e = bx(s) - t; if (Math.abs(e) < 1e-5) break; const d = dx(s); if (Math.abs(d) < 1e-6) break; s = Math.min(1, Math.max(0, s - e / d)); }
    return by(s);
  };
})();

/* One shared clock, the Audience feel: it runs forward (linear) on hover and
   backward at 0.8x on leave, and every part eases inside its own window of that
   clock, so leaving is an exact mirror of arriving: last out, first back. */
function Timeline({ total, onFrame }) {
  return (
    <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={(l) => { if (l.pathLength != null) onFrame(l.pathLength * total); }}
      variants={{
        rest: { pathLength: 0, transition: { duration: total * 0.8, ease: "linear" } },
        hover: { pathLength: 1, transition: { duration: total, ease: "linear" } },
      }} />
  );
}
const win = (time, start, dur) => easeFn((time - start) / dur);
const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const mix = (c1, c2, k) => { const A = hex(c1), B = hex(c2); return "rgb(" + A.map((v, n) => Math.round(v + (B[n] - v) * k)).join(",") + ")"; };

/* Hub and spokes: at rest only the decider (centre) shows. On hover the four
   people slide out from behind it one by one as white outlined circles, then
   take the colour one by one; the colour covers the outline as it fills. */
const SET_STEP = 0.11, SET_DUR = 0.7, SET_FILL = 0.55, SET_FILL_DUR = 0.3;
const SET_TOTAL = SET_FILL + 3 * SET_STEP + SET_FILL_DUR;
/* Once everyone is out, the group keeps cycling: the links squish in, the whole set turns 90°,
   then the people pop back out to full length, rest, and go again. */
/* ---------- shared beat ----------
   Every looping icon keys its repeating moves to one clock, so across the grid they all move together.
   The first move on hover is immediate; each later move waits for the next beat. */
const BEAT = 3.0; // seconds
const clockS = () => (typeof performance !== "undefined" ? performance.now() / 1000 : 0);
/* the next beat time at least minGap seconds from now (offset shifts the grid for icons that peak mid-move) */
const nextOnBeat = (t, minGap = 0.25, offset = 0) => Math.ceil((t + minGap + offset) / BEAT) * BEAT - offset;
/* Every interval move starts exactly on a beat and lasts exactly MOVE seconds, so they all start and stop
   together. Positions are computed from the shared clock (not from per-icon timers), so nothing drifts. */
const MOVE = 1.0;
const beatPos = (t) => { const n = Math.floor(t / BEAT); return { n, ph: t - n * BEAT }; };
/* the first beat whose move has not started yet (the one to join when a loop begins) */
const firstBeat = (t) => { const { n, ph } = beatPos(t); return ph < 0.03 ? n : n + 1; };
/* progress through the beat-locked moves since `start`: whole = moves already finished, u = current move 0..1.
   With a `stop` beat, nothing moves after that beat's move completes. */
const beatProgress = (t, start, stop) => {
  let { n, ph } = beatPos(t);
  let u = Math.min(1, ph / MOVE);
  if (stop != null && n > stop) { n = stop; u = 1; }
  if (n < start) return { whole: 0, u: 0, active: false };
  return { whole: n - start, u, active: true };
};
/* the beat to stop after when leaving: the move in progress (or the last one) finishes, no new one starts */
const stopBeat = (t, start) => Math.max(start - 1, beatPos(t).n);
const beatDone = (t, stop) => { const { n, ph } = beatPos(t); return n > stop || ph >= MOVE; };
const easeInOut3 = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

const SET_SQ = 0.74; // how far the links squish in before the turn
const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeBack = (u) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }; // small overshoot
function Setup({ a }) {
  const locked = a === INK;
  const base = [-90, 0, 90, 180]; // degrees: up, right, down, left
  const dot = useRef([]), link = useRef([]);
  const m = useRef({ time: 0, ang: 0, sq: 1, col: 1, phase: "rest", t: 0, from: 0, raf: 0, last: 0 });
  const draw = () => {
    const st = m.current;
    base.forEach((deg, i) => {
      const el = dot.current[i]; if (!el) return;
      const k = win(st.time, i * SET_STEP, SET_DUR);
      const th = ((deg + st.ang) * Math.PI) / 180, D = 29 * k * st.sq;
      const ux = Math.cos(th), uy = Math.sin(th);
      el.setAttribute("cx", (50 + ux * D).toFixed(2)); el.setAttribute("cy", (50 + uy * D).toFixed(2));
      /* the four people stay white with an ink outline; only the centre carries the colour */
      el.setAttribute("fill", "#FDFDFB");
      el.setAttribute("stroke", INK);
      const ln = link.current[i]; if (!ln) return;
      const r0 = 14, r1 = D - 7.5;
      ln.setAttribute("d", r1 > r0 + 0.5 ? "M" + (50 + ux * r0).toFixed(2) + " " + (50 + uy * r0).toFixed(2) + " L" + (50 + ux * r1).toFixed(2) + " " + (50 + uy * r1).toFixed(2) : "M50 50");
      ln.setAttribute("opacity", win(st.time, 0.18 + i * SET_STEP, 0.35).toFixed(3));
    });
  };
  /* one beat-locked move, no turning: the links squish in (first half), then pop back out (second half) */
  const loop = (now) => {
    const st = m.current, t = now / 1000;
    const out = st.time >= SET_TOTAL - 1e-3;
    if (!out && st.stop == null) st.stop = stopBeat(t, st.start); // leaving: finish this move, start no new one
    const { whole, u, active } = beatProgress(t, st.start, st.stop);
    st.ang = 0;
    if (active) {
      st.sq = u < 0.45 ? 1 - (1 - SET_SQ) * easeIO(u / 0.45) : u < 0.55 ? SET_SQ : SET_SQ + (1 - SET_SQ) * easeBack((u - 0.55) / 0.45);
    } else st.sq = 1;
    draw();
    if (st.stop != null && beatDone(t, st.stop)) { st.sq = 1; st.ang %= 360; draw(); st.raf = 0; return; }
    st.raf = requestAnimationFrame(loop);
  };
  const frame = (time) => {
    const st = m.current;
    st.time = time;
    if (time <= 0.001 && !st.raf) st.ang = 0; // fully tucked away: start the next hover square-on
    draw();
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (time >= SET_TOTAL - 1e-3 && !st.raf && !reduce) {
      st.start = firstBeat(clockS()); st.stop = null; st.base = st.ang % 360;
      st.raf = requestAnimationFrame(loop);
    }
  };
  useEffect(() => () => { if (m.current.raf) cancelAnimationFrame(m.current.raf); }, []);
  return (
    <>
      <Timeline total={SET_TOTAL} onFrame={frame} />
      {base.map((_, i) => (<path key={i} ref={(el) => (link.current[i] = el)} d="M50 50" {...L} {...dots} opacity="0" />))}
      {base.map((_, i) => (<circle key={i} ref={(el) => (dot.current[i] = el)} cx="50" cy="50" r="6.5" fill="#FDFDFB" stroke={INK} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />))}
      <circle cx="50" cy="50" r="13" fill={locked ? "#FDFDFB" : a} stroke={locked ? INK : a} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </>
  );
}

/* Bars with a trend curve floating above them. At rest it is a short ink stub
   over the lowest bar; on hover it turns accent, then climbs to the top bar.
   The arrowhead rides the end of the drawn curve (by arc length) and turns with it. */
const TREND = [[16, 46], [40, 44], [60, 28], [76, 6]]; // cubic: start, c1, c2, end
const TREND_D = `M${TREND[0]} C${TREND[1]} ${TREND[2]} ${TREND[3]}`;
const REST = 0.28;
const TREND_PTS = (() => {
  const [p0, p1, p2, p3] = TREND, pts = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160, u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const prev = pts[i - 1];
    pts.push({ x, y, len: prev ? prev.len + Math.hypot(x - prev.x, y - prev.y) : 0 });
  }
  return pts;
})();
function trendAt(f) {
  const total = TREND_PTS[TREND_PTS.length - 1].len, target = Math.min(1, Math.max(0, f)) * total;
  let i = TREND_PTS.findIndex((p) => p.len >= target);
  if (i <= 0) i = 1;
  const a = TREND_PTS[i - 1], b = TREND_PTS[i];
  const k = b.len === a.len ? 0 : (target - a.len) / (b.len - a.len);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}

const BIZ_GROW_AT = 0.12, BIZ_GROW = 0.8;
const BIZ_BARS = [[22, 14], [36, 24], [50, 34], [64, 44]]; // [x, height], baseline at y 82, width 9
/* Bars fill with the accent from the bottom, one by one, as the arrow tip sweeps
   over them: each bar owns an equal slice of the tip's travel from rest to the top,
   so the fill follows the arrow's own speed. */
const bizFill = (() => {
  let x0 = null, x1 = null;
  return (tipX, n) => {
    if (x0 == null) { x0 = trendAt(REST).x; x1 = trendAt(1).x; }
    const span = (x1 - x0) / BIZ_BARS.length;
    return Math.min(1, Math.max(0, (tipX - (x0 + n * span)) / span));
  };
})();
const BIZ_TOTAL = BIZ_GROW_AT + BIZ_GROW;
/* Leaving: the arrow falls like a dropped ball. It speeds up on the way down,
   lands on its rest spot, bounces up a touch and settles. */
const BIZ_HIT = 0.78, BIZ_BOUNCE = 0.07;
/* Flex: at the top, the arrow strains like a flexed muscle. A fast tremor (two
   mixed frequencies so it feels organic) that builds up, plus a slow push higher. */
/* Hovered and fully drawn: the arrow bobs along its own line (slips back a little, rises to the tip, again),
   and on every rise the tallest bar stretches up like an elastic band: it lags, resists, then springs back
   down with the arrow. BOB_RANGE is in path length, BAR_STRETCH in icon units. */
const FLEX_BUILD = 0.5, BOB_RANGE = 0.16, BAR_STRETCH = 10, SPRING_K = 120, SPRING_C = 9; // one wind-up and punch per beat
/* per beat (seconds after the beat): wind up back down the line, punch up to the tip, then rest */
const BIZ_WIND = 0.68, BIZ_PUNCH = 0.32, BIZ_HOLD = 0.3; // wind + punch = MOVE, so it starts and lands with the others
const dropCurve = (r) => {
  if (r <= 0) return 0; if (r >= 1) return 1;
  if (r < BIZ_HIT) { const q = r / BIZ_HIT; return q * q; }
  const u = (r - BIZ_HIT) / (1 - BIZ_HIT);
  return 1 - BIZ_BOUNCE * 4 * u * (1 - u);
};
function Business({ a, still }) {
  const id = "trend-" + useId().replace(/:/g, "");
  const head = useRef(null), reveal = useRef(null), line = useRef(null), tip = useRef(null);
  const place = (p) => `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.deg.toFixed(2)})`;
  const st = useRef({ time: 0, f: REST, closing: false, t0: 0, f0: REST });
  const shake = useRef(null);
  const flex = useRef({ hovering: false, tension: 0, clock: 0, raf: 0, last: 0, x: 0, v: 0 });
  const fills = useRef([]), fillLv = useRef(BIZ_BARS.map(() => 0));
  const tall = useRef({ clip: null, body: null, outline: null });
  /* how far the arrow has slipped back down its line: 0 at the tip, BOB_RANGE at the bottom of a bob */
  /* on the shared beat: the arrow winds up back down its line (ease in-out), then punches up to the tip (fast ease out) */
  const beatT = () => clockS() % BEAT;
  const bobAt = (fx) => {
    const t = beatT();
    let d = 0;
    if (t < BIZ_WIND) { const u = t / BIZ_WIND; d = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
    else if (t < BIZ_WIND + BIZ_PUNCH) { const u = (t - BIZ_WIND) / BIZ_PUNCH; d = Math.pow(1 - u, 3); }
    return fx.tension * BOB_RANGE * d;
  };
  /* the tallest bar is yanked up the moment the arrow punches, holds, then lets go; the spring gives the overshoot */
  const barPull = () => { const t = beatT(); return t >= BIZ_WIND + BIZ_PUNCH * 0.4 && t < BIZ_WIND + BIZ_PUNCH + BIZ_HOLD ? 1 : 0; };
  const render = () => {
    const m = st.current, fx = flex.current;
    const f = m.f - bobAt(fx);
    const tipX = trendAt(Math.min(1, m.f)).x; // bars fill from the drawn reach, so the bob never drains them
    const extra = BAR_STRETCH * fx.x;          // the tallest bar's elastic stretch
    const last = BIZ_BARS.length - 1;
    BIZ_BARS.forEach(([, h0], n) => {
      const el = fills.current[n]; if (!el) return;
      const h = n === last ? h0 + extra : h0;
      /* on the way out a bar only ever drains, so the arrow bounce never refills it */
      const want = bizFill(tipX, n);
      const lv = m.closing ? Math.min(fillLv.current[n], want) : want;
      fillLv.current[n] = lv;
      const fh = h * lv;
      el.setAttribute("y", (82 - fh).toFixed(2)); el.setAttribute("height", fh.toFixed(2));
    });
    const hT = BIZ_BARS[last][1] + extra;
    [tall.current.clip, tall.current.body, tall.current.outline].forEach((el) => {
      if (el) { el.setAttribute("y", (82 - hT).toFixed(2)); el.setAttribute("height", hT.toFixed(2)); }
    });
    if (reveal.current) reveal.current.setAttribute("stroke-dasharray", f.toFixed(4) + " 1");
    if (head.current) head.current.setAttribute("transform", place(trendAt(Math.min(1, f))));
  };
  const flexLoop = (now) => {
    const fx = flex.current, m = st.current;
    const dt = fx.last ? Math.min(0.05, (now - fx.last) / 1000) : 0;
    fx.last = now;
    /* runs whenever the icon is in its played state (hovered, finished card, or section header), on the shared beat */
    const top = fx.hovering && m.f >= 0.999;
    fx.tension = top ? Math.min(1, fx.tension + dt / FLEX_BUILD) : Math.max(0, fx.tension - dt * 2.5);
    if (fx.tension > 0) fx.clock += dt; else fx.clock = 0;
    /* elastic bar: a damped spring chasing the pull, so it overshoots up on the punch and bounces back down */
    const target = fx.tension * barPull();
    const acc = SPRING_K * (target - fx.x) - SPRING_C * fx.v;
    fx.v += acc * dt; fx.x += fx.v * dt;
    render();
    const settled = !fx.hovering && fx.tension <= 0 && Math.abs(fx.x) < 1e-3 && Math.abs(fx.v) < 1e-3;
    if (settled) { fx.x = 0; fx.v = 0; render(); fx.raf = 0; fx.last = 0; } else fx.raf = requestAnimationFrame(flexLoop);
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const fx = flex.current;
    fx.hovering = l.pathLength > 0.5;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fx.hovering && !fx.raf && !reduce) fx.raf = requestAnimationFrame(flexLoop);
  };
  useEffect(() => () => cancelAnimationFrame(flex.current.raf), []);
  const frame = (time) => {
    const m = st.current;
    const closing = time < m.time;
    if (closing && !m.closing) { m.t0 = m.time; m.f0 = m.f; } // just started leaving: drop from here
    m.closing = closing;
    let f;
    if (closing) {
      const span = m.t0 - BIZ_GROW_AT;
      const r = span > 0 ? (m.t0 - time) / span : 1;
      f = m.f0 - (m.f0 - REST) * dropCurve(r);
    } else {
      f = Math.max(m.f, REST + (1 - REST) * win(time, BIZ_GROW_AT, BIZ_GROW)); // never jump back when re-entering mid-drop
    }
    m.time = time; m.f = f;
    render();
  };
  return (
    <>
      <Timeline total={BIZ_TOTAL} onFrame={frame} />
      {/* hover flag for the flex loop */}
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <path d="M16 82 H84" {...L} />
      {/* each bar: white body, accent fill rising from the bottom (clipped to the bar), outline on top */}
      {BIZ_BARS.map(([x, h], n) => (
        <g key={x}>
          <clipPath id={id + "-b" + n}><rect ref={n === BIZ_BARS.length - 1 ? (el) => (tall.current.clip = el) : undefined} x={x} y={82 - h} width="9" height={h} rx="2" /></clipPath>
          <rect ref={n === BIZ_BARS.length - 1 ? (el) => (tall.current.body = el) : undefined} x={x} y={82 - h} width="9" height={h} rx="2" fill="#FDFDFB" />
          <rect ref={(el) => (fills.current[n] = el)} x={x} y="82" width="9" height="0" fill={a} clipPath={`url(#${id}-b${n})`} />
          <rect ref={n === BIZ_BARS.length - 1 ? (el) => (tall.current.outline = el) : undefined} x={x} y={82 - h} width="9" height={h} rx="2" {...L} />
        </g>
      ))}
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <path ref={reveal} d={TREND_D} pathLength="1" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="butt" strokeDasharray={REST + " 1"} />
      </mask>
      <g ref={shake}>
        <path ref={line} d={TREND_D} {...L} strokeDasharray="2 3" mask={`url(#${id})`} />
        <g ref={head} transform={place(trendAt(REST))}>
          <path ref={tip} d="M-6 -3.6 L0 0 L-6 3.6" {...L} />
        </g>
      </g>
    </>
  );
}

/* Peacock: seven circles evenly spaced on the dotted ring; at rest they all wait behind the person
   (filled with the card colour via .knock, so it hides them without looking filled). On hover they fan
   out to their places, the accent at the crown. Then the ring steps clockwise one place at a time, with a
   pause between steps: circles slide out from behind the person on one side and tuck in on the other, and
   the accent circle simply rides round with the others. */
const FAN_C = [50, 50], FAN_R = 30; // dotted circle: centre, radius
const fanPt = (deg) => { const r = (deg * Math.PI) / 180; return [FAN_C[0] + FAN_R * Math.sin(r), FAN_C[1] - FAN_R * Math.cos(r)]; };
const FAN_STEP = 0.11, FAN_DUR = 0.7;
const FAN_N = 7, FAN_GAP = 360 / FAN_N; // even spacing; the two lowest sit behind the person
const FAN = [0, 1, -1, 2, -2, 3, -3].map((slot, i) => ({ target: slot * FAN_GAP, accent: slot === 0, delay: i * FAN_STEP }));
const FAN_TOTAL = FAN[FAN.length - 1].delay + FAN_DUR;
const FAN_T_TURN = 1.05; // seconds per step; each step starts on the shared beat
const wrap180 = (d) => { let x = ((d + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; };

function Audience({ a }) {
  const refs = useRef([]);
  const m = useRef({ time: 0, rot: 0, from: 0, phase: "rest", t: 0, raf: 0, last: 0 });
  const draw = () => {
    const st = m.current;
    FAN.forEach((c, i) => {
      const el = refs.current[i]; if (!el) return;
      const T = wrap180(c.target + st.rot);          // where this circle sits on the ring now
      const from = T >= 0 ? 180 : -180;               // it comes out from (and tucks back to) the nearer side of the bottom
      const p = easeFn((st.time - c.delay) / FAN_DUR);
      const [x, y] = fanPt(from + (T - from) * p);
      el.setAttribute("cx", x.toFixed(2)); el.setAttribute("cy", y.toFixed(2));
    });
  };
  /* one step per beat, each exactly one MOVE long, computed from the shared clock */
  const loop = (now) => {
    const st = m.current, t = now / 1000;
    const out = st.time >= FAN_TOTAL - 1e-3;
    if (!out && st.stop == null) st.stop = stopBeat(t, st.start); // leaving: finish this step, start no new one
    const { whole, u, active } = beatProgress(t, st.start, st.stop);
    st.rot = active ? (st.base + FAN_GAP * (whole + easeInOut3(u))) % 360 : st.base;
    draw();
    if (st.stop != null && beatDone(t, st.stop)) { st.raf = 0; return; }
    st.raf = requestAnimationFrame(loop);
  };
  const frame = (time) => {
    const st = m.current;
    st.time = time;
    if (time <= 0.001 && !st.raf) st.rot = 0; // all tucked away: next hover starts from the home layout
    draw();
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (time >= FAN_TOTAL - 1e-3 && !st.raf && !reduce) {
      st.start = firstBeat(clockS()); st.stop = null; st.base = st.rot;
      st.raf = requestAnimationFrame(loop);
    }
  };
  useEffect(() => () => { if (m.current.raf) cancelAnimationFrame(m.current.raf); }, []);
  return (
    <>
      <circle cx={FAN_C[0]} cy={FAN_C[1]} r={FAN_R} {...G} {...dots} />
      <Timeline total={FAN_TOTAL} onFrame={frame} />
      {FAN.map((c, i) => (
        <circle key={i} ref={(el) => (refs.current[i] = el)} cx={fanPt(180)[0]} cy={fanPt(180)[1]} r="4.5" {...(c.accent ? AW(a) : W)} />
      ))}
      {/* the person covers the waiting circles */}
      {/* a slightly broader body, so the two circles waiting at the bottom are fully hidden */}
      <path className="knock" d="M31 89 V80 A19 19 0 0 1 69 80 V89 Z" stroke="none" />
      <path d="M31 89 V80 A19 19 0 0 1 69 80 V89" {...L} />
      <circle className="knock" cx="50" cy="44" r="9" {...L} fill={undefined} />
    </>
  );
}

/* Perceptual map: four equal positions. On hover the axes slide toward the
   bottom-left, so our quadrant (top-right) opens up and the rivals' close in.
   Every dot stays centred in its quadrant: the rivals shrink one by one, ours
   grows gradually into the space, then keeps a soft pulse with a ripple. */
const LAND_R = 6, LAND_BIG = 10.5, LAND_SHIFT = 10;
/* outlined white dots read larger than the solid accent at the same radius, so they are drawn a touch smaller */
const LAND_RW = 5.4, LAND_SMALL = 3.8;
const LAND_GROW_AT = 0.06, LAND_GROW = 0.8;
const LAND_TOTAL = LAND_GROW_AT + LAND_GROW;
const LAND_PULSE = 1.6, LAND_RIPPLE = 6.5; // frame-driver period (s); the pulse itself follows the shared beat. Ripple spread past the dot
/* quadrant centres for a cross at (cx, cy) inside the 18..82 square */
const landQuads = (cx, cy) => ({
  tl: [(18 + cx) / 2, (18 + cy) / 2], bl: [(18 + cx) / 2, (cy + 82) / 2],
  br: [(cx + 82) / 2, (cy + 82) / 2], tr: [(cx + 82) / 2, (18 + cy) / 2],
});
function Landscape({ a }) {
  const rivals = ["tl", "bl", "br"];
  const dot = useRef([]), mine = useRef(null), ring = useRef(null), cross = useRef(null);
  const st = useRef({ time: 0, pulse: 0, closing: false });
  const draw = () => {
    const { time, pulse, closing } = st.current;
    const lin = Math.min(1, Math.max(0, (time - LAND_GROW_AT) / LAND_GROW));
    /* dramatic ease in-out (quint): a held-back start, then a strong surge that settles softly */
    const k = lin < 0.5 ? 16 * lin ** 5 : 1 - Math.pow(-2 * lin + 2, 5) / 2;
    const cx = 50 - LAND_SHIFT * k, cy = 50 + LAND_SHIFT * k;
    const q = landQuads(cx, cy);
    if (cross.current) cross.current.setAttribute("d", `M${cx.toFixed(2)} 18 V82 M18 ${cy.toFixed(2)} H82`);
    rivals.forEach((key, n) => {
      const el = dot.current[n]; if (!el) return;
      el.setAttribute("cx", q[key][0].toFixed(2)); el.setAttribute("cy", q[key][1].toFixed(2));
      const rk = k; // the white dots shrink and regrow on the same curve as the cross, in and out
      el.setAttribute("r", (LAND_RW + (LAND_SMALL - LAND_RW) * rk).toFixed(2));
    });
    /* the pulse only fades in as the dot reaches full size */
    const beat = Math.sin(Math.PI * pulse) ** 2, amt = k * k * k;
    const r = LAND_R + (LAND_BIG - LAND_R) * k + 0.9 * beat * amt;
    if (mine.current) { mine.current.setAttribute("cx", q.tr[0].toFixed(2)); mine.current.setAttribute("cy", q.tr[1].toFixed(2)); mine.current.setAttribute("r", r.toFixed(2)); }
    if (ring.current) {
      ring.current.setAttribute("cx", q.tr[0].toFixed(2)); ring.current.setAttribute("cy", q.tr[1].toFixed(2));
      ring.current.setAttribute("r", (LAND_R + (LAND_BIG - LAND_R) * k + LAND_RIPPLE * pulse).toFixed(2));
      ring.current.setAttribute("opacity", (0.7 * (1 - pulse) * amt).toFixed(3));
    }
  };
  /* the pulse reads the shared beat, so its ripple goes out on the same beat as the other icons move */
  /* the ripple runs during each beat's MOVE window, then rests, exactly like the other icons' moves */
  const beatPulse = () => { const ph = clockS() % BEAT; return ph < MOVE ? ph / MOVE : 1; };
  const frame = (time) => { const m = st.current; m.closing = time < m.time; m.time = time; m.pulse = beatPulse(); draw(); };
  const q0 = landQuads(50, 50);
  return (
    <>
      <Timeline total={LAND_TOTAL} onFrame={frame} />
      {/* keeps frames coming while hovered; the pulse value itself comes from the beat */}
      <motion.path d="M0 0 H1" fill="none" stroke="none"
        onUpdate={(l) => { if (l.pathLength != null) { st.current.pulse = beatPulse(); draw(); } }}
        variants={{
          rest: { pathLength: 0, transition: { duration: 0.35, ease: EASE } },
          hover: { pathLength: [0, 1], transition: { duration: LAND_PULSE, ease: "linear", repeat: Infinity } },
        }} />
      <rect x="18" y="18" width="64" height="64" rx="4" {...L} />
      <path ref={cross} d="M50 18 V82 M18 50 H82" {...G} />
      {rivals.map((key, n) => (<circle key={key} ref={(el) => (dot.current[n] = el)} cx={q0[key][0]} cy={q0[key][1]} r={LAND_RW} {...W} />))}
      <circle ref={ring} cx={q0.tr[0]} cy={q0.tr[1]} r={LAND_R} fill="none" stroke={a} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0" />
      <circle ref={mine} cx={q0.tr[0]} cy={q0.tr[1]} r={LAND_R} fill={a} />
    </>
  );
}

/* The original eye with a tired, heavy lid that hides about 40% of the pupil.
   On hover the lid lifts; at the same time the pupil glides right and fills with
   the accent, and seven lashes grow from the lid line left to right in step with
   its look. Lashes are equal length and evenly spaced from corner to corner. */
const EYE_TIRED = [49, 48, 48], EYE_OPEN = [36, 30, 30]; // upper lid: c1.y, c2.y, apex y
const EYE_LID_DUR = 0.55, EYE_LOOK_AT = 0.12, EYE_LOOK_DUR = 0.8, EYE_LOOK_X = 10;
const EYE_LASH_AT = 0.15, EYE_LASH_DUR = 0.42, EYE_LASH_STEP = 0.075, EYE_LASH_LEN = 8.5, EYE_LASH_W = 2;
const EYE_BLINK = 0.12, EYE_BLINK_AT = 0.68; // overshoot depth (share of the lid travel), when in the close it starts
const EYE_N = 7, EYE_SPAN = [0.1, 0.9]; // part of the lid length the lashes cover
const EYE_TOTAL = Math.max(EYE_LOOK_AT + EYE_LOOK_DUR, EYE_LASH_AT + (EYE_N - 1) * EYE_LASH_STEP + EYE_LASH_DUR);
const EYE_ROUND = 0.05; // how far each lid curve stops short of the corner; the gap becomes a soft turn
const lerp2 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
/* split a cubic at t (de Casteljau) into [left, right] control points */
function splitCubic(p0, p1, p2, p3, t) {
  const a = lerp2(p0, p1, t), b = lerp2(p1, p2, t), c = lerp2(p2, p3, t), d = lerp2(a, b, t), e = lerp2(b, c, t), m = lerp2(d, e, t);
  return [[p0, a, d, m], [m, e, c, p3]];
}
const P = (p) => p[0].toFixed(2) + " " + p[1].toFixed(2);
/* the whole eye as one closed outline with slightly rounded corners */
function eyeOutline(y1, y2, y3) {
  const r = EYE_ROUND;
  const ul = splitCubic([12, 50], [24, y1], [37, y2], [50, y3], r)[1];
  const ur = splitCubic([50, y3], [63, y2], [76, y1], [88, 50], 1 - r)[0];
  const lr = splitCubic([88, 50], [76, 64], [63, 70], [50, 70], r)[1];
  const ll = splitCubic([50, 70], [37, 70], [24, 64], [12, 50], 1 - r)[0];
  return "M" + P(ul[0]) + " C" + P(ul[1]) + " " + P(ul[2]) + " " + P(ul[3]) +
    " C" + P(ur[1]) + " " + P(ur[2]) + " " + P(ur[3]) + " Q88 50 " + P(lr[0]) +
    " C" + P(lr[1]) + " " + P(lr[2]) + " " + P(lr[3]) +
    " C" + P(ll[1]) + " " + P(ll[2]) + " " + P(ll[3]) + " Q12 50 " + P(ul[0]) + " Z";
}
function eyeGeom(k) {
  const [y1, y2, y3] = EYE_TIRED.map((v, n) => v + (EYE_OPEN[n] - v) * k);
  const upper = `M12 50 C24 ${y1.toFixed(2)} 37 ${y2.toFixed(2)} 50 ${y3.toFixed(2)} C63 ${y2.toFixed(2)} 76 ${y1.toFixed(2)} 88 50`;
  /* sample the lid (left half, then mirrored right half) to place lashes by arc length */
  const half = [];
  for (let n = 0; n <= 60; n++) {
    const t = n / 60, u = 1 - t;
    half.push([u * u * u * 12 + 3 * u * u * t * 24 + 3 * u * t * t * 37 + t * t * t * 50, u * u * u * 50 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
  }
  const pts = [...half, ...half.slice(0, -1).reverse().map(([x, y]) => [100 - x, y])];
  const cum = [0];
  for (let n = 1; n < pts.length; n++) cum.push(cum[n - 1] + Math.hypot(pts[n][0] - pts[n - 1][0], pts[n][1] - pts[n - 1][1]));
  const total = cum[cum.length - 1];
  const lashes = Array.from({ length: EYE_N }, (_, m) => {
    const target = (EYE_SPAN[0] + ((EYE_SPAN[1] - EYE_SPAN[0]) * m) / (EYE_N - 1)) * total;
    let n = cum.findIndex((c) => c >= target); if (n <= 0) n = 1;
    const [ax, ay] = pts[n - 1], [bx, by] = pts[n];
    const f = (target - cum[n - 1]) / (cum[n] - cum[n - 1] || 1);
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    return { x: ax + dx * f, y: ay + dy * f, nx: dy / len, ny: -dx / len }; // travelling left to right, (dy,-dx) points up and out
  });
  return { upper, outline: eyeOutline(y1, y2, y3), lashes };
}
/* While hovered and fully open, the pupil follows the cursor: it points from the
   iris centre toward the pointer, further the further away the pointer is, never
   leaving the iris, and eases after it like a real eye tracking you. */
const FOLLOW_MAX = 8;      // furthest the pupil centre may sit from the iris centre (iris r17, pupil r8)
const FOLLOW_REACH = 140;  // pointer distance (px) at which the pupil reaches FOLLOW_MAX
const FOLLOW_EASE = 12;    // how quickly it catches up (per second)
const LOOK_RIGHT = [55, 50]; // where the pupil sits after the opening glance
/* The lash nearest the cursor horizontally stretches to full length (up to 70%
   longer), whatever the cursor's height; past either end of the eye the corner
   lash does. Neighbours fall off sharply, so there is one distinct longest lash, and eases on its own: the lash nearest the gaze reacts first, the
   others follow, so moving the cursor ripples across them. */
const LASH_LIFT = 0.7, LASH_FOCUS = 5, LASH_RATE = [4, 13]; // max stretch, horizontal spread (viewBox units) of the stretch, slowest..fastest ease per second
function Perception({ a, as }) {
  const id = "eye-" + useId().replace(/:/g, "");
  const lid = useRef(null), clip = useRef(null), lashes = useRef([]), pupil = useRef(null);
  /* follow loop: amt ramps in once the eye is fully open, and eases out on leave */
  const gaze = useRef({ hovering: false, look: 0, amt: 0, raf: 0, last: 0, at: [0, 0], mx: null, my: null });
  /* lashes: grown by the timeline, stretched further while the pupil looks up */
  const lashState = useRef({ geom: null, grow: [], lift: [] });
  const drawLashes = (dt = 0) => {
    const ls = lashState.current, gz = gaze.current; if (!ls.geom) return;
    /* cursor x in the icon's own units, held between the first and last lash */
    let cx = null;
    const svg = pupil.current && pupil.current.ownerSVGElement;
    if (svg && gz.mx != null) {
      const r = svg.getBoundingClientRect();
      const xs = ls.geom.map((q) => q.x);
      cx = Math.min(Math.max(((gz.mx - r.left) / r.width) * 100, Math.min(...xs)), Math.max(...xs));
    }
    ls.geom.forEach((p, m) => {
      const el = lashes.current[m]; if (!el) return;
      const dx = cx == null ? Infinity : p.x - cx;
      const toward = cx == null ? 0 : Math.exp(-(dx * dx) / (2 * LASH_FOCUS * LASH_FOCUS));
      const target = toward * gz.amt;
      const cur = ls.lift[m] || 0;
      const rate = LASH_RATE[0] + (LASH_RATE[1] - LASH_RATE[0]) * Math.min(1, toward);
      ls.lift[m] = dt ? cur + (target - cur) * (1 - Math.exp(-dt * rate)) : cur;
      const len = EYE_LASH_LEN * ls.grow[m] * (1 + LASH_LIFT * ls.lift[m]);
      el.setAttribute("x1", p.x.toFixed(2)); el.setAttribute("y1", p.y.toFixed(2));
      el.setAttribute("x2", (p.x + p.nx * len).toFixed(2)); el.setAttribute("y2", (p.y + p.ny * len).toFixed(2));
      el.setAttribute("opacity", len > 0.15 ? "1" : "0");
    });
  };
  const drawPupil = () => {
    const gz = gaze.current; if (!pupil.current) return;
    pupil.current.setAttribute("cx", (45 + EYE_LOOK_X * gz.look + gz.at[0] * gz.amt).toFixed(2));
    pupil.current.setAttribute("cy", (50 + gz.at[1] * gz.amt).toFixed(2));
  };
  /* offset from the look-right spot that points the pupil at the cursor */
  const followTarget = (gz) => {
    /* touch screens have no cursor: glance somewhere new every 1-3s, sometimes straight ahead */
    if (gz.auto) {
      const now = performance.now();
      if (!gz.nextAt || now >= gz.nextAt) {
        gz.nextAt = now + 1000 + Math.random() * 2000;
        if (Math.random() < 0.25) gz.autoAt = [50 - LOOK_RIGHT[0], 50 - LOOK_RIGHT[1]];
        else {
          const ang = Math.random() * Math.PI * 2, reach = FOLLOW_MAX * (0.45 + Math.random() * 0.55);
          gz.autoAt = [50 + Math.cos(ang) * reach - LOOK_RIGHT[0], 50 + Math.sin(ang) * reach - LOOK_RIGHT[1]];
        }
      }
      return gz.autoAt;
    }
    const svg = pupil.current && pupil.current.ownerSVGElement;
    if (!svg || gz.mx == null) return [0, 0];
    const r = svg.getBoundingClientRect();
    const ex = r.left + r.width * 0.5, ey = r.top + r.height * 0.5; // iris centre is the middle of the 100x100 box
    const dx = gz.mx - ex, dy = gz.my - ey, d = Math.hypot(dx, dy);
    if (d < 0.5) return [50 - LOOK_RIGHT[0], 50 - LOOK_RIGHT[1]];
    const reach = FOLLOW_MAX * Math.min(1, d / FOLLOW_REACH);
    return [50 + (dx / d) * reach - LOOK_RIGHT[0], 50 + (dy / d) * reach - LOOK_RIGHT[1]];
  };
  /* one stable listener for the life of the icon, so it can always be removed */
  const moveRef = useRef(null);
  if (!moveRef.current) moveRef.current = (e) => { const gz = gaze.current; gz.mx = e.clientX; gz.my = e.clientY; };
  const onMove = moveRef.current;
  const gazeLoop = (now) => {
    const gz = gaze.current;
    const dt = gz.last ? Math.min(0.05, (now - gz.last) / 1000) : 0;
    gz.last = now;
    const open = gz.hovering && gz.look >= 0.97;
    if (open) {
      const [tx, ty] = followTarget(gz), k = 1 - Math.exp(-dt * FOLLOW_EASE);
      gz.at = [gz.at[0] + (tx - gz.at[0]) * k, gz.at[1] + (ty - gz.at[1]) * k];
    }
    gz.amt = open ? Math.min(1, gz.amt + dt * 4) : Math.max(0, gz.amt - dt * 5);
    drawPupil();
    drawLashes(dt);
    if (gz.hovering || gz.amt > 0) gz.raf = requestAnimationFrame(gazeLoop);
    else { gz.raf = 0; gz.last = 0; gz.at = [0, 0]; window.removeEventListener("pointermove", onMove); }
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const gz = gaze.current;
    gz.hovering = l.pathLength > 0.5;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (gz.hovering && !gz.raf && !reduce) {
      gz.auto = !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
      window.addEventListener("pointermove", onMove, { passive: true });
      gz.raf = requestAnimationFrame(gazeLoop);
    }
  };
  useEffect(() => () => { cancelAnimationFrame(gaze.current.raf); window.removeEventListener("pointermove", onMove); }, []);
  /* The lid opens first on the way in, but on the way out it must come down
     with the gaze, not after it. So: opening follows its own early window,
     closing follows the pupil's window, and it never jumps when the direction
     flips mid-way (it holds until the new curve catches up). */
  const lidState = useRef({ time: 0, k: 0, closing: false, t0: 0 });
  const g0 = eyeGeom(0);
  const frame = (time) => {
    const st = lidState.current;
    const opening = time >= st.time;
    if (!opening && !st.closing) st.t0 = st.time; // just started leaving
    st.closing = !opening;
    const k = opening ? Math.max(st.k, win(time, 0, EYE_LID_DUR)) : Math.min(st.k, win(time, EYE_LOOK_AT, EYE_LOOK_DUR));
    st.time = time; st.k = k;
    /* closing ends with the lid dipping past its tired rest and lifting back: almost a blink */
    let dip = 0;
    if (!opening && st.t0 > 0) {
      const r = (st.t0 - time) / st.t0;
      if (r > EYE_BLINK_AT) {
        const u = Math.min(1, (r - EYE_BLINK_AT) / (1 - EYE_BLINK_AT));
        /* quick little drop, then a slower ease back up: how a real lid settles */
        dip = EYE_BLINK * (u < 0.3 ? Math.sin((Math.PI / 2) * (u / 0.3)) : 0.5 * (1 + Math.cos((Math.PI * (u - 0.3)) / 0.7)));
      }
    }
    const g = eyeGeom(k - dip);
    if (lid.current) lid.current.setAttribute("d", g.outline);
    if (clip.current) clip.current.setAttribute("d", g.outline);
    const look = win(time, EYE_LOOK_AT, EYE_LOOK_DUR);
    gaze.current.look = look;
    drawPupil();
    if (pupil.current) {
      pupil.current.setAttribute("fill", mix("#FDFDFB", a, look));
      pupil.current.setAttribute("stroke", mix(INK, a, look));
    }
    const ls = lashState.current;
    ls.geom = g.lashes;
    ls.grow = g.lashes.map((_, m) => win(time, EYE_LASH_AT + m * EYE_LASH_STEP, EYE_LASH_DUR)); // left to right
    drawLashes();
  };
  return (
    <>
      <Timeline total={EYE_TOTAL} onFrame={frame} />
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <clipPath id={id}><path ref={clip} d={g0.outline} /></clipPath>
      <g clipPath={"url(#" + id + ")"}>
        <circle cx="50" cy="50" r="17" {...L} />
        <path d="M58 35 A17 17 0 0 1 58 65" {...L} stroke={as} {...dots} />
        <circle ref={pupil} cx="45" cy="50" r="8" {...W} />
      </g>
      {g0.lashes.map((p, m) => (
        <line key={m} ref={(el) => (lashes.current[m] = el)} x1={p.x} y1={p.y} x2={p.x} y2={p.y} stroke={as} strokeWidth={EYE_LASH_W} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0" />
      ))}
      <path ref={lid} d={g0.outline} {...L} />
    </>
  );
}

/* A planet with a single accent moon on one tilted orbit. While hovered the moon
   rides lap after lap; on leave it finishes its lap and rests back at the start.
   Bodies pass behind the planet on the far side of an orbit and in front on the near side. */
const ORB_C = [50, 50], ORB_TILT = (-16 * Math.PI) / 180, PLANET_R = 23.4;
const ORBITS = [{ rx: 46, ry: 11 }]; // flatter: a lower viewing angle
/* Each lap is one ride: slow near the start point (but never stopped), a punchy
   burst through the middle, slow again arriving home, then straight into the next lap.
   Speed over a lap = ORB_MIN + ORB_BURST * sin^(2n)(pi p), scaled so a lap is one turn;
   ORB_MIN is the creep speed at the start point and the peak is ORB_MIN + ORB_BURST
   (both as multiples of the average speed). */
const ORB_LAP = BEAT, ORB_BURST = 3.8, ORB_SHARP = 6; // one lap per beat, burst size, how concentrated the burst is
const ORB_SHIFT = 0.75; // laps start this long before the beat, so the mid-lap burst lands while the others move
const lapEase = (() => {
  const N = 600, raw = [0];
  for (let k = 1; k <= N; k++) raw.push(raw[k - 1] + Math.pow(Math.sin((Math.PI * (k - 0.5)) / N), 2 * ORB_SHARP) / N);
  const area = raw[N], min = 1 - ORB_BURST * area; // creep speed that makes a lap exactly one turn
  const table = raw.map((v, k) => min * (k / N) + ORB_BURST * v);
  return (p) => {
    const x = Math.min(1, Math.max(0, p)) * N, k = Math.min(N - 1, Math.floor(x));
    return table[k] + (table[k + 1] - table[k]) * (x - k);
  };
})();
/* [orbit, start angle, angular speed (rad/s at cruise), radius, kind] */
const BODIES = [[0, 0.6, 1, 4.6, "accent"]];
const orbPt = (o, th) => {
  const { rx, ry } = ORBITS[o], c = Math.cos(ORB_TILT), sn = Math.sin(ORB_TILT);
  const x = rx * Math.cos(th), y = ry * Math.sin(th);
  return [ORB_C[0] + x * c - y * sn, ORB_C[1] + x * sn + y * c];
};
/* the near half of an orbit (sin > 0), drawn over the planet */
const orbFront = (o) => Array.from({ length: 41 }, (_, n) => orbPt(o, (Math.PI * n) / 40)).map((p, n) => (n ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" ");
const orbEllipse = (o) => ({ cx: ORB_C[0], cy: ORB_C[1], rx: ORBITS[o].rx, ry: ORBITS[o].ry, transform: `rotate(${(ORB_TILT * 180) / Math.PI} ${ORB_C[0]} ${ORB_C[1]})` });
function Purpose({ a, ao }) {
  const back = useRef([]), front = useRef([]);
  /* lap: seconds into the current lap; hovering keeps laps coming, leaving lets the current lap finish */
  const st = useRef(null);
  /* Fresh state, and repair it if it is ever stale (hot reload keeps old refs alive) */
  if (!st.current || typeof st.current.turn !== "number" || !isFinite(st.current.turn)) {
    if (st.current && st.current.raf) cancelAnimationFrame(st.current.raf);
    st.current = { hovering: false, turn: 0, raf: 0, start: 0, stop: null };
  }
  const place = () => {
    const turn = 2 * Math.PI * st.current.turn;
    BODIES.forEach(([o, th0], n) => {
      const th = th0 + turn, [x, y] = orbPt(o, th), near = Math.sin(th) > 0;
      [back.current[n], front.current[n]].forEach((el, layer) => {
        if (!el) return;
        el.setAttribute("cx", x.toFixed(2)); el.setAttribute("cy", y.toFixed(2));
        el.setAttribute("opacity", (layer === 1) === near ? "1" : "0");
      });
    });
  };
  /* one lap per beat on the shared clock. Most of the lap is the eased MOVE (same window as every other icon),
   plus a slow constant creep across the whole beat, so the moon never fully stops: it drifts into each lap
   and drifts out of it, and the speed stays continuous from one lap to the next. */
  const ORB_CREEP = 0.08; // share of each lap spent creeping between the bursts
  const loop = (now) => {
    const m = st.current, t = now / 1000;
    const { n, ph } = beatPos(t);
    const done = m.stop != null && n > m.stop;
    if (done || n < m.start) m.turn = 0;
    else m.turn = ((1 - ORB_CREEP) * easeInOut3(Math.min(1, ph / MOVE)) + ORB_CREEP * (ph / BEAT)) % 1;
    place();
    if (done) { m.raf = 0; return; }
    m.raf = requestAnimationFrame(loop);
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const m = st.current;
    const on = l.pathLength > 0.5;
    if (on === m.hovering) return;
    m.hovering = on;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (on && m.raf) { m.stop = null; return; } // back before it settled: just keep going
    if (on) { m.start = firstBeat(clockS()); m.stop = null; m.raf = requestAnimationFrame(loop); }
    else if (m.raf) m.stop = stopBeat(clockS(), m.start);
  };
  useEffect(() => {
    place(); // put the moon on the track for the current state
    return () => { cancelAnimationFrame(st.current.raf); st.current.raf = 0; };
  }, []);
  const init = BODIES.map(([o, th]) => ({ p: orbPt(o, th), near: Math.sin(th) > 0 }));
  const body = (kind, r, n, layer) => {
    const props = kind === "accent" ? { fill: a, ...(ao ? { stroke: ao, strokeWidth: 1 } : {}) } : kind === "rock" ? { fill: INK } : { ...W };
    return (
      <circle key={kind + layer} ref={(el) => ((layer ? front : back).current[n] = el)} cx={init[n].p[0]} cy={init[n].p[1]} r={r} {...props}
        opacity={(layer === 1) === init[n].near ? 1 : 0} />
    );
  };
  return (
    <>
      {/* hover flag: flips on hover, off on leave */}
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <ellipse {...orbEllipse(0)} {...G} {...dots} />
      {BODIES.map(([, , , r, kind], n) => body(kind, r, n, 0))}
      <circle cx={ORB_C[0]} cy={ORB_C[1]} r={PLANET_R} {...W} />
      <path d={orbFront(0)} {...G} {...dots} />
      {BODIES.map(([, , , r, kind], n) => body(kind, r, n, 1))}
    </>
  );
}

/* A flag planted in the ground. At rest it leans over, cloth limp and drooping;
   on hover the pole rights itself, the cloth lifts and takes the colour, and
   once upright it ripples in a steady wind until the pointer leaves. */
const FLAG_BASE = [36, 80], FLAG_POLE = 52, FLAG_W = 30, FLAG_H = 19;
const FLAG_TILT = 24, FLAG_DROOP = 11; // rest lean (deg, clockwise) and how far the limp cloth sags at its end
const FLAG_UP = 0.85, FLAG_FILL_AT = 0.3, FLAG_FILL = 0.45;
/* leaving: the pole falls back (gravity-like), lands, and settles with one small
   rebound; the cloth lags a beat behind, so it flicks a touch further and settles too */
const FLAG_HIT = 0.64, FLAG_OVER = 0.08, FLAG_FLICK = 0.22;
const flagFall = (r) => {
  if (r <= 0) return 0; if (r >= 1) return 1;
  if (r < FLAG_HIT) { const q = r / FLAG_HIT; return q * q; }
  const u = (r - FLAG_HIT) / (1 - FLAG_HIT);
  return 1 + FLAG_OVER * Math.sin(2 * Math.PI * u) * (1 - u) * (1 - u);
};
const flagFlick = (r) => {
  if (r < FLAG_HIT) return 0;
  const u = (r - FLAG_HIT) / (1 - FLAG_HIT), w = Math.max(0, (u - 0.12) / 0.88);
  return FLAG_FLICK * Math.sin(2 * Math.PI * w) * (1 - w) * (1 - w);
};
const FLAG_TOTAL = FLAG_UP;
const FLAG_WIND = 1.15, FLAG_AMP = 3.2, FLAG_WAVES = 0.95, FLAG_RAMP = 3; // Hz, ripple height, waves across the cloth, wind fade-in rate
/* Catmull-Rom through the points, as cubic segments (no leading M) */
const smoothThrough = (p) => p.slice(1).map((b, i) => {
  const a = p[i], p0 = p[i - 1] || a, p3 = p[i + 2] || b;
  const c1 = [a[0] + (b[0] - p0[0]) / 6, a[1] + (b[1] - p0[1]) / 6], c2 = [b[0] - (p3[0] - a[0]) / 6, b[1] - (p3[1] - a[1]) / 6];
  return `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
}).join(" ");
/* the cloth outline beside a pole standing at x=0, top at y=0 (local units).
   s: 1 limp .. 0 lifted; amt: wind strength 0..1; clock: seconds of wind */
function flagPath(s, amt, clock) {
  const N = 12, top = [], bot = [];
  for (let n = 0; n <= N; n++) {
    const u = n / N, ph = 2 * Math.PI * (u * FLAG_WAVES - FLAG_WIND * clock);
    const A = FLAG_AMP * amt * Math.pow(u, 1.15);
    const x = FLAG_W * u * (1 - 0.18 * s) * (1 - 0.035 * amt * (1 + Math.cos(ph)));
    const sag = s * FLAG_DROOP * u * u;
    top.push([x, sag + A * Math.sin(ph)]);
    bot.push([x - s * 2.5 * u * u, FLAG_H * (1 - 0.12 * u) + sag * 0.9 + A * Math.sin(ph - 0.4)]);
  }
  const b = bot.reverse();
  return `M0 0 ${smoothThrough(top)} L${b[0][0].toFixed(2)} ${b[0][1].toFixed(2)} ${smoothThrough(b)} Z`;
}
function Positioning({ a }) {
  const locked = a === INK;
  const pole = useRef(null), cloth = useRef(null);
  const st = useRef({ k: 0, kf: 0, amt: 0, clock: 0, hovering: false, raf: 0, last: 0, time: 0, closing: false, t0: 0, k0: 0, flick: 0 });
  const render = () => {
    const m = st.current;
    if (pole.current) pole.current.setAttribute("transform", `rotate(${(FLAG_TILT * (1 - m.k)).toFixed(3)} ${FLAG_BASE[0]} ${FLAG_BASE[1]})`);
    if (cloth.current) {
      cloth.current.setAttribute("d", flagPath(1 - m.k + m.flick, m.amt, m.clock));
      cloth.current.setAttribute("fill", mix("#FDFDFB", locked ? "#FDFDFB" : a, m.kf));
      cloth.current.setAttribute("stroke", mix(INK, locked ? INK : a, m.kf));
    }
  };
  const loop = (now) => {
    const m = st.current;
    const dt = m.last ? Math.min(0.05, (now - m.last) / 1000) : 0;
    m.last = now; m.clock += dt;
    const target = m.hovering && m.k > 0.6 ? 1 : 0; // the wind picks up once the pole is nearly upright
    m.amt += (target - m.amt) * (1 - Math.exp(-dt * FLAG_RAMP * (target ? 1 : 1.6)));
    render();
    if (m.hovering || m.amt > 0.002) m.raf = requestAnimationFrame(loop);
    else { m.amt = 0; m.raf = 0; m.last = 0; render(); }
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const m = st.current;
    m.hovering = l.pathLength > 0.5;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (m.hovering && !m.raf && !reduce) m.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);
  const frame = (time) => {
    const m = st.current;
    const closing = time < m.time;
    if (closing && !m.closing) { m.t0 = m.time; m.k0 = m.k; } // just started leaving: fall from here
    m.closing = closing;
    if (closing) {
      const r = m.t0 > 0 ? (m.t0 - time) / m.t0 : 1;
      m.k = m.k0 * (1 - flagFall(r)); // goes a hair below 0 = leans a little past rest, then settles
      m.flick = m.k0 * flagFlick(r);
    } else {
      m.k = Math.max(m.k, win(time, 0, FLAG_UP)); // never jump back when re-entering mid-fall
      m.flick = 0;
    }
    m.time = time;
    m.kf = win(time, FLAG_FILL_AT, FLAG_FILL);
    if (!m.raf) render();
  };
  const [bx, by] = FLAG_BASE, topY = by - FLAG_POLE;
  return (
    <>
      <Timeline total={FLAG_TOTAL} onFrame={frame} />
      {/* hover flag for the wind loop */}
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <path d="M18 80 H82" {...G} />
      <g ref={pole} transform={`rotate(${FLAG_TILT} ${bx} ${by})`}>
        <path ref={cloth} d={flagPath(1, 0, 0)} transform={`translate(${bx} ${topY + 1})`} {...W} />
        <path d={`M${bx} ${by} V${topY - 1}`} {...L} />
      </g>
    </>
  );
}

/* Three sliders on a shared scale of ticks. Each knob rests on a tick and, on hover, slides to
   another tick. While the hover lasts, all three wait a beat together, then glide at the same moment,
   each to its own random tick. On leave they go home. */
const CHAR_TICKS = [20, 35, 50, 65, 80];
const CHAR_ROWS = [[30, 35, 65], [50, 80, 35], [70, 20, 65]]; // y, rest tick, first hover tick
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
function Character({ a }) {
  const knob = useRef([]);
  const m = useRef({ hovering: false, raf: 0, last: 0, wait: 0, k: CHAR_ROWS.map(([, x]) => ({ x, from: x, to: x, t: 0, dur: 0, wait: 0 })) });
  const glide = (s, to, dur) => { s.from = s.x; s.to = to; s.t = 0; s.dur = dur; };
  const loop = (now) => {
    const st = m.current, t = now / 1000;
    const dt = st.last ? Math.min(0.05, (now - st.last) / 1000) : 0;
    st.last = now;
    let moving = false;
    /* the hover-in slide and the slide home run on their own short glides */
    st.k.forEach((s) => {
      if (s.dur > 0) {
        s.t += dt;
        const u = Math.max(0, Math.min(1, s.t / s.dur));
        s.x = s.from + (s.to - s.from) * easeInOut3(u);
        if (u >= 1) { s.x = s.to; s.dur = 0; }
        moving = true;
      }
    });
    /* after that, every move is on the shared beat: all three knobs glide together, each to its own random tick */
    if (st.hovering) {
      moving = true;
      const { whole, u, active } = beatProgress(t, st.start, null);
      if (active && st.k.every((s) => s.dur === 0 || s.beat)) {
        if (whole !== st.lastWhole) {
          st.lastWhole = whole;
          st.k.forEach((s) => { const options = CHAR_TICKS.filter((x) => x !== s.to); s.from = s.to; s.to = options[Math.floor(Math.random() * options.length)]; s.beat = true; });
        }
        st.k.forEach((s) => { s.x = s.from + (s.to - s.from) * easeInOut3(u); });
      }
    }
    st.k.forEach((s, i) => { const el = knob.current[i]; if (el) el.setAttribute("cx", s.x.toFixed(2)); });
    if (!moving) { st.raf = 0; st.last = 0; return; }
    st.raf = requestAnimationFrame(loop);
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const st = m.current;
    const on = l.pathLength > 0.5;
    if (on === st.hovering) return;
    st.hovering = on;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    st.k.forEach((s, i) => {
      const [, home, first] = CHAR_ROWS[i];
      if (reduce) { s.x = on ? first : home; s.dur = 0; const el = knob.current[i]; if (el) el.setAttribute("cx", s.x); return; }
      s.beat = false;
      if (on) glide(s, first, 0.65); else glide(s, home, 0.6);
    });
    /* join the beat grid once the hover-in slide has finished */
    st.start = firstBeat(clockS() + 0.7); st.lastWhole = -1;
    if (!reduce && !st.raf) st.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => { if (m.current.raf) cancelAnimationFrame(m.current.raf); }, []);
  return (
    <>
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      {CHAR_ROWS.map(([y, k], i) => (
        <g key={y}>
          <path d={`M14 ${y} H86`} {...G} />
          <path d={CHAR_TICKS.map((x) => `M${x} ${y - 1.8} V${y + 1.8}`).join(" ")} {...G} />
          <circle ref={(el) => (knob.current[i] = el)} cx={k} cy={y} r="6.5" {...(i === 1 ? { fill: a } : W)} />
        </g>
      ))}
    </>
  );
}

function Voice({ a }) {
  const bars = [[30, 12], [38, 26], [46, 34], [54, 26], [62, 14], [70, 6]];
  return (
    <>
      <path d="M20 22 H80 A4 4 0 0 1 84 26 V64 A4 4 0 0 1 80 68 H44 L32 80 V68 H20 A4 4 0 0 1 16 64 V26 A4 4 0 0 1 20 22 Z" {...L} />
      {bars.map(([x, h], i) => (
        <motion.rect key={x} x={x - 2.2} y={45 - h / 2} width="4.4" height={h} rx="2.2" {...(i === 2 ? AW(a) : W)}
          style={pivot(x, 45)}
          variants={{
            rest: { scaleY: 1, transition: t(0.4) },
            hover: { scaleY: [1, 0.55, 1.12, 0.8, 1], transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity, delay: i * 0.08 } },
          }} />
      ))}
    </>
  );
}

const sparkle = (cx, cy, r) => {
  const k = r * 0.12;
  return `M${cx} ${cy - r} C${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + r} ${cy} C${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + r} C${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - r} ${cy} C${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - r} Z`;
};

/* One star, centred and fixed in place. On hover it turns a quarter (it is
   four-fold, so it lands on itself) and, while it turns, small stars burst out
   from behind it one by one like a firework, each spinning as it flies. */
const IDEA_R = 27.5, IDEA_SPIN = 90, IDEA_SPIN_DUR = 1.1;
const IDEA_POP_AT = 0.12, IDEA_STEP = 0.08, IDEA_DUR = 0.75, IDEA_TWIRL = -120;
const IDEA_SPARKS = [[-62, 39, 7, 14], [-12, 37, 5.2, -22], [38, 39, 6.4, 30], [122, 37, 5.8, -12], [196, 38, 5.2, 24]]; // angle (deg), distance, size, resting tilt (deg)
/* once out, each spark floats: a slow bob and sway, every one on its own period and phase */
const IDEA_FLOAT = 1.1, IDEA_SWAY = 4, IDEA_FLOAT_HZ = [0.42, 0.55, 0.37, 0.5, 0.46]; // bob (units), sway (deg), cycles per second
const IDEA_TOTAL = Math.max(IDEA_SPIN_DUR, IDEA_POP_AT + (IDEA_SPARKS.length - 1) * IDEA_STEP + IDEA_DUR);
function Idea({ a }) {
  const locked = a === INK;
  const star = useRef(null), spark = useRef([]);
  const st = useRef({ time: 0, clock: 0, hovering: false, raf: 0, last: 0 });
  const render = () => {
    const { time, clock } = st.current;
    if (star.current) star.current.setAttribute("transform", `rotate(${(IDEA_SPIN * win(time, 0, IDEA_SPIN_DUR)).toFixed(3)} 50 50)`);
    IDEA_SPARKS.forEach(([ang, dist, , tilt], n) => {
      const el = spark.current[n]; if (!el) return;
      const k = win(time, IDEA_POP_AT + n * IDEA_STEP, IDEA_DUR);
      const rad = (ang * Math.PI) / 180, d = dist * k;
      const ph = 2 * Math.PI * IDEA_FLOAT_HZ[n] * clock + n * 1.7;
      const bob = IDEA_FLOAT * k * Math.sin(ph), sway = IDEA_SWAY * k * Math.sin(ph * 0.8 + 0.9); // fades in and out with the spark itself
      el.setAttribute("transform", `translate(${(50 + Math.cos(rad) * d).toFixed(2)} ${(50 + Math.sin(rad) * d + bob).toFixed(2)}) rotate(${(tilt * k + IDEA_TWIRL * (1 - k) + sway).toFixed(2)}) scale(${(0.25 + 0.75 * k).toFixed(3)})`);
    });
  };
  const frame = (time) => { st.current.time = time; if (!st.current.raf) render(); };
  const loop = (now) => {
    const m = st.current;
    const dt = m.last ? Math.min(0.05, (now - m.last) / 1000) : 0;
    m.last = now; m.clock += dt;
    render();
    if (m.hovering || m.time > 0) m.raf = requestAnimationFrame(loop); else { m.raf = 0; m.last = 0; }
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const m = st.current;
    m.hovering = l.pathLength > 0.5;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (m.hovering && !m.raf && !reduce) m.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);
  return (
    <>
      <Timeline total={IDEA_TOTAL} onFrame={frame} />
      {/* hover flag for the float loop */}
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      {/* sparks sit behind the star, hidden by its white fill until they fly */}
      {IDEA_SPARKS.map(([, , r], n) => (
        <path key={n} ref={(el) => (spark.current[n] = el)} d={sparkle(0, 0, r)} transform="translate(50 50) scale(0.25)"
          {...(n % 2 === 0 && !locked ? AW(a) : W)} />
      ))}
      <path ref={star} d={sparkle(50, 50, IDEA_R)} {...W} />
    </>
  );
}

/* Three circles; the shared centre (a Reuleaux triangle) is filled. A 120° turn maps it onto itself.
   Hovered, it turns 120° with an ease in and out, pauses, then turns again, for as long as the hover lasts.
   On leave it finishes the turn it is in and rests, always back on its home shape. */
const VIS_TURN = 1.05, VIS_PAUSE = 0.75; // seconds per turn, seconds of stillness between turns
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
function Visual({ a }) {
  const g = useRef(null);
  const m = useRef({ hovering: false, ang: 0, base: 0, start: 0, stop: null, raf: 0 });
  const draw = () => { if (g.current) g.current.setAttribute("transform", "rotate(" + m.current.ang.toFixed(3) + " 50 49.33)"); };
  /* one 120° turn per beat, exactly one MOVE long, on the shared clock */
  const loop = (now) => {
    const s = m.current, t = now / 1000;
    const { whole, u, active } = beatProgress(t, s.start, s.stop);
    s.ang = active ? s.base + 120 * (whole + easeInOut3(u)) : s.base;
    draw();
    if (s.stop != null && beatDone(t, s.stop)) { s.ang %= 360; draw(); s.raf = 0; return; }
    s.raf = requestAnimationFrame(loop);
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const s = m.current;
    const on = l.pathLength > 0.5;
    if (on === s.hovering) return;
    s.hovering = on;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { s.ang = on ? 120 : 0; draw(); return; }
    if (on && s.raf) { s.stop = null; return; } // back before it settled: just keep going
    if (on) { s.base = s.ang % 360; s.start = firstBeat(clockS()); s.stop = null; s.raf = requestAnimationFrame(loop); }
    else if (s.raf) s.stop = stopBeat(clockS(), s.start);
  };
  useEffect(() => () => { if (m.current.raf) cancelAnimationFrame(m.current.raf); }, []);
  return (
    <>
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <g ref={g}>
        <circle cx="50" cy="36" r="18" {...L} />
        <circle cx="39" cy="56" r="18" {...L} />
        <circle cx="61" cy="56" r="18" {...L} />
        <path d="M50 41.75 A18 18 0 0 1 56.69 52.71 A18 18 0 0 1 43.31 52.71 A18 18 0 0 1 50 41.75 Z" fill={a} stroke={INK} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </g>
    </>
  );
}

/* Clipboard. While hovered it loops: the three boxes fill one by one, hold, then the boxes and their
   lines fade away and a large check mark draws itself across the board; it holds, fades, the empty rows
   return, a short pause, and again. On leave everything eases back to the empty clipboard. */
const ease01 = (x) => { const u = Math.min(1, Math.max(0, x)); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
function Scope({ as }) {
  const ys = [38, 55, 72]; // equal 9-unit gaps: clip bottom (24) to first box, and last box to board bottom (86)
  const box = useRef([]), line = useRef([]), check = useRef(null);
  const m = useRef({ hovering: false, clock: 0, raf: 0, last: 0, cur: { fill: [0, 0, 0], rows: 1, draw: 0, chk: 0 }, leave: null });
  const paint = (v) => {
    ys.forEach((_, i) => {
      const b = box.current[i], l = line.current[i];
      if (b) { b.setAttribute("fill", mix("#FDFDFB", as, v.fill[i])); b.setAttribute("opacity", v.rows.toFixed(3)); }
      if (l) l.setAttribute("opacity", v.rows.toFixed(3));
    });
    if (check.current) { check.current.setAttribute("stroke-dashoffset", (1 - v.draw).toFixed(4)); check.current.setAttribute("opacity", v.chk.toFixed(3)); }
  };
  /* three steps, one per beat, each exactly one MOVE long: fill the boxes; rows out + check draws; check out + rows back */
  const EMPTY = { fill: [0, 0, 0], rows: 1, draw: 0, chk: 0 };
  const atStep = (step, u) => {
    if (step === 0) return { fill: ys.map((_, i) => ease01((u - i * 0.25) / 0.5)), rows: 1, draw: 0, chk: 0 };
    if (step === 1) return { fill: [1, 1, 1], rows: 1 - ease01(u / 0.45), draw: ease01((u - 0.3) / 0.7), chk: 1 };
    return { fill: [0, 0, 0], rows: ease01((u - 0.4) / 0.6), draw: 1, chk: 1 - ease01(u / 0.4) };
  };
  const loop = (now) => {
    const st = m.current;
    const dt = st.last ? Math.min(0.05, (now - st.last) / 1000) : 0;
    st.last = now;
    if (st.hovering) {
      const { whole, u, active } = beatProgress(now / 1000, st.start, null);
      st.cur = active ? atStep(whole % 3, u) : EMPTY;
    } else {
      /* ease from wherever it was back to the empty clipboard */
      const L = st.leave; L.t += dt;
      const k = ease01(L.t / 0.4), f = L.from;
      st.cur = { fill: f.fill.map((x) => x * (1 - k)), rows: f.rows + (1 - f.rows) * k, draw: f.draw, chk: f.chk * (1 - k) };
      if (k >= 1) { paint(st.cur); st.raf = 0; st.last = 0; return; }
    }
    paint(st.cur);
    st.raf = requestAnimationFrame(loop);
  };
  const onHover = (l) => {
    if (l.pathLength == null) return;
    const st = m.current;
    const on = l.pathLength > 0.5;
    if (on === st.hovering) return;
    st.hovering = on;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { st.cur = on ? { fill: [1, 1, 1], rows: 1, draw: 0, chk: 0 } : { fill: [0, 0, 0], rows: 1, draw: 0, chk: 0 }; paint(st.cur); return; }
    if (on) st.start = firstBeat(clockS()); else st.leave = { from: { ...st.cur, fill: [...st.cur.fill] }, t: 0 };
    if (!st.raf) st.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => { if (m.current.raf) cancelAnimationFrame(m.current.raf); }, []);
  return (
    <>
      <motion.path d="M0 0 H1" fill="none" stroke="none" onUpdate={onHover}
        variants={{ rest: { pathLength: 0, transition: { duration: 0.01 } }, hover: { pathLength: 1, transition: { duration: 0.01 } } }} />
      <rect x="26" y="20" width="48" height="66" rx="5" {...L} />
      <rect x="39" y="15" width="22" height="9" rx="3" {...W} />
      {ys.map((y, i) => (
        <g key={y}>
          <rect ref={(el) => (box.current[i] = el)} x="34" y={y - 5} width="10" height="10" rx="2.5" {...W} />
          <path ref={(el) => (line.current[i] = el)} d={`M52 ${y} H66`} {...L} />
        </g>
      ))}
      {/* the check that draws itself once the list is done */}
      {/* no non-scaling-stroke here: the draw-on dash must be measured along the path (pathLength 1), not in screen pixels */}
      <path ref={check} d="M36 55 L46 65 L64 42" fill="none" stroke={as} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
        pathLength="1" strokeDasharray="1 1" strokeDashoffset="1" opacity="0" />
    </>
  );
}

const ART = {
  "00": Setup, "01": Business, "02": Audience, "03": Landscape, "04": Perception, "05": Purpose,
  "06": Positioning, "07": Character, "08": Voice, "09": Idea, "10": Visual, "11": Scope,
};

/* The bare icon. state: "locked" | "open" | "done". Inside a card the card drives hover; standalone, it drives itself. */
/* Section header: the icon plays into its hover state once and holds it. Icons whose
   hover state keeps moving (orbit, wind, pulse, eye tracking) carry on by themselves;
   the rest settle and stay still. */
function useAutoLoop(on) {
  const [phase, setPhase] = React.useState("rest");
  useEffect(() => {
    if (!on) return undefined;
    const tm = setTimeout(() => setPhase("hover"), 350);
    return () => clearTimeout(tm);
  }, [on]);
  return phase;
}

export function Art({ id, state = "open", standalone = false, autoplay = false, className = "", tint: tintOverride, accentOutline }) {
  const Comp = ART[id];
  const phase = useAutoLoop(autoplay);
  const locked = state === "locked";
  const tint = tintOverride || SECTION_COLORS[id] || ACCENT;
  const a = locked ? INK : tint;
  const as = locked ? GRAY : tint;
  const Svg = standalone ? motion.svg : "svg";
  const drive = autoplay ? { initial: "rest", animate: phase } : standalone ? { initial: "rest", animate: "rest", whileHover: "hover" } : {};
  const Svg2 = autoplay ? motion.svg : Svg;
  return (
    <Svg2 viewBox="0 0 100 100" className={"art " + className} style={{ overflow: "visible" }} aria-hidden="true" {...drive}>
      {Comp && <Comp a={a} as={as} still={autoplay} ao={accentOutline} />}
    </Svg2>
  );
}

/* Small gray tile with the icon (section header). */
export function ArtTile({ id, state, size = 64, autoplay = false }) {
  return (
    <span className="art-tile" style={{ width: size, height: size, borderRadius: Math.round(size * 0.16) }}>
      <Art id={id} state={state} standalone autoplay={autoplay} />
    </span>
  );
}

/* Check mark that draws itself in. */
export function Check({ size = 22, delay = 0, animate = true }) {
  return (
    <motion.span className="check-badge" style={{ width: size, height: size }}
      initial={animate ? { scale: 0.6, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE, delay }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}>
        <motion.path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: delay + 0.15 }} />
      </svg>
    </motion.span>
  );
}

/* Small padlock for locked cards and steps. */
export const Lock = ({ size = 13 }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" className="lock-ic">
    <rect x="3" y="7" width="10" height="7.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
