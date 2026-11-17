"use client";
import React from "react";
import { useSession } from "../session";

const LEVELS = [["fact", "Fact"], ["belief", "Belief"], ["assumption", "Assumption"]];

/* Fact · Belief · Assumption. Clicking the selected level clears it. Stored in meta.confidence[path]. */
export default function ConfidenceTag({ path, label }) {
  const s = useSession();
  const cur = s.confidence[path] || null;
  return (
    <span className="ctag" role="group" aria-label={"How sure are we: " + (label || path)}>
      <span className="ctag-l" aria-hidden="true">How sure are we?</span>
      {LEVELS.map(([k, name]) => (
        <button key={k} type="button" className={"ctag-b " + k + (cur === k ? " on" : "")} aria-pressed={cur === k}
          onClick={() => s.setConfidence(path, cur === k ? null : k)}>{name}</button>
      ))}
    </span>
  );
}
