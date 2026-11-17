"use client";
import React from "react";
import { useSession } from "../session";
import { lint } from "../logic/lint";

/* Amber lint notes under a field. Pass one text or several (deduped). */
export default function LintNotes({ text, texts }) {
  const s = useSession();
  const all = (texts || [text]).flatMap((t) => lint(t, s.data));
  const notes = [...new Set(all)];
  if (!notes.length) return null;
  return (
    <div className="lint" role="note" aria-live="polite">
      {notes.map((n) => <p key={n} className="warn">{n}</p>)}
    </div>
  );
}
