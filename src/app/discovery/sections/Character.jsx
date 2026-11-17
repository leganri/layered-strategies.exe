"use client";
import React from "react";
import { Field, AF, Coach, Scale, CardSelect, Warn } from "../ui/controls";
import { useSession } from "../session";
import { sectionById, fieldId } from "../schema";
import { CHARACTER, ARCHETYPES } from "../content/options";
import { FIELDS } from "../content/tips";

export const ARCH_PANEL = "panel:archetype";

export default function Character() {
  const s = useSession();
  const C = s.data.character;
  const coach = sectionById("07").coach;
  const set = C.sliders.filter((v) => v != null);
  const middle = set.length >= 4 && set.filter((v) => v >= 3 && v <= 5).length >= 4;
  const open = s.isTipOpen(ARCH_PANEL);
  const ac = FIELDS["character.archetype.primary"];

  return (
    <>
      <Coach ask={coach.ask} frame={coach.frame} />
      <div className="scales" id={fieldId("character.sliders")} onFocusCapture={() => s.noteFocus("character.sliders")}>
        {CHARACTER.map(([l, r], i) => (<Scale key={i} path={"character.sliders." + i} left={l} right={r} />))}
      </div>
      {middle && <Warn>Most traits sit in the middle. Middle is safe, and safe is forgettable.</Warn>}

      <div className={"panel" + (open ? " open" : "")} id={fieldId("character.archetype.primary")}>
        <button type="button" className="panel-toggle" aria-expanded={open} aria-controls="arch-panel" onClick={() => s.toggleTip(ARCH_PANEL)}>
          <span aria-hidden="true">{open ? "−" : "+"}</span> Archetype shorthand (optional)
          {!open && C.archetype.primary && <span className="panel-sum">{C.archetype.primary}{C.archetype.secondary ? " + " + C.archetype.secondary : ""}</span>}
        </button>
        {open && (
          <div className="panel-body" id="arch-panel">
            <p className="nudge">A facilitation shorthand, not a science. Use it if it helps the room agree.</p>
            <Coach ask={ac.ask} frame={ac.frame} />
            <CardSelect options={ARCHETYPES} value={C.archetype.primary} onChange={(v) => s.set("character.archetype.primary", v)}
              secondary={C.archetype.secondary} onSecondary={(v) => s.set("character.archetype.secondary", v)} />
            <AF path="character.archetype.notes" rows={2} />
          </div>
        )}
      </div>

      <AF path="character.tension" rows={2} ph="e.g. Institutional rigor x rave energy" />
    </>
  );
}
