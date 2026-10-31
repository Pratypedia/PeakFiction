import React from 'react';
import Poster from '../../components/Poster';
import RatingPair from '../../components/RatingPair';
import { storyHref } from '../../lib/router';
import { fmt } from './chartData';

const gapWords = (g) => {
  const r = Math.round(g * 100) / 100;
  if (Math.abs(r - Math.round(r)) < 0.01) return `${Math.round(r)} ${Math.round(r) === 1 ? 'tier' : 'tiers'} apart`;
  return `${fmt(r, 1)} tiers apart`;
};

// The stories that split us most, widest gap first; each row links to the story page.
export default function Disagreements({ rows }) {
  return (
    <ol className="charts-splits">
      {rows.map(({ story, gap }) => (
        <li key={story.slug}>
          <a className="charts-split" href={storyHref(story)}>
            <span className="charts-split__thumb"><Poster story={story} className="charts-split__img" /></span>
            <span className="charts-split__body">
              <span className="charts-split__title">{story.name}</span>
              <span className="charts-split__meta">
                {story.medium.join(' · ')}
                {story.hoursNum ? <span className="v2-num"> · {story.hoursNum}h</span> : null}
              </span>
            </span>
            <span className="charts-split__ratings">
              <RatingPair story={story} size="sm" />
              <span className="charts-split__gap v2-num">{gapWords(gap)}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
