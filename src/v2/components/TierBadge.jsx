import React from 'react';
import { parseRank } from '../../lib/tiers';
import { tierVars } from '../lib/tierMeta';

// Ink stamp showing a tier ("Peak", "S", "C+"). Unrated renders a dashed "–".
export default function TierBadge({ rank, size = 'md', title }) {
  const parsed = parseRank(rank);
  const { color, wash, key } = tierVars(parsed ? parsed.tier : 'Pending');
  return (
    <span
      className={`v2-tier v2-tier--${size} ${parsed ? '' : 'v2-tier--pending'} ${key === 'Peak' ? 'v2-tier--peak' : ''}`}
      style={{ '--tier-color': color, '--tier-wash': wash }}
      title={title ?? (parsed ? `${parsed.label} tier` : 'Not rated yet')}
    >
      {parsed ? parsed.label : '–'}
    </span>
  );
}
