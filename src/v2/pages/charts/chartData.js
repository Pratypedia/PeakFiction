// Pure data derivations for the Charts page. Every headline is computed here, never hard-coded.
import { consolidateMedium } from '../../../lib/stories';
import { tierScore, tierKey, TIER_KEYS, TIERS } from '../../../lib/tiers';
import { averageScore, bothRated, disagreement, totalHours, PEOPLE } from '../../lib/storyMath';

export const GROUP_ORDER = ['Shows', 'Comics', 'Movies', 'Books + Novels', 'Games', 'Other'];

/** Broad medium bucket from the story's first (primary) medium. */
export function storyGroup(story) {
  return consolidateMedium(story.medium[0] || '');
}

/** Deterministic value in [-0.5, 0.5) from a string (FNV-1a). Used for jitter. */
export function hashUnit(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000 - 0.5;
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** "B+", "A", "S-" for a numeric score: nearest tier step, modifiers at ±0.33. */
export function scoreLabel(score) {
  if (score == null) return '–';
  let best = null;
  for (const t of TIERS) {
    for (const [mod, off] of [['', 0], ['+', 0.33], ['-', -0.33]]) {
      const d = Math.abs(t.score + off - score);
      if (!best || d < best.d) best = { d, label: t.key + mod };
    }
  }
  return best.label;
}

export const fmt = (n, digits = 0) =>
  n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });

/* 1. Hours */
export function hoursSummary(stories) {
  const total = totalHours(stories);
  const byGroup = new Map();
  for (const s of stories) {
    const g = storyGroup(s);
    const row = byGroup.get(g) || { group: g, hours: 0, count: 0, top: null };
    row.hours += s.hoursNum || 0;
    row.count += 1;
    if (!row.top || (s.hoursNum || 0) > (row.top.hoursNum || 0)) row.top = s;
    byGroup.set(g, row);
  }
  const groups = [...byGroup.values()].sort((a, b) => b.hours - a.hours);
  const longest = [...stories].sort((a, b) => (b.hoursNum || 0) - (a.hoursNum || 0))[0];
  return {
    total,
    workWeeks: total / 40,
    workYears: total / (40 * 48),
    days: total / 24,
    groups,
    longest,
    count: stories.length,
  };
}

/* 2. Length vs rating */
export const LENGTH_BUCKETS = [
  { id: 'short', label: 'Under 10 hours', min: 0, max: 10 },
  { id: 'mid', label: '10 to 100 hours', min: 10, max: 100 },
  { id: 'long', label: 'Over 100 hours', min: 100, max: Infinity },
];

export function lengthVsRating(stories) {
  const points = stories
    .filter(s => s.hoursNum > 0 && averageScore(s) != null)
    .map(s => ({
      story: s,
      hours: s.hoursNum,
      score: averageScore(s),
      jitter: hashUnit(s.slug),
      group: storyGroup(s),
    }));
  const buckets = LENGTH_BUCKETS.map(b => {
    const inB = points.filter(p => p.hours >= b.min && p.hours < b.max);
    return { ...b, count: inB.length, mean: mean(inB.map(p => p.score)) };
  });
  const short = buckets[0].mean;
  const long = buckets[2].mean;
  const diff = long - short;
  const mid = buckets[1].mean;
  let headline;
  if (mid != null && mid - Math.max(short, long) >= 0.3) headline = 'The sweet spot is somewhere between 10 and 100 hours';
  else if (Math.abs(diff) < 0.3) headline = 'A longer story isn’t a better one';
  else if (diff > 0) headline = diff >= 0.75 ? 'The long ones really do score higher' : 'The long ones score a little higher';
  else headline = diff <= -0.75 ? 'Shorter stories score clearly higher' : 'Shorter stories score a little higher';
  return { points, buckets, diff, headline };
}

/* 3. Agreement matrix */
export function agreement(stories) {
  const both = stories.filter(bothRated);
  const cells = new Map(); // `${p}|${k}` -> stories
  for (const s of both) {
    const key = `${tierKey(s.rankingPratyush)}|${tierKey(s.rankingKanav)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(s);
  }
  const gaps = both.map(disagreement);
  const exact = both.filter(s => tierKey(s.rankingPratyush) === tierKey(s.rankingKanav)).length;
  const withinOne = gaps.filter(g => g <= 1 + 1e-9).length;
  const pHigher = both.filter(s => tierScore(s.rankingPratyush) > tierScore(s.rankingKanav)).length;
  const kHigher = both.filter(s => tierScore(s.rankingKanav) > tierScore(s.rankingPratyush)).length;
  const max = Math.max(0, ...[...cells.values()].map(v => v.length));
  return {
    both,
    cells,
    max,
    exact,
    withinOne,
    withinOneRate: both.length ? withinOne / both.length : 0,
    exactRate: both.length ? exact / both.length : 0,
    pHigher,
    kHigher,
  };
}

/* 4. Distributions */
export function distributions(stories) {
  return PEOPLE.map(person => {
    const rated = stories.filter(s => tierScore(s[person.rankField]) != null);
    const counts = TIER_KEYS.map(k => rated.filter(s => tierKey(s[person.rankField]) === k).length);
    const avg = mean(rated.map(s => tierScore(s[person.rankField])));
    const topShare = rated.length ? (counts[0] + counts[1]) / rated.length : 0; // Peak + S
    return { person, rated: rated.length, counts, shares: counts.map(c => (rated.length ? c / rated.length : 0)), avg, topShare };
  });
}

/* 5. Disagreements */
export function biggestDisagreements(stories, limit = 5, tieLimit = 8) {
  const rows = stories
    .filter(bothRated)
    .map(s => ({ story: s, gap: disagreement(s) }))
    .sort((a, b) => b.gap - a.gap || (b.story.hoursNum || 0) - (a.story.hoursNum || 0));
  if (!rows.length) return { rows: [], maxGap: 0 };
  const maxGap = rows[0].gap;
  const tied = rows.filter(r => Math.abs(r.gap - maxGap) < 1e-9);
  // If the top gap is shared, show every tied story (up to tieLimit) rather than an arbitrary five.
  const shown = tied.length > limit ? tied.slice(0, tieLimit) : rows.slice(0, limit);
  return { rows: shown, maxGap, tiedCount: tied.length };
}

/* 6. Genres */
export function genreBoard(stories, minStories = 3) {
  const byGenre = new Map();
  for (const s of stories) {
    for (const g of s.genre) {
      if (!byGenre.has(g)) byGenre.set(g, []);
      byGenre.get(g).push(s);
    }
  }
  const rows = [];
  for (const [genre, list] of byGenre) {
    const scored = list.filter(s => averageScore(s) != null);
    if (scored.length < minStories) continue;
    const per = Object.fromEntries(PEOPLE.map(p => {
      const sc = list.map(s => tierScore(s[p.rankField])).filter(v => v != null);
      return [p.id, { avg: mean(sc), n: sc.length }];
    }));
    rows.push({ genre, count: scored.length, avg: mean(scored.map(averageScore)), ...per });
  }
  rows.sort((a, b) => b.avg - a.avg);
  return rows;
}
