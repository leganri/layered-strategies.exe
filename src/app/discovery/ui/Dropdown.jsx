"use client";
/* On-brand dropdown: a soft key showing the value, opening a small menu card.
   Keyboard: Enter/Space/Arrow opens; arrows move; Enter picks; Escape/Tab closes. */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Dropdown({ value, options, onChange, label, className = "" }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(Math.max(0, options.indexOf(value)));
  const wrap = useRef(null);
  const btn = useRef(null);
  const listId = useRef("dd-" + Math.random().toString(36).slice(2, 8)).current;

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = (o) => { onChange(o); setOpen(false); btn.current && btn.current.focus(); };
  const openAt = () => { setHi(Math.max(0, options.indexOf(value))); setOpen(true); };

  const onKey = (e) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); openAt(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setHi(0); }
    else if (e.key === "End") { e.preventDefault(); setHi(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(options[hi]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <span className={"dd " + className} ref={wrap}>
      <button ref={btn} type="button" className={"dd-b" + (open ? " open" : "")} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={listId} aria-label={label ? label + ": " + value : undefined}
        aria-activedescendant={open ? listId + "-" + hi : undefined} onClick={() => (open ? setOpen(false) : openAt())} onKeyDown={onKey}>
        <span className="dd-v">{value}</span>
        <svg className="dd-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.8 5 6.6 8 3.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul className="dd-menu" role="listbox" id={listId} aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -3, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}>
            {options.map((o, i) => (
              <li key={o} id={listId + "-" + i} role="option" aria-selected={o === value}
                className={"dd-i" + (i === hi ? " hi" : "") + (o === value ? " on" : "")}
                onMouseEnter={() => setHi(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
                <span>{o}</span>
                {o === value && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6 9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </span>
  );
}
