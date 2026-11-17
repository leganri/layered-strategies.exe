"use client";
/* Home: every section as a card, sized to fit the window. Sections unlock in order. */
import React, { useEffect, useRef, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { SECTIONS } from "../schema";
import { Art, Check, Lock, EASE, SECTION_COLORS } from "./SectionArt";

const tr = (d = 0.5, delay = 0) => ({ duration: d, ease: EASE, delay });
const gridV = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: tr(0.6) } };
const cardV = { rest: { y: 0, transition: tr(0.45) }, hover: { y: -3, transition: tr(0.45) } };
/* finished cards hold their played state, so they should not also sit lifted */
const cardVDone = { rest: { y: 0, transition: tr(0.45) }, hover: { y: 0, transition: tr(0.45) } };

/* Step count inside a ring whose stroke fills as steps are answered. */
const RING_R = 13;
function Ring({ filled, total, delay = 0 }) {
  const p = total ? Math.min(1, filled / total) : 0;
  return (
    <span className="hc-slot hc-ring">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle className="hc-ring-track" cx="16" cy="16" r={RING_R} />
        <motion.circle className="hc-ring-fill" cx="16" cy="16" r={RING_R} transform="rotate(-90 16 16)"
          initial={{ pathLength: 0 }} animate={{ pathLength: p, opacity: p > 0 ? 1 : 0 }} transition={tr(0.9, delay)} />
      </svg>
      <span className="hc-frac">{filled}/{total}</span>
    </span>
  );
}

/* Phones: a deck. The open card always sits in the same place at the same size.
   Finished (swiped-up) cards tuck behind it as a thin edge at the top; the next few cards
   show their titles below, and the rest tuck away as thin edges at the bottom. */
const MS_EASE = { duration: 0.55, ease: EASE };
/* white or ink title on a card's solid colour band, whichever reads better */
const lum = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const INK_L = lum("#282623");
const onDark = (hex) => !!hex && 1.05 / (lum(hex) + 0.05) > (lum(hex) + 0.05) / (INK_L + 0.05);
/* the card's band colour: the section colour made a little more vivid (more saturation), then lifted in
   lightness only as far as needed for the dark grey title to read clearly (4.5:1). Lifting in HSL keeps the
   colour clean; mixing with white would turn it chalky. Icons keep the original colour. */
