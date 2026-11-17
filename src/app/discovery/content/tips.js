/* ============================================================
   Field registry. Every field's label, hint and client-lens tip,
   keyed by (normalised) data path. "*" stands for any list item.
   section = page id; taggable = shows the Fact/Belief/Assumption tag;
   lint = runs the cliché / never-say lint.
   ============================================================ */

export const FIELDS = {
  /* ---------- 00 Setup ---------- */
  "setup.client": { section: "00", label: "Client" },
  "setup.project": { section: "00", label: "Project name" },
  "setup.date": { section: "00", label: "Date" },
  "setup.facilitator": { section: "00", label: "Facilitator" },
  "setup.sector": { section: "00", label: "Sector" },
  "setup.attendees": { section: "00", label: "In the room" },
  "setup.engagement": { section: "00", label: "Engagement type", hint: "Select all that apply" },
  "setup.decider": {
    section: "00", label: "Decides", hint: "One name",
    ask: "When the final work is presented, whose opinion actually settles it? If three people have to agree, name that now - it changes how the whole project should run.",
    example: "Maya Chen, our founder, has the final say. The board advises but doesn't vote on creative decisions.",
    frame: "Governance - the silent project-killer",
  },
  "setup.approvers": {
    section: "00", label: "Must agree", hint: "Who can block it",
    ask: "Who has to say yes before it reaches the decider - and could stop it? Name them now so they're in the room, not ambushing the final review.",
    example: "Our co-founder Sam must agree on anything touching packaging.",
    frame: "Bain RAPID - Agree",
  },
  "setup.input": { section: "00", label: "Gives input", hint: "Heard, not deciding" },

  /* ---------- 01 Business ---------- */
  "business.scq.situation": {
    section: "01", label: "Situation",
    ask: "What's true today that everyone in this room would agree on?",
    example: "We've grown to 3,000 subscribers on word of mouth and great reviews.",
  },
  "business.scq.complication": {
    section: "01", label: "Complication",
    ask: "What changed, or what's in the way? Why are we here now?",
    example: "Growth has flattened, and new visitors assume we're another snobby roaster.",
  },
  "business.scq.question": {
    section: "01", label: "Question",
    ask: "So what's the one question this project must answer? If we answer it, we've won.",
    example: "How do we become the obvious choice for home brewers who find specialty coffee intimidating?",
    frame: "Minto - Situation, Complication, Question",
  },
  "business.oneLiner": {
    section: "01", label: "What the business does", hint: "One sentence, no adjectives", lint: true,
    ask: "Explain it the way you would to a smart 12-year-old, or to someone at a dinner party after two drinks. No jargon - what do you actually make, sell, or run, and for whom?",
    example: "We roast coffee in small batches and ship it within 48 hours of roasting, straight to people who brew at home.",
    frame: "Golden Circle - the WHAT",
  },
  "business.model": { section: "01", label: "Business model" },
  "business.stage": { section: "01", label: "Stage" },
  "business.revenue": {
    section: "01", label: "How money actually comes in", hint: "Revenue streams, margins, who pays whom",
    ask: "Follow a single dollar. Who hands it over, for what, and how often? Where is the fat margin, and where are you basically breaking even?",
    example: "About 70% from a monthly subscription, which is our best margin. 20% one-off online orders. 10% wholesale to three local cafes, where we barely break even but gain visibility.",
    frame: "Commercial truth before brand romance",
  },
  "business.ambition": {
    section: "01", label: "Three-year ambition", hint: "The destination this work serves",
    ask: "Fast-forward three years. You are toasting because this worked. What is true now that was not true before - a number, a reputation, a room you are now in?",
    example: "In three years we're the coffee a serious home brewer names first: 10,000 active subscribers, a flagship cafe in our city, known nationally without losing the small-roaster soul.",
    frame: "Wolff Olins - brand as growth engine",
  },
  "business.metrics": {
    section: "01", label: "What the brand must move", hint: "2-3 metrics this identity is accountable to",
    ask: "A brand is not jewelry - it has a job. Which 2 or 3 numbers should visibly move because this was done well? If nothing would move, why spend the money?",
    example: "Subscription sign-ups, subscriber retention past the third month, and average order value.",
    frame: "Accountability - ties identity to business",
  },

  /* ---------- 02 Audience ---------- */
  "audience.segments.*.name": {
    section: "02", label: "Give them a nickname", hint: "A person, not a demographic",
    ask: "If this kind of customer walked in, what would you call them behind their back - warmly? Give them a nickname: the scene-builder, the anxious founder, the weekend dad.",
    example: "The weekend ritualist",
    frame: "Persona - makes the abstract human",
  },
  "audience.segments.*.desc": {
    section: "02", label: "Who they are", hint: "Life context, not just age",
    ask: "Describe their world, not their census data. What is a normal day like, and where does your product fit into it?",
    example: "30s to 40s, makes coffee at home a small daily ceremony, owns a grinder, follows a couple of coffee accounts. Not a pro, but quietly proud of caring.",
  },
  "audience.segments.*.job": {
    section: "02", label: "The job", taggable: true,
    ask: "Describe the moment, the task, and the payoff in one breath: when this happens, they want to do this, so they can feel or get that.",
    example: "When I make my morning coffee, I want beans I know are fresh and good, so I can start the day feeling like I've got one thing right.",
    frame: "Jobs-to-be-Done - job story",
  },
  "audience.segments.*.push": {
    section: "02", label: "Push", taggable: true,
    ask: "What's frustrating about how they do it today?",
    example: "Supermarket 'specialty' beans taste flat and stale.",
  },
  "audience.segments.*.pull": {
    section: "02", label: "Pull", taggable: true,
    ask: "What about you specifically draws them in?",
    example: "Roast-dated bags, delivered, explained in plain English.",
  },
  "audience.segments.*.anxiety": {
    section: "02", label: "Anxiety", taggable: true,
    ask: "What worries them about switching - including the embarrassing reason they'd never say?",
    example: "Ordering the wrong thing and looking clueless. Getting stuck in a subscription.",
  },
  "audience.segments.*.habit": {
    section: "02", label: "Habit", taggable: true,
    ask: "What keeps them doing what they do now?",
    example: "Coffee's already in the weekly grocery shop - zero effort.",
  },
  "audience.segments.*.identity": {
    section: "02", label: "What buying you says about them", hint: "The identity badge",
    ask: "People choose brands to tell a story about themselves. Finish their sentence: I use this, therefore I am the kind of person who ___.",
    example: "I use this, therefore I am the kind of person who has quietly good taste and cares about the small things.",
    frame: "Neumeier - buying meaning to build identity",
  },
  "audience.ceps": {
    section: "02", label: "Category entry points", hint: "Moments people think of the category - star your top 3",
    ask: "Forget your brand for a second. In what moments does someone first think 'I need coffee beans'? Each moment is a door into the category - we want to be the brand they remember at as many doors as possible.",
    example: "Running low on Sunday night · Buying a gift for a coffee person · Just bought a new grinder · Hosting brunch",
    frame: "Ehrenberg-Bass - Category Entry Points (mental availability)",
  },
  "audience.insight": {
    section: "02", label: "The sharpest audience insight", hint: "One human truth to build on", taggable: true,
    ask: "What is the one true, slightly uncomfortable thing about these people that almost nobody in your category is brave enough to say out loud?",
    example: "Most people who love coffee are secretly anxious they're doing it wrong. They want permission to enjoy it, not another lecture.",
    frame: "Insight - the spark of great work",
  },
  "audience.notFor": {
    section: "02", label: "Who this is NOT for", hint: "Sharpens meaning - not a media targeting rule",
    ask: "Who do you happily wave goodbye to? A brand that tries to please everyone becomes wallpaper. Naming who it repels is how it earns love from the right people.",
    example: "Not for the grab-and-go crowd chasing the cheapest caffeine, and not for competition baristas who'll only ever trust their own sourcing.",
    frame: "Neumeier - a zag needs an anti-audience · Neumeier's anti-audience, balanced with Sharp: reach still matters.",
  },

  /* ---------- 03 Landscape ---------- */
  "landscape.competitors.*.name": { section: "03", label: "Name" },
  "landscape.competitors.*.threat": { section: "03", label: "Threat level" },
  "landscape.competitors.*.strength": {
    section: "03", label: "What they do well", hint: "Be generous - know the enemy",
    ask: "If a customer picked them over you, what would they honestly be right about? What do they nail?",
    example: "They're everywhere and cheap. Convenience is genuinely on their side, and their app is frictionless.",
  },
  "landscape.competitors.*.weakness": {
    section: "03", label: "Where they're weak", hint: "The opening",
    ask: "Where do they leave customers cold, bored, or annoyed? That gap is where you get to live.",
    example: "The coffee is stale and the brand has no soul - it feels like a gas station. Nobody feels anything about them.",
  },
  "landscape.map": {
    section: "03", label: "Perceptual map", hint: "Name the two axes, then place everyone",
    ask: "Pick the two things customers actually choose on - not the things you wish they chose on. Place everyone. The empty corner is your candidate open space.",
    frame: "Perceptual map - find uncluttered space (Neumeier, Zag)",
  },
  "landscape.enemy": {
    section: "03", label: "Pick a fight", hint: "Name the enemy - it can be an idea",
    ask: "Every strong brand is against something. What are you here to push back on? It does not have to be a company - it can be a tired habit, a rip-off, or a boring norm in your world.",
    example: "We exist to push back against intimidating coffee culture - the snobbery that makes normal people feel stupid for asking a simple question.",
    frame: "Neumeier - step right up and pick a fight",
  },
  "landscape.gap": {
    section: "03", label: "The open space", hint: "The position no one owns", taggable: true,
    ask: "Picture every rival standing in a crowded room. Where is the empty corner nobody is standing in - and why has nobody claimed it yet?",
    example: "Everyone's either cheap-and-soulless or elite-and-preachy. Nobody owns 'seriously good coffee that's actually welcoming.' It's open because roasters confuse warmth with dumbing things down.",
    frame: "Neumeier - head for uncluttered space",
  },
  "landscape.conventions": {
    section: "03", label: "Category codes: keep vs break", hint: "Recognition vs distinction",
    ask: "Every industry has unwritten rules - certain colors, words, looks. Which do you keep so people still recognize what you are, and which do you deliberately break so you stand out?",
    example: "Keep: visible roast dates and origin info, because they signal credibility. Break: the moody, dark, all-lowercase 'craft' packaging everyone uses - we'll go bright and plain-spoken.",
    frame: "Category convention audit",
  },
  "landscape.conventions.keep": { section: "03", label: "Keep (codes we honour)" },
  "landscape.conventions.break": { section: "03", label: "Break (codes we defy)" },

  /* ---------- 04 Perception ---------- */
  "perception.now": { section: "04", label: "Three words people use today", hint: "Honest - include the critics' words" },
  "perception.future": { section: "04", label: "Three words we want them to use", hint: "Two years out, after the work" },
  "perception.misread": {
    section: "04", label: "The most common misread", hint: "What people get wrong about you",
    ask: "What do people assume about you that is flat-out wrong - too expensive, too niche, not for them? Fixing a misunderstanding is often faster than building fame.",
    example: "People assume we're expensive and fussy. We're actually mid-priced, and the whole point is that we're easy to deal with.",
    frame: "Perception correction",
  },
  "perception.feelings": {
    section: "04", label: "How it feels from the inside", hint: "The makers' own gut feeling",
    ask: "Forget customers for a second. When you look at your current brand, what do you feel - proud, a little embarrassed, indifferent? Say it plainly.",
    example: "Honestly, a little embarrassed. The current logo looks like a free template and doesn't match how good the coffee actually is.",
    frame: "Internal audit",
  },
  "perception.assets": {
    section: "04", label: "Distinctive asset audit", hint: "Fame = linked to you without the name · Uniqueness = linked to nobody else",
    ask: "List everything people might recognise you by - logo, colour, the bee, a shape, a phrase. For each: how many buyers would link it to you without the name (fame)? And does it make them think of anyone else (uniqueness)?",
    example: "Bee mark - fame 2, unique 5 → Invest. Kraft bag - fame 3, unique 1 → Avoid using alone.",
    frame: "Ehrenberg-Bass - Distinctive Brand Assets (Romaniuk)",
  },
  "perception.assets.*.name": { section: "04", label: "Distinctive asset" },

  /* ---------- 05 Purpose ---------- */
  "purpose.why": {
    section: "05", label: "WHY - your purpose", hint: "The center of the Golden Circle", lint: true,
    ask: "If you made enough money to be comfortable forever and never had to work again, why would you still want this to exist in the world? That stubborn reason is your why.",
    example: "We believe a daily ritual done well makes an ordinary day better - and that the joy of it shouldn't require a secret handshake.",
    frame: "Sinek - start with why",
  },
  "purpose.ladder": {
    section: "05", label: "The five whys", hint: "Ladder down to the root",
    ask: "Take your first answer and ask why that matters. Then ask why THAT matters. Five times. By the fourth or fifth why you usually hit bedrock - the emotional truth the whole brand can stand on.",
    example: "Why sell coffee? To make mornings better. Why does that matter? Small good rituals anchor people. Why anchor them? Life feels chaotic. Why care? We needed that anchor ourselves. So we're really selling a moment of calm and competence, not beans.",
    frame: "5 Whys - root-cause laddering",
  },
  "purpose.values": {
    section: "05", label: "Values",
    ask: "Choose only the ones you would honor even when it costs you - turning down the wrong client, walking from the wrong deal. If it is just a nice word for a wall, leave it.",
    example: "For this brand: Generosity, Honesty, Craft. Each one we'd defend even when it's expensive.",
    frame: "Values - tested by sacrifice",
  },
  "purpose.antiValue": {
    section: "05", label: "The anti-value", hint: "What you refuse",
    ask: "Name one thing your whole industry celebrates that quietly makes you cringe - the thing you promise never to do. What you reject sharpens what you are.",
    example: "Gatekeeping. We refuse to make anyone feel they don't belong.",
    frame: "Anti-positioning",
  },

  /* ---------- 06 Positioning ---------- */
  "positioning.category": { section: "06", label: "Onlyness: the only…", lint: true },
  "positioning.difference": { section: "06", label: "Onlyness: that…", lint: true },
  "positioning.audience": { section: "06", label: "Onlyness: for…", lint: true },
  "positioning.context": { section: "06", label: "Onlyness: in / during…", lint: true },
  "positioning.connector": { section: "06", label: "Onlyness: connecting word" },
  "positioning.price": { section: "06", label: "Price position", hint: "Where the price signals sit" },
  "positioning.ladder.functional": {
    section: "06", label: "Functional", hint: "So what does that DO for me?",
    ask: "Take those facts and ask 'so what?' What practical good does each one do for the customer? Faster, cheaper, easier, safer?",
    example: "Always-fresh coffee with zero research or guesswork, and you actually understand what you're drinking.",
  },
  "positioning.ladder.emotional": {
    section: "06", label: "Emotional", hint: "So how does that make me FEEL?",
    ask: "Push up another rung. Because of that practical benefit, how does the customer feel? Relieved, confident, proud, looked-after?",
    example: "You feel competent and calm - like you've got this part of life handled, and quietly do it well.",
  },
  "positioning.ladder.expressive": {
    section: "06", label: "Self-expressive", hint: "So what does it say about me?",
    ask: "What does choosing us let them say about themselves?",
    frame: "Aaker - functional, emotional, self-expressive benefits",
  },
  "positioning.rtbs": {
    section: "06", label: "Three reasons to believe", hint: "Claims rivals can't copy",
    ask: "Give three reasons a customer should buy your promise - and for each, ask: could a competitor say this too? If yes, sharpen it until it is yours alone.",
    example: "1: Roasted to order, never more than 48 hours old. 2: Tasting notes written like a human, not a sommelier. 3: A no-wrong-questions promise - real people answer in plain English.",
    frame: "Onlyness test applied to proof",
  },
  "positioning.rtbs.*": { section: "06", label: "Reason to believe", taggable: true },
  "positioning.proof": {
    section: "06", label: "Proof points", hint: "The receipts", taggable: true,
    ask: "Talk is cheap - what is the evidence? Numbers, names, credentials, a track record. What makes the claims believable to a skeptic?",
    example: "Every roast date posted publicly. Founder personally answers DMs. 4.9 stars across 2,300 reviews, 68% subscriber retention past six months.",
    frame: "Reasons to believe",
  },
  "positioning.promise": {
    section: "06", label: "Brand promise", hint: "What every touchpoint must deliver", lint: true,
    ask: "Finish this: every time someone touches our brand, they should walk away feeling ___. That feeling is the promise you are on the hook to keep, everywhere, every time.",
    example: "Every time you touch us, you walk away feeling more capable and more welcome - never talked down to.",
    frame: "Brand promise",
  },

  /* ---------- 07 Character ---------- */
  "character.sliders": { section: "07", label: "Personality spectrum" },
  "character.archetype.primary": {
    section: "07", label: "Archetype shorthand (optional)",
    ask: "Stories everywhere reuse the same dozen characters - the Hero, the Rebel, the Caregiver. Brands that feel alive do too. Which character is this brand at its core? Pick one primary. Then one secondary that adds a twist - but it can never fight the lead.",
    frame: "Jung / Mark & Pearson - 12 archetypes",
  },
  "character.archetype.notes": {
    section: "07", label: "Why this character fits", hint: "Earn it from the real story",
    ask: "What in your actual story - how you started, what your founder believes, how you treat people - makes this character true rather than just aspirational? A brand has to earn its archetype.",
    example: "We're the Everyperson with a touch of Sage. Our founder learned everything the hard way and refuses to gatekeep. The welcome is real, not a marketing pose.",
    frame: "Authenticity check",
  },
  "character.tension": {
    section: "07", label: "The productive tension", hint: "Two traits that seem to clash",
    ask: "Look at where you landed. Which two traits seem to contradict each other? That tension - say, rigorous AND playful - is usually the most interesting thing about you. Most brands are too scared to hold both.",
    example: "Expert but unpretentious. We know more than almost anyone, and we make you feel smart instead of small.",
    frame: "Tension - the signature of distinctive brands",
  },

  /* ---------- 08 Voice ---------- */
  "voice.sliders": { section: "08", label: "Voice dimensions", hint: "Set the resting position; tone bends from here" },
  "voice.toneWords": {
    section: "08", label: "Tone words",
    ask: "If a stranger read one paragraph you wrote, which words should they use to describe how it sounded? Pick the few that feel unmistakably you.",
    example: "For this brand: Warm, Direct, Confident, Generous.",
  },
  "voice.say": {
    section: "08", label: "We say", hint: "Words that belong to us",
    ask: "What words, phrases, or ways of speaking feel like home? The vocabulary a loyal customer would recognize as yours.",
    example: "'Here's the simple version.' 'No wrong answers.' 'Try this.' Plain, warm, confident - we explain, we never lecture.",
  },
  "voice.neverSay": {
    section: "08", label: "We never say", hint: "The forbidden list defines you",
    ask: "Just as important - what words make you cringe? The industry cliches, the buzzwords, the competitor language you refuse to touch. Banning words is how a voice gets its edges.",
    example: "'Notes of bergamot and stone fruit' with no translation. 'Artisanal.' 'Curated.' 'For true connoisseurs.' Anything that makes someone feel shut out.",
    frame: "Forbidden language - sharpens voice",
  },
  "voice.flex": {
    section: "08", label: "Tone flex", hint: "Same voice, different moments",
    ask: "Voice stays put; tone flexes. Write one line of how we'd sound in each moment.",
    frame: "Nielsen Norman - voice vs tone",
  },
  "voice.flex.celebrate": { section: "08", label: "When we celebrate", example: "Big, warm, a little goofy - we just shipped your 100th bag!" },
  "voice.flex.sorry": { section: "08", label: "When we've messed up", example: "Plain, fast, no jokes - here's what happened and what we're doing." },
  "voice.flex.sell": { section: "08", label: "When we're selling", example: "Confident and specific - fresh in 48 hours, no lecture." },

  /* ---------- 09 Brand Idea ---------- */
  "idea.answer": {
    section: "09", label: "The answer", hint: "Our answer to the strategic question", lint: true,
    ask: "Read the strategic question from page 01 out loud. Now answer it in one or two sentences, using what we found today. If the answer does not follow from the chain above, one of the links is wrong.",
    example: "Stop competing on expertise and start competing on welcome: be the serious roaster that makes home brewers feel capable, not judged.",
    frame: "Minto - Situation, Complication, Question, Answer",
  },
  "idea.trueline": {
    section: "09", label: "Trueline", hint: "The one true internal sentence", lint: true,
    ask: "Now boil it to a single line you could say to your own team - the one true thing about you that rivals cannot or will not claim. Not an ad slogan; the truth a slogan would later dress up.",
    example: "The serious roaster that treats you like a friend, not a student.",
    frame: "Neumeier - the trueline (internal)",
  },
  "idea.essence": {
    section: "09", label: "Essence", hint: "The soul - 2-3 words", lint: true,
    ask: "Top of the ladder. If you had to tattoo the whole brand into two or three words - the unchanging soul of it - what are they? This is the hardest and most important line of the day.",
    example: "Welcoming mastery.",
    frame: "Brand essence - the irreducible core",
  },

  /* ---------- 10 Visual ---------- */
  "visual.territories": {
    section: "10", label: "Aesthetic territories",
    ask: "Don't overthink the names. Which of these worlds makes you lean in, and which makes you wince? We want the gut reaction, not the expert answer.",
  },
  "visual.dials": { section: "10", label: "Visual dials", hint: "Moved here from personality - these are about form" },
  "visual.avoid": {
    section: "10", label: "Allergies", hint: "What makes you recoil - be specific",
    ask: "Show me a brand, a color, a style that makes you go 'absolutely not.' Hating something is the clearest signal you'll give all day - be specific and be honest.",
    example: "The dark, moody, all-lowercase 'craft' look everyone uses. Skulls, gritty kraft paper, anything that whispers 'you wouldn't understand.'",
    frame: "Negative space - hate is reliable data",
  },
  "visual.references": {
    section: "10", label: "Admiration", hint: "Brands you wish you were - any category",
    ask: "Which brands - in your world or totally outside it - make you a little jealous? Not to copy, but to understand the quality bar you're quietly measuring against.",
    example: "Aesop for restraint, Mailchimp for warmth-with-wit, Oatly for plain-spoken bravery.",
  },
  "visual.mandatories": {
    section: "10", label: "Mandatories & constraints", hint: "The non-negotiables",
    ask: "What must we keep or work around? A logo that can't change, a legal mark, a color you're stuck with, accessibility needs, formats it has to live in.",
    example: "Keep the name and the bee mark - the founder's grandmother kept bees. Must work as a 38mm bag label and on an Instagram grid.",
    frame: "Constraint capture",
  },
  "visual.touchpoints": {
    section: "10", label: "Priority touchpoints", hint: "Click in order of importance.",
    ask: "Where will people actually meet this brand most often? That's where we spend our best effort first.",
  },

  /* ---------- 11 Scope ---------- */
  "scope.deliverables": {
    section: "11", label: "Deliverables", hint: "Agreed in the room, out loud",
    ask: "Let's say plainly what you walk away with, so nobody is surprised later. Tap everything in scope - and notice what is NOT lit up.",
  },
  "scope.timeline": { section: "11", label: "Timeline" },
  "scope.budget": { section: "11", label: "Budget range" },
  "scope.risks": {
    section: "11", label: "Risks & red flags", hint: "Name them now, not later",
    ask: "What could quietly derail this - a skeptical board member, a founder who changes their mind, a relative with strong opinions? Naming the landmines today is how we avoid stepping on them.",
    example: "The founder loves the current logo her cousin made - emotional attachment is the real risk. Also a silent co-founder who 'hates blue' and only shows up at the final review.",
    frame: "Risk surfacing - protects the relationship",
  },
  "scope.notes": {
    section: "11", label: "Anything else said in the room", hint: "The throwaway line is often the brief",
    ask: "Catch the side comments, the jokes, the half-sentences. The thing someone muttered and waved off is often the most honest thing said all day.",
  },
  "scope.nextSteps": {
    section: "11", label: "Next steps & owners", hint: "Who does what, by when",
    ask: "Before anyone leaves: what happens next, who owns it, and by when? A discovery with no next step is just a nice conversation.",
    example: "Regan: strategy deck by 12 Nov. Maya: send sales data by Friday. Sam: book the packaging review for 20 Nov.",
    frame: "Momentum - every action has a name and a date",
  },
  "scope.openQuestions": {
    section: "11", label: "Open questions", hint: "Unanswered today, owned by someone",
    ask: "What did we not answer today that someone has to?",
    frame: "Unresolved items",
  },
};

