"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from "motion/react";
import { SessionContext } from "./session";
import {
  SECTIONS, FORMAT, AUTOSAVE_KEY, defaults, normalize, getIn, setIn, completion, hasContent, sectionById, fieldId, isFilled,
} from "./schema";
import { migrate } from "./migrate";
import { SAMPLE } from "./content/sample";
import { SectionHeader } from "./ui/controls";
import Toast from "./ui/Toast";
import Hub from "./ui/Hub";
import { CompletePill } from "./ui/Shell";
import { ArtTile, Check, SECTION_COLORS } from "./ui/SectionArt";
import { PresentOverlay, Palette, ShortcutSheet } from "./ui/Overlays";
import Brief, { copyBrief } from "./brief/Brief";
import Setup from "./sections/Setup";
import Business from "./sections/Business";
import Audience from "./sections/Audience";
import Landscape from "./sections/Landscape";
import Perception from "./sections/Perception";
import Purpose from "./sections/Purpose";
import Positioning from "./sections/Positioning";
import Character, { ARCH_PANEL } from "./sections/Character";
import Voice from "./sections/Voice";
import Idea from "./sections/Idea";
import Visual from "./sections/Visual";
import Scope from "./sections/Scope";

/* TESTING: set to false to restore one-section-at-a-time unlocking. */

const BODIES = {
  "00": Setup, "01": Business, "02": Audience, "03": Landscape, "04": Perception, "05": Purpose,
  "06": Positioning, "07": Character, "08": Voice, "09": Idea, "10": Visual, "11": Scope,
};

/* ---------- localStorage (always guarded) ---------- */
const lsGet = () => { try { const raw = window.localStorage.getItem(AUTOSAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } };
const lsSet = (v) => { try { window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } };
const lsDel = () => { try { window.localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {} };

/* Generating the brief: a clean centred bar while a percentage climbs.
   It eases out (slowing as it nears the end), hangs on 99 for a beat, then lands on 100
   with a small flourish before the brief takes over the same panel. */
/* One smooth curve to 99: a gentle steady start (so 1, 2, 3 are readable) that keeps speeding up,
   flowing into a cubic ease-out with matched speed, so there is no seam. Then a dramatic second
   on 99, then it lands on 100. */
const GEN_RUN = 3200, GEN_HOLD = 1000, GEN_LAND = 480;
const GEN_DELAY = 350; // a quiet beat after the click, before the loader appears
const GEN_OUT = 0.35; // seconds for a caption word to lift away before the next rises in
const GEN_MS = GEN_DELAY + GEN_RUN + GEN_HOLD + GEN_LAND;
const GC = 0.03, GP = 3.5, GM = 0.6; // steady-start weight, ease-in power, where ease-in hands over to ease-out
const GA = 1 / (GC * GM + Math.pow(GM, GP) + (GC + GP * Math.pow(GM, GP - 1)) * (1 - GM) / 3);
const GB = GA * (GC + GP * Math.pow(GM, GP - 1)) / (3 * Math.pow(1 - GM, 2));
const genCurve = (u) => (u < GM ? GA * (GC * u + Math.pow(u, GP)) : 1 - GB * Math.pow(1 - u, 3));
const genValue = (t) => 99 * genCurve(Math.min(1, t / GEN_RUN));
function BriefLoader() {
  const [p, setP] = useState(0);
  const [el, setEl] = useState(0); // ms since the loader appeared
  const [shown, setShown] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setShown(true), GEN_DELAY); return () => clearTimeout(tm); }, []);
  useEffect(() => {
    if (!shown) return undefined;
    let raf = 0; const t0 = performance.now();
    const tick = (now) => {
      const t = Math.max(0, now - t0);
      const v = t < GEN_RUN ? Math.min(99, genValue(t)) : t < GEN_RUN + GEN_HOLD ? 99 : 100;
      setP(v);
      setEl(t);
      if (t < GEN_MS - GEN_DELAY) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown]);
  const pct = Math.max(0, Math.floor(p));
  const landed = pct >= 100;
  /* three phrases only */
  /* switch points chosen so each word stays up a similar time (the bar eases out, so % is not linear in time) */
  /* three phrases, each on screen for exactly a third of the loader's time */
  const third = (GEN_RUN + GEN_HOLD + GEN_LAND) / 3;
  /* the old word leaves first (GEN_OUT), then the new one rises in, landing on the third */
  const ahead = el + GEN_OUT * 1000;
  const caption = ahead < third ? "Strategizing…" : ahead < 2 * third ? "Pondering…" : "Perfecting…";
  return (
    <motion.div key="gen" className={"view gen-view" + (landed ? " landed" : "")} role="status" aria-live="polite"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
      {shown && <div className="gen">
        <motion.div className="gen-pct">
          {pct}<span>%</span>
        </motion.div>
        <div className="gen-bar" aria-hidden="true"><span style={{ transform: "scaleX(" + p / 100 + ")" }} /></div>
        <div className="gen-cap">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={caption} className="gen-t" initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } }}
              exit={{ opacity: 0, y: -8, transition: { duration: GEN_OUT, ease: [0.4, 0, 1, 1] } }}>{caption}</motion.span>
          </AnimatePresence>
        </div>
      </div>}
    </motion.div>
  );
}

