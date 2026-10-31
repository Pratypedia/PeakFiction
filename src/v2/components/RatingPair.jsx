import React from 'react';
import TierBadge from './TierBadge';
import { PEOPLE } from '../lib/storyMath';
import { tierLabel } from '../../lib/tiers';

// Both brothers' ratings, each with an initial in their colour.
export default function RatingPair({ story, size = 'sm', layout = 'row', showNames = false }) {
  return (
    <div className={`v2-rating-pair v2-rating-pair--${layout}`}>
      {PEOPLE.map(person => (
        <span key={person.id} className={`v2-rating v2-rating--${person.id}`}
          title={`${person.name}: ${tierLabel(story[person.rankField], 'not rated yet')}`}>
          <span className="v2-initial" aria-hidden="true">{person.initial}</span>
          {showNames && <span className="v2-rating__name">{person.name}</span>}
          <span className="v2-visually-hidden">{person.name}</span>
          <TierBadge rank={story[person.rankField]} size={size} title="" />
        </span>
      ))}
    </div>
  );
}
