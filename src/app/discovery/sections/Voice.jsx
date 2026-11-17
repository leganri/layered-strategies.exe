"use client";
import React from "react";
import { Field, AF, Coach, Scale, StaticScale, Chips, Eyebrow } from "../ui/controls";
import ContextCard from "../ui/ContextCard";
import { useSession } from "../session";
import { sectionById, fieldId } from "../schema";
import { VOICE_DIMS, TONE_WORDS, CHARACTER } from "../content/options";

export default function Voice() {
  const s = useSession();
  const d = s.data;
  const coach = sectionById("08").coach;
  const c = d.character.sliders;
  const charSet = c[0] != null || c[1] != null;

  return (
    <>
      <div className="ctx-grid">
        <ContextCard num="07" label="Character" empty={!charSet} to={["07", "character.sliders"]}
          value={<div className="ctx-scales">{[0, 1].map((i) => <StaticScale key={i} left={CHARACTER[i][0]} right={CHARACTER[i][1]} value={c[i]} />)}</div>} />
        <ContextCard num="07" label="Archetype" value={d.character.archetype.primary || ""} to={["07", "character.archetype.primary"]} />
      </div>

      <Eyebrow hint="Set the resting position; tone bends from here">Voice dimensions</Eyebrow>
      <Coach ask={coach.ask} frame={coach.frame} />
      <div className="scales" id={fieldId("voice.sliders")} onFocusCapture={() => s.noteFocus("voice.sliders")}>
        {VOICE_DIMS.map(([l, r], i) => (<Scale key={i} path={"voice.sliders." + i} left={l} right={r} />))}
      </div>
      <Field path="voice.toneWords" hint={"Maximum six. Selected: " + d.voice.toneWords.length + "/6"}>
        <Chips path="voice.toneWords" options={TONE_WORDS} max={6} />
      </Field>
      <div className="grid2">
        <AF path="voice.say" rows={4} />
        <AF path="voice.neverSay" rows={4} />
      </div>
      <Field path="voice.flex">
        <div className="grid3">
          <AF path="voice.flex.celebrate" rows={2} />
          <AF path="voice.flex.sorry" rows={2} />
          <AF path="voice.flex.sell" rows={2} />
        </div>
      </Field>
    </>
  );
}
