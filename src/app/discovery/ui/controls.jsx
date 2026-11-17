"use client";
import React, { useContext, useRef, useState } from "react";
import { useSession, FieldContext } from "../session";
import { FIELDS, THINK, PLACEHOLDERS } from "../content/tips";
import { normPath, fieldId } from "../schema";
import { fmtClock } from "../logic/derive";
import LintNotes from "./LintNotes";

/* ---------- labels & coaching ---------- */

export const Eyebrow = ({ children, hint, id }) => (
  <div className="eyebrow-row">
    <span className="eyebrow" id={id}>{children}</span>
    {hint && <span className="hint">{hint}</span>}
  </div>
);

/* Always-open coach panel (page intros). */
export const Coach = ({ ask, example, egLabel = "A strong answer sounds like", frame, quote = false }) => (
  <div className="coach standalone">
    <div className="coach-body open">
      {ask && <p className="coach-ask">{ask}</p>}
      {example && (
        <div className="coach-eg"><span className="coach-eg-l">{egLabel}</span>
          <p className="coach-eg-t">{quote ? "“" + example + "”" : example}</p></div>
      )}
    </div>
  </div>
);

/* Hover tip: a small "Tip" key on the hint line. Hover or focus it to see a strong
   example and one or two plain questions to think with. */
export function TipHover({ tipId, example, think }) {
  const popId = "tip-" + tipId.replace(/[.*]/g, "-");
  const ref = useRef(null);
  const [up, setUp] = useState(true);
  const [dx, setDx] = useState(0);
  /* open above by default (the input sits below); drop below only when there is no room above */
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const pop = el.querySelector(".tiph-pop");
    const view = el.closest(".sec-sheet") || document.documentElement;
    const vr = view === document.documentElement ? { top: 0, bottom: window.innerHeight } : view.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const need = (pop ? pop.offsetHeight : 220) + 12;
    const below = vr.bottom - r.bottom, above = r.top - vr.top;
    setUp(!(above < need && below > above));
    /* keep the card inside the view horizontally (narrow screens) */
    if (pop) {
      const right = view === document.documentElement ? window.innerWidth : vr.right;
      const left = view === document.documentElement ? 0 : vr.left;
      const w = pop.offsetWidth, start = r.left - 12;
      let shift = 0;
      if (start + w > right - 8) shift = right - 8 - (start + w);
      if (start + shift < left + 8) shift = left + 8 - start;
      setDx(shift);
    }
  };
  return (
    <span className={"tiph" + (up ? " up" : "")} ref={ref} onMouseEnter={place} onFocus={place}>
      <button type="button" className="tiph-b" aria-describedby={popId}>
        Tip &amp; Example
      </button>
      <span className="tiph-pop" role="tooltip" id={popId} style={dx ? { marginLeft: dx } : undefined}>
        {example && (<>
          <span className="tiph-h">A strong answer sounds like</span>
          <span className="tiph-eg">{"“" + example + "”"}</span>
        </>)}
        {think && think.length > 0 && (<>
          <span className="tiph-h">How to think about it</span>
          <span className="tiph-think">{think.map((t) => <span key={t} className="tiph-q">{t}</span>)}</span>
        </>)}
      </span>
    </span>
  );
}

/* Field: label row (+ confidence tag), tip, children, extra notes.
   Looks its copy up from content/tips.js by path. */
export function Field({ path, tipKey, label, hint, children, className = "", tag, after }) {
  const s = useSession();
  const f = FIELDS[tipKey || normPath(path)] || {};
  const lab = label ?? f.label;
  const hin = hint ?? f.hint;
  const key = tipKey || normPath(path);
  const think = THINK[key];
  const hasTip = !!(f.example || think);
  const fid = fieldId(path);
  const labelId = fid + "-label";
  return (
    <FieldContext.Provider value={{ labelId, path }}>
      <div className={"field " + className} id={fid} onFocusCapture={() => s.noteFocus(path)}>
        <div className="eyebrow-row">
          <span className="eyebrow" id={labelId}>{lab}</span>
          {(hin || hasTip) && (
            <span className="subline">
              {hin && <span className="hint">{hin}</span>}
              {hasTip && <TipHover tipId={path} example={f.example} think={think} />}
            </span>
          )}
        </div>
        {children}
        {f.lint && <LintNotes text={s.get(path)} />}
        {after}
      </div>
    </FieldContext.Provider>
  );
}

