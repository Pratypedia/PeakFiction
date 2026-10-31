// Single source of truth for tier ratings. Every view parses ranks through here.

// Ordered best to worst. `score` is the numeric value used by charts and sorting.
export const TIERS = [
  { key: 'Peak', score: 10 },
  { key: 'S', score: 9 },
  { key: 'A', score: 8 },
  { key: 'B', score: 7 },
  { key: 'C', score: 6 },
  { key: 'D', score: 5 },
  { key: 'E', score: 4 },
  { key: 'F', score: 3 },
];

export const PENDING = 'Pending';
export const TIER_KEYS = TIERS.map(t => t.key);
export const TIER_ORDER = [...TIER_KEYS, PENDING];

const MODIFIER_STEP = 0.33;
const BY_KEY = Object.fromEntries(TIERS.map(t => [t.key.toUpperCase(), t]));

// Values in the sheet that mean "not rated yet".
const EMPTY_VALUES = new Set(['', '-', 'UNSEEN', 'N/A', 'NA', 'PENDING']);

/**
 * Parse a raw rank string such as "S", "peak", "C+", "A-" or "Peak+".
 * Returns null for blank / unrated values and for anything unrecognised.
 */
export function parseRank(raw) {
  if (raw == null) return null;
  const clean = String(raw).trim().toUpperCase();
  if (EMPTY_VALUES.has(clean)) return null;

  const match = clean.match(/^(PEAK|[SABCDEF])\s*([+-]?)$/);
  if (!match) return null;

  const tier = BY_KEY[match[1]];
  const modifier = match[2];
  const offset = modifier === '+' ? MODIFIER_STEP : modifier === '-' ? -MODIFIER_STEP : 0;

  return {
    tier: tier.key,
    modifier,
    score: tier.score + offset,
    label: tier.key + modifier,
  };
}

/** Base tier key for a raw rank, or 'Pending'. Use for CSS classes and grouping. */
export function tierKey(raw) {
  return parseRank(raw)?.tier ?? PENDING;
}

/** Numeric score for a raw rank, or null when unrated. */
export function tierScore(raw) {
  return parseRank(raw)?.score ?? null;
}

/** Display label ("C+", "Peak") or the given fallback when unrated. */
export function tierLabel(raw, fallback = '-') {
  return parseRank(raw)?.label ?? fallback;
}

/** Nearest tier key for a numeric score (used for chart axes). */
export function tierForScore(score) {
  if (score == null) return '';
  const nearest = TIERS.reduce((best, t) =>
    Math.abs(t.score - score) < Math.abs(best.score - score) ? t : best
  );
  return nearest.key;
}

export const SCORE_MIN = TIERS[TIERS.length - 1].score;
export const SCORE_MAX = TIERS[0].score;
export const SCORE_TICKS = TIERS.map(t => t.score).reverse();
