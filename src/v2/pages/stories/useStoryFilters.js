// Filter / sort state for the All stories page, persisted to sessionStorage so the
// shelf looks the same when you come back from a story page.
import { useEffect, useMemo, useState } from 'react';
import { TIER_ORDER } from '../../../lib/tiers';
import { bestScore, bestTier, averageScore, disagreement } from '../../lib/storyMath';

const STORAGE_KEY = 'pf-v2-stories-filters';
export const DISAGREE_MIN = 2;

export const SORTS = [
  { id: 'best', label: 'Best rated' },
  { id: 'hours', label: 'Most hours' },
  { id: 'az', label: 'A–Z' },
];

export const DEFAULT_FILTERS = {
  query: '',
  tiers: [],
  media: [],
  genre: '',
  sort: 'best',
  disagree: false,
};

function loadFilters() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_FILTERS,
      ...saved,
      tiers: Array.isArray(saved.tiers) ? saved.tiers : [],
      media: Array.isArray(saved.media) ? saved.media : [],
      sort: SORTS.some(s => s.id === saved.sort) ? saved.sort : 'best',
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
const byBest = (a, b) =>
  (bestScore(b) ?? -1) - (bestScore(a) ?? -1) ||
  (averageScore(b) ?? -1) - (averageScore(a) ?? -1) ||
  byName(a, b);
const byHours = (a, b) => (b.hoursNum || 0) - (a.hoursNum || 0) || byName(a, b);
const byGap = (a, b) => disagreement(b) - disagreement(a) || byBest(a, b);

function matchesQuery(story, q) {
  if (!q) return true;
  return (
    story.name.toLowerCase().includes(q) ||
    story.medium.some(m => m.toLowerCase().includes(q)) ||
    story.genre.some(g => g.toLowerCase().includes(q)) ||
    (story.favoriteCharacters || '').toLowerCase().includes(q)
  );
}

/** Options that actually occur in the data, in a sensible order. */
export function useFilterOptions(stories) {
  return useMemo(() => {
    const tierSet = new Set(stories.map(bestTier));
    const tiers = TIER_ORDER.filter(t => tierSet.has(t));

    const count = key => {
      const counts = new Map();
      stories.forEach(s => s[key].forEach(v => counts.set(v, (counts.get(v) || 0) + 1)));
      return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    };
    return {
      tiers,
      media: count('medium').map(([value, n]) => ({ value, n })),
      genres: count('genre').map(([value, n]) => ({ value, n })),
    };
  }, [stories]);
}

export function useStoryFilters(stories) {
  const [filters, setFilters] = useState(loadFilters);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      /* private mode etc. */
    }
  }, [filters]);

  const update = patch => setFilters(f => ({ ...f, ...patch }));
  const toggleIn = (key, value) =>
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }));
  const reset = () => setFilters(DEFAULT_FILTERS);

  const activeCount =
    (filters.query.trim() ? 1 : 0) +
    filters.tiers.length +
    filters.media.length +
    (filters.genre ? 1 : 0) +
    (filters.disagree ? 1 : 0);

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = stories.filter(
      s =>
        matchesQuery(s, q) &&
        (!filters.tiers.length || filters.tiers.includes(bestTier(s))) &&
        (!filters.media.length || s.medium.some(m => filters.media.includes(m))) &&
        (!filters.genre || s.genre.includes(filters.genre)) &&
        (!filters.disagree || (disagreement(s) ?? 0) >= DISAGREE_MIN)
    );
    const sorter = filters.disagree ? byGap : filters.sort === 'hours' ? byHours : filters.sort === 'az' ? byName : byBest;
    return list.sort(sorter);
  }, [stories, filters]);

  // Tier groups only make sense for "Best rated" outside of the disagreement view.
  const groups = useMemo(() => {
    if (filters.disagree || filters.sort !== 'best') return null;
    const map = new Map();
    results.forEach(s => {
      const t = bestTier(s);
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(s);
    });
    return TIER_ORDER.filter(t => map.has(t)).map(tier => ({ tier, stories: map.get(tier) }));
  }, [results, filters.disagree, filters.sort]);

  return { filters, update, toggleIn, reset, activeCount, results, groups };
}
