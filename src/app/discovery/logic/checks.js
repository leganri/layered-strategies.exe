/* Advisory consistency checks. Never block navigation or the brief.
   Notch values are 0-8. c = character.sliders, v = voice.sliders. */
import { primarySegment } from "./derive";

export function checks(d) {
  const out = [];
  const c = d.character.sliders;
  const v = d.voice.sliders;
  const set = (x) => x != null;

  // 1. Playful(0)-Serious(8) vs Serious(0)-Funny(8): flip character so both run serious -> funny.
  if (set(c[1]) && set(v[3]) && Math.abs((8 - c[1]) - v[3]) >= 5)
    out.push({ id: "humour", text: "Character and voice disagree on humour.", to: ["08", "voice.sliders"] });

  // 2. Friendly(0)-Authoritative(8) vs Formal(0)-Casual(8).
  if (set(c[0]) && set(v[0]) && Math.abs((8 - c[0]) - v[0]) >= 5)
    out.push({ id: "warmth", text: "Character and voice disagree on warmth.", to: ["08", "voice.sliders"] });

  // 3. Archetype vs Conventional(0)-Rebellious(8).
  const arch = d.character.archetype.primary;
  if (set(c[3]) && ((arch === "Outlaw" && c[3] <= 2) || ((arch === "Ruler" || arch === "Caregiver") && c[3] >= 6)))
    out.push({ id: "rebellion", text: "Archetype and rebellion setting conflict.", to: ["07", "character.sliders"] });

  // 4. RTBs a rival could say.
  d.positioning.rtbs.forEach((r, i) => {
    if (r.rival === true)
      out.push({ id: "rtb" + i, text: `Reason to believe ${i + 1}: a rival could say this. Sharpen it.`, to: ["06", "positioning.rtbs." + i] });
  });

  // 5. Values with no cost.
  d.purpose.values.forEach((val, i) => {
    if (!String(val.cost || "").trim())
      out.push({ id: "val" + i, text: `Value '${val.name}' has no cost - it's untested.`, to: ["05", "purpose.values." + i] });
  });

  // 6. Several segments, none primary.
  const segs = d.audience.segments;
  if (segs.length >= 2 && !segs.some((s) => s.primary))
    out.push({ id: "primary", text: "Mark one segment as primary.", to: ["02", "audience.segments." + segs[0].id + ".name"] });

  // 7. Onlyness 'for' empty while a primary segment exists.
  const ps = primarySegment(d);
  if (ps && segs.some((s) => s.primary) && !String(d.positioning.audience || "").trim()) {
    const nm = ps.name.trim();
    out.push({ id: "only-for", text: nm ? `Onlyness "for" is empty - try "${nm}", your primary segment.` : `Onlyness "for" is empty - try your primary segment.`, to: ["06", "positioning.audience"] });
  }
  return out;
}
