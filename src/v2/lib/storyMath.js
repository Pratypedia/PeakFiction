// Small derived values used across the redesign's pages.
import { tierScore, tierKey, PENDING } from '../../lib/tiers';

export const PEOPLE = [
  { id: 'pratyush', name: 'Pratyush', initial: 'P', rankField: 'rankingPratyush', commentField: 'commentsPratyush' },
  { id: 'kanav', name: 'Kanav', initial: 'K', rankField: 'rankingKanav', commentField: 'commentsKanav' },
];

/** Highest of the two scores, or null if neither brother rated it. */
export function bestScore(story) {
  const scores = [tierScore(story.rankingPratyush), tierScore(story.rankingKanav)].filter(s => s !== null);
  return scores.length ? Math.max(...scores) : null;
}

/** Tier key of the better rating ('Pending' if unrated). Used for grouping. */
export function bestTier(story) {
  const p = tierScore(story.rankingPratyush) ?? -1;
  const k = tierScore(story.rankingKanav) ?? -1;
  if (p < 0 && k < 0) return PENDING;
  return tierKey(p >= k ? story.rankingPratyush : story.rankingKanav);
}

/** Mean of the available scores, or null. */
export function averageScore(story) {
  const scores = [tierScore(story.rankingPratyush), tierScore(story.rankingKanav)].filter(s => s !== null);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

export function bothRated(story) {
  return tierScore(story.rankingPratyush) !== null && tierScore(story.rankingKanav) !== null;
}

/** Absolute gap in tier points between the brothers (null unless both rated). 1 point = 1 tier. */
export function disagreement(story) {
  if (!bothRated(story)) return null;
  return Math.abs(tierScore(story.rankingPratyush) - tierScore(story.rankingKanav));
}

export function totalHours(list) {
  return list.reduce((sum, s) => sum + (s.hoursNum || 0), 0);
}
