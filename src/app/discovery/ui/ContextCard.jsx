"use client";
import React from "react";
import { useSession } from "../session";
import { isFilled } from "../schema";

/* Read-only echo of an earlier answer, with a jump link back to the source field. */
export default function ContextCard({ num, label, value, to, empty }) {
  const s = useSession();
  const isEmpty = empty != null ? empty : !isFilled(value);
  const [sec, path] = to || [num, null];
  return (
    <div className={"ctx" + (isEmpty ? " empty" : "")}>
      <div className="ctx-head">
        <span className="ctx-l">{num} {"·"} {label}</span>
        <button type="button" className="ctx-go" onClick={() => s.goTo(sec, path)}
          aria-label={(isEmpty ? "Answer " : "Edit ") + label + " on page " + sec}>{isEmpty ? "Answer →" : "Edit →"}</button>
      </div>
      <div className="ctx-v">{isEmpty ? <em>Not answered yet</em> : value}</div>
    </div>
  );
}
