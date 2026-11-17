# Layered Discovery — Full App Specification

A complete, page-by-page description of the **Layered Discovery** app: every screen, every input, every piece of strategy coaching, the data model, the generated brief, and the global features. Use it as the source of truth for understanding, rebuilding or extending the app.

---

## 1. What the app is

- **Product:** a brand-strategy workshop tool made by Layered Studio.
- **User:** a facilitator, typically a brand strategist or designer, who fills it in live with a client in the room.
- **Flow:** 13 sequential input pages, numbered `00`–`12`, followed by a generated **Brief**: a printable document that can be saved as a PDF.
- **Teaching layer:** most questions have a hidden **"Tip"** panel. It holds a plain-language way to ask the question out loud, an example of a strong answer, and the strategy framework the question comes from. The design principle is that clients answer plain questions, not branding jargon.
- **Frameworks used across the app:**
  - Simon Sinek: the Golden Circle (Why / How / What) and 5 Whys laddering.
  - Marty Neumeier: Onlyness, the Trueline, "pick a fight" (from *Zag*), and the idea that customers buy meaning and identity.
  - Jung and Mark & Pearson: the 12 brand archetypes.
  - The Bates Brand Wheel: attributes → benefits → values → personality → essence.
  - Wolff Olins: brand as a growth engine, "the gap is the project", and the proposition quadrant.
  - Jennifer Aaker: brand personality dimensions.
  - Jobs-to-be-Done: the functional and emotional job.
  - Nielsen Norman Group: voice vs tone.

## 2. Tech and architecture

- **Stack:** Next.js 14.2.5 (App Router) and React 18. There are no other dependencies, no backend, no database and no authentication. It is deployed on Vercel.
- **Files:**
  - `src/app/layout.jsx`: sets the page title "Brand Discovery — Layered" and the description "Proprietary brand strategy instrument by Layered Studio.", and sets the body margin to 0.
  - `src/app/page.jsx`: a `"use client"` page that renders `<DiscoveryInstrument />`.
  - `src/app/components/DiscoveryInstrument.jsx`: the entire app (about 1,330 lines). It contains the constants, data model, UI building blocks, all 13 section components, the Brief renderer, the main component, and all CSS as one injected `<style>` string.
- **State:** a single React `useState` holds the whole session object, and a second one holds the current `view`, which is a section id `"00"`–`"12"` or `"brief"`. Nothing is saved automatically: a page refresh loses all work unless it was exported.

## 3. Global features (present on every input page)

