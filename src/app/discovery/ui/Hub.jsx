"use client";
/* Home: every section as a card, sized to fit the window. Sections unlock in order. */
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
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
function MobileStack({ comp, reach, target, resume, onOpen, onLocked, onBrief }) {
  const last = SECTIONS.length - 1;
  const [act, setAct] = useState(Math.max(0, target));
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
  const go = (i) => setAct(Math.max(0, Math.min(last, i)));
  const start = useRef(null);
  const cool = useRef(0);
  const step = (dir) => { const now = Date.now(); if (now < cool.current) return; cool.current = now + 420; setAct((a) => Math.max(0, Math.min(last, a + dir))); };
  const onTouchStart = (e) => { start.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (start.current == null) return;
    const dy = e.changedTouches[0].clientY - start.current;
    start.current = null;
    if (Math.abs(dy) > 36) step(dy < 0 ? 1 : -1);
  };
  const onWheel = (e) => { if (Math.abs(e.deltaY) > 18) step(e.deltaY > 0 ? 1 : -1); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); go(act + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(act - 1); }
  };

  /* fixed bands: the top edge band, the open card, the titles + bottom edges */
  const bottomBand = MS_TABS * MS_TAB + MS_EDGES * MS_EDGE;
  const A = Math.max(180, h - MS_TOP - bottomBand); // the open card's height, the same for every card
  const place = (i) => {
    if (i === act) return { top: MS_TOP, scale: 1, z: 100, show: true };
    if (i < act) {
      const d = Math.min(act - i, MS_EDGES + 1);
      return { top: MS_TOP - Math.min(d, MS_EDGES) * MS_EDGE, scale: 1 - Math.min(d, MS_EDGES) * 0.03, z: 100 - (act - i), show: act - i <= MS_EDGES };
    }
    const k = i - act;
    if (k <= MS_TABS) return { top: MS_TOP + A - MS_OV + (k - 1) * MS_TAB, scale: 1, z: 100 + k, show: true };
    const e = Math.min(k - MS_TABS, MS_EDGES);
    const lastTab = MS_TOP + A - MS_OV + (MS_TABS - 1) * MS_TAB;
    return { top: lastTab + MS_TAB + (e - 1) * MS_EDGE, scale: 1, z: 100 + k, show: k - MS_TABS <= MS_EDGES };
  };

  return (
    <>
    <div className="mstack" ref={box} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onWheel={onWheel} onKeyDown={onKey}>
      {h > 0 && SECTIONS.map((s, i) => {
        const c = comp[i];
        const locked = i > reach;
        const on = i === act;
        const pos = place(i);
        const state = locked ? "locked" : c.done ? "done" : "open";
        const open = () => (locked ? onLocked(s.id) : onOpen(s.id));
        const cta = c.done || c.filled > 0 ? "Continue" : "Start";
        const titled = on || (i > act && i - act <= MS_TABS);
        return (
          <motion.div key={s.id} className={"ms-card " + state + (on ? " on" : "") + (titled ? "" : " edge") + (onDark(SECTION_COLORS[s.id]) ? " dark" : "")}
            initial={false}
            animate={{ top: pos.top, scale: pos.scale, opacity: pos.show ? 1 : 0 }}
            transition={MS_EASE}
            style={{ height: A, zIndex: pos.z, pointerEvents: pos.show ? "auto" : "none", "--sc": BAND[s.id] }}
            aria-hidden={!titled || undefined}>
            <span className="ms-grain" aria-hidden="true" />
            <button type="button" className="ms-head" tabIndex={titled ? 0 : -1} aria-expanded={on}
              onClick={() => (on ? open() : go(i))}
              aria-label={s.title + (locked ? ", locked" : c.done ? ", complete" : ", " + c.filled + " of " + c.total + " answered") + (on ? "" : ", show")}>
              <span className="ms-t">{s.title}</span>
              <span className="ms-s">
                {!on && resume && resume.id === s.id ? <span className="ms-pill">Continue</span> : locked ? <span className="hc-lock"><Lock /></span> : c.done ? (on ? <span className="hc-slot ms-done"><Check size={28} animate={false} /></span> : <Check size={20} animate={false} />) : on ? <Ring filled={c.filled} total={c.total} /> : null}
              </span>
            </button>
            {on && (
              <motion.div className="ms-body" style={{ height: A - 87 - MS_OV }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tr(0.4, 0.15)}>
                <button type="button" className="ms-art" onClick={open} tabIndex={-1} aria-hidden="true">
                  <Art id={s.id} state={state} standalone autoplay tint={s.id === "05" ? BAND["05"] : undefined} accentOutline={s.id === "05" ? "rgba(40, 38, 35, 0.35)" : undefined} />
                </button>
                <button type="button" className="ms-foot" onClick={open}>
                  <span className="ms-cta">{cta}</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      {/* written on the background beneath every card: only seen once the deck runs out (the last section open) */}
      {h > 0 && (
        <div className="ms-note" style={{ top: MS_TOP + A, height: Math.max(0, h - MS_TOP - A) }}>
          <p className="ms-note-t">Thank you for taking the time to do this properly. Good brands start with honest answers.</p>
          <p className="ms-note-c">{"©"} {new Date().getFullYear()} Regan Li. All rights reserved.</p>
        </div>
      )}
    </div>
    </>
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
