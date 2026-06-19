import React, { useState, useRef } from "react";

/* ============================================================
   LAYERED — BRAND DISCOVERY INSTRUMENT  ·  v2
   A facilitator-led workshop tool. Swiss / editorial system.
   Every question carries a client-lens helper: the framework
   it descends from + a plain-language way to ask it out loud,
   because clients answer plain questions, not branding jargon.

   Frameworks woven in:
   · Sinek — Golden Circle (Why/How/What) + 5 Whys laddering
   · Neumeier — Onlyness, Trueline, "pick a fight" (Zag)
   · Jung / Mark & Pearson — 12 archetypes
   · Bates Brand Wheel — attributes->benefits->values->essence
   · Wolff Olins — Butterfly (purpose), Quadrant (proposition)
   · Aaker — brand personality dimensions
   ============================================================ */

const BLUE = "#1B29F5";
const INK = "#0B0B0C";
const RULE = "#E4E4E1";
const MID = "#8C8C88";

const SECTIONS = [
  { id: "00", title: "Setup", note: "Set the room. Confirm who owns the final yes before anything else - the wrong answer here sinks projects.", frame: "Engagement governance" },
  { id: "01", title: "Business", note: "Money first. A brand that ignores the business model is decoration. Get the commercial truth before the romance.", frame: "Wolff Olins - brand lives where commerce, culture & tech overlap" },
  { id: "02", title: "Audience", note: "Push past age and income. People buy to build their identity - find what they want to feel and be seen as.", frame: "Neumeier - customers buy meaning, not products" },
  { id: "03", title: "Landscape", note: "Name the enemy. Differentiation only exists relative to something. Sometimes the enemy is the old way, not a rival.", frame: "Neumeier - step right up and pick a fight" },
  { id: "04", title: "Perception Gap", note: "The distance between how they are seen today and how they want to be seen - that delta is the whole brief.", frame: "Wolff Olins - the gap is the project" },
  { id: "05", title: "Personality", note: "Read each pair aloud. If the brand were a person walking into a room, how would it behave? The middle is a decision too.", frame: "Aaker - brand personality dimensions" },
  { id: "06", title: "Archetype", note: "Brands that feel human follow a recognizable character. Pick one. The secondary flavors the primary; it never competes.", frame: "Jung / Mark & Pearson - 12 archetypes" },
  { id: "07", title: "Purpose & Values", note: "Start with why. If you stopped making money tomorrow, why would this still deserve to exist? Ladder down with why five times.", frame: "Sinek - Golden Circle + 5 Whys" },
  { id: "08", title: "Positioning", note: "One sentence the competition cannot honestly say. If a rival could claim it too, it is not positioning yet.", frame: "Neumeier - Onlyness & Trueline" },
  { id: "09", title: "Voice", note: "Voice is what you always sound like; tone bends by moment. Capture the forbidden words - what you would never say defines you.", frame: "Verbal identity - voice vs tone" },
  { id: "10", title: "Brand Wheel", note: "Climb from the tangible to the soul: what it has, then what that does for me, what it believes, who it is, its one essence.", frame: "Bates Brand Wheel" },
  { id: "11", title: "Visual Direction", note: "Collect allergies, not just appetites. What a client hates is far more reliable data than what they say they like.", frame: "Art direction intake" },
  { id: "12", title: "Scope & Risks", note: "Scope agreed out loud in the room survives. Scope assumed over email becomes the fight that kills the relationship.", frame: "Engagement scoping" },
];

/* 12 orthogonal axes. Each dial measures something the others do not,
   so a brand's profile is information, not noise. See chat for the
   reasoning behind every cut and keep. */
const PERSONALITY = [
  ["Friendly", "Authoritative"],   // warmth / manner
  ["Playful", "Serious"],          // levity / mood
  ["Youthful", "Mature"],          // age & energy of the persona
  ["Classic", "Contemporary"],     // aesthetic era
  ["Conventional", "Rebellious"],  // relationship to the rules
  ["Soft", "Strong"],              // force & weight (degendered)
  ["Simple", "Complex"],           // structural density
  ["Understated", "Expressive"],   // volume / emotional loudness
  ["Casual", "Refined"],           // formality / polish
  ["Accessible", "Exclusive"],     // who's invited
  ["Economical", "Premium"],       // price & value cues
  ["Corporate", "Crafted"],        // made by a system vs by a person
];

const VOICE_DIMS = [
  ["Formal", "Casual"], ["Matter-of-fact", "Enthusiastic"],
  ["Respectful", "Irreverent"], ["Serious", "Funny"],
];

const ARCHETYPES = [
  ["Innocent", "Optimism, simplicity, trust - Dove, Coca-Cola"],
  ["Sage", "Truth, expertise, clarity - Google, BBC"],
  ["Explorer", "Freedom, discovery, the frontier - Patagonia, Jeep"],
  ["Outlaw", "Rebellion, disruption, rule-breaking - Harley, Liquid Death"],
  ["Magician", "Transformation, vision, wonder - Apple, Disney"],
  ["Hero", "Mastery, courage, proof in action - Nike, FedEx"],
  ["Lover", "Intimacy, beauty, devotion - Chanel, Aesop"],
  ["Jester", "Play, irreverence, the moment - Old Spice, Mailchimp"],
  ["Everyperson", "Belonging, honesty, no pretense - IKEA, Target"],
  ["Caregiver", "Service, protection, generosity - Johnson's, Volvo"],
  ["Ruler", "Control, authority, the standard - Rolex, Mercedes"],
  ["Creator", "Imagination, craft, self-expression - Lego, Adobe"],
];

const VALUES = [
  "Craft", "Honesty", "Courage", "Precision", "Curiosity", "Generosity",
  "Independence", "Optimism", "Rigor", "Playfulness", "Sustainability", "Community",
  "Simplicity", "Innovation", "Heritage", "Transparency", "Ambition", "Care",
  "Speed", "Discipline", "Imagination", "Inclusivity", "Integrity", "Excellence",
];

const TONE_WORDS = [
  "Confident", "Direct", "Warm", "Witty", "Poetic", "Technical",
  "Calm", "Bold", "Dry", "Generous", "Sharp", "Understated",
  "Charged", "Reassuring", "Provocative", "Precise", "Human", "Cinematic",
];

const TERRITORIES = [
  ["Swiss / International", "Grid, restraint, typographic order"],
  ["Brutalist", "Raw, structural, anti-polish"],
  ["Editorial / Print", "Magazine logic, serifs, columns"],
  ["Organic / Natural", "Texture, imperfection, earth"],
  ["Tech-minimal", "Precision, interface-native, cool"],
  ["Retro-future", "Period optimism bent forward"],
  ["Quiet luxury", "Whisper, material, negative space"],
  ["Maximalist", "Density, collision, more is more"],
  ["Craft / Analog", "Hand, ink, physical process"],
  ["Pop / Vernacular", "Street, commerce, found language"],
  ["Corporate-modern", "Systematic, scalable, assured"],
  ["Avant-garde", "Experimental, uncomfortable, new"],
];

const ENGAGEMENTS = ["Full identity", "Rebrand / refresh", "Strategy only", "Naming", "Campaign", "Packaging", "Digital product", "Spatial"];
const MODELS = ["B2B", "B2C", "B2B2C", "DTC", "Marketplace", "SaaS", "Service", "Physical product", "Membership"];
const STAGES = ["Pre-launch", "Early (0-2y)", "Growth", "Established", "Legacy / turnaround"];
const BUDGETS = ["Under $10k", "$10-25k", "$25-50k", "$50-100k", "$100k+"];
const THREATS = ["Low", "Medium", "High"];
const DELIVERABLES = [
  "Brand strategy document", "Naming", "Logo & marks", "Type system", "Color system",
  "Art direction", "Photography direction", "Illustration system", "Motion principles",
  "Voice & messaging", "Brand guidelines", "Website design", "Social templates",
  "Packaging", "Pitch deck", "Launch campaign",
];
const TOUCHPOINTS = ["Website", "Social", "Print", "Packaging", "Spatial", "Merch", "Events", "Product UI", "Email", "OOH"];

const initData = () => ({
  setup: { client: "", project: "", date: new Date().toISOString().slice(0, 10), facilitator: "", sector: "", engagement: [], decision: "", attendees: "" },
  business: { oneLiner: "", model: [], stage: null, revenue: "", ambition: "", metrics: "" },
  audience: { segments: [{ name: "", desc: "", needs: "", frictions: "", identity: "" }], insight: "", notFor: "" },
  landscape: { competitors: [{ name: "", threat: null, strength: "", weakness: "" }], enemy: "", gap: "", conventions: "" },
  perception: { now: ["", "", ""], future: ["", "", ""], misread: "", feelings: "" },
  personality: { sliders: Array(PERSONALITY.length).fill(null), tension: "" },
  archetype: { primary: null, secondary: null, notes: "" },
  values: { why: "", how: "", what: "", ladder: "", picked: [], antiValue: "" },
  positioning: { category: "", difference: "", audience: "", context: "", trueline: "", props: ["", "", ""], proof: "", promise: "" },
  voice: { sliders: Array(VOICE_DIMS.length).fill(null), toneWords: [], say: "", neverSay: "" },
  wheel: { attributes: "", benefits: "", emotional: "", values: "", personality: "", essence: "" },
  visual: { territories: [], avoid: "", references: "", mandatories: "", touchpoints: [] },
  scope: { deliverables: [], timeline: "", budget: null, risks: "", notes: "" },
});