/* ============================================================
   "How to think about it": one or two plain questions per field,
   shown under the example in the hover tip. Short, no setup needed.
   ============================================================ */
export const THINK = {
  "setup.decider": ["Whose yes ends the debate?", "If two people disagree, who wins?"],
  "setup.approvers": ["Who has to say yes before it reaches the decider?", "Who could stop it late?"],
  "business.scq.situation": ["What's true today that nobody here would argue with?"],
  "business.scq.complication": ["What changed?", "Why now, not last year?"],
  "business.scq.question": ["What one question, answered, means we won?"],
  "business.oneLiner": ["What do you make, sell or run - and for whom?", "Say it with no adjectives."],
  "business.revenue": ["Who pays, for what, how often?", "Where's the margin, where's break-even?"],
  "business.ambition": ["In three years, what's true that isn't now?", "A number, a reputation, a room you're in."],
  "business.metrics": ["Which 2-3 numbers should move if this works?"],
  "audience.segments.*.name": ["What would you call them, warmly?"],
  "audience.segments.*.desc": ["What does a normal day look like for them?", "Where do you fit in it?"],
  "audience.segments.*.job": ["When ___ happens, what do they want to get done, and why?"],
  "audience.segments.*.push": ["What annoys them about how they do it now?"],
  "audience.segments.*.pull": ["What about you draws them in?"],
  "audience.segments.*.anxiety": ["What worries them about switching?", "What reason would they never say out loud?"],
  "audience.segments.*.habit": ["What keeps them doing it the old way?"],
  "audience.segments.*.identity": ["I use this, so I'm the kind of person who ___."],
  "audience.ceps": ["When does someone first think they need this?", "Where are they, what just happened?"],
  "audience.insight": ["What's true about them that nobody in the category says?"],
  "audience.notFor": ["Who are you happy to lose?"],
  "landscape.competitors.*.strength": ["If someone picked them over you, what would they be right about?"],
  "landscape.competitors.*.weakness": ["Where do they leave customers cold or annoyed?"],
  "landscape.map": ["What two things do customers really choose on?", "Which corner is empty?"],
  "landscape.enemy": ["What are you against?", "A habit, a rip-off, a tired norm."],
  "landscape.gap": ["Where is nobody standing?", "Why hasn't anyone claimed it?"],
  "landscape.conventions": ["Which category codes help people recognise you?", "Which ones can you break?"],
  "perception.misread": ["What do people wrongly assume about you?"],
  "perception.feelings": ["Looking at the brand today: proud, embarrassed, indifferent?"],
  "perception.assets": ["What do people recognise you by without the name?", "Does it make them think of anyone else?"],
  "purpose.why": ["If money didn't matter, why would this still exist?"],
  "purpose.ladder": ["Why does that matter?", "Ask again, five times."],
  "purpose.values": ["Which would you keep even if it cost you a client?"],
  "purpose.antiValue": ["What does your industry celebrate that makes you cringe?"],
  "positioning.ladder.functional": ["What practical good does it do them?", "Faster, cheaper, easier, safer?"],
  "positioning.ladder.emotional": ["Because of that, how do they feel?"],
  "positioning.ladder.expressive": ["What does choosing you say about them?"],
  "positioning.rtbs": ["Why should they believe the promise?", "Could a rival say the same?"],
  "positioning.proof": ["What would convince a sceptic?", "Numbers, names, track record."],
  "positioning.promise": ["After every interaction, they should feel ___."],
  "character.archetype.primary": ["Which character is the brand at its core?", "What one twist does it add?"],
  "character.archetype.notes": ["What in your real story makes this true?"],
  "character.tension": ["Which two of your traits seem to contradict?"],
  "voice.toneWords": ["How should a stranger describe one paragraph of yours?"],
  "voice.say": ["Which words and phrases feel like yours?"],
  "voice.neverSay": ["Which words make you cringe?", "Clichés, buzzwords, rivals' language."],
  "voice.flex": ["Same voice - how does it sound happy, sorry, selling?"],
  "idea.answer": ["What's your answer to the strategic question, in two sentences?"],
  "idea.trueline": ["What's the one true thing rivals can't claim?"],
  "idea.essence": ["Two or three words that never change."],
  "visual.territories": ["Which worlds make you lean in?", "Which make you wince?"],
  "visual.avoid": ["What look makes you say absolutely not?"],
  "visual.references": ["Which brands make you a little jealous?"],
  "visual.mandatories": ["What can't change?", "Logos, legal marks, accessibility, formats."],
  "visual.touchpoints": ["Where will people meet the brand most?"],
  "scope.deliverables": ["What do you walk away with?", "What's not included?"],
  "scope.risks": ["Who or what could derail this?"],
  "scope.notes": ["What was said in passing that matters?"],
  "scope.nextSteps": ["What happens next, who owns it, by when?"],
  "scope.openQuestions": ["What didn't we answer today?"],
};

