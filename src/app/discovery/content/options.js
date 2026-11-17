/* Design tokens (mirrored in discovery.css) */
export const BLUE = "#1B29F5";
export const INK = "#0B0B0C";
export const RULE = "#E4E4E1";
export const MID = "#8C8C88";
export const AMBER = "#B25E00";

/* v1 personality pairs - kept only so migrate.js can label dropped dials. */
export const V1_PERSONALITY = [
  ["Friendly", "Authoritative"], ["Playful", "Serious"], ["Youthful", "Mature"], ["Classic", "Contemporary"],
  ["Conventional", "Rebellious"], ["Soft", "Strong"], ["Simple", "Complex"], ["Understated", "Expressive"],
  ["Casual", "Refined"], ["Accessible", "Exclusive"], ["Economical", "Premium"], ["Corporate", "Crafted"],
];

/* 07 Character - six orthogonal personality axes */
export const CHARACTER = [
  ["Friendly", "Authoritative"],   // warmth / manner
  ["Playful", "Serious"],          // levity / mood
  ["Classic", "Contemporary"],     // aesthetic era
  ["Conventional", "Rebellious"],  // relationship to the rules
  ["Understated", "Expressive"],   // volume / emotional loudness
  ["Accessible", "Exclusive"],     // who's invited
];

/* 10 Visual - dials migrated from v1 personality */
export const VISUAL_DIALS = [
  ["Simple", "Complex"],
  ["Soft", "Strong"],
  ["Corporate", "Crafted"],
];

export const PRICE = ["Economical", "Premium"];

export const VOICE_DIMS = [
  ["Formal", "Casual"], ["Matter-of-fact", "Enthusiastic"],
  ["Respectful", "Irreverent"], ["Serious", "Funny"],
];

export const ARCHETYPES = [
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

export const VALUES = [
  "Craft", "Honesty", "Courage", "Precision", "Curiosity", "Generosity",
  "Independence", "Optimism", "Rigor", "Playfulness", "Sustainability", "Community",
  "Simplicity", "Innovation", "Heritage", "Transparency", "Ambition", "Care",
  "Speed", "Discipline", "Imagination", "Inclusivity", "Integrity", "Excellence",
];

export const TONE_WORDS = [
  "Confident", "Direct", "Warm", "Witty", "Poetic", "Technical",
  "Calm", "Bold", "Dry", "Generous", "Sharp", "Understated",
  "Charged", "Reassuring", "Provocative", "Precise", "Human", "Cinematic",
];

export const TERRITORIES = [
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

export const ENGAGEMENTS = ["Full identity", "Rebrand / refresh", "Strategy only", "Naming", "Campaign", "Packaging", "Digital product", "Spatial"];
export const MODELS = ["B2B", "B2C", "B2B2C", "DTC", "Marketplace", "SaaS", "Service", "Physical product", "Membership"];
export const STAGES = ["Pre-launch", "Early (0-2y)", "Growth", "Established", "Legacy / turnaround"];
export const BUDGETS = ["Under $10k", "$10-25k", "$25-50k", "$50-100k", "$100k+"];
export const THREATS = ["Low", "Medium", "High"];
export const DELIVERABLES = [
  "Brand strategy document", "Naming", "Logo & marks", "Type system", "Color system",
  "Art direction", "Photography direction", "Illustration system", "Motion principles",
  "Voice & messaging", "Brand guidelines", "Website design", "Social templates",
  "Packaging", "Pitch deck", "Launch campaign",
];
export const TOUCHPOINTS = ["Website", "Social", "Print", "Packaging", "Spatial", "Merch", "Events", "Product UI", "Email", "OOH"];

export const ASSET_TYPES = ["Logo", "Colour", "Shape", "Character", "Sound", "Tagline", "Pattern", "Packaging", "Other"];
export const CEP_STEMS = ["When…", "Where…", "Why…", "With whom…", "Feeling…"];

export const CLICHES = [
  "innovative", "passionate", "quality", "solutions", "world-class", "best-in-class", "cutting-edge",
  "seamless", "premium experience", "curated", "artisanal", "elevate", "unlock", "empower", "synergy",
  "game-changing", "next-level", "customer-centric", "authentic", "disruptive",
];
