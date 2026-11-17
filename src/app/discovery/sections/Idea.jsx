"use client";
import React, { Fragment } from "react";
import { Field, Input, Area } from "../ui/controls";
import ContextCard from "../ui/ContextCard";
import { useSession } from "../session";
import { onlynessText, hasOnlyness } from "../logic/derive";

export default function Idea() {
  const s = useSession();
  const d = s.data;
  const chain = [
    { num: "01", label: "Strategic question", value: d.business.scq.question, to: ["01", "business.scq.question"] },
    { num: "02", label: "Insight", value: d.audience.insight, to: ["02", "audience.insight"] },
    { num: "03", label: "Enemy", value: d.landscape.enemy, to: ["03", "landscape.enemy"] },
    { num: "06", label: "Onlyness", value: hasOnlyness(d) ? onlynessText(d) : "", to: ["06", "positioning.category"] },
    { num: "06", label: "Emotional benefit", value: d.positioning.ladder.emotional, to: ["06", "positioning.ladder.emotional"] },
    { num: "06", label: "Promise", value: d.positioning.promise, to: ["06", "positioning.promise"] },
  ];
  const checks = d.idea.checks;

  return (
    <>
      <div className="chain" aria-label="The chain">
        <div className="box-title">The chain</div>
        {chain.map((c, i) => (
          <Fragment key={i}>
            <ContextCard num={c.num} label={c.label} value={c.value} to={c.to} />
            {i < chain.length - 1 && (
              <div className="follows">
                <span className="follows-line" aria-hidden="true" />
                <label className="follows-l">
                  <input type="checkbox" checked={!!checks[i]} onChange={(e) => s.set("idea.checks." + i, e.target.checked)}
                    aria-label={`${chain[i + 1].label} follows from ${c.label}`} />
                  <span>Follows?</span>
                </label>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <div className="wheel">
        <div className="wheel-rung essence">
          <span className="wheel-n" aria-hidden="true">{"★"}</span>
          <Field path="idea.answer"><Area path="idea.answer" rows={2} placeholder={d.business.scq.question.trim() ? "Answering: " + d.business.scq.question.trim() : "Our answer to the strategic question"} /></Field>
        </div>
        <div className="wheel-rung essence">
          <span className="wheel-n" aria-hidden="true">{"★"}</span>
          <Field path="idea.trueline"><Input path="idea.trueline" placeholder="The one true thing we can say" /></Field>
        </div>
        <div className="wheel-rung essence">
          <span className="wheel-n" aria-hidden="true">{"★"}</span>
          <Field path="idea.essence"><Input path="idea.essence" placeholder="e.g. Fearless craft" /></Field>
        </div>
      </div>
    </>
  );
}