/* Hints for questions that had none, so every question has a short line under it. */
const MORE_HINTS = {
  "setup.client": "The company or organisation",
  "setup.project": "A working title is fine",
  "setup.date": "When this session happens",
  "setup.facilitator": "Who runs the room",
  "setup.sector": "The industry you compete in",
  "setup.attendees": "Everyone here, with their role",
  "business.scq.situation": "What's true today",
  "business.scq.complication": "What changed, or what's in the way",
  "business.scq.question": "The one question this project must answer",
  "business.model": "How the business is set up to sell",
  "business.stage": "Where the business is right now",
  "audience.segments.*.job": "The progress they're trying to make",
  "audience.segments.*.push": "What's wrong with today",
  "audience.segments.*.pull": "What draws them to you",
  "audience.segments.*.anxiety": "What makes them hesitate",
  "audience.segments.*.habit": "What keeps them where they are",
  "landscape.competitors.*.name": "Who else they consider",
  "landscape.competitors.*.threat": "How much they worry you",
  "landscape.conventions.keep": "So people know what you are",
  "landscape.conventions.break": "So people notice you",
  "voice.flex.celebrate": "Good news, launches, thank-yous",
  "voice.flex.sorry": "Delays, mistakes, apologies",
  "voice.flex.sell": "Offers, launches, asks",
  "scope.timeline": "Key dates and hard deadlines",
  "scope.budget": "A rough range is enough",
};
for (const [k, h] of Object.entries(MORE_HINTS)) if (FIELDS[k] && !FIELDS[k].hint) FIELDS[k].hint = h;

