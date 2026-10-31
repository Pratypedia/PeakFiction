import React from 'react';
import Poster from './Poster';
import RatingPair from './RatingPair';
import { storyHref } from '../lib/router';

// Poster + title + ratings, linking to the story page.
export default function PosterCard({ story, size = 'md', showMeta = true }) {
  return (
    <a className={`v2-poster-card v2-poster-card--${size}`} href={storyHref(story)}>
      <div className="v2-poster-card__art">
        <Poster story={story} className="v2-poster-card__img" />
      </div>
      <div className="v2-poster-card__body">
        <h3 className="v2-poster-card__title">{story.name}</h3>
        {showMeta && (
          <p className="v2-poster-card__meta">
            {story.medium.join(' · ')}
            {story.hoursNum ? <span className="v2-num"> · {story.hoursNum}h</span> : null}
          </p>
        )}
        <RatingPair story={story} size="sm" />
      </div>
    </a>
  );
}
