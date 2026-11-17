"use client";
import React from "react";
import { Field, AF, Scale, StaticScale } from "../ui/controls";
import ContextCard from "../ui/ContextCard";
import { useSession } from "../session";
import { fieldId } from "../schema";
import { TERRITORIES, VISUAL_DIALS, TOUCHPOINTS, CHARACTER } from "../content/options";
import { join } from "../logic/derive";

export default function Visual() {
  const s = useSession();
  const d = s.data;
  const V = d.visual;
  const T = V.territories;
  const c = d.character.sliders;

  /* neutral -> in -> out -> neutral (skip "in" when 3 are already in) */
  const cycle = (name) => {
    const isIn = T.in.includes(name), isOut = T.out.includes(name);
    let next;
    if (isIn) next = { in: T.in.filter((x) => x !== name), out: [...T.out, name] };
    else if (isOut) next = { in: T.in, out: T.out.filter((x) => x !== name) };
    else if (T.in.length < 3) next = { in: [...T.in, name], out: T.out };
    else next = { in: T.in, out: [...T.out, name] };
    s.set("visual.territories", next);
  };

  const tp = V.touchpoints;
  const toggleTp = (o) => s.set("visual.touchpoints", tp.includes(o) ? tp.filter((x) => x !== o) : [...tp, o]);

  return (
    <>
      <div className="ctx-grid">
        <ContextCard num="07" label="Character" empty={!c.some((v) => v != null)} to={["07", "character.sliders"]}
          value={<div className="ctx-scales">{CHARACTER.map(([l, r], i) => (c[i] != null ? <StaticScale key={i} left={l} right={r} value={c[i]} /> : null))}</div>} />
        <ContextCard num="09" label="Essence" value={d.idea.essence} to={["09", "idea.essence"]} />
        <ContextCard num="10" label="Top touchpoints" value={join(tp.slice(0, 3), " · ")} to={["10", "visual.touchpoints"]} />
      </div>

      <Field path="visual.territories" hint={`Lean in: ${T.in.length}/3 · Wince: ${T.out.length}`}>
        <p className="nudge">Click once to lean in, twice to wince, three times to clear.</p>
        <div className="cards">
          {TERRITORIES.map(([name, desc]) => {
            const st = T.in.includes(name) ? "in" : T.out.includes(name) ? "out" : null;
            return (
              <button key={name} type="button" className={"card tbtn" + (st === "in" ? " p" : st === "out" ? " out" : "")}
                aria-label={`${name}: ${st === "in" ? "lean in" : st === "out" ? "wince" : "no reaction"}. Click to change.`}
                onClick={() => cycle(name)}>
                {st && <span className={"ttag " + st}>{st === "in" ? "IN" : "NO"}</span>}
                <div className="card-name">{name}</div>
                <div className="card-desc">{desc}</div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field path="visual.dials">
        <div className="scales">
          {VISUAL_DIALS.map(([l, r], i) => (<Scale key={i} path={"visual.dials." + i} left={l} right={r} />))}
        </div>
      </Field>

      <AF path="visual.avoid" />
      <AF path="visual.references" />
      <AF path="visual.mandatories" />

      <Field path="visual.touchpoints">
        <div className="chips" role="group" aria-labelledby={fieldId("visual.touchpoints") + "-label"}>
          {TOUCHPOINTS.map((o) => {
            const r = tp.indexOf(o);
            return (
              <button key={o} type="button" className={"chip" + (r >= 0 ? " on" : "")} aria-pressed={r >= 0}
                aria-label={r >= 0 ? `${o}, rank ${r + 1}` : o} onClick={() => toggleTp(o)}>
                {r >= 0 && <span className={"rank" + (r < 3 ? " top" : "")}>{r + 1}</span>}{o}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}