### 3.1 Top bar (sticky, 56px)
- **Brand mark:** "Layered", followed by a full stop in the brand blue.
- **Current project name:** shows `setup.project`, falling back to `setup.client`, then "New session". It is hidden on screens under 880px.
- **Buttons:**
  - **Save .gsx:** downloads the entire session as pretty-printed JSON. The filename is a slug of the project or client name (lowercase, with anything that isn't a letter or digit replaced by `-`) plus `.gsx`, falling back to `session.gsx`. The file also carries three metadata fields: `_format: "gsx/1.0"`, `_tool: "Layered Discovery"` and `_saved: <ISO timestamp>`.
  - **Load .gsx:** opens a file picker that accepts `.gsx` and `.json`. The file is parsed, the three metadata fields are removed, and the rest is merged over a fresh default session. The merge is shallow: each section object in the file replaces that section completely. If the file can't be parsed, nothing happens and no error is shown.
  - **Generate brief →** (primary, black): switches to the Brief view.

### 3.2 Left section menu (sticky sidebar, 232px)
- Lists all 13 sections. Each entry shows the mono-spaced number, the title, and a small status dot.
- **The dot is filled** when that section's data differs from the defaults, meaning something has been entered.
- The active section gets a blue left border, bold text and a blue number.
- **Under 880px** the menu becomes a horizontally scrolling tab strip under the top bar. The active tab is underlined in blue and the dots are hidden.

### 3.3 Section header (top of every page)
- The section number in blue mono type, with the framework label in small grey caps on the right.
- The section title in large, bold, uppercase type.
- A **"Facilitator"**-tagged note: guidance for whoever is running the room.

### 3.4 Pager (bottom of every page)
- On the left, "← Previous section title". On the right, "Next section title →" in bold.
- On the last page (12), the right-hand button becomes a blue **"Generate brief →"**.

### 3.5 The Tip panel
Every field can carry up to three pieces of coaching:
- **ask:** an italic, plain-language question the facilitator reads aloud.
- **example:** shown under "A strong answer sounds like", in quotation marks.
- **frame:** the framework source, in small grey caps.

The panel is collapsed by default. Its toggle reads **"Tip"**, or **"Tip & example"** when there is an example, and **"Hide tip"** when open. Some pages also have an **always-open intro panel** in the same style, called a "standalone coach" below.

### 3.6 Input controls
- **Text input:** a single line with only a bottom border, which turns blue on focus.
- **Text area:** a lightly boxed, vertically resizable field. Row count varies by field.
- **Chips:** uppercase buttons, single- or multi-select, with an optional maximum. Selected chips are black. Clicking a selected single-select chip clears it.
- **Scale:** a 9-notch horizontal slider between two opposing words. The centre notch has a taller tick. The selected notch shows a blue square, and clicking it again clears it. The value is stored as `0`–`8`, or `null` when unset. Each notch has an aria-label reading "Left to Right, position N of 9".
- **Cards:** a grid of selectable tiles, used for archetypes and aesthetic territories.
- **Repeatable blocks:** bordered groups numbered "Segment 01", "Competitor 01" and so on. A "Remove" link appears only when there is more than one block, and a dashed full-width "+ Add …" button adds another.

---

## 4. Page by page

Notation used below: **Label** — `data.path` · control · *hint* · placeholder. Tip content follows as **Ask**, **Example** and **Frame**.

---

### Page 00 — SETUP
- **Framework label:** Engagement governance
- **Facilitator note:** "Set the room. Confirm who owns the final yes before anything else - the wrong answer here sinks projects."
- **Layout:** a two-column grid of six inputs, then the engagement chips, then the decision-maker field.

Fields:
1. **Client** — `setup.client` · text · placeholder "Company or organization"
2. **Project name** — `setup.project` · text · "Working title"
3. **Date** — `setup.date` · text in mono type · defaults to today as `YYYY-MM-DD`
4. **Facilitator** — `setup.facilitator` · text · "Who runs the room"
5. **Sector** — `setup.sector` · text · "e.g. Hospitality, Web3 events, DTC food"
6. **In the room** — `setup.attendees` · text · "Names and roles"
7. **Engagement type** — `setup.engagement` · multi-select chips · *Select all that apply*
   - Options: Full identity, Rebrand / refresh, Strategy only, Naming, Campaign, Packaging, Digital product, Spatial
8. **Final decision-maker** — `setup.decision` · text · *One name* · "Who signs off"
   - **Ask:** "When the final work is presented, whose opinion actually settles it? If three people have to agree, name that now - it changes how the whole project should run."
   - **Example:** "Maya Chen, our founder, has the final say. The board advises but doesn't vote on creative decisions."
   - **Frame:** Governance - the silent project-killer

---

### Page 01 — BUSINESS
- **Framework label:** Wolff Olins - brand lives where commerce, culture & tech overlap
- **Facilitator note:** "Money first. A brand that ignores the business model is decoration. Get the commercial truth before the romance."

Fields:
1. **What the business does** — `business.oneLiner` · textarea, 2 rows · *One sentence, no adjectives* · "We make / sell / run ___ for ___."
   - **Ask:** "Explain it the way you would to a smart 12-year-old, or to someone at a dinner party after two drinks. No jargon - what do you actually make, sell, or run, and for whom?"
   - **Example:** "We roast coffee in small batches and ship it within 48 hours of roasting, straight to people who brew at home."
   - **Frame:** Golden Circle - the WHAT
2. **Business model** — `business.model` · multi-select chips
   - Options: B2B, B2C, B2B2C, DTC, Marketplace, SaaS, Service, Physical product, Membership
3. **Stage** — `business.stage` · single-select chips
   - Options: Pre-launch, Early (0-2y), Growth, Established, Legacy / turnaround
4. **How money actually comes in** — `business.revenue` · textarea, 3 rows · *Revenue streams, margins, who pays whom* · "Primary and secondary revenue, pricing logic"
   - **Ask:** "Follow a single dollar. Who hands it over, for what, and how often? Where is the fat margin, and where are you basically breaking even?"
   - **Example:** "About 70% from a monthly subscription, which is our best margin. 20% one-off online orders. 10% wholesale to three local cafes, where we barely break even but gain visibility."
   - **Frame:** Commercial truth before brand romance
5. **Three-year ambition** — `business.ambition` · textarea · *The destination this work serves*
   - **Ask:** "Fast-forward three years. You are toasting because this worked. What is true now that was not true before - a number, a reputation, a room you are now in?"
   - **Example:** "In three years we're the coffee a serious home brewer names first: 10,000 active subscribers, a flagship cafe in our city, known nationally without losing the small-roaster soul."
   - **Frame:** Wolff Olins - brand as growth engine
6. **What the brand must move** — `business.metrics` · textarea, 2 rows · *2-3 metrics this identity is accountable to* · "e.g. ticket conversion, average order value, inbound quality"
   - **Ask:** "A brand is not jewelry - it has a job. Which 2 or 3 numbers should visibly move because this was done well? If nothing would move, why spend the money?"
   - **Example:** "Subscription sign-ups, subscriber retention past the third month, and average order value."
   - **Frame:** Accountability - ties identity to business

---

### Page 02 — AUDIENCE
- **Framework label:** Neumeier - customers buy meaning, not products
- **Facilitator note:** "Push past age and income. People buy to build their identity - find what they want to feel and be seen as."
- **Structure:** repeatable **Segment** blocks (`audience.segments[]`, starting with one), a "+ Add segment" button, then two page-level fields.

Fields in each Segment block:
1. **Give them a nickname** — `.name` · text · *A person, not a demographic* · "e.g. The scene-builder"
   - **Ask:** "If this kind of customer walked in, what would you call them behind their back - warmly? Give them a nickname: the scene-builder, the anxious founder, the weekend dad."
   - **Example:** "The weekend ritualist"
   - **Frame:** Persona - makes the abstract human
2. **Who they are** — `.desc` · text · *Life context, not just age* · "What's their world like day to day?"
   - **Ask:** "Describe their world, not their census data. What is a normal day like, and where does your product fit into it?"
   - **Example:** "30s to 40s, makes coffee at home a small daily ceremony, owns a grinder, follows a couple of coffee accounts. Not a pro, but quietly proud of caring."
3. **What they actually want** — `.needs` · textarea, 2 rows · *The functional AND the emotional*
   - **Ask:** "Two layers. On the surface, what task are they trying to finish? Underneath, what do they want to feel - safe, admired, ahead of everyone else?"
   - **Example:** "Functionally: consistently fresh, well-sourced beans without having to do the research. Emotionally: to feel like they have taste and are doing this properly."
   - **Frame:** Jobs-to-be-Done - functional + emotional job
4. **What's in their way** — `.frictions` · textarea, 2 rows · *Frictions, fears, the thing they'd never admit*
   - **Ask:** "What makes them hesitate, distrust, or put it off? Include the slightly embarrassing reason they would never say out loud - that is usually the real one."
   - **Example:** "They worry good coffee is pretentious, or that they'll order the wrong thing and look clueless. They've been burned before by stale supermarket beans labelled 'specialty'."
   - **Frame:** Barrier mapping
5. **What buying you says about them** — `.identity` · textarea, 2 rows · *The identity badge* · "I use this, therefore I am the kind of person who..."
   - **Ask:** "People choose brands to tell a story about themselves. Finish their sentence: I use this, therefore I am the kind of person who ___."
   - **Example:** "I use this, therefore I am the kind of person who has quietly good taste and cares about the small things."
   - **Frame:** Neumeier - buying meaning to build identity

Page-level fields:
6. **The sharpest audience insight** — `audience.insight` · textarea, 2 rows · *One human truth to build on*
   - **Ask:** "What is the one true, slightly uncomfortable thing about these people that almost nobody in your category is brave enough to say out loud?"
   - **Example:** "Most people who love coffee are secretly anxious they're doing it wrong. They want permission to enjoy it, not another lecture."
   - **Frame:** Insight - the spark of great work
7. **Who this is NOT for** — `audience.notFor` · textarea, 2 rows · *Exclusion creates attraction*
   - **Ask:** "Who do you happily wave goodbye to? A brand that tries to please everyone becomes wallpaper. Naming who it repels is how it earns love from the right people."
   - **Example:** "Not for the grab-and-go crowd chasing the cheapest caffeine, and not for competition baristas who'll only ever trust their own sourcing."
   - **Frame:** Neumeier - a zag needs an anti-audience

---

### Page 03 — LANDSCAPE
- **Framework label:** Neumeier - step right up and pick a fight
- **Facilitator note:** "Name the enemy. Differentiation only exists relative to something. Sometimes the enemy is the old way, not a rival."
- **Structure:** repeatable **Competitor** blocks (`landscape.competitors[]`, starting with one), a "+ Add competitor" button, then three page-level fields.

Fields in each Competitor block:
1. **Name** — `.name` · text · "Who else gets the look?"
2. **Threat level** — `.threat` · single-select chips: Low, Medium, High
3. **What they do well** — `.strength` · textarea, 2 rows · *Be generous - know the enemy*
   - **Ask:** "If a customer picked them over you, what would they honestly be right about? What do they nail?"
   - **Example:** "They're everywhere and cheap. Convenience is genuinely on their side, and their app is frictionless."
4. **Where they're weak** — `.weakness` · textarea, 2 rows · *The opening*
   - **Ask:** "Where do they leave customers cold, bored, or annoyed? That gap is where you get to live."
   - **Example:** "The coffee is stale and the brand has no soul - it feels like a gas station. Nobody feels anything about them."

Page-level fields:
5. **Pick a fight** — `landscape.enemy` · textarea · *Name the enemy - it can be an idea* · "We exist to push back against..."
   - **Ask:** "Every strong brand is against something. What are you here to push back on? It does not have to be a company - it can be a tired habit, a rip-off, or a boring norm in your world."
   - **Example:** "We exist to push back against intimidating coffee culture - the snobbery that makes normal people feel stupid for asking a simple question."
   - **Frame:** Neumeier - step right up and pick a fight
6. **The open space** — `landscape.gap` · textarea · *The position no one owns*
   - **Ask:** "Picture every rival standing in a crowded room. Where is the empty corner nobody is standing in - and why has nobody claimed it yet?"
   - **Example:** "Everyone's either cheap-and-soulless or elite-and-preachy. Nobody owns 'seriously good coffee that's actually welcoming.' It's open because roasters confuse warmth with dumbing things down."
   - **Frame:** Neumeier - head for uncluttered space
7. **Category codes: keep vs break** — `landscape.conventions` · textarea · *Recognition vs distinction* · "Keep: ...   Break: ..."
   - **Ask:** "Every industry has unwritten rules - certain colors, words, looks. Which do you keep so people still recognize what you are, and which do you deliberately break so you stand out?"
   - **Example:** "Keep: visible roast dates and origin info, because they signal credibility. Break: the moody, dark, all-lowercase 'craft' packaging everyone uses - we'll go bright and plain-spoken."
   - **Frame:** Category convention audit

---

### Page 04 — PERCEPTION GAP
- **Framework label:** Wolff Olins - the gap is the project
- **Facilitator note:** "The distance between how they are seen today and how they want to be seen - that delta is the whole brief."
- **Layout:** two columns of three word inputs with a large blue → arrow between them. On mobile the columns stack and the arrow is hidden.

Fields:
1. **Three words people use today** — `perception.now[0..2]` · three text inputs, placeholders "Word 1"–"Word 3" · *Honest - include the critics' words*
2. **Three words we want them to use** — `perception.future[0..2]` · three text inputs · *Two years out, after the work*
3. **Standalone coach** (always open):
   - **Ask:** "Imagine overhearing a customer describe you to a friend at a bar - the words they really use, not the ones on your website. Now imagine the words you would kill to hear two years from now. The space between those two lists is exactly what we are about to build."
   - **Example** (labelled "A strong pair looks like"): Today: "cheap, fine, forgettable." Target: "fresh, welcoming, the-good-stuff."
   - **Frame:** Wolff Olins - the gap is the project
4. **The most common misread** — `perception.misread` · textarea, 2 rows · *What people get wrong about you*
   - **Ask:** "What do people assume about you that is flat-out wrong - too expensive, too niche, not for them? Fixing a misunderstanding is often faster than building fame."
   - **Example:** "People assume we're expensive and fussy. We're actually mid-priced, and the whole point is that we're easy to deal with."
   - **Frame:** Perception correction
5. **How it feels from the inside** — `perception.feelings` · textarea · *The makers' own gut feeling*
   - **Ask:** "Forget customers for a second. When you look at your current brand, what do you feel - proud, a little embarrassed, indifferent? Say it plainly."
   - **Example:** "Honestly, a little embarrassed. The current logo looks like a free template and doesn't match how good the coffee actually is."
   - **Frame:** Internal audit

---

### Page 05 — PERSONALITY
- **Framework label:** Aaker - brand personality dimensions
- **Facilitator note:** "Read each pair aloud. If the brand were a person walking into a room, how would it behave? The middle is a decision too."
- **Standalone coach:** "If the brand walked into a party as a person, how would it act? For each pair, slide toward the side that feels more true. Resist landing everything in the middle - middle is safe, and safe is forgettable. Pick a side." Frame: Aaker - brand personality dimensions.

Fields:
1. **12 personality scales** — `personality.sliders[0..11]`, each a 9-point Scale from 0 to 8, or null. The code says the 12 pairs are deliberately independent of each other, so that a brand's profile carries real information. Each pair and what it measures:

| # | Left | Right | What it measures |
|---|---|---|---|
| 0 | Friendly | Authoritative | warmth / manner |
| 1 | Playful | Serious | levity / mood |
| 2 | Youthful | Mature | age & energy of the persona |
| 3 | Classic | Contemporary | aesthetic era |
| 4 | Conventional | Rebellious | relationship to the rules |
| 5 | Soft | Strong | force & weight (not gendered) |
| 6 | Simple | Complex | how dense or layered it is |
| 7 | Understated | Expressive | volume / emotional loudness |
| 8 | Casual | Refined | formality / polish |
| 9 | Accessible | Exclusive | who's invited |
| 10 | Economical | Premium | price & value cues |
| 11 | Corporate | Crafted | made by a system vs by a person |

2. **The productive tension** — `personality.tension` · textarea, 2 rows · *Two traits that seem to clash* · "e.g. Institutional rigor x rave energy"
   - **Ask:** "Look at where you landed. Which two traits seem to contradict each other? That tension - say, rigorous AND playful - is usually the most interesting thing about you. Most brands are too scared to hold both."
   - **Example:** "Expert but unpretentious. We know more than almost anyone, and we make you feel smart instead of small."
   - **Frame:** Tension - the signature of distinctive brands

---

### Page 06 — ARCHETYPE
- **Framework label:** Jung / Mark & Pearson - 12 archetypes
- **Facilitator note:** "Brands that feel human follow a recognizable character. Pick one. The secondary flavors the primary; it never competes."
- **Standalone coach:** "Stories everywhere reuse the same dozen characters - the Hero, the Rebel, the Caregiver. Brands that feel alive do too. Which character is this brand at its core? Pick one primary. Then one secondary that adds a twist - but it can never fight the lead."

Fields:
1. **Archetype cards** — `archetype.primary` and `archetype.secondary`. Twelve cards, each showing a name, a description and example brands, plus **Primary** and **Secondary** buttons.
   - Only one primary is allowed, shown with a blue border and a filled blue button.
   - Only one secondary is allowed, shown with a black border and a filled black button.
   - A card that is the primary has its Secondary button disabled.
   - Making the current secondary card the primary clears the secondary.
   - The 12 archetypes:
     - Innocent: optimism, simplicity, trust (Dove, Coca-Cola)
     - Sage: truth, expertise, clarity (Google, BBC)
     - Explorer: freedom, discovery, the frontier (Patagonia, Jeep)
     - Outlaw: rebellion, disruption, rule-breaking (Harley, Liquid Death)
     - Magician: transformation, vision, wonder (Apple, Disney)
     - Hero: mastery, courage, proof in action (Nike, FedEx)
     - Lover: intimacy, beauty, devotion (Chanel, Aesop)
     - Jester: play, irreverence, the moment (Old Spice, Mailchimp)
     - Everyperson: belonging, honesty, no pretense (IKEA, Target)
     - Caregiver: service, protection, generosity (Johnson's, Volvo)
     - Ruler: control, authority, the standard (Rolex, Mercedes)
     - Creator: imagination, craft, self-expression (Lego, Adobe)
2. **Why this character fits** — `archetype.notes` · textarea, 2 rows · *Earn it from the real story*
   - **Ask:** "What in your actual story - how you started, what your founder believes, how you treat people - makes this character true rather than just aspirational? A brand has to earn its archetype."
   - **Example:** "We're the Everyperson with a touch of Sage. Our founder learned everything the hard way and refuses to gatekeep. The welcome is real, not a marketing pose."
   - **Frame:** Authenticity check

---

### Page 07 — PURPOSE & VALUES
- **Framework label:** Sinek - Golden Circle + 5 Whys
- **Facilitator note:** "Start with why. If you stopped making money tomorrow, why would this still deserve to exist? Ladder down with why five times."
- **Layout:** a black-bordered "Golden Circle" box containing Why, How and What, followed by the other fields.

Fields:
1. **WHY - your purpose** — `values.why` · textarea, 2 rows · *The center of the Golden Circle* · "We exist because we believe..."
   - **Ask:** "If you made enough money to be comfortable forever and never had to work again, why would you still want this to exist in the world? That stubborn reason is your why."
   - **Example:** "We believe a daily ritual done well makes an ordinary day better - and that the joy of it shouldn't require a secret handshake."
   - **Frame:** Sinek - start with why
2. **HOW - your approach** — `values.how` · textarea, 2 rows · *What makes your way different* · "We do this by..."
   - **Ask:** "How do you do it in a way others do not? Your special method, your way of working, the thing people notice is different about how you operate."
   - **Example:** "By sourcing obsessively, roasting in tiny batches, and explaining everything in plain language with zero snobbery."
   - **Frame:** Sinek - the how
3. **WHAT - the proof** — `values.what` · textarea, 2 rows · *The tangible result* · "So we make / offer..."
   - **Ask:** "And what does that actually produce - the products, services, experiences someone can point at? This is the easy one; everyone can answer it."
   - **Example:** "So we sell fresh single-origin and blend coffees by subscription and online, with tasting notes a normal person can actually understand."
   - **Frame:** Sinek - the what
4. **The five whys** — `values.ladder` · textarea · *Ladder down to the root* · "Why? ... Why does that matter? ... and again ... and again ..."
   - **Ask:** "Take your first answer and ask why that matters. Then ask why THAT matters. Five times. By the fourth or fifth why you usually hit bedrock - the emotional truth the whole brand can stand on."
   - **Example:** "Why sell coffee? To make mornings better. Why does that matter? Small good rituals anchor people. Why anchor them? Life feels chaotic. Why care? We needed that anchor ourselves. So we're really selling a moment of calm and competence, not beans."
   - **Frame:** 5 Whys - root-cause laddering
5. **Values** — `values.picked` · multi-select chips, **maximum 5** · the hint updates live: "Maximum five. A value you would not lose money to keep is not a value. Selected: N/5"
   - Options (24): Craft, Honesty, Courage, Precision, Curiosity, Generosity, Independence, Optimism, Rigor, Playfulness, Sustainability, Community, Simplicity, Innovation, Heritage, Transparency, Ambition, Care, Speed, Discipline, Imagination, Inclusivity, Integrity, Excellence
   - **Ask:** "Choose only the ones you would honor even when it costs you - turning down the wrong client, walking from the wrong deal. If it is just a nice word for a wall, leave it."
   - **Example:** "For this brand: Generosity, Honesty, Craft. Each one we'd defend even when it's expensive."
   - **Frame:** Values - tested by sacrifice
6. **The anti-value** — `values.antiValue` · text · *What you refuse* · "e.g. Hype for its own sake"
   - **Ask:** "Name one thing your whole industry celebrates that quietly makes you cringe - the thing you promise never to do. What you reject sharpens what you are."
   - **Example:** "Gatekeeping. We refuse to make anyone feel they don't belong."
   - **Frame:** Anti-positioning

---

### Page 08 — POSITIONING
- **Framework label:** Neumeier - Onlyness & Trueline
- **Facilitator note:** "One sentence the competition cannot honestly say. If a rival could claim it too, it is not positioning yet."
- **Standalone coach:**
  - **Ask:** "We are going to fill one sentence together. The trick is the word ONLY - it has to stay true. If a competitor could say the exact same line, we have not found it yet, and we keep pushing until only you can claim it."
  - **Example** (labelled "A strong result reads like"): "The only specialty coffee roaster that makes great coffee feel welcoming instead of intimidating, for home brewers who care but aren't experts, in a category that mistakes snobbery for quality."
  - **Frame:** Marty Neumeier - the Onlyness test (Zag)

Fields:
1. **Onlyness sentence:** a black-bordered box of four rows. Each row has a bold lead word and a large italic blue input.
   - "**The only**" → `positioning.category` · "category / kind of company"
   - "**that**" → `positioning.difference` · "meaningful difference only you offer"
   - "**for**" → `positioning.audience` · "specific audience"
   - "**in / during**" → `positioning.context` · "market, place, or moment"
2. **Trueline** — `positioning.trueline` · text · *The one true internal sentence* · "The one true thing we can say"
   - **Ask:** "Now boil it to a single line you could say to your own team - the one true thing about you that rivals cannot or will not claim. Not an ad slogan; the truth a slogan would later dress up."
   - **Example:** "The serious roaster that treats you like a friend, not a student."
   - **Frame:** Neumeier - the trueline (internal)
3. **Three reasons to believe** — `positioning.props[0..2]` · three text inputs, "Reason 1"–"Reason 3" · *Claims rivals can't copy*
   - **Ask:** "Give three reasons a customer should buy your promise - and for each, ask: could a competitor say this too? If yes, sharpen it until it is yours alone."
   - **Example:** "1: Roasted to order, never more than 48 hours old. 2: Tasting notes written like a human, not a sommelier. 3: A no-wrong-questions promise - real people answer in plain English."
   - **Frame:** Wolff Olins Quadrant - proposition
4. **Proof points** — `positioning.proof` · textarea · *The receipts*
   - **Ask:** "Talk is cheap - what is the evidence? Numbers, names, credentials, a track record. What makes the claims believable to a skeptic?"
   - **Example:** "Every roast date posted publicly. Founder personally answers DMs. 4.9 stars across 2,300 reviews, 68% subscriber retention past six months."
   - **Frame:** Reasons to believe
5. **Brand promise** — `positioning.promise` · textarea, 2 rows · *What every touchpoint must deliver*
   - **Ask:** "Finish this: every time someone touches our brand, they should walk away feeling ___. That feeling is the promise you are on the hook to keep, everywhere, every time."
   - **Example:** "Every time you touch us, you walk away feeling more capable and more welcome - never talked down to."
   - **Frame:** Brand promise

---

### Page 09 — VOICE
- **Framework label:** Verbal identity - voice vs tone
- **Facilitator note:** "Voice is what you always sound like; tone bends by moment. Capture the forbidden words - what you would never say defines you."
- An eyebrow label above the scales reads "Voice dimensions", with the hint "Set the resting position; tone bends from here".
- **Standalone coach:** "Voice is your personality in words - it stays constant. Tone is the outfit it wears for the occasion. Set where your voice naturally rests on each dial; tone can flex later for a celebration versus an apology." Frame: Nielsen Norman - voice vs tone.

Fields:
1. **4 voice scales** — `voice.sliders[0..3]`, each a 9-point Scale:
   - Formal ↔ Casual
   - Matter-of-fact ↔ Enthusiastic
   - Respectful ↔ Irreverent
   - Serious ↔ Funny
2. **Tone words** — `voice.toneWords` · multi-select chips, **maximum 6** · hint "Maximum six. Selected: N/6"
   - Options (18): Confident, Direct, Warm, Witty, Poetic, Technical, Calm, Bold, Dry, Generous, Sharp, Understated, Charged, Reassuring, Provocative, Precise, Human, Cinematic
   - **Ask:** "If a stranger read one paragraph you wrote, which words should they use to describe how it sounded? Pick the few that feel unmistakably you."
   - **Example:** "For this brand: Warm, Direct, Confident, Generous."
3. **We say** — `voice.say` · textarea, 4 rows, left column · *Words that belong to us*
   - **Ask:** "What words, phrases, or ways of speaking feel like home? The vocabulary a loyal customer would recognize as yours."
   - **Example:** "'Here's the simple version.' 'No wrong answers.' 'Try this.' Plain, warm, confident - we explain, we never lecture."
4. **We never say** — `voice.neverSay` · textarea, 4 rows, right column · *The forbidden list defines you*
   - **Ask:** "Just as important - what words make you cringe? The industry cliches, the buzzwords, the competitor language you refuse to touch. Banning words is how a voice gets its edges."
   - **Example:** "'Notes of bergamot and stone fruit' with no translation. 'Artisanal.' 'Curated.' 'For true connoisseurs.' Anything that makes someone feel shut out."
   - **Frame:** Forbidden language - sharpens voice

---

### Page 10 — BRAND WHEEL
- **Framework label:** Bates Brand Wheel
- **Facilitator note:** "Climb from the tangible to the soul: what it has, then what that does for me, what it believes, who it is, its one essence."
- **Standalone coach:** "We are going to climb a ladder from head to heart. Bottom rung: the plain facts. Each rung up, we ask SO WHAT? - until we reach the single idea at the top that is the soul of the brand. Answer in order; do not skip rungs." Frame: Bates Brand Wheel - attributes to essence.
- **Layout:** a vertical ladder of numbered rungs 1–5, with a highlighted ★ rung for the essence. All six are single-line text inputs.

Rungs:
1. **Attributes** — `wheel.attributes` · *The tangible facts* · "What it is / has"
   - **Ask:** "What does it literally have or do? Features, materials, ingredients - things you could photograph or list on a spec sheet."
   - **Example:** "Roasted-to-order beans, 48-hour freshness, plain-language tasting notes, a flexible subscription."
2. **Functional benefits** — `wheel.benefits` · *So what does that DO for me?* · "What it does for them"
   - **Ask:** "Take those facts and ask 'so what?' What practical good does each one do for the customer? Faster, cheaper, easier, safer?"
   - **Example:** "Always-fresh coffee with zero research or guesswork, and you actually understand what you're drinking."
3. **Emotional benefits** — `wheel.emotional` · *So how does that make me FEEL?* · "How it makes them feel"
   - **Ask:** "Push up another rung. Because of that practical benefit, how does the customer feel? Relieved, confident, proud, looked-after?"
   - **Example:** "You feel competent and calm - like you've got this part of life handled, and quietly do it well."
4. **Brand values** — `wheel.values` · *What it believes* · "What it stands for"
   - **Ask:** "What does a brand that delivers all of that clearly believe in? The principles underneath the feeling."
   - **Example:** "Generosity with knowledge, craft without snobbery, honesty about sourcing."
5. **Personality** — `wheel.personality` · *Who it is* · "Who it is as a person"
   - **Ask:** "If all of that were a person, describe them in a few words. The character a customer would recognize."
   - **Example:** "A knowledgeable friend who's thrilled you asked, and never makes you feel dumb."
6. ★ **Essence** — `wheel.essence` · *The soul - 2-3 words* · "e.g. Fearless craft"
   - **Ask:** "Top of the ladder. If you had to tattoo the whole brand into two or three words - the unchanging soul of it - what are they? This is the hardest and most important line of the day."
   - **Example:** "Welcoming mastery."
   - **Frame:** Brand essence - the irreducible core

---

### Page 11 — VISUAL DIRECTION
- **Framework label:** Art direction intake
- **Facilitator note:** "Collect allergies, not just appetites. What a client hates is far more reliable data than what they say they like."

Fields:
1. **Aesthetic territories** — `visual.territories` · a grid of clickable cards, **maximum 3** · hint "Maximum three. Selected: N/3". Selected cards get a blue border.
   - **Ask:** "Don't overthink the names. Which of these worlds makes you lean in, and which makes you wince? We want the gut reaction, not the expert answer."
   - The 12 territories:
     - Swiss / International: grid, restraint, typographic order
     - Brutalist: raw, structural, anti-polish
     - Editorial / Print: magazine logic, serifs, columns
     - Organic / Natural: texture, imperfection, earth
     - Tech-minimal: precision, interface-native, cool
     - Retro-future: period optimism bent forward
     - Quiet luxury: whisper, material, negative space
     - Maximalist: density, collision, more is more
     - Craft / Analog: hand, ink, physical process
     - Pop / Vernacular: street, commerce, found language
     - Corporate-modern: systematic, scalable, assured
     - Avant-garde: experimental, uncomfortable, new
2. **Allergies** — `visual.avoid` · textarea · *What makes you recoil - be specific*
   - **Ask:** "Show me a brand, a color, a style that makes you go 'absolutely not.' Hating something is the clearest signal you'll give all day - be specific and be honest."
   - **Example:** "The dark, moody, all-lowercase 'craft' look everyone uses. Skulls, gritty kraft paper, anything that whispers 'you wouldn't understand.'"
   - **Frame:** Negative space - hate is reliable data
3. **Admiration** — `visual.references` · textarea · *Brands you wish you were - any category*
   - **Ask:** "Which brands - in your world or totally outside it - make you a little jealous? Not to copy, but to understand the quality bar you're quietly measuring against."
   - **Example:** "Aesop for restraint, Mailchimp for warmth-with-wit, Oatly for plain-spoken bravery."
4. **Mandatories & constraints** — `visual.mandatories` · textarea · *The non-negotiables*
   - **Ask:** "What must we keep or work around? A logo that can't change, a legal mark, a color you're stuck with, accessibility needs, formats it has to live in."
   - **Example:** "Keep the name and the bee mark - the founder's grandmother kept bees. Must work as a 38mm bag label and on an Instagram grid."
   - **Frame:** Constraint capture
5. **Priority touchpoints** — `visual.touchpoints` · multi-select chips · *Where it matters most*
   - Options: Website, Social, Print, Packaging, Spatial, Merch, Events, Product UI, Email, OOH
   - **Ask:** "Where will people actually meet this brand most often? That's where we spend our best effort first."

---

### Page 12 — SCOPE & RISKS
- **Framework label:** Engagement scoping
- **Facilitator note:** "Scope agreed out loud in the room survives. Scope assumed over email becomes the fight that kills the relationship."

Fields:
1. **Deliverables** — `scope.deliverables` · multi-select chips · *Agreed in the room, out loud*
   - Options (16): Brand strategy document, Naming, Logo & marks, Type system, Color system, Art direction, Photography direction, Illustration system, Motion principles, Voice & messaging, Brand guidelines, Website design, Social templates, Packaging, Pitch deck, Launch campaign
   - **Ask:** "Let's say plainly what you walk away with, so nobody is surprised later. Tap everything in scope - and notice what is NOT lit up."
2. **Timeline** — `scope.timeline` · text · "Key dates, hard deadlines"
3. **Budget range** — `scope.budget` · single-select chips: Under $10k, $10-25k, $25-50k, $50-100k, $100k+
4. **Risks & red flags** — `scope.risks` · textarea · *Name them now, not later*
   - **Ask:** "What could quietly derail this - a skeptical board member, a founder who changes their mind, a relative with strong opinions? Naming the landmines today is how we avoid stepping on them."
   - **Example:** "The founder loves the current logo her cousin made - emotional attachment is the real risk. Also a silent co-founder who 'hates blue' and only shows up at the final review."
   - **Frame:** Risk surfacing - protects the relationship
5. **Anything else said in the room** — `scope.notes` · textarea · *The throwaway line is often the brief*
   - **Ask:** "Catch the side comments, the jokes, the half-sentences. The thing someone muttered and waved off is often the most honest thing said all day."

The pager on this page ends with a blue **"Generate brief →"** button.

---

## 5. The Brief (output document)

The Brief opens from the top bar on any page, or from the pager on page 12. It replaces the whole interface.

### 5.1 Brief toolbar (hidden when printing)
- **← Back to workshop:** returns to page 12.
- A help note: "File → Print → Save as PDF · Set paper to A4, margins to None".
- **Download PDF** (primary): calls `window.print()`.

### 5.2 Document layout
The document is a white "paper" sheet, 820px wide, on a grey background. Its parts, in order:

1. **Cover**
   - Header line: "BRAND DISCOVERY — WORKSHOP RECORD" on the left and the date on the right.
   - A large uppercase title: the project name, falling back to the client, then "Untitled project".
   - A four-column grid: Client, Sector, Facilitator and Engagement. Empty values show as "—".
2. **Sections:** each has a black rule, a blue number and an uppercase title. Each row shows a grey label in a 168px column and its value with line breaks preserved.

**Rule:** a section appears only if at least one of its fields has content, and a row appears only if that row has content. Empty segments and competitors are filtered out.

| # | Brief section | What's shown |
|---|---|---|
| 00 | Setup | In the room; Final decision-maker. Only appears if one of these two is filled. Client, project, sector, facilitator and engagement are on the cover instead. |
| 01 | Business | What the business does, Model (comma-separated), Stage, Revenue logic, Three-year ambition, Metrics the brand must move |
| 02 | Audience | One indented block per non-empty segment, titled with the nickname or "Segment N": Who they are, What they want, Frictions, Identity badge. Then Sharpest insight and Not for. |
| 03 | Landscape | One block per competitor, titled "Name · {Threat} threat": Strong at, Weak at. Then The enemy, The open space, Conventions: keep / break. |
| 04 | Perception gap | Large bold "Today" words → large blue "Target" words (comma-separated), then Common misread and Internal feeling |
| 05 | Personality | Read-only mini scales for the sliders that were set, then Productive tension |
| 06 | Archetype | Primary, Secondary, Rationale |
| 07 | Purpose & values | A bordered Why / How / What box (blue keys), then Root (5 whys), Values, Anti-value |
| 08 | Positioning | A large sentence: "The only *category* that *difference* for *audience* in *context*." The parts are blue italic, and empty parts show as "____". Then Trueline, Reasons to believe (numbered 01–03), Proof points, Brand promise. |
| 09 | Voice | Read-only voice scales, then Tone words, We say, We never say |
| 10 | Brand wheel | Attributes, Functional benefits, Emotional benefits, Values, Personality, then a bordered box with the large Essence |
| 11 | Visual direction | Territories, Allergies, Admiration, Mandatories, Priority touchpoints |
| 12 | Scope & risks | Deliverables, Timeline, Budget, Risks & red flags, Room notes |

3. **Footer:** "{Client} × {Facilitator}" on the left and "DISCOVERY RECORD · {date}" on the right.

### 5.3 Print behaviour
- Toolbars are hidden and the backgrounds turn white.
- The sheet's shadow and padding are removed.
- Sections avoid splitting across pages, and `@page` sets a 16mm margin.

---

## 6. Data model (the `.gsx` file)

```js
{
  setup:       { client, project, date /*YYYY-MM-DD*/, facilitator, sector, engagement: [], decision, attendees },
  business:    { oneLiner, model: [], stage: null, revenue, ambition, metrics },
  audience:    { segments: [{ name, desc, needs, frictions, identity }], insight, notFor },
  landscape:   { competitors: [{ name, threat: null, strength, weakness }], enemy, gap, conventions },
  perception:  { now: ["", "", ""], future: ["", "", ""], misread, feelings },
  personality: { sliders: [12 × null|0..8], tension },
  archetype:   { primary: null, secondary: null, notes },
  values:      { why, how, what, ladder, picked: [], antiValue },
  positioning: { category, difference, audience, context, trueline, props: ["", "", ""], proof, promise },
  voice:       { sliders: [4 × null|0..8], toneWords: [], say, neverSay },
  wheel:       { attributes, benefits, emotional, values, personality, essence },
  visual:      { territories: [], avoid, references, mandatories, touchpoints: [] },
  scope:       { deliverables: [], timeline, budget: null, risks, notes }
}
// Saved files also carry: _format: "gsx/1.0", _tool: "Layered Discovery", _saved: ISO timestamp
```

Unless shown otherwise above, every field is a string that defaults to `""`. Single-select chip fields hold `null` or one option string.

---

## 7. Design system

- **Style:** Swiss and editorial. Square corners everywhere, hairline rules, uppercase labels in small caps with wide letter-spacing, and large tight uppercase headlines.
- **Colours:**
  - Blue `#1B29F5`: accent, selections and focus.
  - Ink `#0B0B0C`: text, borders and selected chips.
  - Rule `#E4E4E1`: light dividers.
  - Mid `#8C8C88`: secondary text.
  - White background.
- **Type:**
  - Helvetica Neue / Helvetica / Arial at a 15px base.
  - Mono (SF Mono / ui-monospace / Menlo) for section numbers and dates.
- **Motion:** 0.12s transitions on interactive elements, applied only when the user has not set `prefers-reduced-motion`.
- **Mobile (under 880px):**
  - The left menu becomes a horizontal tab strip.
  - Two-column grids become one column, and the perception arrow is hidden.
  - Scales stack: the left label sits above the track with a ↔ symbol.
  - The section framework label and top-bar project name are hidden, and the brief uses a single column.

---

## 8. Known gaps and quirks

1. **No autosave.** All data lives in memory, so a refresh loses the session unless it was saved as a `.gsx`.
2. **Loading uses a shallow merge.** A section in a loaded file replaces the default section completely, so fields missing from older files become `undefined`. A failed load gives no feedback because of an empty `catch`.
3. **Section dots can be wrong.** The "done" check compares each section to a fresh default that contains today's date, so Setup always looks done for a session saved on another day.
4. **The print instructions contradict the CSS.** The note says to set margins to "None", but the print CSS sets 16mm.
5. **Positioning wording differs between the input and the brief.** The input row says "in / during", but the brief renders only "in".
6. **There are no validations or required fields,** and no undo or reset-session control.
7. **Everything is in one file.** Adding or changing a field means editing `initData`, the section component and the `Brief` renderer.
