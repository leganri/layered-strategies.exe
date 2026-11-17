"use client";
import React from "react";
import { useSession } from "../session";
import { assumptions } from "../logic/derive";

/* Assumptions to validate (11 Scope). */
export function AssumptionsRegister() {
  const s = useSession();
  const list = assumptions(s.data);
  return (
    <section className="field" aria-labelledby="reg-title" id="f-assumptions">
      <div className="eyebrow-row">
        <span className="eyebrow" id="reg-title">Assumptions to validate</span>
        <span className="hint">Everything tagged Assumption, plus every distinctive asset</span>
      </div>
      {list.length === 0 ? (
        <p className="reg-empty">Nothing flagged as an assumption.</p>
      ) : (
        <div className="register">
          {list.map((a) => (
            <div className="reg-i" key={a.path}>
              <span className="reg-n">{a.section}</span>
              <div>
                <div className="reg-l">{a.label}</div>
                {a.value && <div className="reg-v">{a.value}</div>}
                {a.note && <div className="reg-note">{a.note}</div>}
              </div>
              <button type="button" className="ctx-go" onClick={() => s.goTo(a.section, a.path)} aria-label={"Edit " + a.label}>Edit {"→"}</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
