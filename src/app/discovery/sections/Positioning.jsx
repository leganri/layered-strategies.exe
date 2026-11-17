"use client";
import React from "react";
import { Field, AF, Coach, Scale, Input, Warn } from "../ui/controls";
import ContextCard from "../ui/ContextCard";
import Dropdown from "../ui/Dropdown";
import LintNotes from "../ui/LintNotes";
import { useSession } from "../session";
import { sectionById, fieldId } from "../schema";
import { PRICE } from "../content/options";
import { primarySegment, describePos } from "../logic/derive";

const CONNECTORS = ["in", "during", "where", "when", "at"];

const ONLY = [
  ["The only", "category", "category / kind of company"],
  ["that", "difference", "meaningful difference only you offer"],
  ["for", "audience", "specific audience"],
  [null, "context", "market, place, or moment"],
];

export default function Positioning() {
  const s = useSession();
  const d = s.data;
  const P = d.positioning;
  const coach = sectionById("06").coach;
  const seg = primarySegment(d);
  const segText = seg ? [seg.name.trim(), seg.job.trim()].filter(Boolean).join(" — ") : "";
  const target = describePos(d.landscape.map, d.landscape.map.target);
  const identity = seg && seg.identity.trim();

  return (
    <>
      <div className="ctx-grid">
        <ContextCard num="02" label="Insight" value={d.audience.insight} to={["02", "audience.insight"]} />
        <ContextCard num="02" label="Primary segment" value={segText}
          to={["02", seg ? `audience.segments.${seg.id}.${seg.name.trim() ? "job" : "name"}` : "audience.segments." + d.audience.segments[0].id + ".name"]} />
        <ContextCard num="03" label="Enemy" value={d.landscape.enemy} to={["03", "landscape.enemy"]} />
        <ContextCard num="03" label="Open space" value={d.landscape.gap} to={["03", "landscape.gap"]} />
        <ContextCard num="03" label="Us target on the map" value={target} to={["03", "landscape.map"]} />
      </div>

      <Coach ask={coach.ask} example={coach.example} egLabel={coach.egLabel} frame={coach.frame} />
      <div className="only">
        {ONLY.map(([word, key, ph]) => (
          <div className="only-row" key={key} id={fieldId("positioning." + key)} onFocusCapture={() => s.noteFocus("positioning." + key)}>
            {word ? <label className="only-word" htmlFor={"only-" + key}>{word}</label> : (
              <span className="only-word"><Dropdown value={P.connector || "in"} options={CONNECTORS} label="Connecting word" onChange={(v) => s.set("positioning.connector", v)} /></span>
            )}
            <input id={"only-" + key} className="only-inp" value={P[key]} placeholder={ph} onChange={(e) => s.set("positioning." + key, e.target.value)} />
          </div>
        ))}
        <LintNotes texts={ONLY.map(([, k]) => P[k])} />
      </div>

      <Field path="positioning.price">
        <div className="scales single"><Scale path="positioning.price" left={PRICE[0]} right={PRICE[1]} /></div>
      </Field>

      <div className="vladder" aria-label="Value ladder">
        <div className="box-title">Value ladder</div>
        <AF path="positioning.ladder.functional" rows={2} ph="What it does for them" />
        <div className="sowhat" aria-hidden="true">so what? {"↓"}</div>
        <AF path="positioning.ladder.emotional" rows={2} ph="How it makes them feel" />
        <div className="sowhat" aria-hidden="true">so what? {"↓"}</div>
        <AF path="positioning.ladder.expressive" rows={2}
          ph="Choosing us says I'm the kind of person who..."
          after={identity && !P.ladder.expressive.trim() ? (
            <p className="ghost-hint">From your primary segment: {"“" + identity + "”"}{" "}
              <button type="button" className="link" onClick={() => s.set("positioning.ladder.expressive", identity)}>Use this</button></p>
          ) : null} />
      </div>

      <Field path="positioning.rtbs">
        {P.rtbs.map((r, i) => {
          const p = "positioning.rtbs." + i;
          return (
            <div key={i} className={"rtb" + (r.rival === true ? " is-rival" : "")} id={fieldId(p)} onFocusCapture={() => s.noteFocus("positioning.rtbs")}>
              <div className="rtb-head">
                <span className="rtb-n mono">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <Input value={r.text} onChange={(v) => s.set(p + ".text", v)} placeholder={"Reason " + (i + 1)} aria-label={"Reason to believe " + (i + 1)} />
              <div className="rival" role="group" aria-label={"Could a rival say reason " + (i + 1) + "?"}>
                <span className="rival-q">Could a rival say this?</span>
                {[[true, "Yes"], [false, "No"]].map(([val, lab]) => (
                  <button key={lab} type="button" className={"mini" + (r.rival === val ? (val ? " on-amber" : " on2") : "")} aria-pressed={r.rival === val}
                    onClick={() => s.set(p + ".rival", r.rival === val ? null : val)}>{lab}</button>
                ))}
              </div>
              {r.rival === true && <Warn>Sharpen until only you can say it.</Warn>}
            </div>
          );
        })}
      </Field>
      <AF path="positioning.proof" />
      <AF path="positioning.promise" rows={2} />
    </>
  );
}