/* ---------- inputs (bind by path, or controlled via value/onChange) ---------- */

/* placeholder: the one passed in, else the field registry default for this path */
const phFor = (placeholder, path, fc) => placeholder || PLACEHOLDERS[normPath(path || (fc && fc.path) || "")] || "";

function useBinding(path, value, onChange, fallback) {
  const s = useSession();
  if (!path) return [value, onChange];
  const v = s.get(path);
  return [v === undefined || v === null ? fallback : v, (x) => s.set(path, x)];
}

export function Input({ path, value, onChange, placeholder, mono, className = "", ...rest }) {
  const fc = useContext(FieldContext);
  const [v, ch] = useBinding(path, value, onChange, "");
  return (
    <input className={"inp" + (mono ? " mono" : "") + (className ? " " + className : "")} value={v} onChange={(e) => ch(e.target.value)}
      placeholder={phFor(placeholder, path, fc)} aria-labelledby={rest["aria-label"] ? undefined : fc && fc.labelId} {...rest} />
  );
}

export function Area({ path, value, onChange, placeholder, rows = 3, className = "", ...rest }) {
  const fc = useContext(FieldContext);
  const [v, ch] = useBinding(path, value, onChange, "");
  return (
    <textarea className={"area" + (className ? " " + className : "")} rows={rows} value={v} onChange={(e) => ch(e.target.value)}
      placeholder={phFor(placeholder, path, fc)} aria-labelledby={rest["aria-label"] ? undefined : fc && fc.labelId} {...rest} />
  );
}

/* Field + input shorthands */
export const TF = ({ path, ph, mono, after }) => <Field path={path} after={after}><Input path={path} placeholder={ph} mono={mono} /></Field>;
export const AF = ({ path, ph, rows, after, className }) => <Field path={path} after={after} className={className}><Area path={path} placeholder={ph} rows={rows} /></Field>;

export function Chips({ path, options, value, onChange, multi = true, max, render }) {
  const fc = useContext(FieldContext);
  const [val, ch] = useBinding(path, value, onChange, multi ? [] : null);
  const isSel = (o) => (multi ? val.includes(o) : val === o);
  const toggle = (o) => {
    if (multi) {
      if (val.includes(o)) ch(val.filter((x) => x !== o));
      else if (!max || val.length < max) ch([...val, o]);
    } else ch(val === o ? null : o);
  };
  return (
    <div className="chips" role="group" aria-labelledby={fc && fc.labelId}>
      {options.map((o) => {
        const sel = isSel(o);
        const full = multi && max && !sel && val.length >= max;
        return (
          <button key={o} type="button" data-v={String(o).toLowerCase()} className={"chip" + (sel ? " on" : "")} aria-pressed={sel} aria-disabled={full || undefined}
            title={full ? "Maximum " + max : undefined} onClick={() => toggle(o)}>{render ? render(o, sel) : o}</button>
        );
      })}
    </div>
  );
}

/* Roving-focus helper for single-choice rows (scales, 1-5 controls). */
function onRadioKeys(e, value, count, set) {
  const k = e.key;
  let next = null;
  const cur = value == null ? Math.floor((count - 1) / 2) : value;
  if (k === "ArrowRight" || k === "ArrowUp") next = Math.min(count - 1, value == null ? cur : cur + 1);
  else if (k === "ArrowLeft" || k === "ArrowDown") next = Math.max(0, value == null ? cur : cur - 1);
  else if (k === "Home") next = 0;
  else if (k === "End") next = count - 1;
  else if (k === "Delete" || k === "Backspace") { e.preventDefault(); set(null); return; }
  if (next == null) return;
  e.preventDefault();
  set(next);
  const btns = e.currentTarget.querySelectorAll("[role=radio]");
  if (btns[next]) btns[next].focus();
}

/* Scales show 7 steps; stored values stay 0-8 so checks, the brief and saved files keep working. */
export const STEPS = 7, MID = 3;
export const STEP_VAL = [0, 1, 3, 4, 5, 7, 8];
export const scalePos = (v) => (v == null ? null : Math.round((v * (STEPS - 1)) / 8));