/* Section intro: the icon tile is kept square and exactly as tall as the text beside it. */
function SecIntro({ id, sec, done, onHome }) {
  const ref = useRef(null);
  const [h, setH] = useState(120);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => setH(Math.round(el.getBoundingClientRect().height));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="sec-intro">
      <ArtTile key={id} id={id} state={done ? "done" : "open"} size={h} autoplay />
      <div className="sec-intro-main" ref={ref}><SectionHeader sec={sec} /></div>
      {done && <div className="sec-intro-side"><span className="sheet-done"><Check size={18} /> Complete</span></div>}
    </div>
  );
}

function relTime(ts) {
  if (!ts) return "earlier";
  const sec = Math.round((ts - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const abs = Math.abs(sec);
  if (abs < 60) return rtf.format(sec, "second");
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  return rtf.format(Math.round(sec / 86400), "day");
}
const clockTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const savedStamp = (ts) => new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) + ", " + clockTime(ts);
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function DiscoveryApp() {
  const [data, setData] = useState(defaults);
  const [view, setViewRaw] = useState("home");
  const [lastView, setLastView] = useState("home");
  const [lastSec, setLastSec] = useState(null); // the last section opened, for "pick up where you left off"
  const [tips, setTips] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [restore, setRestore] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [menu, setMenu] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [present, setPresent] = useState(false);
  const [palette, setPalette] = useState(false);
  const [sheet, setSheet] = useState(false);
  const fileRef = useRef(null);
  const menuRef = useRef(null);
  const lastFocus = useRef(null);
  const autosaveOn = useRef(false);

  /* ---------- toast ---------- */
  const showToast = useCallback((msg, kind) => setToast({ msg, kind, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- autosave & restore ---------- */
  useEffect(() => {
    const snap = lsGet();
    if (snap && snap.data && hasContent(snap.data)) setRestore(snap);
    else autosaveOn.current = true;
  }, []);

  useEffect(() => {
    if (!autosaveOn.current) return undefined;
    const t = setTimeout(() => {
      const at = Date.now();
      if (lsSet({ savedAt: at, data, view, lastView, lastSec })) setSavedAt(at);
    }, 500);
    return () => clearTimeout(t);
  }, [data, view, lastView, lastSec]);

  const doRestore = () => {
    try {
      const n = normalize(migrate(restore.data));
      setData(n);
      const ok = (x) => x === "home" || !!sectionById(x);
      const v = restore.view && (restore.view === "brief" || ok(restore.view)) ? restore.view : "home";
      setViewRaw(v);
      setLastView(restore.lastView && ok(restore.lastView) ? restore.lastView : v === "brief" ? "home" : v);
      if (restore.lastSec && sectionById(restore.lastSec)) setLastSec(restore.lastSec);
      showToast("Session restored");
    } catch (e) {
      showToast("Couldn't restore that session.", "error");
    }
    setRestore(null);
    autosaveOn.current = true;
  };
  /* the restore offer slides away by itself after 7 seconds (the saved session is left untouched) */
  useEffect(() => {
    if (!restore) return undefined;
    const tm = setTimeout(() => setRestore(null), 7000);
    return () => clearTimeout(tm);
  }, [restore]);
  const startFresh = () => { lsDel(); setRestore(null); autosaveOn.current = true; };

  const newSession = () => {
    lsDel();
    setData(defaults());
    setTips(new Set());
    setViewRaw("home");
    setLastView("home");
    setConfirmNew(false);
    setMenu(false);
    autosaveOn.current = true;
    window.scrollTo(0, 0);
    showToast("New session started");
  };

  /* ---------- navigation ---------- */
  const scrollTop = useRef(false);
  const reachRef = useRef(0);
  const setView = useCallback((v, keepScroll) => {
    const si = SECTIONS.findIndex((x) => x.id === v);
    if (si > reachRef.current) {
      showToast("Complete " + SECTIONS[reachRef.current].title + " to unlock " + SECTIONS[si].title);
      return;
    }
    setViewRaw(v);
    if (v !== "brief") setLastView(v);
    if (si >= 0) setLastSec(v);
    scrollTop.current = !keepScroll;
    if (v === "brief" && !keepScroll) window.scrollTo(0, 0);
  }, [showToast]);
  const onViewExit = useCallback(() => { if (scrollTop.current) { scrollTop.current = false; window.scrollTo(0, 0); } }, []);

  /* ---------- completion + celebration ---------- */
  /* dev tester: preview everything complete, and flip locking, without touching the session */
  const [generating, setGenerating] = useState(false);
  const genTimer = useRef(null);
  const openBriefRef = useRef(() => {});
  const [testDone, setTestDone] = useState(false);
  const loadSample = () => { setData(normalize(migrate(JSON.parse(JSON.stringify(SAMPLE))))); openBriefRef.current(); };
  /* desktop: the dev panel stays hidden until the cursor rests near the bottom edge for a second */
  const [devShow, setDevShow] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" === false) return undefined;
    let timer = 0, inZone = false;
    const onMove = (e) => {
      const near = e.clientY > window.innerHeight - 72;
      if (near && !inZone) { inZone = true; clearTimeout(timer); timer = setTimeout(() => setDevShow(true), 1000); }
      else if (!near && inZone) { inZone = false; clearTimeout(timer); setDevShow(false); }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(timer); };
  }, []);
  const unlockAll = true; // nothing is locked: people can explore any section in any order
  const comp = useMemo(() => SECTIONS.map((x) => (testDone ? { filled: x.core.length, total: x.core.length, done: true } : completion(data, x))), [data, testDone]);
  const doneCount = comp.filter((c) => c.done).length;
  /* Sections unlock in order. Unlocking is sticky (meta.unlocked), so clearing an
     earlier field never locks you out of a section you have already reached. */
  const firstOpen = comp.findIndex((c) => !c.done);
  /* A section unlocks only when Next is clicked on the one before it with every required question answered. */
  const reach = SECTIONS.length - 1; // every section is always open
  reachRef.current = reach;
  const [celebrate, setCelebrate] = useState(null);
  const closeCelebrate = useCallback(() => setCelebrate(null), []);
  const prevDone = useRef(null);
  useEffect(() => {
    const now = comp.map((c) => c.done);
    const prev = prevDone.current;
    prevDone.current = now;
    if (!prev) return;
  }, [comp]);

  /* ---------- Next: check the page, then unlock ---------- */
  /* Missing questions are flagged only after a Next attempt, and clear one by one as they are answered. */
  /* on phones the frame body is the scroller; start each view at its top */
  useEffect(() => { const fb = document.querySelector(".frame-body"); if (fb) fb.scrollTop = 0; }, [view]);
  const [missing, setMissing] = useState([]);
  useEffect(() => { setMissing([]); }, [view]);
  const findField = (path) => {
    const id = fieldId(path);
    let el = document.getElementById(id) || document.querySelector("[id^=\"" + id + "-\"]");
    let p = path;
    while (!el && p.includes(".")) { p = p.slice(0, p.lastIndexOf(".")); el = document.getElementById(fieldId(p)); }
    return el;
  };
  const markOf = (el) => (el && (el.closest(".sec-body > *, .sec-body > .grid2 > .field, .sec-body > .grid3 > .field, .sec-body .repeat .field, .sec-body .only-row") || el));
  useEffect(() => {
    document.querySelectorAll(".sec-sheet .missing").forEach((n) => n.classList.remove("missing"));
    missing.filter((p) => !isFilled(getIn(data, p))).forEach((p) => { const el = findField(p); if (el) el.classList.add("missing"); });
  });
  const tryNext = useCallback((idx) => {
    const sec = SECTIONS[idx];
    const gaps = sec.core.filter((p) => !isFilled(getIn(data, p)));
    if (gaps.length) {
      setMissing(gaps);
      showToast(gaps.length === 1 ? "Answer the highlighted question to continue" : "Answer the " + gaps.length + " highlighted questions to continue");
      const el = findField(gaps[0]);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
        const target = el.matches("input,textarea") ? el : el.querySelector("input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea, [role=radio][tabindex=\"0\"], .chip, .card, .dd-b, button:not(.tiph-b)");
        if (target) target.focus({ preventScroll: true });
      }
      return;
    }
    setMissing([]);
    const next = idx + 1;
    if (!unlockAll && next > (data.meta.unlocked || 0)) {
      reachRef.current = Math.max(reachRef.current, next);
      setData((d) => ({ ...d, meta: { ...d.meta, unlocked: Math.max(next, d.meta.unlocked || 0) } }));
    }
    if (next < SECTIONS.length) setViewRaw(SECTIONS[next].id), setLastView(SECTIONS[next].id), (scrollTop.current = true);
    else openBriefRef.current();
  }, [data, showToast, setView, unlockAll]);

  const goTo = useCallback((sec, path) => {
    if (path && path.startsWith("character.archetype")) setTips((t) => new Set(t).add(ARCH_PANEL));
    setView(sec, !!path);
    if (!path) return;
    const attempt = (n) => {
      let el = document.getElementById(fieldId(path));
      let p = path;
      while (!el && p.includes(".")) { p = p.slice(0, p.lastIndexOf(".")); el = document.getElementById(fieldId(p)); }
      if (!el) { if (n < 10) setTimeout(() => attempt(n + 1), 30); else window.scrollTo(0, 0); return; }
      el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
      const target = el.matches("input,textarea") ? el
        : el.querySelector("input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea, [role=radio][tabindex='0'], .chip, .card, [data-key], button:not(.coach-toggle):not(.ctag-b):not(.tiph-b)");
      if (target) target.focus({ preventScroll: true });
      el.classList.remove("flash");
      void el.offsetWidth; // restart the animation
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 700);
    };
    setTimeout(() => attempt(0), 0);
  }, [setView]);

  /* ---------- session context ---------- */
  const isTipOpen = useCallback((k) => tips.has(k), [tips]);
  const toggleTip = useCallback((k) => setTips((t) => { const n = new Set(t); if (n.has(k)) n.delete(k); else n.add(k); return n; }), []);
  const noteFocus = useCallback((p) => { lastFocus.current = p; }, []);

  const ctx = useMemo(() => ({
    data,
    get: (p) => getIn(data, p),
    set: (p, v) => setData((d) => setIn(d, p, v)),
    update: (fn) => setData(fn),
    goTo,
    confidence: data.meta.confidence,
    setConfidence: (p, lvl) => setData((d) => {
      const c = { ...d.meta.confidence };
      if (lvl) c[p] = lvl; else delete c[p];
      return { ...d, meta: { ...d.meta, confidence: c } };
    }),
    isTipOpen, toggleTip, noteFocus, toast: showToast,
  }), [data, goTo, isTipOpen, toggleTip, noteFocus, showToast]);

  /* ---------- file save / load ---------- */
  const saveSession = useCallback(() => {
    const payload = { _format: FORMAT, _tool: "Layered Discovery", _saved: new Date().toISOString(), ...data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = (data.setup.project || data.setup.client || "session").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "session";
    a.download = slug + ".gsx";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast("Saved " + slug + ".gsx");
  }, [data, showToast]);

  const loadSession = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const n = normalize(migrate(JSON.parse(r.result)));
        setData(n);
        setRestore(null);
        autosaveOn.current = true;
        showToast("Loaded " + (n.setup.project || n.setup.client || f.name));
      } catch (err) {
        showToast("Couldn't read that file. Is it a .gsx from Layered Discovery?", "error");
      }
    };
    r.onerror = () => showToast("Couldn't read that file. Is it a .gsx from Layered Discovery?", "error");
    r.readAsText(f);
    e.target.value = "";
  };

  /* ---------- shortcuts ---------- */
  const keys = useRef({});
  keys.current = { saveSession, view };
  useEffect(() => {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const editing = (el) => el && (el.tagName === "TEXTAREA" || el.isContentEditable || (el.tagName === "INPUT" && !["radio", "checkbox", "button", "file"].includes(el.type)));
    const onKey = (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      const mod = mac ? e.metaKey : e.ctrlKey;
      const k = (e.key || "").toLowerCase();
      const { view: v } = keys.current;
      if (mod && !e.shiftKey && !e.altKey && k === "s") { e.preventDefault(); keys.current.saveSession(); return; }
      if (mod && !e.shiftKey && !e.altKey && k === "k") { e.preventDefault(); setPresent(false); setSheet(false); setPalette((p) => !p); return; }
      if (mod && e.shiftKey && !e.altKey && k === "p") { e.preventDefault(); if (v !== "brief" && v !== "home") { setPalette(false); setSheet(false); setPresent((p) => !p); } return; }
      if (e.altKey && !mod && !e.shiftKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        if (v === "brief" || v === "home" || (mac && editing(e.target))) return; // Option+Arrow is word-jump on macOS
        e.preventDefault();
        const i = SECTIONS.findIndex((x) => x.id === v) + (e.key === "ArrowRight" ? 1 : -1);
        if (i >= 0 && i < SECTIONS.length) setView(SECTIONS[i].id);
        return;
      }
      if (e.key === "?" && !mod && !e.altKey && !editing(e.target)) { e.preventDefault(); setSheet(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setView]);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------- menu dismissal ---------- */
  useEffect(() => {
    if (!menu) return undefined;
    const close = (ev) => { if (menuRef.current && !menuRef.current.contains(ev.target)) setMenu(false); };
    const esc = (ev) => { if (ev.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [menu]);

  const idx = SECTIONS.findIndex((x) => x.id === view);
  const sec = SECTIONS[idx];
  const Body = BODIES[view];
  const inSection = !!sec;
  const openBrief = () => {
    clearTimeout(genTimer.current);
    setGenerating(true);
    setView("brief");
    genTimer.current = setTimeout(() => setGenerating(false), GEN_MS);
  };
  openBriefRef.current = openBrief;
  const ready = doneCount === SECTIONS.length;
  /* not finished yet: the button shakes and a note says what's left */
  const ctaShake = useAnimationControls();
  /* the label swaps to a red "Incomplete" (in from the right), then back after 2s (the reverse) */
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef(0);
  useEffect(() => () => clearTimeout(nudgeTimer.current), []);
  const nudgeBrief = () => {
    ctaShake.start({ x: [0, -6, 6, -4, 4, -2, 0], transition: { duration: 0.45, ease: "easeInOut" } });
    setNudge(true);
    clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudge(false), 2000);
  };

  return (
    <SessionContext.Provider value={ctx}>
      <MotionConfig reducedMotion="user">
      <div className="root canvas">
        <a className="skip" href="#main">Skip to content</a>
        <AnimatePresence>
          {restore && (
            <motion.div key="restore" className="banner no-print" role="region" aria-label="Restore session"
              initial={{ opacity: 0, y: -12, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -12, x: "-50%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}>
              <span className="banner-t">Unsaved session from {relTime(restore.savedAt)} found.</span>
              <span className="banner-acts">
                <button type="button" className="banner-b" onClick={startFresh}>Start fresh</button>
                <button type="button" className="banner-b strong" onClick={doRestore}>Restore</button>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {(
          <>
            <div className="frame">
            <div className="topbar no-print">
              <div className="top-left">
                <AnimatePresence mode="wait" initial={false}>
                  {view === "brief" ? (
                    <motion.button key="edit" type="button" className="top-back" onClick={() => { setGenerating(false); setView(lastView && lastView !== "brief" ? lastView : "home"); }}
                      initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}>
                      <span aria-hidden="true">{"←"}</span> Edit
                    </motion.button>
                  ) : inSection ? (
                    <motion.button key="back" type="button" className="top-back" onClick={() => setView("home")}
                      initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}>
                      <span aria-hidden="true">{"←"}</span> All sections
                    </motion.button>
                  ) : (
                    <motion.button key="brand" type="button" className="brand" onClick={() => setView("home")} aria-label="layered-strategies.exe, all sections"
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}>
                      layered-strategies.exe
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              {view === "brief" ? (
              <div className="top-actions">
                <button type="button" className="bar-btn" disabled={generating} onClick={() => copyBrief(data, showToast)}><span className="cta-full">Copy as Markdown</span><span className="cta-short">Copy</span></button>
                <motion.button type="button" className="cta" disabled={generating} onClick={() => window.print()} whileTap={{ scale: 0.97 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v8M4.8 7 8 10.2 11.2 7M3 13.5h10" /></svg>
                  <span><span className="cta-full">Download PDF</span><span className="cta-short">PDF</span></span>
                </motion.button>
              </div>
              ) : (
              <div className="top-actions">
                <button type="button" className="bar-btn hide-sm" onClick={saveSession} title="Download the session as a .gsx file">Save</button>
                <button type="button" className="bar-btn hide-sm" onClick={() => fileRef.current && fileRef.current.click()} title="Open a saved .gsx file">Load</button>
                <input ref={fileRef} type="file" accept=".gsx,.json" hidden onChange={loadSession} />
                <div className="menu-wrap show-sm" ref={menuRef}>
                  <button type="button" className="bar-btn icon" aria-haspopup="menu" aria-expanded={menu} aria-label="More actions" onClick={() => setMenu((m) => !m)}>{"⋯"}</button>
                  <AnimatePresence>
                    {menu && (
                      <motion.div className="menu" role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}>
                        <button type="button" role="menuitem" className="menu-i" autoFocus onClick={() => { setMenu(false); saveSession(); }}>Save</button>
                        <button type="button" role="menuitem" className="menu-i" onClick={() => { setMenu(false); if (fileRef.current) fileRef.current.click(); }}>Load</button>
                        {process.env.NODE_ENV !== "production" && (
                          <>
                            <span className="menu-sep" aria-hidden="true" />
                            <span className="menu-k">Preview</span>
                            <button type="button" role="menuitemcheckbox" aria-checked={testDone} className={"menu-i" + (testDone ? " on" : "")} onClick={() => { setMenu(false); setTestDone((v) => !v); }}>All complete</button>
                            <button type="button" role="menuitem" className="menu-i" onClick={() => { setMenu(false); loadSample(); }}>Sample brief</button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button type="button" className={"cta" + (ready ? " ready" : "")} animate={ctaShake} onClick={ready ? openBrief : nudgeBrief} aria-disabled={!ready || undefined} whileTap={ready ? { scale: 0.97 } : undefined}>
                  <span className="cta-swap">
                    <motion.span className="cta-lab" initial={false} animate={nudge ? { x: -16, opacity: 0 } : { x: 0, opacity: 1 }} transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }} aria-hidden={nudge || undefined}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M4 1.8h5.2L12.5 5v8.2a1 1 0 0 1-1 1h-7.5a1 1 0 0 1-1-1V2.8a1 1 0 0 1 1-1Z" /><path d="M9 1.8V5h3.5M5.5 8.2h5M5.5 10.8h3.5" /></svg>
                      <span className="cta-full">Generate Brief</span><span className="cta-short">Generate</span>
                    </motion.span>
                    <motion.span className="cta-lab cta-bad" initial={false} animate={nudge ? { x: 0, opacity: 1 } : { x: 16, opacity: 0 }} transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }} aria-hidden={!nudge || undefined}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" /></svg>
                      Incomplete
                    </motion.span>
                  </span>
                  <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{nudge ? "Incomplete: finish every section to generate the brief" : ""}</span>
                </motion.button>
              </div>
              )}
            </div>
            <AnimatePresence>
              {confirmNew && (
                <motion.div className="confirm no-print" role="alertdialog" aria-label="Confirm new session"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <span>Start a new session? Anything not saved to a .gsx file will be cleared.</span>
                  <button type="button" className="bar-btn primary" autoFocus onClick={newSession}>Clear and start fresh</button>
                  <button type="button" className="bar-btn" onClick={() => setConfirmNew(false)}>Cancel</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="frame-body">

            <AnimatePresence mode="wait" initial={false} onExitComplete={onViewExit}>
              {view === "brief" ? (
                generating ? <BriefLoader key="gen" /> : (
                  <motion.div key="brief" className="view brief-view" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
                    <Brief embedded data={data} onToast={showToast} />
                  </motion.div>
                )
              ) : view === "home" ? (
                <motion.div key="home" className="view home-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18 }}>
                  <Hub data={data} comp={comp} reach={reach} lastSec={lastSec} onOpen={(id) => setView(id)} onLocked={(id) => setView(id)} onBrief={openBrief} />
                </motion.div>
              ) : (
                <motion.main key={view} className="sec-sheet" id="main" tabIndex={-1} style={{ "--accent": SECTION_COLORS[view] || undefined }}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}>
                  <SecIntro id={view} sec={sec} done={comp[idx].done} onHome={() => setView("home")} />
                  <div className="sec-body"><Body /></div>
                  <div className="pager">
                    {idx > 0 ? (<button type="button" className="pager-btn" onClick={() => setView(SECTIONS[idx - 1].id)}>{"←"} {SECTIONS[idx - 1].title}</button>) : (
                      <button type="button" className="pager-btn" onClick={() => setView("home")}>{"←"} All sections</button>)}
                    {idx < SECTIONS.length - 1 ? (
                      <button type="button" className="pager-btn next" onClick={() => tryNext(idx)}>{SECTIONS[idx + 1].title} {"→"}</button>
                    ) : (
                      <button type="button" className="pager-btn next blue-btn" onClick={() => tryNext(idx)}>Generate Brief {"→"}</button>
                    )}
                  </div>
                </motion.main>
              )}
            </AnimatePresence>
            </div>
            </div>
            {process.env.NODE_ENV !== "production" && (
              <div className={"tester no-print" + (devShow ? " show" : "")} role="group" aria-label="Preview controls (development only)">
                <span className="tester-l">Preview</span>
                <button type="button" className={"tester-b" + (testDone ? " on" : "")} aria-pressed={testDone} onClick={() => setTestDone((v) => !v)}>All complete</button>
                <button type="button" className="tester-b" onClick={loadSample}>Sample brief</button>
              </div>
            )}
            <CompletePill celebrate={celebrate} comp={comp} onNext={(id) => setView(id)} onBrief={openBrief} onClose={closeCelebrate} />
          </>
        )}
        {present && inSection && <PresentOverlay view={view} lastFocus={lastFocus.current} onClose={() => setPresent(false)} />}
        {palette && <Palette data={data} onGo={goTo} onClose={() => setPalette(false)} />}
        {sheet && <ShortcutSheet mac={isMac} onClose={() => setSheet(false)} />}
        <Toast toast={toast} />
      </div>
      </MotionConfig>
    </SessionContext.Provider>
  );
}
