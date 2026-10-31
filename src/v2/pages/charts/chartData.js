// Pure data derivations for the Charts page. Tier lists always come from src/lib/tiers.js.
import { consolidateMedium } from '../../../lib/stories';
import { tierScore, tierKey, TIER_KEYS, TIERS } from '../../../lib/tiers';
import { averageScore, bothRated, disagreement, PEOPLE } from '../../lib/storyMath';

/** Every broad medium group a story belongs to ("Comics", "Shows", ...), without repeats. */
export function storyGroups(story) {
  return [...new Set(story.medium.map(consolidateMedium))];
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

/* Length vs rating: one point per story with hours, for the chosen rating view. */
export const SCATTER_MODES = [
  { id: 'average', label: 'Average of both' },
  ...PEOPLE.map(p => ({ id: p.id, label: p.name, person: p })),
];

export function scatterPoints(stories, mode) {
  const person = PEOPLE.find(p => p.id === mode);
  return stories
    .filter(s => s.hoursNum > 0)
    .map(s => ({
      story: s,
      hours: s.hoursNum,
      score: person ? tierScore(s[person.rankField]) : averageScore(s),
      jitter: hashUnit(s.slug),
    }))
    .filter(p => p.score != null);
}

/* Agreement matrix: stories both brothers rated, keyed by `${pratyushTier}|${kanavTier}`. */
export function agreementCells(stories) {
  const both = stories.filter(bothRated);
  const cells = new Map();
  for (const s of both) {
    const key = `${tierKey(s.rankingPratyush)}|${tierKey(s.rankingKanav)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(s);
  }
  const max = Math.max(0, ...[...cells.values()].map(v => v.length));
  return { both, cells, max };
}

/* Biggest disagreements: the widest gaps; if more than `limit` stories tie for the top gap, show them all (up to tieLimit). */
export function biggestDisagreements(stories, limit = 5, tieLimit = 8) {
  const rows = stories
    .filter(bothRated)
    .map(s => ({ story: s, gap: disagreement(s) }))
    .filter(r => r.gap > 0)
    .sort((a, b) => b.gap - a.gap || (b.story.hoursNum || 0) - (a.story.hoursNum || 0));
  if (!rows.length) return [];
  const tied = rows.filter(r => Math.abs(r.gap - rows[0].gap) < 1e-9);
  return tied.length > limit ? tied.slice(0, tieLimit) : rows.slice(0, limit);
}

/* Leaderboards: average rating (mean of whichever ratings exist) by genre and by medium group. */
function averageBy(stories, keysOf, minCount) {
  const stats = new Map();
  for (const s of stories) {
    const avg = averageScore(s);
    if (avg == null) continue;
    for (const k of keysOf(s)) {
      const row = stats.get(k) || { name: k, sum: 0, count: 0 };
      row.sum += avg;
      row.count += 1;
      stats.set(k, row);
    }
  }
  return [...stats.values()]
    .filter(r => r.count >= minCount)
    .map(r => ({ name: r.name, avg: r.sum / r.count, count: r.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count);
}

export function leaderboards(stories, top = 3) {
  return {
    genres: averageBy(stories, s => s.genre, 2).slice(0, top),
    formats: averageBy(stories, storyGroups, 1).slice(0, top),
  };
}

/* Per-brother counts: ratings per tier, stories per medium group, top genres. */
export function brotherStats(stories, person, topGenres = 5) {
  const rated = stories.filter(s => tierScore(s[person.rankField]) != null);
  const count = (keysOf) => {
    const m = new Map();
    for (const s of rated) for (const k of keysOf(s)) m.set(k, (m.get(k) || 0) + 1);
    return [...m.entries()].map(([name, n]) => ({ name, count: n })).sort((a, b) => b.count - a.count);
  };
  return {
    person,
    rated: rated.length,
    tiers: TIER_KEYS.map(k => ({ name: k, count: rated.filter(s => tierKey(s[person.rankField]) === k).length })),
    media: count(storyGroups),
    genres: count(s => s.genre).slice(0, topGenres),
  };
}

/* Hand-picked favourite characters; the poster comes from the story (by slug). */
export const FAVOURITES = {
  pratyush: [
    { character: 'Arthur Leywin', slug: 'the-beginning-after-the-end' },
    { character: 'Kim Dokja', slug: 'omniscient-readers-viewpoint' },
    { character: 'Spider-Man', slug: 'marvel-cinematic-universe' },
  ],
  kanav: [
    { character: 'Regis', slug: 'the-beginning-after-the-end' },
    { character: 'Reiner', slug: 'attack-on-titan' },
    { character: 'Levi', slug: 'attack-on-titan' },
  ],
};