const toHsl = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let H = 0, S = 0; const L = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    S = L > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    H = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
  }
  return [H, S, L];
};
const toHex = (H, S, L) => {
  const f = (n) => { const k = (n + H * 12) % 12; const a = S * Math.min(L, 1 - L); return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return "#" + [0, 8, 4].map((n) => Math.round(f(n) * 255).toString(16).padStart(2, "0")).join("");
};
const inkContrast = (hex) => (lum(hex) + 0.05) / (INK_L + 0.05);
const bandColor = (hex) => {
  if (!hex) return hex;
  if (inkContrast(hex) >= 4.5) return hex;
  let [H, S, L] = toHsl(hex);
  S = Math.min(1, Math.max(S * 1.12, 0.72));
  let c = toHex(H, S, L);
  while (inkContrast(c) < 4.5 && L < 0.95) { L += 0.005; c = toHex(H, S, L); }
  return c;
};
const BAND = Object.fromEntries(Object.entries(SECTION_COLORS).map(([k, v]) => [k, bandColor(v)]));
/* phones only: Purpose wears a bright lemon-lime band instead of its navy (the icon keeps its own colour) */
BAND["05"] = "#DDEB5B";
const MS_TOP = 18;     // room for the thin edge of cards already passed
const MS_EDGE = 4;     // how much of each tucked card shows
const MS_EDGES = 3;    // at most this many edges show at either end
const MS_TAB = 34;     // visible height of a title tab below the open card
const MS_TABS = 4;     // titles shown below the open card
const MS_OV = 14;      // each tab tucks this far under the card in front of it
const MS_SWITCH = 0.2; // a swipe must travel this share of a card's journey before it changes card
const MS_SPRING = { type: "spring", stiffness: 280, damping: 38, mass: 1 }; // over-damped: lands without overshooting

/* Where a card sits, as a smooth function of d = (its index - the deck position).
   At whole numbers this is exactly the resting layout; in between it glides, so the deck can follow a finger. */
function deckY(d, A) {
  const T1 = MS_TOP + A - MS_OV;                 // first title tab under the open card
  const lastTab = T1 + (MS_TABS - 1) * MS_TAB;
  if (d <= 0) return MS_TOP - Math.min(-d, MS_EDGES) * MS_EDGE;
  if (d <= 1) return MS_TOP + (T1 - MS_TOP) * d;
  if (d <= MS_TABS) return T1 + (d - 1) * MS_TAB;
  if (d <= MS_TABS + 1) return lastTab + (d - MS_TABS) * MS_TAB;
  return lastTab + MS_TAB + Math.min(d - MS_TABS - 1, MS_EDGES - 1) * MS_EDGE;
}
const deckScale = (d) => (d < 0 ? 1 - Math.min(-d, MS_EDGES) * 0.03 : 1);
const deckOpacity = (d) => (d < -MS_EDGES ? Math.max(0, 1 - (-d - MS_EDGES)) : d > MS_TABS + MS_EDGES ? Math.max(0, 1 - (d - MS_TABS - MS_EDGES)) : 1);

/* One card. It moves with GPU transforms only (translate + scale), never layout, so dragging stays smooth. */
function MsCard({ s, i, pos, A, act, live, c, locked, resume, onOpen, onLocked, onGo }) {
  const y = useTransform(pos, (p) => deckY(i - p, A));
  const scale = useTransform(pos, (p) => deckScale(i - p));
  const opacity = useTransform(pos, (p) => deckOpacity(i - p));
  const on = i === act;
  const state = locked ? "locked" : c.done ? "done" : "open";
  const open = () => (locked ? onLocked(s.id) : onOpen(s.id));
  const cta = c.done || c.filled > 0 ? "Continue" : "Start";
  const titled = on || (i > act && i - act <= MS_TABS);
  return (
    <motion.div className={"ms-card " + state + (on ? " on" : "") + (titled ? "" : " edge") + (onDark(SECTION_COLORS[s.id]) ? " dark" : "")}
      style={{ y, scale, opacity, height: A, zIndex: i + 1, "--sc": BAND[s.id] }} aria-hidden={!titled || undefined}>
      {titled && <span className="ms-grain" aria-hidden="true" />}
      <button type="button" className="ms-head" tabIndex={titled ? 0 : -1} aria-expanded={on}
        onClick={() => (on ? open() : onGo(i))}
        aria-label={s.title + (locked ? ", locked" : c.done ? ", complete" : ", " + c.filled + " of " + c.total + " answered") + (on ? "" : ", show")}>
        <span className="ms-t">{s.title}</span>
        <span className="ms-s">
          {!on && resume && resume.id === s.id ? <span className="ms-pill">Continue</span> : locked ? <span className="hc-lock"><Lock /></span> : c.done ? (on ? <span className="hc-slot ms-done"><Check size={28} animate={false} /></span> : <Check size={20} animate={false} />) : on ? <Ring filled={c.filled} total={c.total} /> : null}
        </span>
      </button>
      {on && (
        <motion.div className="ms-body" style={{ height: A - 87 - MS_OV }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tr(0.3, 0.05)}>
          <button type="button" className="ms-art" onClick={open} tabIndex={-1} aria-hidden="true">
            <Art id={s.id} state={state} standalone autoplay={live} tint={s.id === "05" ? BAND["05"] : undefined} accentOutline={s.id === "05" ? "rgba(40, 38, 35, 0.35)" : undefined} />
          </button>
          <button type="button" className="ms-foot" onClick={open}>
            <span className="ms-cta">{cta}</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function MobileStack({ comp, reach, target, resume, onOpen, onLocked }) {
  const last = SECTIONS.length - 1;
  const start0 = Math.max(0, target);
  const pos = useMotionValue(start0);            // the deck position: which card is open, with fractions mid-drag
  const [act, setAct] = useState(start0);
  const [live, setLive] = useState(true);          // the open card's icon plays only while the deck is at rest
  const [h, setH] = useState(0);
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => setH(el.clientHeight);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Finish a swipe from the finger's own speed: an ease-out whose starting slope matches the release velocity,
     so the card keeps moving exactly as it was being pushed and settles without overshooting. */
  const glide = (to, samples) => {
    const from = pos.get(), dist = to - from;
    if (Math.abs(dist) < 0.002) { pos.set(to); return 0; }
    const a0 = samples[0], b0 = samples[samples.length - 1];
    const fresh = performance.now() - b0[0] < 100;
    const vPx = fresh ? (b0[1] - a0[1]) / Math.max(1, b0[0] - a0[0]) : 0;    // px/ms, + = finger moving down
    const v = (-vPx * 1000) / travel.current;                                  // cards per second
    const toward = Math.sign(dist) === Math.sign(v) ? Math.abs(v) : 0;          // only speed heading the right way carries
    const remain = Math.abs(dist);
    const dur = Math.min(0.62, Math.max(0.3, toward > 0 ? (remain / toward) * 2.4 : 0.5));
    const k = Math.min(3.2, (toward * dur) / remain);                           // starting slope of the curve
    const x1 = 0.24, y1 = Math.min(1, Math.max(0.12, x1 * k));
    animate(pos, to, { type: "tween", duration: dur, ease: [x1, y1, 0.22, 1] });
    return dur;
  };
  const settle = (to) => {
    const t = Math.max(0, Math.min(last, to));
    if (t === restAt.current && Math.abs(pos.get() - t) < 0.002) return;
    restAt.current = t;
    clearTimeout(nearTimer.current);
    setLive(false);
    animate(pos, t, { type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    landSoon(t, 500);
  };
  const go = (i) => settle(i);

  /* swipe: the deck moves 1:1 with the finger (one card's journey = the open card's travel, so the card
     stays under the finger). Pointer capture once the finger moves keeps the drag even when the card under it
     changes. One card per swipe: the drag is held within one card of where it started, and on release it moves
     only if the swipe crossed the threshold; otherwise it springs back. */
  const drag = useRef(null);
  const swallowClick = useRef(false);
  const nearTimer = useRef(0);
  useEffect(() => () => clearTimeout(nearTimer.current), []);
  /* the open card changes as soon as a swipe lands; its icon starts once the card is in place */
  const landSoon = (to, ms) => {
    setAct(to);
    clearTimeout(nearTimer.current);
    nearTimer.current = setTimeout(() => setLive(true), ms);
  };
  const restAt = useRef(start0);                   // the card the deck is resting on, or heading to
  const travel = useRef(400);                      // px of finger travel for one card (set from the layout below)
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pos.stop();
    drag.current = { id: e.pointerId, y0: e.clientY, p0: restAt.current, moved: false, samples: [[performance.now(), e.clientY]] };
  };
  const onPointerMove = (e) => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    const dy = e.clientY - d.y0;
    if (!d.moved && Math.abs(dy) > 6) {
      d.moved = true;
      clearTimeout(nearTimer.current);
      setLive(false);
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
    }
    if (!d.moved) return;
    const off = Math.max(-1, Math.min(1, -dy / travel.current));   // 1:1 with the finger, one card at most
    let p = d.p0 + off;
    if (p < 0) p *= 0.35;                          // rubber-band past either end
    else if (p > last) p = last + (p - last) * 0.35;
    pos.set(p);
    d.samples.push([performance.now(), e.clientY]);
    if (d.samples.length > 5) d.samples.shift();
  };
  const onPointerUp = (e) => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.moved) return;                          // a tap: let the buttons handle it
    swallowClick.current = true;
    setTimeout(() => { swallowClick.current = false; }, 350);
    const dy = e.clientY - d.y0;
    const need = travel.current * MS_SWITCH;
    const dir = dy < -need ? 1 : dy > need ? -1 : 0;
    const to = Math.max(0, Math.min(last, d.p0 + dir));
    restAt.current = to;
    const dur = glide(to, d.samples);
    landSoon(to, dur * 1000);
  };
  const onClickCapture = (e) => { if (swallowClick.current) { swallowClick.current = false; e.stopPropagation(); e.preventDefault(); } };

  /* mouse wheel / trackpad: one card per notch, on the same spring */
  const wheelAt = useRef(0);
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 12) return;
    const now = performance.now(); if (now - wheelAt.current < 260) return; wheelAt.current = now;
    settle(restAt.current + (e.deltaY > 0 ? 1 : -1));
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); go(act + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(act - 1); }
  };

  const bottomBand = MS_TABS * MS_TAB + MS_EDGES * MS_EDGE;
  const A = Math.max(180, h - MS_TOP - bottomBand); // the open card's height, the same for every card
  travel.current = A - MS_OV;                        // the distance a card travels between tab and open

  return (
    <div className="mstack" ref={box} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture} onWheel={onWheel} onKeyDown={onKey}>
      {h > 0 && SECTIONS.map((s, i) => (
        <MsCard key={s.id} s={s} i={i} pos={pos} A={A} act={act} live={live} c={comp[i]} locked={i > reach} resume={resume}
          onOpen={onOpen} onLocked={onLocked} onGo={go} />
      ))}
      {/* written on the background beneath every card: only seen once the deck runs out (the last section open) */}
      {h > 0 && (
        <div className="ms-note" style={{ top: MS_TOP + A, height: Math.max(0, h - MS_TOP - A) }}>
          <p className="ms-note-t">Thank you for taking the time to do this properly. Good brands start with honest answers.</p>
          <p className="ms-note-c">{"©"} {new Date().getFullYear()} Regan Li. All rights reserved.</p>
        </div>
      )}
    </div>
  );
}

