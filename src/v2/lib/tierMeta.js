// Display metadata for tiers in the redesign. Descriptions come from the brothers' own rubric.
import { TIER_KEYS, PENDING, tierKey } from '../../lib/tiers';

export const TIER_META = {
  Peak: { name: 'Peak', blurb: "I love this story. I'll talk about it for hours and pitch it to you." },
  S: { name: 'S tier', blurb: 'Exceptional story. Outstanding execution and storytelling.' },
  A: { name: 'A tier', blurb: "Really fun. Minor issues that don't distract, but not truly mind-blowing." },
  B: { name: 'B tier', blurb: 'Kinda enjoyed it, with obvious room for improvement in parts.' },
  C: { name: 'C tier', blurb: 'Average, or mixed feelings.' },
  D: { name: 'D tier', blurb: 'Below average.' },
  L: { name: 'L tier', blurb: "Took an L on this one. Don't recommend." },
  [PENDING]: { name: 'Not rated yet', blurb: 'On the list, waiting for a verdict.' },
};

export const TIERS_WITH_PENDING = [...TIER_KEYS, PENDING];

/** CSS custom property names for a raw rank or tier key. */
export function tierVars(rankOrKey) {
  const key = TIERS_WITH_PENDING.includes(rankOrKey) ? rankOrKey : tierKey(rankOrKey);
  const slug = key.toLowerCase();
  return { color: `var(--tier-${slug})`, wash: `var(--tier-${slug}-wash)`, key };
}
