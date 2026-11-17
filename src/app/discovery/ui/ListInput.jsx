"use client";
import React, { useContext, useRef, useState } from "react";
import { useSession, FieldContext } from "../session";
import { newCep } from "../schema";

/* Add-to-list with stars (max 3), reorder and remove. Items: { id, text, star }. */
export default function ListInput({ path, stems = [], maxStars = 3, placeholder = "Add a moment and press Enter" }) {
  const s = useSession();
  const fc = useContext(FieldContext);
  const list = s.get(path) || [];
  const [draft, setDraft] = useState("");
  const inRef = useRef(null);
  const starred = list.filter((x) => x.star).length;

  const write = (next) => s.set(path, next);
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    write([...list, newCep(t)]);
    setDraft("");
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const c = list.slice();
    [c[i], c[j]] = [c[j], c[i]];
    write(c);
  };
  const upd = (id, patch) => write(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div className="list">
      <div className="list-add">
        <input ref={inRef} className="inp" value={draft} placeholder={placeholder} aria-labelledby={fc && fc.labelId}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); add(); } }} />
        <button type="button" className="bar-btn" onClick={add}>Add</button>
      </div>
      {stems.length > 0 && (
        <div className="stems" aria-label="Prompt starters">
          {stems.map((st) => (
            <button key={st} type="button" className="stem" onClick={() => {
              setDraft(st.replace("…", " "));
              requestAnimationFrame(() => { if (inRef.current) { inRef.current.focus(); const n = inRef.current.value.length; inRef.current.setSelectionRange(n, n); } });
            }}>{st}</button>
          ))}
        </div>
      )}
      {list.length > 0 && (
        <ol className="list-items">
          {list.map((it, i) => {
            const lock = !it.star && starred >= maxStars;
            return (
              <li key={it.id} className={"list-row" + (it.star ? " star" : "")}>
                <button type="button" className="li-star" aria-pressed={it.star} disabled={lock}
                  title={lock ? "Top " + maxStars + " only" : it.star ? "Unstar" : "Star as top " + maxStars}
                  aria-label={(it.star ? "Unstar: " : "Star: ") + it.text + (lock ? " (top " + maxStars + " only)" : "")}
                  onClick={() => upd(it.id, { star: !it.star })}>{it.star ? "★" : "☆"}</button>
                <input className="li-text" value={it.text} aria-label={"Entry point " + (i + 1)} onChange={(e) => upd(it.id, { text: e.target.value })} />
                <button type="button" className="li-btn" aria-label={"Move up: " + it.text} disabled={i === 0} onClick={() => move(i, -1)}>{"↑"}</button>
                <button type="button" className="li-btn" aria-label={"Move down: " + it.text} disabled={i === list.length - 1} onClick={() => move(i, 1)}>{"↓"}</button>
                <button type="button" className="li-btn" aria-label={"Remove: " + it.text} onClick={() => write(list.filter((x) => x.id !== it.id))}>{"×"}</button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