export default function Hub({ comp, reach, lastSec, onOpen, onLocked, onBrief }) {
  const firstOpen = comp.findIndex((c) => !c.done);
  /* exactly one call to action: the first section in progress, else the first not started */
  const inProgress = comp.findIndex((c) => !c.done && c.filled > 0);
  const target = inProgress !== -1 ? inProgress : firstOpen;

  return (
    <div className="hub">
      <MobileStack comp={comp} reach={reach} target={target} onOpen={onOpen} onLocked={onLocked} onBrief={onBrief}
        resume={(() => { const id = lastSec || (SECTIONS[target] && SECTIONS[target].id); const sec = SECTIONS.find((x) => x.id === id); return sec ? { id: sec.id, title: sec.title } : null; })()} />
      <motion.div className="hub-grid" variants={gridV} initial="hidden" animate="show">
        {SECTIONS.map((s, i) => {
          const c = comp[i];
          const locked = i > reach;
          const current = !locked && i === target;
          const state = locked ? "locked" : c.done ? "done" : "open";
          const prev = SECTIONS[i - 1];
          return (
            <motion.div key={s.id} variants={itemV} className="hub-cell">
              <motion.button type="button" className={"hcard " + state + (current ? " current" : "")}
                variants={c.done && !locked ? cardVDone : cardV} initial="rest" animate={c.done && !locked ? "hover" : "rest"} whileHover={current ? "hover" : undefined} whileFocus={current ? "hover" : undefined}
                whileTap={locked ? { x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.45, ease: "easeInOut" } } : { scale: 0.985, transition: tr(0.2) }}
                onClick={() => (locked ? onLocked(s.id) : onOpen(s.id))}
                aria-disabled={locked || undefined}
                aria-label={`${s.id} ${s.title}, ${locked ? "locked until " + (prev ? prev.title : "") + " is complete" : c.done ? "complete" : c.filled + " of " + c.total + " answered"}`}>
                <span className="hc-top">
                  <span className="hc-label">{s.title}</span>
                  <span className="hc-top-r">
                  {c.done && !locked && <span className="hc-slot"><Check size={28} delay={0.3 + i * 0.04} /></span>}
                  {locked && <span className="hc-slot hc-lock"><Lock /></span>}
                  {!locked && !c.done && <Ring filled={c.filled} total={c.total} delay={0.3 + i * 0.04} />}
                  </span>
                </span>
                <span className="hc-art"><Art id={s.id} state={current || c.done ? state : "locked"} /></span>
                <span className="hc-bot">
                  {current && (
                    <span className="hc-cta">
                      <span className="hc-next">{c.filled > 0 ? "Continue" : "Start here"}</span>
                      <span className="hc-arrow" aria-hidden="true"><span className="hc-arrow-in"><span className="hc-shaft" /><svg width="7" height="10" viewBox="0 0 7 10"><path d="M1.5 1.5 5.5 5 1.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></span>
                    </span>
                  )}
                </span>
                {current && (
                  <span className="hc-line" aria-hidden="true">
                    <motion.span className="hc-line-fill" initial={{ scaleX: 0 }} animate={{ scaleX: c.filled / c.total }} transition={tr(0.8, 0.3)} />
                  </span>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