/* Placeholder phrases for fields that had none: a short nudge on how to start the answer. */
export const PLACEHOLDERS = {
  "business.scq.situation": "Today we...",
  "business.scq.complication": "But now...",
  "business.ambition": "In three years we'll be...",
  "audience.segments.*.push": "They're fed up with...",
  "audience.segments.*.pull": "They're drawn to us because...",
  "audience.segments.*.anxiety": "They worry that...",
  "audience.segments.*.habit": "They stick with what they know because...",
  "audience.insight": "What nobody says about them is...",
  "audience.notFor": "We're not for people who...",
  "landscape.competitors.*.strength": "They're genuinely good at...",
  "landscape.competitors.*.weakness": "They fall short when...",
  "landscape.gap": "Nobody is yet...",
  "perception.misread": "People assume we're...",
  "perception.feelings": "When we look at it, we feel...",
  "positioning.proof": "Numbers, names, awards, track record",
  "positioning.promise": "Every time, they walk away feeling...",
  "character.archetype.notes": "It fits because...",
  "voice.say": "Words and phrases that sound like us",
  "voice.neverSay": "Words we'd never use",
  "voice.flex.celebrate": "One line, e.g. a launch post",
  "voice.flex.sorry": "One line, e.g. a delay email",
  "voice.flex.sell": "One line, e.g. a product page",
  "visual.avoid": "Absolutely not: ...",
  "visual.references": "Brands we quietly admire",
  "visual.mandatories": "Must keep or work around",
  "scope.risks": "This could go wrong if...",
  "scope.notes": "Side comments worth keeping",
  "scope.openQuestions": "We still need to find out...",
};

