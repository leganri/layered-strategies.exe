"use client";
import React from "react";
import { Field, TF, AF } from "../ui/controls";
import ListInput from "../ui/ListInput";
import { useSession } from "../session";
import { newSegment } from "../schema";
import { CEP_STEMS } from "../content/options";

export default function Audience() {
  const s = useSession();
  const segs = s.data.audience.segments;
  const setSegs = (v) => s.set("audience.segments", v);
  const setPrimary = (id) => setSegs(segs.map((x) => ({ ...x, primary: x.id === id })));

  return (
    <>
      {segs.map((sg, i) => {
        const p = "audience.segments." + sg.id;
        const num = String(i + 1).padStart(2, "0");
        return (
          <div className={"repeat" + (sg.primary ? " primary" : "")} key={sg.id}>
            <div className="repeat-head">
              <span className="eyebrow">Segment {num}</span>
              <label className="radio">
                <input type="radio" name="primary-segment" checked={!!sg.primary} onChange={() => setPrimary(sg.id)} />
                <span>Primary segment</span>
              </label>
              {segs.length > 1 && (
                <button type="button" className="ghost" aria-label={"Remove segment " + num} onClick={() => setSegs(segs.filter((x) => x.id !== sg.id))}>Remove</button>
              )}
            </div>
            <div className="grid2">
              <TF path={p + ".name"} ph="e.g. The scene-builder" />
              <TF path={p + ".desc"} ph="What's their world like day to day?" />
            </div>
            <AF path={p + ".job"} rows={2} ph="When ___, I want to ___, so I can ___." />
            <div className="forces">
              <div className="forces-l toward">Toward you</div>
              <div className="grid2">
                <AF path={p + ".push"} rows={2} />
                <AF path={p + ".pull"} rows={2} />
              </div>
              <div className="forces-l back">Holding them back</div>
              <div className="grid2">
                <AF path={p + ".anxiety"} rows={2} />
                <AF path={p + ".habit"} rows={2} />
              </div>
            </div>
            <AF path={p + ".identity"} rows={2} ph="I use this, therefore I am the kind of person who..." />
          </div>
        );
      })}
      <button type="button" className="add" onClick={() => setSegs([...segs, newSegment()])}>+ Add segment</button>
      <Field path="audience.ceps"><ListInput path="audience.ceps" stems={CEP_STEMS} /></Field>
      <AF path="audience.insight" rows={2} />
      <AF path="audience.notFor" rows={2} />
    </>
  );
}
