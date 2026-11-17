"use client";
import React from "react";
import { Field, TF, AF, Area, Input, Chips } from "../ui/controls";
import PerceptualMap from "../ui/PerceptualMap";
import { useSession } from "../session";
import { newCompetitor } from "../schema";
import { THREATS } from "../content/options";

export default function Landscape() {
  const s = useSession();
  const comps = s.data.landscape.competitors;
  const setComps = (v) => s.set("landscape.competitors", v);

  return (
    <>
      {comps.map((c, i) => {
        const p = "landscape.competitors." + c.id;
        const num = String(i + 1).padStart(2, "0");
        return (
          <div className="repeat" key={c.id}>
            <div className="repeat-head">
              <span className="eyebrow">Competitor {num}</span>
              {comps.length > 1 && (
                <button type="button" className="ghost" aria-label={"Remove competitor " + num} onClick={() => setComps(comps.filter((x) => x.id !== c.id))}>Remove</button>
              )}
            </div>
            <div className="grid2">
              <TF path={p + ".name"} ph="Who else gets the look?" />
              <Field path={p + ".threat"}><Chips path={p + ".threat"} options={THREATS} multi={false} /></Field>
            </div>
            <div className="grid2">
              <AF path={p + ".strength"} rows={2} />
              <AF path={p + ".weakness"} rows={2} />
            </div>
          </div>
        );
      })}
      <button type="button" className="add" onClick={() => setComps([...comps, newCompetitor()])}>+ Add competitor</button>

      <Field path="landscape.map">
        <div className="axes">
          <div className="axis-row">
            <span className="axis-k">Across</span>
            <Input path="landscape.map.x.0" placeholder="Intimidating" aria-label="Horizontal axis, left end" />
            <span className="axis-arrow" aria-hidden="true">{"↔"}</span>
            <Input path="landscape.map.x.1" placeholder="Welcoming" aria-label="Horizontal axis, right end" />
          </div>
          <div className="axis-row">
            <span className="axis-k">Up</span>
            <Input path="landscape.map.y.0" placeholder="Commodity" aria-label="Vertical axis, bottom end" />
            <span className="axis-arrow" aria-hidden="true">{"↕"}</span>
            <Input path="landscape.map.y.1" placeholder="Specialist" aria-label="Vertical axis, top end" />
          </div>
        </div>
        <PerceptualMap />
      </Field>

      <AF path="landscape.enemy" ph="We exist to push back against..." />
      <AF path="landscape.gap" />
      <Field path="landscape.conventions">
        <div className="grid2">
          <Field path="landscape.conventions.keep"><Area path="landscape.conventions.keep" placeholder="Codes we keep so people still recognise the category" /></Field>
          <Field path="landscape.conventions.break"><Area path="landscape.conventions.break" placeholder="Codes we deliberately break to stand out" /></Field>
        </div>
      </Field>
    </>
  );
}
