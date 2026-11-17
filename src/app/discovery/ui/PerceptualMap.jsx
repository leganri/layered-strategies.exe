"use client";
import React, { useId, useRef, useState } from "react";
import { useSession } from "../session";
import { setIn } from "../schema";
import { axisLabels } from "../logic/derive";

const S = 400;            // viewBox size
const R = 7;              // dot radius (~14px at 400px)
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const px = (x) => (x / 100) * S;
const py = (y) => S - (y / 100) * S;

function mapItems(L) {
  return [
    ...L.competitors.filter((c) => c.name && c.name.trim()).map((c) => ({
      key: c.id, label: c.name.trim(), kind: "comp", x: c.x, y: c.y, path: "landscape.competitors." + c.id,
    })),
    { key: "us", label: "Us today", kind: "us", x: L.map.us.x, y: L.map.us.y, path: "landscape.map.us" },
    { key: "target", label: "Us target", kind: "target", x: L.map.target.x, y: L.map.target.y, path: "landscape.map.target" },
  ];
}

/* Draggable 2-axis competitor map. readOnly renders the static version used in the brief. */
export default function PerceptualMap({ readOnly = false, data }) {
  const s = useSession();
  const d = data || s.data;
  const L = d.landscape;
  const { xl, xr, yb, yt } = axisLabels(L.map);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const tray = useRef(null);
  const [armed, setArmed] = useState(null);
  const uidRaw = useId();
  const mid = "pm" + uidRaw.replace(/[^a-zA-Z0-9]/g, "");

  const items = mapItems(L);
  const placed = items.filter((i) => i.x != null && i.y != null);
  const unplaced = items.filter((i) => i.x == null || i.y == null);
  const us = L.map.us, tg = L.map.target;
  const arrow = us.x != null && us.y != null && tg.x != null && tg.y != null;

  const setPos = (it, x, y) => {
    if (it.kind === "comp") s.update((dd) => setIn(setIn(dd, it.path + ".x", x), it.path + ".y", y));
    else s.set(it.path, { x, y });
  };
  const toPos = (cx, cy) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: clamp(((cx - r.left) / r.width) * 100), y: clamp((1 - (cy - r.top) / r.height) * 100) };
  };
  const overMap = (cx, cy) => {
    const r = svgRef.current && svgRef.current.getBoundingClientRect();
    return r && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  };
  const focusDot = (key) => setTimeout(() => {
    const el = svgRef.current && svgRef.current.querySelector('[data-key="' + key + '"]');
    if (el) el.focus();
  }, 30);
  const ariaFor = (it) => `${it.label}, ${xr} ${it.x}%, ${yt} ${it.y}%`;

  /* ---------- static ---------- */
  if (readOnly) {
    return (
      <div className="pmap ro">
        <div className="pm-top">{yt}</div>
        <div className="pm-left">{xl}</div>
        <svg viewBox={`0 0 ${S} ${S}`} className="pm-svg" role="img"
          aria-label={"Perceptual map. " + placed.map(ariaFor).join("; ")}>
          <Frame mid={mid} />
          {arrow && <line x1={px(us.x)} y1={py(us.y)} x2={px(tg.x)} y2={py(tg.y)} className="pm-arrow" markerEnd={`url(#${mid})`} />}
          {placed.map((it) => <Dot key={it.key} it={it} />)}
        </svg>
        <div className="pm-right">{xr}</div>
        <div className="pm-bottom">{yb}</div>
      </div>
    );
  }

  /* ---------- interactive ---------- */
  const onDotKey = (e, it) => {
    const step = e.shiftKey ? 10 : 2;
    let { x, y } = it;
    if (e.key === "ArrowLeft") x -= step;
    else if (e.key === "ArrowRight") x += step;
    else if (e.key === "ArrowUp") y += step;
    else if (e.key === "ArrowDown") y -= step;
    else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setPos(it, null, null);
      setTimeout(() => { const b = tray.current && tray.current.querySelector('[data-key="' + it.key + '"]'); if (b) b.focus(); }, 30);
      return;
    } else return;
    e.preventDefault();
    setPos(it, clamp(x), clamp(y));
  };

  return (
    <div className="pmap-wrap">
      <div className="pmap">
        <div className="pm-top">{yt}</div>
        <div className="pm-left">{xl}</div>
        <svg ref={svgRef} viewBox={`0 0 ${S} ${S}`} className={"pm-svg" + (armed ? " armed" : "")}
          role="group" aria-label={`Perceptual map: ${xl} to ${xr} across, ${yb} to ${yt} up`}
          onClick={(e) => {
            if (!armed || e.target.closest("[data-key]")) return;
            const it = items.find((i) => i.key === armed);
            if (it) { const p = toPos(e.clientX, e.clientY); setPos(it, p.x, p.y); focusDot(it.key); }
            setArmed(null);
          }}>
          <Frame mid={mid} />
          {arrow && <line x1={px(us.x)} y1={py(us.y)} x2={px(tg.x)} y2={py(tg.y)} className="pm-arrow" markerEnd={`url(#${mid})`} />}
          {placed.map((it) => (
            <Dot key={it.key} it={it} interactive
              aria={ariaFor(it)}
              onKeyDown={(e) => onDotKey(e, it)}
              onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); drag.current = it.key; }}
              onPointerMove={(e) => { if (drag.current === it.key) { const p = toPos(e.clientX, e.clientY); setPos(it, p.x, p.y); } }}
              onPointerUp={(e) => { drag.current = null; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (er) {} }}
            />
          ))}
        </svg>
        <div className="pm-right">{xr}</div>
        <div className="pm-bottom">{yb}</div>
      </div>

      <div className="pm-tray" ref={tray}>
        {unplaced.length > 0 && <span className="pm-tray-l">{armed ? "Now click the map to place it" : "Drag onto the map, or click then click the map"}</span>}
        {unplaced.map((it) => (
          <button key={it.key} data-key={it.key} type="button" className={"pm-chip " + it.kind + (armed === it.key ? " armed" : "")}
            aria-pressed={armed === it.key} aria-label={"Place " + it.label + " on the map"}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { key: it.key, sx: e.clientX, sy: e.clientY, moved: false }; }}
            onPointerMove={(e) => { const g = drag.current; if (g && g.key === it.key && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 5) g.moved = true; }}
            onPointerUp={(e) => {
              const g = drag.current; drag.current = null;
              if (!g || g.key !== it.key) return;
              if (g.moved && overMap(e.clientX, e.clientY)) { const p = toPos(e.clientX, e.clientY); setPos(it, p.x, p.y); setArmed(null); focusDot(it.key); }
              else if (!g.moved) setArmed((a) => (a === it.key ? null : it.key));
            }}
            onClick={(e) => { if (e.detail === 0) { setPos(it, 50, 50); setArmed(null); focusDot(it.key); } }}>
            <span className={"pm-sw " + it.kind} aria-hidden="true" />{it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Frame({ mid }) {
  return (
    <>
      <defs>
        <marker id={mid} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--blue)" }} />
        </marker>
      </defs>
      <rect x="0.5" y="0.5" width={S - 1} height={S - 1} className="pm-frame" />
      <line x1={S / 2} y1="0" x2={S / 2} y2={S} className="pm-cross" />
      <line x1="0" y1={S / 2} x2={S} y2={S / 2} className="pm-cross" />
    </>
  );
}

function Dot({ it, interactive, aria, ...handlers }) {
  const cx = px(it.x), cy = py(it.y);
  const right = it.x < 70;
  return (
    <g data-key={it.key} className={"pm-dot " + it.kind} tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined} aria-roledescription={interactive ? "movable marker" : undefined}
      aria-label={interactive ? aria : undefined} {...handlers}>
      {interactive && <circle cx={cx} cy={cy} r={R + 9} className="pm-hit" />}
      <circle cx={cx} cy={cy} r={R} className="pm-c" />
      <circle cx={cx} cy={cy} r={R + 4} className="pm-ring" />
      <text x={right ? cx + R + 5 : cx - R - 5} y={cy + 4} textAnchor={right ? "start" : "end"} className="pm-t">{it.label}</text>
    </g>
  );
}