/* ============================================================
   Question copy, rewritten for clarity. Each title is a plain question a
   newcomer can answer with no context; each hint says what a good answer looks like.
   ============================================================ */
const COPY = {
  "setup.client": ["Client name", "The company or organisation"],
  "setup.project": ["Project name", "A working title is fine"],
  "setup.date": ["Session date", "When this workshop happens"],
  "setup.facilitator": ["Facilitator", "The person running the session"],
  "setup.sector": ["Industry", "The market you compete in"],
  "setup.attendees": ["Who's in the room?", "Everyone taking part today"],
  "setup.engagement": ["What are we making?", "Select all that apply"],
  "setup.decider": ["Who makes the final call?", "One person"],
  "setup.approvers": ["Who needs to approve it first?", "Anyone who could block it"],
  "setup.input": ["Who should we hear from?", "They advise, but don't decide"],

  "business.scq.situation": ["Where are you today?", "Facts everyone here agrees on"],
  "business.scq.complication": ["What's changed or in the way?", "Why this project, why now"],
  "business.scq.question": ["What must this project answer?", "One question - answer it and we've won"],
  "business.oneLiner": ["What does the business do?", "One plain sentence, no adjectives"],
  "business.model": ["How do you sell?", "Select all that apply"],
  "business.stage": ["What stage is the business at?", "Pick one"],
  "business.revenue": ["Where does the money come from?", "Who pays, for what, and where the margin is"],
  "business.ambition": ["Where do you want to be in 3 years?", "A number, a reputation, or a milestone"],
  "business.metrics": ["What should the new brand improve?", "2-3 numbers you'd track"],

  "audience.segments.*.name": ["Who is this customer?", "A nickname, not a demographic"],
  "audience.segments.*.desc": ["What's their life like?", "Their day, not their age bracket"],
  "audience.segments.*.job": ["What are they trying to get done?", "When ___, they want to ___, so they can ___"],
  "audience.segments.*.push": ["What frustrates them today?", "Why they'd look for something new"],
  "audience.segments.*.pull": ["What draws them to you?", "What you offer that they want"],
  "audience.segments.*.anxiety": ["What makes them hesitate?", "Doubts about switching to you"],
  "audience.segments.*.habit": ["What keeps them where they are?", "Habits and comfort with the old way"],
  "audience.segments.*.identity": ["What does choosing you say about them?", "I use this, so I'm someone who..."],
  "audience.ceps": ["When do people need what you sell?", "Real moments - star the top 3"],
  "audience.insight": ["What's true about them that others miss?", "One human truth to build on"],
  "audience.notFor": ["Who is this not for?", "Who you're happy to lose"],

  "landscape.competitors.*.name": ["Competitor", "Who else customers consider"],
  "landscape.competitors.*.threat": ["How big a threat are they?", "Pick one"],
  "landscape.competitors.*.strength": ["What do they do well?", "Be honest and generous"],
  "landscape.competitors.*.weakness": ["Where do they fall short?", "Where customers are let down"],
  "landscape.map": ["How does the market compare?", "Name two axes, then place everyone"],
  "landscape.enemy": ["What are you against?", "A habit, an idea, or a norm - not just a rival"],
  "landscape.gap": ["What space is nobody owning?", "The position still open"],
  "landscape.conventions": ["Which category norms do you follow?", "Keep some to be recognised, break some to stand out"],
  "landscape.conventions.keep": ["Norms to keep", "So people know what you are"],
  "landscape.conventions.break": ["Norms to break", "So people notice you"],

  "perception.now": ["How do people describe you today?", "Three honest words, critics included"],
  "perception.future": ["How should they describe you?", "Three words, two years from now"],
  "perception.misread": ["What do people get wrong about you?", "The most common wrong assumption"],
  "perception.feelings": ["How does your team feel about the brand?", "Proud, embarrassed, indifferent?"],
  "perception.assets": ["What do people recognise you by?", "Rate how known and how unique each one is"],
  "perception.assets.*.name": ["Brand asset", ""],

  "purpose.why": ["Why does the business exist?", "Beyond making money"],
  "purpose.ladder": ["Why does that matter?", "Keep asking why until you hit the root"],
  "purpose.values": ["What do you stand for?", ""],
  "purpose.antiValue": ["What will you never do?", "Something your industry does that you won't"],

  "positioning.price": ["Where does your price sit?", "Compared with the market"],
  "positioning.ladder.functional": ["What does it do for them?", "The practical benefit"],
  "positioning.ladder.emotional": ["How does that make them feel?", "The emotional benefit"],
  "positioning.ladder.expressive": ["What does it say about them?", "How it reflects who they are"],
  "positioning.rtbs": ["Why should people believe you?", "Three reasons a rival couldn't claim"],
  "positioning.rtbs.*": ["Reason to believe", ""],
  "positioning.proof": ["What's the evidence?", "Numbers, names, results"],
  "positioning.promise": ["What do you promise every time?", "The feeling people should leave with"],

  "character.sliders": ["What's the brand's personality?", ""],
  "character.archetype.primary": ["Which character is the brand? (optional)", ""],
  "character.archetype.notes": ["Why does that character fit?", "Proof from your real story"],
  "character.tension": ["Which two traits pull against each other?", "The contrast that makes you interesting"],

  "voice.sliders": ["How does the brand sound?", "Its usual tone of voice"],
  "voice.toneWords": ["Which words describe your tone?", ""],
  "voice.say": ["Words and phrases you use", "Language that sounds like you"],
  "voice.neverSay": ["Words and phrases you avoid", "Clichés, jargon, rivals' language"],
  "voice.flex": ["How does the tone shift?", "Same voice, different moments"],
  "voice.flex.celebrate": ["When celebrating", "Launches, wins, thank-yous"],
  "voice.flex.sorry": ["When apologising", "Delays, mistakes, bad news"],
  "voice.flex.sell": ["When selling", "Offers, product pages, asks"],

  "idea.answer": ["What's the answer to your strategic question?", "One or two sentences"],
  "idea.trueline": ["What's the one true thing about you?", "One sentence for your team, not an ad"],
  "idea.essence": ["What's the brand in 2-3 words?", "The part that never changes"],

  "visual.territories": ["Which visual styles feel right?", ""],
  "visual.dials": ["How should the brand look?", "Set each slider"],
  "visual.avoid": ["What should it never look like?", "Styles, colours or brands to avoid"],
  "visual.references": ["Which brands do you admire?", "From any industry"],
  "visual.mandatories": ["What can't change?", "Logos, legal marks, colours, formats"],
  "visual.touchpoints": ["Where will people see the brand most?", "Click in order of importance"],

  "scope.deliverables": ["What will we deliver?", "Select everything in scope"],
  "scope.timeline": ["What's the timeline?", "Key dates and hard deadlines"],
  "scope.budget": ["What's the budget?", "A rough range is enough"],
  "scope.risks": ["What could get in the way?", "People, timing, or politics"],
  "scope.notes": ["Anything else worth noting?", "Side comments from the room"],
  "scope.openQuestions": ["What's still unanswered?", "And who will find out"],
  "scope.nextSteps": ["What happens next?", "Who does what, by when"],
};
for (const [k, [label, hint]] of Object.entries(COPY)) if (FIELDS[k]) { FIELDS[k].label = label; FIELDS[k].hint = hint || undefined; }

