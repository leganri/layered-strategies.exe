/* Tester: a fully answered session, so the generated brief can be seen complete.
   Every question is answered, every slider is set, and every option comes from the app's own lists. */
export const SAMPLE = {
  meta: { version: 2, confidence: {}, timeSpent: {} },

  setup: {
    client: "Hearth & Grain",
    project: "Hearth rebrand",
    date: "2026-11-17",
    facilitator: "Sam Lee",
    sector: "Specialty bakery",
    attendees: "Ana Reyes (founder), Raj Patel (operations), Mei Tanaka (marketing), Tom Okafor (head baker)",
    engagement: ["Rebrand / refresh", "Packaging"],
    decider: "Ana Reyes",
    approvers: "Raj Patel, who signs off anything that touches the wholesale contracts",
    input: "Two long-standing café customers, and the morning shift at the Mill Road shop",
  },

  business: {
    scq: {
      situation: "We bake slow-fermented bread for 40 neighbourhood cafés and run two shops of our own. The bread has a loyal following, and the cafés that stock it sell out most mornings.",
      complication: "Supermarket 'artisan' ranges now copy our look at half the price, and because cafés rarely name their bakery, most people who love our bread have no idea who makes it.",
      question: "How do we make Hearth the bread people ask for by name, without losing the cafés that carry us?",
    },
    oneLiner: "We bake slow-fermented bread for neighbourhood cafés and our own two shops.",
    model: ["B2B", "B2C", "Physical product"],
    stage: "Growth",
    revenue: "Wholesale to 40 cafés brings in about 60% of revenue on thin margins. The two shops bring in the rest and carry most of the profit, mainly through loaves, pastries and weekend pre-orders.",
    ambition: "Five shops by 2029, wholesale to 80 cafés, and a name people recognise on a café counter before they taste anything.",
    metrics: "Shop footfall and repeat visits, the number of cafés that name us on their menus, and weekend pre-orders.",
  },

  audience: {
    segments: [
      {
        id: "s1", name: "The weekend ritualist", primary: true,
        desc: "Late twenties to forties, lives nearby, works hard all week. Saturday morning is protected time: a walk, the market, coffee, and a good loaf to take home.",
        job: "When the weekend starts, they want a small ritual that feels earned, so they can feel they live well, not just get by.",
        push: "Supermarket bread tastes of nothing and goes stale in a day; it makes breakfast feel like an afterthought.",
        pull: "A loaf with a story they can retell, made a few streets away, that still tastes good on Monday.",
        anxiety: "Is it really worth twice the price, and will the shop still have any left by the time they get there?",
        habit: "The big weekly shop already covers bread, and it is one less stop on a busy morning.",
        identity: "I'm someone who knows good food and supports the people who make it.",
      },
      {
        id: "s2", name: "The café owner", primary: false,
        desc: "Runs one or two independent cafés. Competes on quality and atmosphere, not price, and is wary of anything that makes their counter look like a chain.",
        job: "When they plan the counter each morning, they want bread customers comment on, so they can charge a little more and keep regulars coming back.",
        push: "Cheaper wholesale bread gets left on plates and makes their sandwiches forgettable.",
        pull: "Bread that sells itself and lets them say they work with a local baker.",
        anxiety: "If Hearth becomes famous on its own, will customers skip the café and go straight to the shop?",
        habit: "Their current supplier delivers at 6am, every day, without fail.",
        identity: "I run a place that cares about what it serves.",
      },
    ],
    ceps: [
      { id: "c1", text: "Saturday breakfast at home", star: true },
      { id: "c2", text: "Hosting friends for lunch", star: true },
      { id: "c3", text: "Picking up a sandwich at the café on the way to work", star: true },
      { id: "c4", text: "Bringing something good to a dinner party", star: false },
      { id: "c5", text: "Treating themselves after a long week", star: false },
    ],
    insight: "People don't buy bread, they buy the start of a good day. The loaf is the excuse for the ritual.",
    notFor: "Bargain hunters who want the cheapest loaf, and anyone who needs bread delivered by the van-load overnight.",
  },

  landscape: {
    competitors: [
      { id: "k1", name: "Supermarket 'artisan' ranges", threat: "High", strength: "Everywhere, open late, and half our price. Their packaging now borrows our kraft-paper look.", weakness: "Tastes industrial and goes stale fast; nobody can name who bakes it.", x: 18, y: 28 },
      { id: "k2", name: "Larkspur Bakery Co.", threat: "Medium", strength: "Six beautiful shops and a strong Instagram presence.", weakness: "Feels generic and expensive; the bread is fine but the brand is the product.", x: 55, y: 35 },
      { id: "k3", name: "Market-stall bakers", threat: "Low", strength: "Genuinely crafted, with real people behind the stall.", weakness: "Only there on Saturdays, hard to find, and they sell out by ten.", x: 82, y: 70 },
    ],
    map: { x: ["Mass-made", "Crafted"], y: ["Cold", "Warm"], us: { x: 78, y: 62 }, target: { x: 86, y: 86 } },
    enemy: "Bread as an afterthought: the idea that a loaf is just something to put things on.",
    gap: "Warm, genuinely crafted, and easy to find every day of the week. Nobody owns all three at once.",
    conventions: {
      keep: "Kraft paper, visible crust, the bakers' early hours, and a short daily menu.",
      break: "Rustic clichés: wheat-sheaf icons, chalkboard fonts, and 'artisan' as a selling point.",
    },
  },

  perception: {
    now: ["good", "small", "hidden"],
    future: ["warm", "crafted", "everywhere"],
    misread: "That we're expensive for no reason. People see the price before they hear about the 48-hour ferment.",
    feelings: "Proud of the bread, embarrassed by the logo, and a little frustrated that the cafés get the credit.",
    assets: [
      { id: "a1", name: "The orange shop door", type: "Colour", fame: 3, unique: 4 },
      { id: "a2", name: "The flour-dusted paper bag", type: "Packaging", fame: 4, unique: 2 },
      { id: "a3", name: "The hand-drawn hearth logo", type: "Logo", fame: 2, unique: 3 },
    ],
  },

  purpose: {
    why: "Good bread makes ordinary days better.",
    ladder: "Because a better breakfast changes the tone of a morning, and a morning that starts slowly changes how people treat each other for the rest of the day. Slowing down is how we notice life.",
    values: [
      { name: "Craft", cost: "We turn down rush orders rather than shorten the ferment." },
      { name: "Honesty", cost: "We print our prices and our ingredients in plain sight, even when it invites comparison." },
      { name: "Community", cost: "We keep a pay-what-you-can shelf at both shops, which costs us real money every week." },
    ],
    antiValue: "We will never sell yesterday's bread as today's, and we will never cut the ferment to meet demand.",
  },

  positioning: {
    category: "neighbourhood bakery",
    difference: "ferments every loaf for 48 hours",
    audience: "people who make the weekend a ritual",
    connector: "in",
    context: "the cafés and streets they already walk",
    price: 6,
    ladder: {
      functional: "Bread that tastes properly of something and stays fresh for days.",
      emotional: "A calm, proud start to the day.",
      expressive: "I care about doing things properly, and I support the people who do.",
    },
    rtbs: [
      { text: "Every loaf ferments for 48 hours, with no shortcuts.", rival: false },
      { text: "All our flour comes from one farm, 30 miles away, that we've worked with for nine years.", rival: false },
      { text: "Baked before dawn, every day.", rival: true },
    ],
    proof: "Voted the city's best bakery two years running; 40 cafés stock us and 31 of them have done so for more than three years.",
    promise: "The best part of your morning.",
  },

  character: {
    sliders: [2, 3, 3, 5, 3, 2],
    archetype: { primary: "Everyperson", secondary: "Creator", notes: "Ana started Hearth to feed her street, and the craft is the proof that it matters. Warm and unpretentious first, skilled second." },
    tension: "Warm but exacting: easy to talk to, impossible to rush.",
  },

  voice: {
    sliders: [6, 3, 4, 5],
    toneWords: ["Warm", "Direct", "Dry"],
    say: "Fresh, proper, ours, baked this morning, from Mill Road.",
    neverSay: "Artisan, curated, elevated, handcrafted with love.",
    flex: {
      celebrate: "You made it happen. Thank you, from all of us at the ovens.",
      sorry: "We got this wrong. Here's what happened, and here's the fix.",
      sell: "Fresh this week: the seeded rye is back. Want one put aside?",
    },
  },

  idea: {
    checks: [true, true, true, true, true],
    answer: "Make Hearth the warm, everyday ritual bread, and put our name on every café counter that serves it.",
    trueline: "Bread worth waking up for.",
    essence: "Worth the wait",
  },

  visual: {
    territories: { in: ["Craft / Analog", "Editorial / Print"], out: ["Quiet luxury", "Tech-minimal"] },
    dials: [3, 6, 7],
    avoid: "Wheat-sheaf icons, chalkboard lettering, and anything that looks like a supermarket's idea of 'artisan'.",
    references: "Aesop for restraint, Patagonia for honesty, and old bakery shopfronts for warmth.",
    mandatories: "Keep the orange door, and the Hearth name must stay legible on a small café sticker.",
    touchpoints: ["Packaging", "Print", "Social", "Website"],
  },

  scope: {
    deliverables: ["Brand strategy document", "Logo & marks", "Color system", "Packaging", "Voice & messaging", "Brand guidelines"],
    timeline: "Strategy signed off by January; new identity in both shops and on café stickers by the end of March.",
    budget: "$25-50k",
    risks: "Ana may resist retiring the hand-drawn logo, and cafés may push back if the new packaging makes Hearth louder than their own brand.",
    notes: "Everyone laughed when Tom said the old logo 'looks like a dentist'. Then everyone agreed.",
    openQuestions: "Can we reprint the existing bag stock, or do we run it down first? Raj to check with the printer by Friday.",
    nextSteps: "Sam sends the brief on Friday; Ana and Raj review it with two café owners the following week.",
  },
};