/* ---------- atoms ---------- */

const Eyebrow = ({ children, hint }) => (
  <div className="eyebrow-row">
    <span className="eyebrow">{children}</span>
    {hint && <span className="hint">{hint}</span>}
  </div>
);

const Input = ({ value, onChange, placeholder, mono }) => (
  <input className={"inp" + (mono ? " mono" : "")} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} />
);

const Area = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea className="area" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} />
);

function Field({ label, hint, frame, ask, example, children }) {
  const [open, setOpen] = useState(false);
  const hasCoach = ask || frame || example;
  return (
    <div className="field">
      <Eyebrow hint={hint}>{label}</Eyebrow>
      {hasCoach && (
        <div className="coach">
          <button type="button" className={"coach-toggle" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
            <span className="coach-ic" aria-hidden="true">{open ? "\u2212" : "i"}</span>
            {open ? "Hide tip" : (example ? "Tip & example" : "Tip")}
          </button>
          {open && (
            <div className="coach-body">
              {ask && <p className="coach-ask">{ask}</p>}
              {example && (
                <div className="coach-eg">
                  <span className="coach-eg-l">A strong answer sounds like</span>
                  <p className="coach-eg-t">{"\u201C" + example + "\u201D"}</p>
                </div>
              )}
              {frame && <span className="coach-frame">{frame}</span>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Chips({ options, value, onChange, multi = true, max }) {
  const isSel = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => {
    if (multi) {
      if (value.includes(o)) onChange(value.filter((x) => x !== o));
      else if (!max || value.length < max) onChange([...value, o]);
    } else onChange(value === o ? null : o);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} type="button" className={"chip" + (isSel(o) ? " on" : "")} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

function CardSelect({ options, value, onChange, secondary, onSecondary }) {
  return (
    <div className="cards">
      {options.map(([name, desc]) => {
        const isP = value === name;
        const isS = secondary === name;
        return (
          <div key={name} className={"card" + (isP ? " p" : "") + (isS ? " s" : "")}>
            <div className="card-name">{name}</div>
            <div className="card-desc">{desc}</div>
            <div className="card-actions">
              <button type="button" className={"mini" + (isP ? " on" : "")} onClick={() => { onChange(isP ? null : name); if (isS && !isP) onSecondary(null); }}>Primary</button>
              <button type="button" className={"mini" + (isS ? " on2" : "")} onClick={() => { onSecondary(isS ? null : name); }} disabled={isP}>Secondary</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Scale({ left, right, value, onChange }) {
  return (
    <div className="scale">
      <div className="scale-l">{left}</div>
      <div className="scaletrack">
        {Array.from({ length: 9 }).map((_, i) => (
          <button key={i} type="button" className="notch" aria-label={left + " to " + right + ", position " + (i + 1) + " of 9"} aria-pressed={value === i} onClick={() => onChange(value === i ? null : i)}>
            <span className={"tick" + (i === 4 ? " mid" : "")} />
            {value === i && <span className="mark" />}
          </button>
        ))}
      </div>
      <div className="scale-r">{right}</div>
    </div>
  );
}

const StaticScale = ({ left, right, value }) => (
  <div className="bscale">
    <div className="bscale-l">{left}</div>
    <div className="bscale-track">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="bcell">
          <span className={"btick" + (i === 4 ? " mid" : "")} />
          {value === i && <span className="bmark" />}
        </span>
      ))}
    </div>
    <div className="bscale-r">{right}</div>
  </div>
);

/* ---------- section bodies ---------- */

function SectionHeader({ sec }) {
  return (
    <header className="sec-head">
      <div className="sec-top">
        <div className="sec-num">{sec.id}</div>
        <div className="sec-frame">{sec.frame}</div>
      </div>
      <h1 className="sec-title">{sec.title}</h1>
      <p className="sec-note"><span className="note-tag">Facilitator</span>{sec.note}</p>
    </header>
  );
}

function Setup({ d, set }) {
  return (
    <>
      <div className="grid2">
        <Field label="Client"><Input value={d.client} onChange={(v) => set("client", v)} placeholder="Company or organization" /></Field>
        <Field label="Project name"><Input value={d.project} onChange={(v) => set("project", v)} placeholder="Working title" /></Field>
        <Field label="Date"><Input value={d.date} onChange={(v) => set("date", v)} mono /></Field>
        <Field label="Facilitator"><Input value={d.facilitator} onChange={(v) => set("facilitator", v)} placeholder="Who runs the room" /></Field>
        <Field label="Sector"><Input value={d.sector} onChange={(v) => set("sector", v)} placeholder="e.g. Hospitality, Web3 events, DTC food" /></Field>
        <Field label="In the room"><Input value={d.attendees} onChange={(v) => set("attendees", v)} placeholder="Names and roles" /></Field>
      </div>
      <Field label="Engagement type" hint="Select all that apply">
        <Chips options={ENGAGEMENTS} value={d.engagement} onChange={(v) => set("engagement", v)} />
      </Field>
      <Field
        label="Final decision-maker"
        hint="One name"
        ask="When the final work is presented, whose opinion actually settles it? If three people have to agree, name that now - it changes how the whole project should run."
        example="Maya Chen, our founder, has the final say. The board advises but doesn't vote on creative decisions."
        frame="Governance - the silent project-killer">
        <Input value={d.decision} onChange={(v) => set("decision", v)} placeholder="Who signs off" />
      </Field>
    </>
  );
}

function Business({ d, set }) {
  return (
    <>
      <Field
        label="What the business does"
        hint="One sentence, no adjectives"
        ask="Explain it the way you would to a smart 12-year-old, or to someone at a dinner party after two drinks. No jargon - what do you actually make, sell, or run, and for whom?"
        example="We roast coffee in small batches and ship it within 48 hours of roasting, straight to people who brew at home."
        frame="Golden Circle - the WHAT">
        <Area rows={2} value={d.oneLiner} onChange={(v) => set("oneLiner", v)} placeholder="We make / sell / run ___ for ___." />
      </Field>
      <Field label="Business model"><Chips options={MODELS} value={d.model} onChange={(v) => set("model", v)} /></Field>
      <Field label="Stage"><Chips options={STAGES} value={d.stage} onChange={(v) => set("stage", v)} multi={false} /></Field>
      <Field
        label="How money actually comes in"
        hint="Revenue streams, margins, who pays whom"
        ask="Follow a single dollar. Who hands it over, for what, and how often? Where is the fat margin, and where are you basically breaking even?"
        example="About 70% from a monthly subscription, which is our best margin. 20% one-off online orders. 10% wholesale to three local cafes, where we barely break even but gain visibility."
        frame="Commercial truth before brand romance">
        <Area value={d.revenue} onChange={(v) => set("revenue", v)} placeholder="Primary and secondary revenue, pricing logic" />
      </Field>
      <Field
        label="Three-year ambition"
        hint="The destination this work serves"
        ask="Fast-forward three years. You are toasting because this worked. What is true now that was not true before - a number, a reputation, a room you are now in?"
        example="In three years we're the coffee a serious home brewer names first: 10,000 active subscribers, a flagship cafe in our city, known nationally without losing the small-roaster soul."
        frame="Wolff Olins - brand as growth engine">
        <Area value={d.ambition} onChange={(v) => set("ambition", v)} />
      </Field>
      <Field
        label="What the brand must move"
        hint="2-3 metrics this identity is accountable to"
        ask="A brand is not jewelry - it has a job. Which 2 or 3 numbers should visibly move because this was done well? If nothing would move, why spend the money?"
        example="Subscription sign-ups, subscriber retention past the third month, and average order value."
        frame="Accountability - ties identity to business">
        <Area rows={2} value={d.metrics} onChange={(v) => set("metrics", v)} placeholder="e.g. ticket conversion, average order value, inbound quality" />
      </Field>
    </>
  );
}

function Audience({ d, set }) {
  const upd = (i, k, v) => set("segments", d.segments.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <>
      {d.segments.map((s, i) => (
        <div className="repeat" key={i}>
          <div className="repeat-head">
            <span className="eyebrow">Segment {String(i + 1).padStart(2, "0")}</span>
            {d.segments.length > 1 && (
              <button type="button" className="ghost" onClick={() => set("segments", d.segments.filter((_, j) => j !== i))}>Remove</button>
            )}
          </div>
          <div className="grid2">
            <Field label="Give them a nickname" hint="A person, not a demographic"
              ask="If this kind of customer walked in, what would you call them behind their back - warmly? Give them a nickname: the scene-builder, the anxious founder, the weekend dad."
              example="The weekend ritualist"
              frame="Persona - makes the abstract human">
              <Input value={s.name} onChange={(v) => upd(i, "name", v)} placeholder="e.g. The scene-builder" />
            </Field>
            <Field label="Who they are" hint="Life context, not just age"
              ask="Describe their world, not their census data. What is a normal day like, and where does your product fit into it?"
              example="30s to 40s, makes coffee at home a small daily ceremony, owns a grinder, follows a couple of coffee accounts. Not a pro, but quietly proud of caring.">
              <Input value={s.desc} onChange={(v) => upd(i, "desc", v)} placeholder="What's their world like day to day?" />
            </Field>
          </div>
          <Field label="What they actually want" hint="The functional AND the emotional"
            ask="Two layers. On the surface, what task are they trying to finish? Underneath, what do they want to feel - safe, admired, ahead of everyone else?"
            example="Functionally: consistently fresh, well-sourced beans without having to do the research. Emotionally: to feel like they have taste and are doing this properly."
            frame="Jobs-to-be-Done - functional + emotional job">
            <Area rows={2} value={s.needs} onChange={(v) => upd(i, "needs", v)} />
          </Field>
          <Field label="What's in their way" hint="Frictions, fears, the thing they'd never admit"
            ask="What makes them hesitate, distrust, or put it off? Include the slightly embarrassing reason they would never say out loud - that is usually the real one."
            example="They worry good coffee is pretentious, or that they'll order the wrong thing and look clueless. They've been burned before by stale supermarket beans labelled 'specialty'."
            frame="Barrier mapping">
            <Area rows={2} value={s.frictions} onChange={(v) => upd(i, "frictions", v)} />
          </Field>
          <Field label="What buying you says about them" hint="The identity badge"
            ask="People choose brands to tell a story about themselves. Finish their sentence: I use this, therefore I am the kind of person who ___."
            example="I use this, therefore I am the kind of person who has quietly good taste and cares about the small things."
            frame="Neumeier - buying meaning to build identity">
            <Area rows={2} value={s.identity} onChange={(v) => upd(i, "identity", v)} placeholder="I use this, therefore I am the kind of person who..." />
          </Field>
        </div>
      ))}
      <button type="button" className="add" onClick={() => set("segments", [...d.segments, { name: "", desc: "", needs: "", frictions: "", identity: "" }])}>+ Add segment</button>
      <Field label="The sharpest audience insight" hint="One human truth to build on"
        ask="What is the one true, slightly uncomfortable thing about these people that almost nobody in your category is brave enough to say out loud?"
        example="Most people who love coffee are secretly anxious they're doing it wrong. They want permission to enjoy it, not another lecture."
        frame="Insight - the spark of great work">
        <Area rows={2} value={d.insight} onChange={(v) => set("insight", v)} />
      </Field>
      <Field label="Who this is NOT for" hint="Exclusion creates attraction"
        ask="Who do you happily wave goodbye to? A brand that tries to please everyone becomes wallpaper. Naming who it repels is how it earns love from the right people."
        example="Not for the grab-and-go crowd chasing the cheapest caffeine, and not for competition baristas who'll only ever trust their own sourcing."
        frame="Neumeier - a zag needs an anti-audience">
        <Area rows={2} value={d.notFor} onChange={(v) => set("notFor", v)} />
      </Field>
    </>
  );
}

function Landscape({ d, set }) {
  const upd = (i, k, v) => set("competitors", d.competitors.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <>
      {d.competitors.map((c, i) => (
        <div className="repeat" key={i}>
          <div className="repeat-head">
            <span className="eyebrow">Competitor {String(i + 1).padStart(2, "0")}</span>
            {d.competitors.length > 1 && (
              <button type="button" className="ghost" onClick={() => set("competitors", d.competitors.filter((_, j) => j !== i))}>Remove</button>
            )}
          </div>
          <div className="grid2">
            <Field label="Name"><Input value={c.name} onChange={(v) => upd(i, "name", v)} placeholder="Who else gets the look?" /></Field>
            <Field label="Threat level"><Chips options={THREATS} value={c.threat} onChange={(v) => upd(i, "threat", v)} multi={false} /></Field>
          </div>
          <div className="grid2">
            <Field label="What they do well" hint="Be generous - know the enemy"
              ask="If a customer picked them over you, what would they honestly be right about? What do they nail?"
              example="They're everywhere and cheap. Convenience is genuinely on their side, and their app is frictionless.">
              <Area rows={2} value={c.strength} onChange={(v) => upd(i, "strength", v)} />
            </Field>
            <Field label="Where they're weak" hint="The opening"
              ask="Where do they leave customers cold, bored, or annoyed? That gap is where you get to live."
              example="The coffee is stale and the brand has no soul - it feels like a gas station. Nobody feels anything about them.">
              <Area rows={2} value={c.weakness} onChange={(v) => upd(i, "weakness", v)} />
            </Field>
          </div>
        </div>
      ))}
      <button type="button" className="add" onClick={() => set("competitors", [...d.competitors, { name: "", threat: null, strength: "", weakness: "" }])}>+ Add competitor</button>
      <Field label="Pick a fight" hint="Name the enemy - it can be an idea"
        ask="Every strong brand is against something. What are you here to push back on? It does not have to be a company - it can be a tired habit, a rip-off, or a boring norm in your world."
        example="We exist to push back against intimidating coffee culture - the snobbery that makes normal people feel stupid for asking a simple question."
        frame="Neumeier - step right up and pick a fight">
        <Area value={d.enemy} onChange={(v) => set("enemy", v)} placeholder="We exist to push back against..." />
      </Field>
      <Field label="The open space" hint="The position no one owns"
        ask="Picture every rival standing in a crowded room. Where is the empty corner nobody is standing in - and why has nobody claimed it yet?"
        example="Everyone's either cheap-and-soulless or elite-and-preachy. Nobody owns 'seriously good coffee that's actually welcoming.' It's open because roasters confuse warmth with dumbing things down."
        frame="Neumeier - head for uncluttered space">
        <Area value={d.gap} onChange={(v) => set("gap", v)} />
      </Field>
      <Field label="Category codes: keep vs break" hint="Recognition vs distinction"
        ask="Every industry has unwritten rules - certain colors, words, looks. Which do you keep so people still recognize what you are, and which do you deliberately break so you stand out?"
        example="Keep: visible roast dates and origin info, because they signal credibility. Break: the moody, dark, all-lowercase 'craft' packaging everyone uses - we'll go bright and plain-spoken."
        frame="Category convention audit">
        <Area value={d.conventions} onChange={(v) => set("conventions", v)} placeholder="Keep: ...   Break: ..." />
      </Field>
    </>
  );
}

function Perception({ d, set }) {
  const updW = (key, i, v) => { const arr = [...d[key]]; arr[i] = v; set(key, arr); };
  return (
    <>
      <div className="gapgrid">
        <div>
          <Eyebrow hint="Honest - include the critics' words">Three words people use today</Eyebrow>
          {d.now.map((w, i) => (<Input key={i} value={w} onChange={(v) => updW("now", i, v)} placeholder={"Word " + (i + 1)} />))}
        </div>
        <div className="gap-arrow" aria-hidden="true">{"\u2192"}</div>
        <div>
          <Eyebrow hint="Two years out, after the work">Three words we want them to use</Eyebrow>
          {d.future.map((w, i) => (<Input key={i} value={w} onChange={(v) => updW("future", i, v)} placeholder={"Word " + (i + 1)} />))}
        </div>
      </div>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">Imagine overhearing a customer describe you to a friend at a bar - the words they really use, not the ones on your website. Now imagine the words you would kill to hear two years from now. The space between those two lists is exactly what we are about to build.</p>
          <div className="coach-eg"><span className="coach-eg-l">A strong pair looks like</span><p className="coach-eg-t">Today: {"\u201C"}cheap, fine, forgettable.{"\u201D"} Target: {"\u201C"}fresh, welcoming, the-good-stuff.{"\u201D"}</p></div>
          <span className="coach-frame">Wolff Olins - the gap is the project</span>
        </div>
      </div>
      <Field label="The most common misread" hint="What people get wrong about you"
        ask="What do people assume about you that is flat-out wrong - too expensive, too niche, not for them? Fixing a misunderstanding is often faster than building fame."
        example="People assume we're expensive and fussy. We're actually mid-priced, and the whole point is that we're easy to deal with."
        frame="Perception correction">
        <Area rows={2} value={d.misread} onChange={(v) => set("misread", v)} />
      </Field>
      <Field label="How it feels from the inside" hint="The makers' own gut feeling"
        ask="Forget customers for a second. When you look at your current brand, what do you feel - proud, a little embarrassed, indifferent? Say it plainly."
        example="Honestly, a little embarrassed. The current logo looks like a free template and doesn't match how good the coffee actually is."
        frame="Internal audit">
        <Area value={d.feelings} onChange={(v) => set("feelings", v)} />
      </Field>
    </>
  );
}

function Personality({ d, set }) {
  const updS = (i, v) => { const s = [...d.sliders]; s[i] = v; set("sliders", s); };
  return (
    <>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">If the brand walked into a party as a person, how would it act? For each pair, slide toward the side that feels more true. Resist landing everything in the middle - middle is safe, and safe is forgettable. Pick a side.</p>
          <span className="coach-frame">Aaker - brand personality dimensions</span>
        </div>
      </div>
      <div className="scales">
        {PERSONALITY.map(([l, r], i) => (<Scale key={i} left={l} right={r} value={d.sliders[i]} onChange={(v) => updS(i, v)} />))}
      </div>
      <Field label="The productive tension" hint="Two traits that seem to clash"
        ask="Look at where you landed. Which two traits seem to contradict each other? That tension - say, rigorous AND playful - is usually the most interesting thing about you. Most brands are too scared to hold both."
        example="Expert but unpretentious. We know more than almost anyone, and we make you feel smart instead of small."
        frame="Tension - the signature of distinctive brands">
        <Area rows={2} value={d.tension} onChange={(v) => set("tension", v)} placeholder="e.g. Institutional rigor x rave energy" />
      </Field>
    </>
  );
}

function Archetype({ d, set }) {
  return (
    <>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">Stories everywhere reuse the same dozen characters - the Hero, the Rebel, the Caregiver. Brands that feel alive do too. Which character is this brand at its core? Pick one primary. Then one secondary that adds a twist - but it can never fight the lead.</p>
          <span className="coach-frame">Jung / Mark & Pearson - 12 archetypes</span>
        </div>
      </div>
      <CardSelect options={ARCHETYPES} value={d.primary} onChange={(v) => set("primary", v)} secondary={d.secondary} onSecondary={(v) => set("secondary", v)} />
      <Field label="Why this character fits" hint="Earn it from the real story"
        ask="What in your actual story - how you started, what your founder believes, how you treat people - makes this character true rather than just aspirational? A brand has to earn its archetype."
        example="We're the Everyperson with a touch of Sage. Our founder learned everything the hard way and refuses to gatekeep. The welcome is real, not a marketing pose."
        frame="Authenticity check">
        <Area rows={2} value={d.notes} onChange={(v) => set("notes", v)} />
      </Field>
    </>
  );
}

function Values({ d, set }) {
  return (
    <>
      <div className="golden">
        <Field label="WHY - your purpose" hint="The center of the Golden Circle"
          ask="If you made enough money to be comfortable forever and never had to work again, why would you still want this to exist in the world? That stubborn reason is your why."
          example="We believe a daily ritual done well makes an ordinary day better - and that the joy of it shouldn't require a secret handshake."
          frame="Sinek - start with why">
          <Area rows={2} value={d.why} onChange={(v) => set("why", v)} placeholder="We exist because we believe..." />
        </Field>
        <Field label="HOW - your approach" hint="What makes your way different"
          ask="How do you do it in a way others do not? Your special method, your way of working, the thing people notice is different about how you operate."
          example="By sourcing obsessively, roasting in tiny batches, and explaining everything in plain language with zero snobbery."
          frame="Sinek - the how">
          <Area rows={2} value={d.how} onChange={(v) => set("how", v)} placeholder="We do this by..." />
        </Field>
        <Field label="WHAT - the proof" hint="The tangible result"
          ask="And what does that actually produce - the products, services, experiences someone can point at? This is the easy one; everyone can answer it."
          example="So we sell fresh single-origin and blend coffees by subscription and online, with tasting notes a normal person can actually understand."
          frame="Sinek - the what">
          <Area rows={2} value={d.what} onChange={(v) => set("what", v)} placeholder="So we make / offer..." />
        </Field>
      </div>
      <Field label="The five whys" hint="Ladder down to the root"
        ask="Take your first answer and ask why that matters. Then ask why THAT matters. Five times. By the fourth or fifth why you usually hit bedrock - the emotional truth the whole brand can stand on."
        example="Why sell coffee? To make mornings better. Why does that matter? Small good rituals anchor people. Why anchor them? Life feels chaotic. Why care? We needed that anchor ourselves. So we're really selling a moment of calm and competence, not beans."
        frame="5 Whys - root-cause laddering">
        <Area value={d.ladder} onChange={(v) => set("ladder", v)} placeholder="Why? ... Why does that matter? ... and again ... and again ..." />
      </Field>
      <Field label="Values" hint={"Maximum five. A value you would not lose money to keep is not a value. Selected: " + d.picked.length + "/5"}
        ask="Choose only the ones you would honor even when it costs you - turning down the wrong client, walking from the wrong deal. If it is just a nice word for a wall, leave it."
        example="For this brand: Generosity, Honesty, Craft. Each one we'd defend even when it's expensive."
        frame="Values - tested by sacrifice">
        <Chips options={VALUES} value={d.picked} onChange={(v) => set("picked", v)} max={5} />
      </Field>
      <Field label="The anti-value" hint="What you refuse"
        ask="Name one thing your whole industry celebrates that quietly makes you cringe - the thing you promise never to do. What you reject sharpens what you are."
        example="Gatekeeping. We refuse to make anyone feel they don't belong."
        frame="Anti-positioning">
        <Input value={d.antiValue} onChange={(v) => set("antiValue", v)} placeholder="e.g. Hype for its own sake" />
      </Field>
    </>
  );
}

function Positioning({ d, set }) {
  const updP = (i, v) => { const p = [...d.props]; p[i] = v; set("props", p); };
  return (
    <>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">We are going to fill one sentence together. The trick is the word ONLY - it has to stay true. If a competitor could say the exact same line, we have not found it yet, and we keep pushing until only you can claim it.</p>
          <div className="coach-eg"><span className="coach-eg-l">A strong result reads like</span><p className="coach-eg-t">The only specialty coffee roaster that makes great coffee feel welcoming instead of intimidating, for home brewers who care but aren't experts, in a category that mistakes snobbery for quality.</p></div>
          <span className="coach-frame">Marty Neumeier - the Onlyness test (Zag)</span>
        </div>
      </div>
      <div className="only">
        <div className="only-row"><span className="only-word">The only</span><input className="only-inp" value={d.category} onChange={(e) => set("category", e.target.value)} placeholder="category / kind of company" /></div>
        <div className="only-row"><span className="only-word">that</span><input className="only-inp" value={d.difference} onChange={(e) => set("difference", e.target.value)} placeholder="meaningful difference only you offer" /></div>
        <div className="only-row"><span className="only-word">for</span><input className="only-inp" value={d.audience} onChange={(e) => set("audience", e.target.value)} placeholder="specific audience" /></div>
        <div className="only-row"><span className="only-word">in / during</span><input className="only-inp" value={d.context} onChange={(e) => set("context", e.target.value)} placeholder="market, place, or moment" /></div>
      </div>
      <Field label="Trueline" hint="The one true internal sentence"
        ask="Now boil it to a single line you could say to your own team - the one true thing about you that rivals cannot or will not claim. Not an ad slogan; the truth a slogan would later dress up."
        example="The serious roaster that treats you like a friend, not a student."
        frame="Neumeier - the trueline (internal)">
        <Input value={d.trueline} onChange={(v) => set("trueline", v)} placeholder="The one true thing we can say" />
      </Field>
      <Field label="Three reasons to believe" hint="Claims rivals can't copy"
        ask="Give three reasons a customer should buy your promise - and for each, ask: could a competitor say this too? If yes, sharpen it until it is yours alone."
        example="1: Roasted to order, never more than 48 hours old. 2: Tasting notes written like a human, not a sommelier. 3: A no-wrong-questions promise - real people answer in plain English."
        frame="Wolff Olins Quadrant - proposition">
        {d.props.map((p, i) => (<Input key={i} value={p} onChange={(v) => updP(i, v)} placeholder={"Reason " + (i + 1)} />))}
      </Field>
      <Field label="Proof points" hint="The receipts"
        ask="Talk is cheap - what is the evidence? Numbers, names, credentials, a track record. What makes the claims believable to a skeptic?"
        example="Every roast date posted publicly. Founder personally answers DMs. 4.9 stars across 2,300 reviews, 68% subscriber retention past six months."
        frame="Reasons to believe">
        <Area value={d.proof} onChange={(v) => set("proof", v)} />
      </Field>
      <Field label="Brand promise" hint="What every touchpoint must deliver"
        ask="Finish this: every time someone touches our brand, they should walk away feeling ___. That feeling is the promise you are on the hook to keep, everywhere, every time."
        example="Every time you touch us, you walk away feeling more capable and more welcome - never talked down to."
        frame="Brand promise">
        <Area rows={2} value={d.promise} onChange={(v) => set("promise", v)} />
      </Field>
    </>
  );
}

function Voice({ d, set }) {
  const updS = (i, v) => { const s = [...d.sliders]; s[i] = v; set("sliders", s); };
  return (
    <>
      <Eyebrow hint="Set the resting position; tone bends from here">Voice dimensions</Eyebrow>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">Voice is your personality in words - it stays constant. Tone is the outfit it wears for the occasion. Set where your voice naturally rests on each dial; tone can flex later for a celebration versus an apology.</p>
          <span className="coach-frame">Nielsen Norman - voice vs tone</span>
        </div>
      </div>
      <div className="scales">
        {VOICE_DIMS.map(([l, r], i) => (<Scale key={i} left={l} right={r} value={d.sliders[i]} onChange={(v) => updS(i, v)} />))}
      </div>
      <Field label="Tone words" hint={"Maximum six. Selected: " + d.toneWords.length + "/6"}
        ask="If a stranger read one paragraph you wrote, which words should they use to describe how it sounded? Pick the few that feel unmistakably you."
        example="For this brand: Warm, Direct, Confident, Generous.">
        <Chips options={TONE_WORDS} value={d.toneWords} onChange={(v) => set("toneWords", v)} max={6} />
      </Field>
      <div className="grid2">
        <Field label="We say" hint="Words that belong to us"
          ask="What words, phrases, or ways of speaking feel like home? The vocabulary a loyal customer would recognize as yours."
          example="'Here's the simple version.' 'No wrong answers.' 'Try this.' Plain, warm, confident - we explain, we never lecture.">
          <Area rows={4} value={d.say} onChange={(v) => set("say", v)} />
        </Field>
        <Field label="We never say" hint="The forbidden list defines you"
          ask="Just as important - what words make you cringe? The industry cliches, the buzzwords, the competitor language you refuse to touch. Banning words is how a voice gets its edges."
          example="'Notes of bergamot and stone fruit' with no translation. 'Artisanal.' 'Curated.' 'For true connoisseurs.' Anything that makes someone feel shut out."
          frame="Forbidden language - sharpens voice">
          <Area rows={4} value={d.neverSay} onChange={(v) => set("neverSay", v)} />
        </Field>
      </div>
    </>
  );
}

function Wheel({ d, set }) {
  return (
    <>
      <div className="coach standalone">
        <div className="coach-body open">
          <p className="coach-ask">We are going to climb a ladder from head to heart. Bottom rung: the plain facts. Each rung up, we ask SO WHAT? - until we reach the single idea at the top that is the soul of the brand. Answer in order; do not skip rungs.</p>
          <span className="coach-frame">Bates Brand Wheel - attributes to essence</span>
        </div>
      </div>
      <div className="wheel">
        <div className="wheel-rung"><span className="wheel-n">1</span>
          <Field label="Attributes" hint="The tangible facts"
            ask="What does it literally have or do? Features, materials, ingredients - things you could photograph or list on a spec sheet."
            example="Roasted-to-order beans, 48-hour freshness, plain-language tasting notes, a flexible subscription.">
            <Input value={d.attributes} onChange={(v) => set("attributes", v)} placeholder="What it is / has" />
          </Field>
        </div>
        <div className="wheel-rung"><span className="wheel-n">2</span>
          <Field label="Functional benefits" hint="So what does that DO for me?"
            ask="Take those facts and ask 'so what?' What practical good does each one do for the customer? Faster, cheaper, easier, safer?"
            example="Always-fresh coffee with zero research or guesswork, and you actually understand what you're drinking.">
            <Input value={d.benefits} onChange={(v) => set("benefits", v)} placeholder="What it does for them" />
          </Field>
        </div>
        <div className="wheel-rung"><span className="wheel-n">3</span>
          <Field label="Emotional benefits" hint="So how does that make me FEEL?"
            ask="Push up another rung. Because of that practical benefit, how does the customer feel? Relieved, confident, proud, looked-after?"
            example="You feel competent and calm - like you've got this part of life handled, and quietly do it well.">
            <Input value={d.emotional} onChange={(v) => set("emotional", v)} placeholder="How it makes them feel" />
          </Field>
        </div>
        <div className="wheel-rung"><span className="wheel-n">4</span>
          <Field label="Brand values" hint="What it believes"
            ask="What does a brand that delivers all of that clearly believe in? The principles underneath the feeling."
            example="Generosity with knowledge, craft without snobbery, honesty about sourcing.">
            <Input value={d.values} onChange={(v) => set("values", v)} placeholder="What it stands for" />
          </Field>
        </div>
        <div className="wheel-rung"><span className="wheel-n">5</span>
          <Field label="Personality" hint="Who it is"
            ask="If all of that were a person, describe them in a few words. The character a customer would recognize."
            example="A knowledgeable friend who's thrilled you asked, and never makes you feel dumb.">
            <Input value={d.personality} onChange={(v) => set("personality", v)} placeholder="Who it is as a person" />
          </Field>
        </div>
        <div className="wheel-rung essence"><span className="wheel-n">{"\u2605"}</span>
          <Field label="Essence" hint="The soul - 2-3 words"
            ask="Top of the ladder. If you had to tattoo the whole brand into two or three words - the unchanging soul of it - what are they? This is the hardest and most important line of the day."
            example="Welcoming mastery."
            frame="Brand essence - the irreducible core">
            <Input value={d.essence} onChange={(v) => set("essence", v)} placeholder="e.g. Fearless craft" />
          </Field>
        </div>
      </div>
    </>
  );
}

function Visual({ d, set }) {
  return (
    <>
      <Field label="Aesthetic territories" hint={"Maximum three. Selected: " + d.territories.length + "/3"}
        ask="Don't overthink the names. Which of these worlds makes you lean in, and which makes you wince? We want the gut reaction, not the expert answer.">
        <div className="cards">
          {TERRITORIES.map(([name, desc]) => {
            const on = d.territories.includes(name);
            return (
              <button key={name} type="button" className={"card tbtn" + (on ? " p" : "")}
                onClick={() => { if (on) set("territories", d.territories.filter((x) => x !== name)); else if (d.territories.length < 3) set("territories", [...d.territories, name]); }}>
                <div className="card-name">{name}</div>
                <div className="card-desc">{desc}</div>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Allergies" hint="What makes you recoil - be specific"
        ask="Show me a brand, a color, a style that makes you go 'absolutely not.' Hating something is the clearest signal you'll give all day - be specific and be honest."
        example="The dark, moody, all-lowercase 'craft' look everyone uses. Skulls, gritty kraft paper, anything that whispers 'you wouldn't understand.'"
        frame="Negative space - hate is reliable data">
        <Area value={d.avoid} onChange={(v) => set("avoid", v)} />
      </Field>
      <Field label="Admiration" hint="Brands you wish you were - any category"
        ask="Which brands - in your world or totally outside it - make you a little jealous? Not to copy, but to understand the quality bar you're quietly measuring against."
        example="Aesop for restraint, Mailchimp for warmth-with-wit, Oatly for plain-spoken bravery.">
        <Area value={d.references} onChange={(v) => set("references", v)} />
      </Field>
      <Field label="Mandatories & constraints" hint="The non-negotiables"
        ask="What must we keep or work around? A logo that can't change, a legal mark, a color you're stuck with, accessibility needs, formats it has to live in."
        example="Keep the name and the bee mark - the founder's grandmother kept bees. Must work as a 38mm bag label and on an Instagram grid."
        frame="Constraint capture">
        <Area value={d.mandatories} onChange={(v) => set("mandatories", v)} />
      </Field>
      <Field label="Priority touchpoints" hint="Where it matters most"
        ask="Where will people actually meet this brand most often? That's where we spend our best effort first.">
        <Chips options={TOUCHPOINTS} value={d.touchpoints} onChange={(v) => set("touchpoints", v)} />
      </Field>
    </>
  );
}

function Scope({ d, set }) {
  return (
    <>
      <Field label="Deliverables" hint="Agreed in the room, out loud"
        ask="Let's say plainly what you walk away with, so nobody is surprised later. Tap everything in scope - and notice what is NOT lit up.">
        <Chips options={DELIVERABLES} value={d.deliverables} onChange={(v) => set("deliverables", v)} />
      </Field>
      <div className="grid2">
        <Field label="Timeline"><Input value={d.timeline} onChange={(v) => set("timeline", v)} placeholder="Key dates, hard deadlines" /></Field>
        <Field label="Budget range"><Chips options={BUDGETS} value={d.budget} onChange={(v) => set("budget", v)} multi={false} /></Field>
      </div>
      <Field label="Risks & red flags" hint="Name them now, not later"
        ask="What could quietly derail this - a skeptical board member, a founder who changes their mind, a relative with strong opinions? Naming the landmines today is how we avoid stepping on them."
        example="The founder loves the current logo her cousin made - emotional attachment is the real risk. Also a silent co-founder who 'hates blue' and only shows up at the final review."
        frame="Risk surfacing - protects the relationship">
        <Area value={d.risks} onChange={(v) => set("risks", v)} />
      </Field>
      <Field label="Anything else said in the room" hint="The throwaway line is often the brief"
        ask="Catch the side comments, the jokes, the half-sentences. The thing someone muttered and waved off is often the most honest thing said all day.">
        <Area value={d.notes} onChange={(v) => set("notes", v)} />
      </Field>
    </>
  );
}

/* ---------- brief (the document) ---------- */

const has = (v) => {
  if (v == null) return false;
  if (Array.isArray(v)) return v.some(has);
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object") return Object.values(v).some(has);
  return true;
};

const BSec = ({ num, title, children }) => (
  <section className="bsec">
    <div className="bsec-rule" />
    <div className="bsec-head"><span className="bsec-num">{num}</span><h2 className="bsec-title">{title}</h2></div>
    {children}
  </section>
);

const BItem = ({ label, children, full }) =>
  has(children) ? (
    <div className={"bitem" + (full ? " full" : "")}>
      <div className="blabel">{label}</div>
      <div className="bval">{children}</div>
    </div>
  ) : null;

const join = (arr) => arr.filter((x) => x && String(x).trim()).join(", ");

function Brief({ data, onBack }) {
  const s = data;
  const wordsNow = join(s.perception.now);
  const wordsFuture = join(s.perception.future);
  const onlyParts = [s.positioning.category, s.positioning.difference, s.positioning.audience, s.positioning.context];
  const hasOnly = onlyParts.some((x) => x && x.trim());
  return (
    <div className="brief-wrap">
      <div className="brief-bar no-print">
        <button type="button" className="bar-btn" onClick={onBack}>{"\u2190"} Back to workshop</button>
        <span className="bar-note">File {"\u2192"} Print {"\u2192"} Save as PDF &nbsp;·&nbsp; Set paper to A4, margins to None</span>
        <button type="button" className="bar-btn primary" onClick={() => window.print()}>Download PDF</button>
      </div>

      <div className="brief">
        <div className="bcover">
          <div className="bcover-top"><span className="mono-cap">Brand discovery {"\u2014"} workshop record</span><span className="mono-cap">{s.setup.date}</span></div>
          <h1 className="bcover-title">{s.setup.project || s.setup.client || "Untitled project"}</h1>
          <div className="bcover-grid">
            <div><div className="blabel">Client</div><div className="bval">{s.setup.client || "\u2014"}</div></div>
            <div><div className="blabel">Sector</div><div className="bval">{s.setup.sector || "\u2014"}</div></div>
            <div><div className="blabel">Facilitator</div><div className="bval">{s.setup.facilitator || "\u2014"}</div></div>
            <div><div className="blabel">Engagement</div><div className="bval">{join(s.setup.engagement) || "\u2014"}</div></div>
          </div>
        </div>

        {(has(s.setup.decision) || has(s.setup.attendees)) && (
          <BSec num="00" title="Setup">
            <BItem label="In the room">{s.setup.attendees}</BItem>
            <BItem label="Final decision-maker">{s.setup.decision}</BItem>
          </BSec>
        )}

        {has(s.business) && (
          <BSec num="01" title="Business">
            <BItem label="What the business does" full>{s.business.oneLiner}</BItem>
            <BItem label="Model">{join(s.business.model)}</BItem>
            <BItem label="Stage">{s.business.stage}</BItem>
            <BItem label="Revenue logic" full>{s.business.revenue}</BItem>
            <BItem label="Three-year ambition" full>{s.business.ambition}</BItem>
            <BItem label="Metrics the brand must move" full>{s.business.metrics}</BItem>
          </BSec>
        )}

        {has(s.audience) && (
          <BSec num="02" title="Audience">
            {s.audience.segments.filter(has).map((seg, i) => (
              <div className="bseg" key={i}>
                <div className="bseg-name">{seg.name || "Segment " + (i + 1)}</div>
                <BItem label="Who they are" full>{seg.desc}</BItem>
                <BItem label="What they want" full>{seg.needs}</BItem>
                <BItem label="Frictions" full>{seg.frictions}</BItem>
                <BItem label="Identity badge" full>{seg.identity}</BItem>
              </div>
            ))}
            <BItem label="Sharpest insight" full>{s.audience.insight}</BItem>
            <BItem label="Not for" full>{s.audience.notFor}</BItem>
          </BSec>
        )}

        {has(s.landscape) && (
          <BSec num="03" title="Landscape">
            {s.landscape.competitors.filter(has).map((c, i) => (
              <div className="bseg" key={i}>
                <div className="bseg-name">{c.name || "Competitor " + (i + 1)}{c.threat ? <span className="bthreat"> {"\u00B7"} {c.threat} threat</span> : null}</div>
                <BItem label="Strong at" full>{c.strength}</BItem>
                <BItem label="Weak at" full>{c.weakness}</BItem>
              </div>
            ))}
            <BItem label="The enemy" full>{s.landscape.enemy}</BItem>
            <BItem label="The open space" full>{s.landscape.gap}</BItem>
            <BItem label="Conventions: keep / break" full>{s.landscape.conventions}</BItem>
          </BSec>
        )}

        {(wordsNow || wordsFuture || has(s.perception.feelings) || has(s.perception.misread)) && (
          <BSec num="04" title="Perception gap">
            {(wordsNow || wordsFuture) && (
              <div className="bgap">
                <div><div className="blabel">Today</div><div className="bgap-words">{wordsNow || "\u2014"}</div></div>
                <div className="bgap-arrow">{"\u2192"}</div>
                <div><div className="blabel">Target</div><div className="bgap-words blue">{wordsFuture || "\u2014"}</div></div>
              </div>
            )}
            <BItem label="Common misread" full>{s.perception.misread}</BItem>
            <BItem label="Internal feeling" full>{s.perception.feelings}</BItem>
          </BSec>
        )}

        {(s.personality.sliders.some((v) => v != null) || has(s.personality.tension)) && (
          <BSec num="05" title="Personality">
            <div className="bscales">
              {PERSONALITY.map(([l, r], i) => s.personality.sliders[i] != null ? <StaticScale key={i} left={l} right={r} value={s.personality.sliders[i]} /> : null)}
            </div>
            <BItem label="Productive tension" full>{s.personality.tension}</BItem>
          </BSec>
        )}

        {has(s.archetype) && (
          <BSec num="06" title="Archetype">
            <BItem label="Primary">{s.archetype.primary}</BItem>
            <BItem label="Secondary">{s.archetype.secondary}</BItem>
            <BItem label="Rationale" full>{s.archetype.notes}</BItem>
          </BSec>
        )}

        {has(s.values) && (
          <BSec num="07" title="Purpose & values">
            {(has(s.values.why) || has(s.values.how) || has(s.values.what)) && (
              <div className="bgolden">
                <div className="bgold-row"><span className="bgold-k">Why</span><span className="bgold-v">{s.values.why || "\u2014"}</span></div>
                <div className="bgold-row"><span className="bgold-k">How</span><span className="bgold-v">{s.values.how || "\u2014"}</span></div>
                <div className="bgold-row"><span className="bgold-k">What</span><span className="bgold-v">{s.values.what || "\u2014"}</span></div>
              </div>
            )}
            <BItem label="Root (5 whys)" full>{s.values.ladder}</BItem>
            <BItem label="Values">{join(s.values.picked)}</BItem>
            <BItem label="Anti-value">{s.values.antiValue}</BItem>
          </BSec>
        )}

        {has(s.positioning) && (
          <BSec num="08" title="Positioning">
            {hasOnly && (
              <p className="bonly">The only <em>{s.positioning.category || "____"}</em> that <em>{s.positioning.difference || "____"}</em> for <em>{s.positioning.audience || "____"}</em> in <em>{s.positioning.context || "____"}</em>.</p>
            )}
            <BItem label="Trueline" full>{s.positioning.trueline}</BItem>
            <BItem label="Reasons to believe" full>
              {s.positioning.props.filter((p) => p.trim()).map((p, i) => (<div key={i} className="bprop"><span className="bprop-n">{String(i + 1).padStart(2, "0")}</span>{p}</div>))}
            </BItem>
            <BItem label="Proof points" full>{s.positioning.proof}</BItem>
            <BItem label="Brand promise" full>{s.positioning.promise}</BItem>
          </BSec>
        )}

        {has(s.voice) && (
          <BSec num="09" title="Voice">
            <div className="bscales">
              {VOICE_DIMS.map(([l, r], i) => s.voice.sliders[i] != null ? <StaticScale key={i} left={l} right={r} value={s.voice.sliders[i]} /> : null)}
            </div>
            <BItem label="Tone words">{join(s.voice.toneWords)}</BItem>
            <BItem label="We say" full>{s.voice.say}</BItem>
            <BItem label="We never say" full>{s.voice.neverSay}</BItem>
          </BSec>
        )}

        {has(s.wheel) && (
          <BSec num="10" title="Brand wheel">
            <div className="bwheel">
              <BItem label="Attributes" full>{s.wheel.attributes}</BItem>
              <BItem label="Functional benefits" full>{s.wheel.benefits}</BItem>
              <BItem label="Emotional benefits" full>{s.wheel.emotional}</BItem>
              <BItem label="Values" full>{s.wheel.values}</BItem>
              <BItem label="Personality" full>{s.wheel.personality}</BItem>
            </div>
            {has(s.wheel.essence) && <p className="bessence"><span className="bessence-l">Essence</span>{s.wheel.essence}</p>}
          </BSec>
        )}

        {has(s.visual) && (
          <BSec num="11" title="Visual direction">
            <BItem label="Territories">{join(s.visual.territories)}</BItem>
            <BItem label="Allergies" full>{s.visual.avoid}</BItem>
            <BItem label="Admiration" full>{s.visual.references}</BItem>
            <BItem label="Mandatories" full>{s.visual.mandatories}</BItem>
            <BItem label="Priority touchpoints">{join(s.visual.touchpoints)}</BItem>
          </BSec>
        )}

        {has(s.scope) && (
          <BSec num="12" title="Scope & risks">
            <BItem label="Deliverables" full>{join(s.scope.deliverables)}</BItem>
            <BItem label="Timeline">{s.scope.timeline}</BItem>
            <BItem label="Budget">{s.scope.budget}</BItem>
            <BItem label="Risks & red flags" full>{s.scope.risks}</BItem>
            <BItem label="Room notes" full>{s.scope.notes}</BItem>
          </BSec>
        )}

        <footer className="bfoot">
          <span>{s.setup.client || "Client"} {"\u00D7"} {s.setup.facilitator || "Facilitator"}</span>
          <span className="mono-cap">Discovery record {"\u00B7"} {s.setup.date}</span>
        </footer>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */

export default function DiscoveryInstrument() {
  const [view, setView] = useState("00");
  const [data, setData] = useState(initData);
  const fileRef = useRef(null);

  const set = (sectionKey) => (key, val) => setData((d) => ({ ...d, [sectionKey]: { ...d[sectionKey], [key]: val } }));

  const saveSession = () => {
    const payload = { _format: "gsx/1.0", _tool: "Layered Discovery", _saved: new Date().toISOString(), ...data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = (data.setup.project || data.setup.client || "session").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = slug + ".gsx";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadSession = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        const { _format, _tool, _saved, ...session } = parsed;
        setData({ ...initData(), ...session });
      } catch (err) {}
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const idx = SECTIONS.findIndex((x) => x.id === view);
  const sec = SECTIONS[idx];
  const keys = ["setup", "business", "audience", "landscape", "perception", "personality", "archetype", "values", "positioning", "voice", "wheel", "visual", "scope"];

  const bodies = {
    "00": <Setup d={data.setup} set={set("setup")} />,
    "01": <Business d={data.business} set={set("business")} />,
    "02": <Audience d={data.audience} set={set("audience")} />,
    "03": <Landscape d={data.landscape} set={set("landscape")} />,
    "04": <Perception d={data.perception} set={set("perception")} />,
    "05": <Personality d={data.personality} set={set("personality")} />,
    "06": <Archetype d={data.archetype} set={set("archetype")} />,
    "07": <Values d={data.values} set={set("values")} />,
    "08": <Positioning d={data.positioning} set={set("positioning")} />,
    "09": <Voice d={data.voice} set={set("voice")} />,
    "10": <Wheel d={data.wheel} set={set("wheel")} />,
    "11": <Visual d={data.visual} set={set("visual")} />,
    "12": <Scope d={data.scope} set={set("scope")} />,
  };

  return (
    <div className="root">
      <style>{CSS}</style>
      {view === "brief" ? (
        <Brief data={data} onBack={() => setView("12")} />
      ) : (
        <>
          <div className="topbar no-print">
            <span className="brand">Layered<span className="blue">.</span></span>
            <span className="top-project">{data.setup.project || data.setup.client || "New session"}</span>
            <div className="top-actions">
              <button type="button" className="bar-btn" onClick={saveSession}>Save .gsx</button>
              <button type="button" className="bar-btn" onClick={() => fileRef.current && fileRef.current.click()}>Load .gsx</button>
              <input ref={fileRef} type="file" accept=".gsx,.json" style={{ display: "none" }} onChange={loadSession} />
              <button type="button" className="bar-btn primary" onClick={() => setView("brief")}>Generate brief {"\u2192"}</button>
            </div>
          </div>

          <div className="layout">
            <nav className="rail no-print">
              {SECTIONS.map((x, i) => (
                <button key={x.id} type="button" className={"rail-item" + (view === x.id ? " on" : "")} onClick={() => setView(x.id)}>
                  <span className="rail-num">{x.id}</span>
                  <span className="rail-title">{x.title}</span>
                  <span className={"rail-dot" + (JSON.stringify(data[keys[i]]) !== JSON.stringify(initData()[keys[i]]) ? " done" : "")} />
                </button>
              ))}
            </nav>

            <main className="main">
              <SectionHeader sec={sec} />
              <div className="body">{bodies[view]}</div>
              <div className="pager">
                {idx > 0 ? (<button type="button" className="pager-btn" onClick={() => setView(SECTIONS[idx - 1].id)}>{"\u2190"} {SECTIONS[idx - 1].title}</button>) : <span />}
                {idx < SECTIONS.length - 1 ? (
                  <button type="button" className="pager-btn next" onClick={() => setView(SECTIONS[idx + 1].id)}>{SECTIONS[idx + 1].title} {"\u2192"}</button>
                ) : (
                  <button type="button" className="pager-btn next blue-btn" onClick={() => setView("brief")}>Generate brief {"\u2192"}</button>
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- system ---------- */

const CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; margin: 0; }
.root { min-height: 100vh; background: #fff; color: ${INK}; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
.blue { color: ${BLUE}; }
.mono, .mono-cap { font-family: "SF Mono", ui-monospace, "Roboto Mono", Menlo, monospace; }
.mono-cap { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }

/* top bar */
.topbar { position: sticky; top: 0; z-index: 20; height: 56px; display: flex; align-items: center; gap: 20px; padding: 0 24px; background: #fff; border-bottom: 1px solid ${INK}; }
.brand { font-weight: 700; letter-spacing: -0.02em; font-size: 17px; }
.top-project { font-size: 12px; color: ${MID}; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-actions { display: flex; gap: 8px; }
.bar-btn { font: inherit; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; background: #fff; color: ${INK}; border: 1px solid ${INK}; padding: 8px 14px; cursor: pointer; border-radius: 0; }
.bar-btn:hover { background: ${INK}; color: #fff; }
.bar-btn.primary { background: ${INK}; color: #fff; }
.bar-btn.primary:hover { background: ${BLUE}; border-color: ${BLUE}; }

/* layout */
.layout { display: flex; align-items: flex-start; }
.rail { position: sticky; top: 56px; width: 232px; flex-shrink: 0; height: calc(100vh - 56px); overflow-y: auto; border-right: 1px solid ${RULE}; padding: 16px 0; display: flex; flex-direction: column; }
.rail-item { display: flex; align-items: center; gap: 12px; font: inherit; font-size: 13px; text-align: left; background: none; border: none; border-left: 2px solid transparent; padding: 9px 16px 9px 22px; cursor: pointer; color: ${INK}; }
.rail-item:hover { background: #F6F6F4; }
.rail-item.on { border-left-color: ${BLUE}; font-weight: 700; }
.rail-num { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 10px; color: ${MID}; }
.rail-item.on .rail-num { color: ${BLUE}; }
.rail-title { flex: 1; }
.rail-dot { width: 6px; height: 6px; border: 1px solid ${RULE}; border-radius: 50%; }
.rail-dot.done { background: ${INK}; border-color: ${INK}; }
.main { flex: 1; min-width: 0; padding: 44px 56px 96px; max-width: 1000px; }

/* section header */
.sec-head { margin-bottom: 36px; border-bottom: 1px solid ${INK}; padding-bottom: 22px; }
.sec-top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.sec-num { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 12px; color: ${BLUE}; letter-spacing: 0.1em; }
.sec-frame { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: ${MID}; text-align: right; }
.sec-title { font-size: clamp(32px, 5vw, 54px); font-weight: 700; letter-spacing: -0.035em; line-height: 0.95; text-transform: uppercase; margin-top: 6px; }
.sec-note { margin-top: 14px; font-size: 13px; color: ${MID}; max-width: 600px; line-height: 1.55; }
.note-tag { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: ${BLUE}; border: 1px solid ${BLUE}; padding: 2px 6px; margin-right: 10px; position: relative; top: -1px; }

/* fields */
.field { margin-bottom: 26px; }
.eyebrow-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
.eyebrow { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
.hint { font-size: 11px; color: ${MID}; }
.inp { display: block; width: 100%; font: inherit; font-size: 15px; border: none; border-bottom: 1px solid ${INK}; border-radius: 0; padding: 8px 0; background: transparent; color: ${INK}; margin-bottom: 6px; }
.inp::placeholder, .area::placeholder, .only-inp::placeholder { color: #BDBDB8; }
.inp:focus, .area:focus, .only-inp:focus { outline: none; border-color: ${BLUE}; }
.inp:focus { box-shadow: 0 1px 0 ${BLUE}; }
.area { display: block; width: 100%; font: inherit; font-size: 14px; line-height: 1.55; border: 1px solid ${RULE}; border-radius: 0; padding: 12px; background: #FCFCFB; color: ${INK}; resize: vertical; }
.area:focus { border-color: ${BLUE}; background: #fff; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }

/* coach — the client-lens helper */
.coach { margin-bottom: 10px; }
.coach.standalone { margin: 0 0 24px; }
.coach-toggle { display: inline-flex; align-items: center; gap: 7px; font: inherit; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: none; color: ${BLUE}; cursor: pointer; padding: 2px 0; }
.coach-toggle:hover { text-decoration: underline; }
.coach-ic { display: inline-flex; align-items: center; justify-content: center; width: 15px; height: 15px; border: 1px solid ${BLUE}; border-radius: 50%; font-size: 10px; font-weight: 700; }
.coach-body { border-left: 2px solid ${BLUE}; padding: 10px 0 6px 16px; margin-top: 8px; }
.coach-body.open { animation: none; }
.coach-ask { font-size: 14px; line-height: 1.6; font-style: italic; color: ${INK}; max-width: 620px; }
.coach-frame { display: inline-block; margin-top: 8px; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: ${MID}; }
.coach-eg { margin-top: 12px; padding-top: 12px; border-top: 1px dashed ${RULE}; }
.coach-eg-l { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: ${BLUE}; font-weight: 700; }
.coach-eg-t { font-size: 13.5px; line-height: 1.55; color: ${INK}; margin-top: 5px; max-width: 620px; }


/* chips */
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { font: inherit; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid ${INK}; background: #fff; color: ${INK}; padding: 7px 12px; cursor: pointer; border-radius: 0; }
.chip:hover { background: #F1F1EF; }
.chip.on { background: ${INK}; color: #fff; }

/* cards */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
.card { border: 1px solid ${RULE}; padding: 14px; background: #fff; }
.card.p { border-color: ${BLUE}; box-shadow: inset 0 0 0 1px ${BLUE}; }
.card.s { border-color: ${INK}; }
.card-name { font-weight: 700; font-size: 14px; letter-spacing: -0.01em; }
.card-desc { font-size: 12px; color: ${MID}; margin-top: 3px; line-height: 1.4; }
.card-actions { display: flex; gap: 6px; margin-top: 12px; }
.mini { font: inherit; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid ${RULE}; background: #fff; padding: 4px 8px; cursor: pointer; color: ${MID}; }
.mini:hover:not(:disabled) { border-color: ${INK}; color: ${INK}; }
.mini.on { background: ${BLUE}; border-color: ${BLUE}; color: #fff; }
.mini.on2 { background: ${INK}; border-color: ${INK}; color: #fff; }
.mini:disabled { opacity: 0.3; cursor: default; }
.tbtn { font: inherit; text-align: left; cursor: pointer; }
.tbtn:hover { border-color: ${INK}; }

/* scales */
.scales { border-top: 1px solid ${INK}; margin-bottom: 26px; }
.scale { display: grid; grid-template-columns: 124px 1fr 124px; align-items: center; gap: 14px; border-bottom: 1px solid ${RULE}; }
.scale-l, .scale-r { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
.scale-l { text-align: right; }
.scaletrack { position: relative; display: flex; height: 44px; }
.scaletrack::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: ${INK}; pointer-events: none; }
.notch { flex: 1; position: relative; background: none; border: none; cursor: pointer; padding: 0; }
.notch:focus-visible { outline: 2px solid ${BLUE}; outline-offset: -2px; }
.tick { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 1px; height: 9px; background: ${INK}; }
.tick.mid { height: 17px; }
.notch:hover .tick { background: ${BLUE}; height: 17px; width: 2px; }
.mark { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 15px; height: 15px; background: ${BLUE}; }

/* repeatables */
.repeat { border: 1px solid ${RULE}; padding: 20px 20px 4px; margin-bottom: 16px; }
.repeat-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.ghost { font: inherit; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: none; color: ${MID}; cursor: pointer; }
.ghost:hover { color: ${BLUE}; }
.add { font: inherit; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px dashed ${MID}; background: none; padding: 10px 16px; cursor: pointer; width: 100%; margin-bottom: 28px; color: ${MID}; }
.add:hover { border-color: ${BLUE}; color: ${BLUE}; }

/* perception gap */
.gapgrid { display: grid; grid-template-columns: 1fr 60px 1fr; gap: 16px; align-items: start; margin-bottom: 24px; }
.gap-arrow { font-size: 28px; text-align: center; padding-top: 48px; color: ${BLUE}; }

/* golden circle */
.golden { border: 1px solid ${INK}; padding: 8px 22px; margin-bottom: 24px; }
.golden .field { border-bottom: 1px solid ${RULE}; padding: 18px 0; margin-bottom: 0; }
.golden .field:last-child { border-bottom: none; }

/* onlyness */
.only { border: 1px solid ${INK}; padding: 24px; margin-bottom: 24px; }
.only-row { display: flex; align-items: baseline; gap: 14px; margin-top: 14px; }
.only-row:first-child { margin-top: 0; }
.only-word { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; min-width: 96px; }
.only-inp { flex: 1; font: inherit; font-size: 18px; font-style: italic; border: none; border-bottom: 1px solid ${INK}; background: transparent; padding: 4px 0; color: ${BLUE}; }

/* brand wheel */
.wheel { border-top: 1px solid ${INK}; }
.wheel-rung { display: grid; grid-template-columns: 36px 1fr; gap: 16px; align-items: start; border-bottom: 1px solid ${RULE}; padding: 18px 0; }
.wheel-rung .field { margin-bottom: 0; }
.wheel-n { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 13px; color: ${MID}; padding-top: 4px; }
.wheel-rung.essence { background: #FAFAF8; margin: 0 -16px; padding: 18px 16px; border-bottom: none; }
.wheel-rung.essence .wheel-n { color: ${BLUE}; }

/* pager */
.pager { display: flex; justify-content: space-between; margin-top: 44px; border-top: 1px solid ${INK}; padding-top: 20px; }
.pager-btn { font: inherit; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; background: none; border: none; cursor: pointer; color: ${MID}; padding: 8px 0; }
.pager-btn.next { font-weight: 700; color: ${INK}; }
.pager-btn:hover { color: ${BLUE}; }
.blue-btn { color: ${BLUE}; }

/* ---------- brief ---------- */
.brief-wrap { background: #F1F1EF; min-height: 100vh; }
.brief-bar { position: sticky; top: 0; z-index: 20; height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 24px; background: #fff; border-bottom: 1px solid ${INK}; }
.bar-note { font-size: 11px; color: ${MID}; }
.brief { max-width: 820px; margin: 32px auto; background: #fff; padding: 72px 72px 48px; box-shadow: 0 1px 0 rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.07); }
.bcover { margin-bottom: 56px; }
.bcover-top { display: flex; justify-content: space-between; color: ${MID}; margin-bottom: 48px; }
.bcover-title { font-size: clamp(40px, 7vw, 68px); font-weight: 700; letter-spacing: -0.04em; line-height: 0.95; text-transform: uppercase; margin-bottom: 40px; word-break: break-word; }
.bcover-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; border-top: 1px solid ${INK}; padding-top: 16px; }
.bsec { margin-bottom: 8px; break-inside: avoid-page; }
.bsec-rule { height: 1px; background: ${INK}; margin: 32px 0 0; }
.bsec-head { display: flex; align-items: baseline; gap: 14px; padding: 14px 0 18px; }
.bsec-num { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 11px; color: ${BLUE}; }
.bsec-title { font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.01em; }
.bitem { display: grid; grid-template-columns: 168px 1fr; gap: 16px; padding: 8px 0; }
.blabel { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${MID}; padding-top: 3px; }
.bval { font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
.bseg { border-left: 2px solid ${RULE}; padding-left: 16px; margin: 12px 0 18px; }
.bseg-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.bthreat { font-weight: 400; color: ${MID}; font-size: 12px; }
.bgap { display: grid; grid-template-columns: 1fr 50px 1fr; gap: 12px; align-items: center; padding: 10px 0 16px; }
.bgap-words { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
.bgap-words.blue { color: ${BLUE}; }
.bgap-arrow { text-align: center; font-size: 22px; color: ${MID}; }
.bgolden { border: 1px solid ${INK}; padding: 4px 18px; margin: 6px 0 16px; }
.bgold-row { display: grid; grid-template-columns: 60px 1fr; gap: 14px; padding: 12px 0; border-bottom: 1px solid ${RULE}; }
.bgold-row:last-child { border-bottom: none; }
.bgold-k { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${BLUE}; }
.bgold-v { font-size: 14px; line-height: 1.5; }
.bonly { font-size: 21px; line-height: 1.5; letter-spacing: -0.01em; padding: 6px 0 18px; }
.bonly em { color: ${BLUE}; font-style: italic; }
.bprop { display: flex; gap: 12px; margin-bottom: 5px; }
.bprop-n { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 10px; color: ${BLUE}; padding-top: 3px; }
.bwheel { margin-bottom: 4px; }
.bessence { display: flex; align-items: baseline; gap: 14px; border: 1px solid ${INK}; padding: 14px 18px; margin-top: 10px; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
.bessence-l { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${MID}; font-weight: 400; }
.bscales { margin-bottom: 8px; }
.bscale { display: grid; grid-template-columns: 130px 1fr 130px; gap: 12px; align-items: center; padding: 5px 0; }
.bscale-l, .bscale-r { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
.bscale-l { text-align: right; }
.bscale-track { position: relative; display: flex; height: 18px; }
.bscale-track::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: ${INK}; }
.bcell { flex: 1; position: relative; }
.btick { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 1px; height: 6px; background: ${INK}; }
.btick.mid { height: 11px; }
.bmark { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 10px; height: 10px; background: ${BLUE}; }
.bfoot { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid ${INK}; margin-top: 48px; padding-top: 14px; font-size: 11px; color: ${MID}; }

/* responsive */
@media (max-width: 880px) {
  .layout { flex-direction: column; }
  .rail { position: sticky; top: 56px; width: 100%; height: auto; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid ${RULE}; padding: 0; background: #fff; z-index: 15; }
  .rail-item { border-left: none; border-bottom: 2px solid transparent; padding: 12px 14px; white-space: nowrap; }
  .rail-item.on { border-bottom-color: ${BLUE}; }
  .rail-dot { display: none; }
  .main { padding: 32px 20px 80px; }
  .grid2, .gapgrid { grid-template-columns: 1fr; }
  .gap-arrow { display: none; }
  .scale { grid-template-columns: 1fr; gap: 2px; padding: 10px 0; }
  .scale-l { text-align: left; }
  .scale-l::after { content: " \\2194"; color: ${MID}; }
  .sec-frame { display: none; }
  .brief { padding: 40px 24px; margin: 16px; }
  .bcover-grid { grid-template-columns: 1fr 1fr; }
  .bitem { grid-template-columns: 1fr; gap: 2px; }
  .bscale { grid-template-columns: 1fr; gap: 1px; }
  .bscale-l { text-align: left; }
  .top-project { display: none; }
  .only-word { min-width: 72px; font-size: 16px; }
  .only-inp { font-size: 16px; }
}

/* print */
@media print {
  .no-print { display: none !important; }
  .root, .brief-wrap { background: #fff; }
  .brief { box-shadow: none; margin: 0 auto; padding: 0; max-width: 100%; }
  .bsec { break-inside: avoid; }
  .bcover { margin-top: 24px; }
  @page { margin: 16mm; }
}

@media (prefers-reduced-motion: no-preference) {
  .chip, .bar-btn, .mini, .card, .notch .tick, .coach-toggle { transition: all 0.12s ease; }
}
`;
