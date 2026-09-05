/**
 * Factory paint data for the 2003–2006 Subaru Baja.
 *
 * Subaru never sold the Baja a single colour — it sold a *combination*, where an
 * order code such as 2Z3 pairs a body paint with a cladding paint. The hex values
 * below are close visual approximations only; no public source publishes RGB for
 * these codes, so the paint code is the authoritative reference for matching.
 *
 * Sources: ImportArchive paint-code archive, AutoPadre year-by-year lineups.
 */

export const PAINT = {
  '23Y': { name: 'Baja Yellow', hex: '#D9A227' },
  '18X': { name: 'Regatta Red Pearl', hex: '#9A1B21' },
  '17X': { name: 'Mystic Blue Pearl', hex: '#35506F' },
  '54A': { name: 'Black Granite Pearl', hex: '#1B1D1F' },
  '19X': { name: 'Silver Stone Metallic', hex: '#A8A69F' },
  '35Y': { name: 'Monterey Silver Metallic', hex: '#8E9296' },
  '36Y': { name: 'Onyx Metallic', hex: '#3A3D40' },
  '39D': { name: 'Brilliant Silver Metallic', hex: '#B9BDC0' },
  '32J': { name: 'Obsidian Black Pearl', hex: '#131417' },
  '33J': { name: 'Garnet Red Pearl', hex: '#6E1420' },
  '35J': { name: 'Regal Blue Pearl', hex: '#1E2C4F' },
  '33A': { name: 'Atlantic Blue Pearl', hex: '#2A4C7A' },
  '37J': { name: 'Satin White Pearl', hex: '#EDEDE8' },
  '01X': { name: 'White Frost', hex: '#E8E8E4' },
  '37F': { name: 'Brilliant Silver Metallic', hex: '#B4B8BB' },
};

/** body + cladding pairs, in the order they were introduced */
export const COMBINATIONS = [
  {
    id: 'baja-yellow-silverstone', body: '23Y', cladding: '19X',
    order: '2Z3', years: [2003, 2004],
    note: 'The signature Baja colour and the one most people picture. Yellow over grey was offered both launch years.',
  },
  {
    id: 'regatta-red-silverstone', body: '18X', cladding: '19X',
    order: '2Z8', years: [2003, 2004],
    note: 'The launch red — often misremembered as “Sedona Red”, which the Baja never wore.',
  },
  {
    id: 'black-granite-silverstone', body: '54A', cladding: '19X',
    order: '2Z5', years: [2003, 2004],
    note: 'Near-black pearl over light grey cladding — the highest-contrast pairing Subaru offered.',
  },
  {
    id: 'mystic-blue-silverstone', body: '17X', cladding: '19X',
    order: '17X + 19X', years: [2003],
    note: "The 2003 Sport's blue. For 2004 the same paint returned as a monotone car instead.",
  },
  {
    id: 'silverstone-mono', body: '19X', cladding: '19X',
    order: '19X', years: [2003],
    note: "The only 2003 combination that wasn't two-tone — cladding paint over the whole truck.",
  },
  {
    id: 'monterey-silverstone', body: '35Y', cladding: '19X',
    order: '3X2', years: [2004],
    note: 'Silver on silver, a half-step darker on the body than the cladding beneath it.',
  },
  {
    id: 'mystic-blue-mono', body: '17X', cladding: '17X',
    order: '17X', years: [2004],
    note: 'The first sign of the retreat: a colour that had been two-tone in 2003 came back monotone.',
  },
  {
    id: 'white-frost-silverstone', body: '01X', cladding: '19X',
    order: '3Z9', years: [2004],
    note: 'Documented in the factory paint-code archive but absent from the common 2004 lineup listings.',
  },
  {
    id: 'black-granite-onyx', body: '54A', cladding: '36Y',
    order: '3X3', years: [2004],
    note: 'A dark-on-dark alternative to the Silver Stone pairing; also archive-only for 2004.',
  },
  {
    id: 'monterey-brilliant', body: '35Y', cladding: '39D',
    order: '3V4 / 4V4', years: [2005],
    note: 'Two order codes, one look. Brilliant Silver existed in two formulations (37F and 39D), so the same visual pairing was catalogued twice.',
  },
  {
    id: 'obsidian-onyx', body: '32J', cladding: '36Y',
    order: '4V7', years: [2005],
    note: 'The last true two-tone the Baja was sold with.',
  },
  {
    id: 'satin-white-brilliant', body: '37J', cladding: '39D',
    order: '4V8', years: [2005],
    note: 'White pearl over silver cladding — the softest contrast of any two-tone in the run.',
  },
  {
    id: 'garnet-red-mono', body: '33J', cladding: '33J',
    order: '33J', years: [2005],
    note: 'Replaced Regatta Red, and dropped the contrasting cladding with it.',
  },
  {
    id: 'regal-blue-mono', body: '35J', cladding: '35J',
    order: '35J', years: [2005],
    note: 'A darker navy than Mystic Blue, offered for 2005 only.',
  },
  {
    id: 'atlantic-blue-mono', body: '33A', cladding: '33A',
    order: '33A', years: [2005, 2006],
    note: "One of just three colours that survived into the Baja's final year.",
  },
  {
    id: 'brilliant-silver-mono', body: '39D', cladding: '39D',
    order: '39D', years: [2005, 2006],
    note: "The cladding colour of 2005's two-tones, sold on its own as a monotone car.",
  },
  {
    id: 'obsidian-mono', body: '32J', cladding: '32J',
    order: '32J', years: [2006],
    note: 'For 2006 Obsidian Black lost its Onyx cladding and went single-tone.',
  },
].map((c) => ({
  ...c,
  twoTone: c.body !== c.cladding,
  // the turbo arrived for 2004, so 2003-only combinations cannot wear the scoop
  turbo: c.years.some((y) => y >= 2004),
}));

export const MODEL_YEARS = [2003, 2004, 2005, 2006];

/**
 * Subaru's own colour names state the finish, so the name is the source of truth
 * for how much flake the paint should carry.
 */
export function finishOf(paintName) {
  if (/Metallic$/.test(paintName)) return 'metallic';
  if (/Pearl$/.test(paintName)) return 'pearl';
  return 'solid';
}

/**
 * Shader parameters per finish. Metalness is deliberately kept low-ish: in a PBR
 * renderer a metal's base colour becomes its *specular tint*, so pushing it too
 * far turns yellow into gold. Flake depth comes from envIntensity and roughness.
 */
export const FINISH = {
  solid: { metalness: 0.04, roughness: 0.38, clearcoatRoughness: 0.04, envIntensity: 1.15 },
  pearl: { metalness: 0.46, roughness: 0.21, clearcoatRoughness: 0.026, envIntensity: 1.85 },
  metallic: { metalness: 0.88, roughness: 0.15, clearcoatRoughness: 0.02, envIntensity: 2.4 },
};

export const FINISH_LABELS = { solid: 'Solid', pearl: 'Pearl', metallic: 'Metallic' };

/** Resolve a factory combination into the flat shape the 3D scene consumes. */
export function resolveCombination(combo) {
  const body = PAINT[combo.body];
  const cladding = PAINT[combo.cladding];
  return {
    bodyHex: body.hex,
    claddingHex: cladding.hex,
    bodyFinish: finishOf(body.name),
    claddingFinish: finishOf(cladding.name),
  };
}
