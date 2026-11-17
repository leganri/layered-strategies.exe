"use client";
import React, { useState } from "react";
import { Field, AF, TF, Box, Warn } from "../ui/controls";
import { useSession } from "../session";
import { VALUES } from "../content/options";

export default function Purpose() {
  const s = useSession();
  const [own, setOwn] = useState("");
  const vals = s.data.purpose.values;
  const names = vals.map((v) => v.name);
  const setVals = (v) => s.set("purpose.values", v);
  const custom = names.filter((n) => !VALUES.includes(n));
  const addOwn = () => {
    const n = own.trim().replace(/s+/g, " ");
    if (!n || vals.length >= 5) return;
    if (!names.some((x) => x.toLowerCase() === n.toLowerCase())) setVals([...vals, { name: n, cost: "" }]);
    setOwn("");
  };
  const toggle = (name) => {
    if (names.includes(name)) setVals(vals.filter((v) => v.name !== name));
    else if (vals.length < 5) setVals([...vals, { name, cost: "" }]);
  };

  return (
    <>
      <Box title="The why">
        <AF path="purpose.why" rows={2} ph="We exist because we believe..." />
        <AF path="purpose.ladder" ph="Why? ... Why does that matter? ... and again ... and again ..." />
      </Box>
      <Field path="purpose.values" hint={"Maximum five. A value you would not lose money to keep is not a value. Selected: " + vals.length + "/5"}>
        <div className="chips" role="group" aria-labelledby="f-purpose-values-label">
          {[...VALUES, ...custom].map((o) => {
            const on = names.includes(o);
            const full = !on && vals.length >= 5;
            return (
              <button key={o} type="button" className={"chip" + (on ? " on" : "")} aria-pressed={on} aria-disabled={full || undefined}
                title={full ? "Maximum 5" : undefined} onClick={() => toggle(o)}>{o}</button>
            );
          })}
        </div>
        <div className="custom-val">
          <input className="inp" value={own} placeholder="Or name your own value" aria-label="Add your own value" disabled={vals.length >= 5}
            onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); addOwn(); } }} />
          <button type="button" className="mini" onClick={addOwn} disabled={!own.trim() || vals.length >= 5}>Add</button>
        </div>
        {vals.length >= 4 && <p className="nudge">Three is stronger than five.</p>}
        {vals.length > 0 && (
          <div className="costs">
            {vals.map((v, i) => (
              <div className="cost-row" key={v.name} id={"f-purpose-values-" + i}>
                <span className="cost-name">{v.name}</span>
                <div className="cost-in">
                  <label className="cost-l" htmlFor={"cost-" + i}>What it costs us</label>
                  <input id={"cost-" + i} className="inp" value={v.cost} placeholder="We'd turn down / give up ___ to keep this."
                    onChange={(e) => setVals(vals.map((x) => (x.name === v.name ? { ...x, cost: e.target.value } : x)))} />
                  {!v.cost.trim() && <Warn>Untested - a value with no cost is a wall poster.</Warn>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Field>
      <TF path="purpose.antiValue" ph="e.g. Hype for its own sake" />
    </>
  );
}