/* Examples for the tips that had none, so every tip shows a strong answer. */
const MORE_EXAMPLES = {
  "landscape.map": "Across: intimidating to welcoming. Up: commodity to specialist. Most rivals sit specialist but intimidating; the welcoming specialist corner is empty.",
  "positioning.ladder.expressive": "I care about doing things properly, without being a snob about it.",
  "character.archetype.primary": "Primary: the Everyman, warm and down to earth. Secondary: the Sage, it knows its craft.",
  "voice.flex": "Celebrating: 'You made it happen - thank you.' Sorry: 'We got this wrong. Here's the fix.' Selling: 'Fresh this week. Want in?'",
  "visual.territories": "Lean in: warm editorial, honest craft. Wince: luxury minimal, tech neon.",
  "visual.touchpoints": "1. Packaging  2. Website  3. Instagram",
  "scope.deliverables": "Full identity and packaging. Not in scope: naming or a website build.",
  "scope.notes": "The founder joked that the old logo 'looks like a dentist'. Everyone laughed, then agreed.",
  "scope.openQuestions": "Can we change the name on existing packaging stock? Sam to check with the printer by Friday.",
};
for (const [k, ex] of Object.entries(MORE_EXAMPLES)) if (FIELDS[k] && !FIELDS[k].example) FIELDS[k].example = ex;
