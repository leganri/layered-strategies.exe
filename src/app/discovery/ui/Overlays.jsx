"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, sectionById, normPath } from "../schema";
import { FIELDS } from "../content/tips";

/* Keep Tab inside a modal. */
function trapTab(e, root) {
  if (e.key !== "Tab" || !root) return;
  const f = [...root.querySelectorAll("button, input, [tabindex='0']")].filter((x) => !x.disabled);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* Restore focus to whatever was focused before the overlay opened. */
function useReturnFocus() {
  useEffect(() => {
    const prev = document.activeElement;
    return () => { if (prev && prev.focus && document.contains(prev)) prev.focus({ preventScroll: true }); };
  }, []);
}

/* ---------- Present mode: client-facing question only ---------- */
export function PresentOverlay({ view, lastFocus, onClose }) {
  const ref = useRef(null);
  useReturnFocus();
  const sec = sectionById(view);
  const f = lastFocus && FIELDS[normPath(lastFocus)];
  const fromField = f && f.section === view && f.ask ? f : null;
  const ask = fromField ? fromField.ask : sec && sec.coach ? sec.coach.ask : "";
  useEffect(() => { const b = ref.current && ref.current.querySelector(".present-x"); if (b) b.focus(); }, []);
  return (
    <div className="present" role="dialog" aria-modal="true" aria-label={"Present: " + (sec ? sec.title : "")} ref={ref}
      onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } trapTab(e, ref.current); }}>
      <button type="button" className="present-x" onClick={onClose} aria-label="Exit present mode">Esc {"×"}</button>
      <div className="present-in">
        {sec && <div className="present-sec"><span className="present-num">{sec.id}</span> {sec.title}{fromField ? <span className="present-f"> {"·"} {fromField.label}</span> : null}</div>}
        {ask ? <p className="present-ask">{ask}</p> : <p className="present-ask">{sec ? sec.title : ""}</p>}
      </div>
    </div>
  );
}

/* ---------- Jump palette ---------- */
export function Palette({ data, onGo, onClose }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);
  useReturnFocus();

  const all = useMemo(() => {
    const firstId = { segments: data.audience.segments[0] && data.audience.segments[0].id, competitors: data.landscape.competitors[0] && data.landscape.competitors[0].id, assets: data.perception.assets[0] && data.perception.assets[0].id, rtbs: "0" };
    const secs = SECTIONS.map((s) => ({ key: "s" + s.id, sec: s.id, path: null, label: s.title, kind: "Section" }));
    const fields = Object.entries(FIELDS)
      .filter(([p]) => p !== "setup.date")
      .map(([p, f]) => {
        const real = p.split(".").map((seg, k, arr) => (seg === "*" ? firstId[arr[k - 1]] : seg)).join(".");
        return { key: p, sec: f.section, path: real, label: f.label, kind: (sectionById(f.section) || {}).title };
      })
      .filter((x) => !x.path.includes("undefined"));
    return [...secs, ...fields];
  }, [data]);

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = all.filter((x) => { const hay = (x.sec + " " + x.label + " " + x.kind).toLowerCase(); return words.every((w) => hay.includes(w)); }).slice(0, 60);
  const cur = Math.min(i, Math.max(0, list.length - 1));

  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector('[aria-selected="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cur, q]);

  const go = (x) => { if (!x) return; onClose(); onGo(x.sec, x.path); };

  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Jump to a section or field" ref={ref}
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.preventDefault(); onClose(); }
          else if (e.key === "ArrowDown") { e.preventDefault(); setI(Math.min(cur + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setI(Math.max(cur - 1, 0)); }
          else if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); go(list[cur]); }
          else trapTab(e, ref.current);
        }}>
        <input className="palette-in" autoFocus value={q} placeholder="Jump to... (section or field)" role="combobox"
          aria-expanded="true" aria-controls="palette-list" aria-activedescendant={list[cur] ? "pl-" + cur : undefined}
          aria-label="Search sections and fields" onChange={(e) => { setQ(e.target.value); setI(0); }} />
        <ul className="palette-list" id="palette-list" role="listbox" ref={listRef} aria-label="Results">
          {list.length === 0 && <li className="palette-empty">Nothing matches.</li>}
          {list.map((x, k) => (
            <li key={x.key} id={"pl-" + k} role="option" aria-selected={k === cur} className={"palette-i" + (k === cur ? " on" : "") + (x.kind === "Section" ? " sec" : "")}
              onMouseEnter={() => setI(k)} onMouseDown={(e) => { e.preventDefault(); go(x); }}>
              <span className="palette-n">{x.sec}</span>
              <span className="palette-l">{x.label}</span>
              <span className="palette-k">{x.kind}</span>
            </li>
          ))}
        </ul>
        <div className="palette-foot">{"↑↓"} move {"·"} Enter jump {"·"} Esc close</div>
      </div>
    </div>
  );
}

/* ---------- Shortcut sheet ---------- */
export function ShortcutSheet({ onClose, mac }) {
  const ref = useRef(null);
  useReturnFocus();
  const m = mac ? "⌘" : "Ctrl";
  const rows = [
    [m + " S", "Save .gsx"],
    [m + " K", "Jump palette"],
    ["Alt → / Alt ←", "Next / previous section"],
    [m + " Shift P", "Present mode"],
    ["?", "This sheet"],
    ["Esc", "Close any overlay"],
  ];
  useEffect(() => { const b = ref.current && ref.current.querySelector("button"); if (b) b.focus(); }, []);
  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t" ref={ref}
        onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } trapTab(e, ref.current); }}>
        <div className="sheet-h"><span id="sheet-t" className="eyebrow">Keyboard shortcuts</span>
          <button type="button" className="ghost" onClick={onClose} aria-label="Close shortcuts">Close {"×"}</button></div>
        <dl className="sheet-l">
          {rows.map(([k, v]) => (<div key={k} className="sheet-r"><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>))}
        </dl>
        <p className="nudge">Map dots: arrow keys move 2, Shift + arrow moves 10, Delete returns a dot to the tray.</p>
      </div>
    </div>
  );
}