export function Scale({ path, left, right, value, onChange }) {
  const [v, ch] = useBinding(path, value, onChange, null);
  /* 7 visible steps (3 each side of the middle); answers stay on the stored 0-8 scale */
  const p = scalePos(v);
  const tabbable = p == null ? MID : p;
  return (
    <div className="scale">
      <div className="scale-l" aria-hidden="true">{left}</div>
      <div className="scaletrack" role="radiogroup" aria-label={left + " to " + right}
        onKeyDown={(e) => onRadioKeys(e, p, STEPS, (i) => ch(i == null ? null : STEP_VAL[i]))}>
        {STEP_VAL.map((val, i) => (
          <button key={i} type="button" role="radio" className="notch" tabIndex={i === tabbable ? 0 : -1}
            aria-label={left + " to " + right + ", position " + (i + 1) + " of " + STEPS} aria-checked={p === i}
            onClick={() => ch(p === i ? null : val)}>
            <span className={"tick" + (i === MID ? " mid" : "")} />
          </button>
        ))}
        <span className={"sdot" + (p == null ? " unset" : "")} aria-hidden="true" style={{ left: ((p == null ? MID : p) + 0.5) / STEPS * 100 + "%" }} />
      </div>
      <div className="scale-r" aria-hidden="true">{right}</div>
    </div>
  );
}

export const StaticScale = ({ left, right, value }) => {
  const p = scalePos(value);
  return (
    <div className="bscale" role="img" aria-label={left + " to " + right + ": " + (p == null ? "not set" : p + 1 + " of " + STEPS)}>
      <div className="bscale-l">{left}</div>
      <div className="bscale-track">
        {STEP_VAL.map((_, i) => (
          <span key={i} className="bcell">
            <span className={"btick" + (i === MID ? " mid" : "")} />
            {p === i && <span className="bmark" />}
          </span>
        ))}
      </div>
      <div className="bscale-r">{right}</div>
    </div>
  );
};

/* 1-5 segmented control */
export function Segmented({ value, onChange, label, n = 5 }) {
  const tabbable = value == null ? 0 : value - 1;
  return (
    <div className="seg" role="radiogroup" aria-label={label}
      onKeyDown={(e) => onRadioKeys(e, value == null ? null : value - 1, n, (i) => onChange(i == null ? null : i + 1))}>
      {Array.from({ length: n }).map((_, i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i + 1} tabIndex={i === tabbable ? 0 : -1}
          aria-label={label + " " + (i + 1) + " of " + n} className={"seg-b" + (value === i + 1 ? " on" : "")}
          onClick={() => onChange(value === i + 1 ? null : i + 1)}>{i + 1}</button>
      ))}
    </div>
  );
}

export function CardSelect({ options, value, onChange, secondary, onSecondary }) {
  return (
    <div className="cards">
      {options.map(([name, desc]) => {
        const isP = value === name;
        const isS = secondary === name;
        return (
          <div key={name} className={"card" + (isP ? " p" : "") + (isS ? " s" : "")}>
            <div className="card-name">{name}</div>
            <div className="card-desc">{desc}</div>
            <div className="card-actions">
              <button type="button" className={"mini" + (isP ? " on" : "")} aria-pressed={isP} aria-label={"Primary: " + name}
                onClick={() => { onChange(isP ? null : name); if (isS && !isP) onSecondary(null); }}>Primary</button>
              <button type="button" className={"mini" + (isS ? " on2" : "")} aria-pressed={isS} aria-label={"Secondary: " + name}
                onClick={() => { onSecondary(isS ? null : name); }} disabled={isP}>Secondary</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Bordered box with a small caps title (v1 Golden Circle style). */
export const Box = ({ title, children, className = "" }) => (
  <div className={"golden " + className}>
    {title && <div className="box-title">{title}</div>}
    {children}
  </div>
);

export const Warn = ({ children }) => <p className="warn">{children}</p>;

export function SectionHeader({ sec, spent }) {
  const over = spent != null && spent > sec.minutes * 60 * 1.5;
  return (
    <header className="sec-head">
      <div className="sec-top">
        <div className="sec-meta">
          <span className="sec-num">{sec.id}</span>
          <span className="sec-phase">{sec.phase}</span>
          <span className="sec-time">
            ~{sec.minutes} min{spent != null && spent > 0 && <> {"·"} <span className={over ? "amber" : ""}>{fmtClock(spent)} spent</span></>}
          </span>
        </div>
      </div>
      <h1 className="sec-title">{sec.title}</h1>
      <p className="sec-note">{sec.note}</p>
    </header>
  );
}

export const useStableRef = (v) => { const r = useRef(v); r.current = v; return r; };
