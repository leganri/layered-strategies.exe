"use client";
import React from "react";
import { Field, AF, Input, Coach, Segmented } from "../ui/controls";
import AssetGrid from "../ui/AssetGrid";
import { useSession } from "../session";
import { newAsset, sectionById, fieldId } from "../schema";
import { ASSET_TYPES } from "../content/options";
import { quadrant } from "../logic/derive";

export default function Perception() {
  const s = useSession();
  const d = s.data.perception;
  const coach = sectionById("04").coach;
  const assets = d.assets;
  const setAssets = (v) => s.set("perception.assets", v);
  const upd = (id, k, v) => s.set(`perception.assets.${id}.${k}`, v);

  return (
    <>
      <div className="gapgrid">
        <Field path="perception.now">
          {d.now.map((w, i) => (<Input key={i} path={"perception.now." + i} placeholder={"Word " + (i + 1)} aria-label={"Today, word " + (i + 1)} />))}
        </Field>
        <div className="gap-arrow" aria-hidden="true">{"→"}</div>
        <Field path="perception.future">
          {d.future.map((w, i) => (<Input key={i} path={"perception.future." + i} placeholder={"Word " + (i + 1)} aria-label={"Target, word " + (i + 1)} />))}
        </Field>
      </div>
      <Coach ask={coach.ask} example={coach.example} egLabel={coach.egLabel} frame={coach.frame} />
      <AF path="perception.misread" rows={2} />
      <AF path="perception.feelings" />

      <Field path="perception.assets">
        <div className="dba">
          <div className="dba-rows">
            {assets.map((a, i) => {
              const q = quadrant(a.fame, a.unique);
              const n = i + 1;
              return (
                <div className="dba-row" key={a.id} id={fieldId(`perception.assets.${a.id}.name`)}>
                  <div className="dba-top">
                    <input className="inp" value={a.name} placeholder="e.g. Bee mark" aria-label={"Asset " + n + " name"}
                      onChange={(e) => upd(a.id, "name", e.target.value)} onFocus={() => s.noteFocus("perception.assets")} />
                    {assets.length > 1 && (
                      <button type="button" className="ghost" aria-label={"Remove asset " + n} onClick={() => setAssets(assets.filter((x) => x.id !== a.id))}>Remove</button>
                    )}
                  </div>
                  <div className="chips small" role="group" aria-label={"Asset " + n + " type"}>
                    {ASSET_TYPES.map((t) => (
                      <button key={t} type="button" className={"chip" + (a.type === t ? " on" : "")} aria-pressed={a.type === t}
                        onClick={() => upd(a.id, "type", a.type === t ? null : t)}>{t}</button>
                    ))}
                  </div>
                  <div className="dba-scores">
                    <span className="dba-k">Fame</span>
                    <Segmented label={"Asset " + n + " fame"} value={a.fame} onChange={(v) => upd(a.id, "fame", v)} />
                    <span className="dba-k">Unique</span>
                    <Segmented label={"Asset " + n + " uniqueness"} value={a.unique} onChange={(v) => upd(a.id, "unique", v)} />
                    <span className="dba-q" aria-live="polite">{q || "—"}</span>
                  </div>
                </div>
              );
            })}
            <button type="button" className="add" onClick={() => setAssets([...assets, newAsset()])}>+ Add asset</button>
          </div>
          <div className="dba-grid"><AssetGrid assets={assets} /></div>
        </div>
      </Field>
    </>
  );
}
