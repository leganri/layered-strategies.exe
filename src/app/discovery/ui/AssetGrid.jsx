"use client";
import React from "react";
import { quadrant } from "../logic/derive";

/* Romaniuk distinctive-asset grid. x = uniqueness 1-5, y = fame 1-5, split at 3. */
const W = 320, H = 300, L = 26, T = 8, PW = W - L - 8, PH = H - T - 26;
const vx = (u) => L + ((u - 0.5) / 5) * PW;
const vy = (f) => T + PH - ((f - 0.5) / 5) * PH;
const splitX = vx(2.5), splitY = vy(2.5);

export default function AssetGrid({ assets }) {
  const pts = (assets || []).filter((a) => a.name && a.name.trim() && a.fame != null && a.unique != null);
  const seen = {};
  const plotted = pts.map((a) => {
    const k = a.fame + ":" + a.unique;
    const n = (seen[k] = (seen[k] || 0) + 1) - 1;
    return { ...a, cx: vx(a.unique), cy: vy(a.fame), off: n * 12 };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="agrid" role="img"
      aria-label={"Distinctive asset grid. " + (plotted.length ? plotted.map((a) => `${a.name}: fame ${a.fame}, uniqueness ${a.unique}, ${quadrant(a.fame, a.unique)}`).join("; ") : "No assets scored yet.")}>
      <rect x={L} y={T} width={PW} height={PH} className="ag-frame" />
      <line x1={splitX} y1={T} x2={splitX} y2={T + PH} className="ag-split" />
      <line x1={L} y1={splitY} x2={L + PW} y2={splitY} className="ag-split" />
      <text x={L + 6} y={T + 14} className="ag-q">Avoid using alone</text>
      <text x={L + PW - 6} y={T + 14} className="ag-q" textAnchor="end">Use or lose</text>
      <text x={L + 6} y={T + PH - 6} className="ag-q">Ignore or test</text>
      <text x={L + PW - 6} y={T + PH - 6} className="ag-q" textAnchor="end">Invest</text>
      <text x={L + PW / 2} y={H - 6} className="ag-ax" textAnchor="middle">Uniqueness {"→"}</text>
      <text x={12} y={T + PH / 2} className="ag-ax" textAnchor="middle" transform={`rotate(-90 12 ${T + PH / 2})`}>Fame {"→"}</text>
      {plotted.map((a) => {
        const right = a.unique <= 3;
        return (
          <g key={a.id}>
            <rect x={a.cx - 4} y={a.cy - 4} width="8" height="8" className="ag-dot" />
            <text x={right ? a.cx + 8 : a.cx - 8} y={a.cy + 4 + a.off} textAnchor={right ? "start" : "end"} className="ag-t">{a.name.trim()}</text>
          </g>
        );
      })}
    </svg>
  );
}
