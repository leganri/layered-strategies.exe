"use client";
/* In-section chrome: the step strip and the "section complete" pill. */
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SECTIONS, sectionById } from "../schema";
import { Check, Lock, EASE } from "./SectionArt";

const tr = (d = 0.45) => ({ duration: d, ease: EASE });

export function StepBar({ view, comp, reach, onGo, onHome }) {
  return (
    <nav className="stepbar no-print" aria-label="Sections">
      <motion.button type="button" className="step-home" onClick={onHome} whileTap={{ scale: 0.97 }}
        initial="rest" animate="rest" whileHover="hover">
        <motion.span aria-hidden="true" variants={{ rest: { x: 0, transition: tr(0.35) }, hover: { x: -3, transition: tr(0.35) } }}>{"←"}</motion.span>
        <span>All sections</span>
      </motion.button>
      <div className="steps">
        {SECTIONS.map((s, i) => {
          const on = s.id === view;
          const c = comp[i];
          const locked = i > reach;
          return (
            <button key={s.id} type="button" className={"step" + (on ? " on" : "") + (c.done && !locked ? " done" : "") + (locked ? " locked" : "")}
              aria-current={on ? "page" : undefined} disabled={locked} onClick={() => onGo(s.id)}
              aria-label={`${s.id} ${s.title}${locked ? ", locked" : c.done ? ", complete" : ""}`} title={locked ? s.title + " (locked)" : s.title}>
              {on && <motion.span layoutId="step-hl" className="step-hl" transition={tr(0.5)} />}
              <span className="step-in">
                {locked ? <Lock size={11} /> : c.done && !on ? <Check size={14} animate={false} /> : <span className="step-n">{s.id}</span>}
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span className="step-t" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }} transition={tr(0.45)}>{s.title}</motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* Shown when a section crosses into complete. */
export function CompletePill({ celebrate, comp, onNext, onBrief, onClose }) {
  useEffect(() => {
    if (!celebrate) return undefined;
    const tm = setTimeout(onClose, 5200);
    return () => clearTimeout(tm);
  }, [celebrate, onClose]);

  let body = null;
  if (celebrate) {
    if (celebrate.all) {
      body = (
        <>
          <Check size={26} />
          <span className="cp-t"><strong>All {SECTIONS.length} sections complete.</strong> The brief is ready.</span>
          <button type="button" className="cp-b primary" onClick={() => { onClose(); onBrief(); }}>Generate Brief {"→"}</button>
        </>
      );
    } else {
      const sec = sectionById(celebrate.id);
      const i = SECTIONS.findIndex((s) => s.id === celebrate.id);
      const next = SECTIONS.slice(i + 1).find((s) => !comp[SECTIONS.indexOf(s)].done);
      body = (
        <>
          <Check size={26} />
          <span className="cp-t"><strong>{sec.title}</strong> complete{next ? <span className="cp-u"> · Next: {next.title}</span> : null}</span>
          {next && <button type="button" className="cp-b" onClick={() => { onClose(); onNext(next.id); }}>Continue {"→"}</button>}
          <button type="button" className="cp-x" onClick={onClose} aria-label="Dismiss">{"×"}</button>
        </>
      );
    }
  }

  return (
    <div className="cp-region no-print" role="status" aria-live="polite">
      <AnimatePresence>
        {celebrate && (
          <motion.div key={celebrate.all ? "all" : celebrate.id} className={"cp" + (celebrate.all ? " all" : "")}
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={tr(0.5)}>
            {body}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
