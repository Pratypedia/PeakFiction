import React from 'react';
import Poster from '../../components/Poster';
import TierBadge from '../../components/TierBadge';
import { storyHref } from '../../lib/router';
import { FAVOURITES } from './chartData';

// Horizontal bar list in one brother's colour. `max` is shared across both columns so lengths compare.
function BarList({ title, rows, max, personId, tierLabels = false }) {
  const total = rows.reduce((a, r) => a + r.count, 0);
  return (
    <figure className="charts-mini">
      <figcaption className="charts-mini__title">{title}</figcaption>
      <ul className="charts-hbars" aria-label={`${title}: ${rows.map(r => `${r.name} ${r.count}`).join(', ')}`}>
        {rows.map(r => (
          <li key={r.name} className="charts-hbars__row" aria-hidden="true">
            <span className="charts-hbars__label">
              {tierLabels ? <TierBadge rank={r.name} size="sm" title="" /> : r.name}
            </span>
            <span className="charts-hbars__track">
              {r.count > 0 && (
                <span className={`charts-hbars__bar charts-hbars__bar--${personId}`}
                  style={{ '--w': `${(r.count / max) * 100}%` }} />
              )}
            </span>
            <span className="charts-hbars__value v2-num">{r.count}</span>
          </li>
        ))}
      </ul>
      {total === 0 && <p className="charts-muted">Nothing rated yet.</p>}
    </figure>
  );
}

function Favourites({ personId, bySlug }) {
  return (
    <div className="charts-mini">
      <h4 className="charts-mini__title">Favourite characters</h4>
      <ul className="charts-favs">
        {FAVOURITES[personId].map(({ character, slug }) => {
          const story = bySlug[slug];
          const body = (
            <>
              <span className="charts-favs__art">
                {story ? <Poster story={story} className="charts-favs__img" /> : <span className="poster-fallback">{character}</span>}
              </span>
              <span className="charts-favs__name">{character}</span>
              {story && <span className="charts-favs__from">{story.name}</span>}
            </>
          );
          return (
            <li key={character}>
              {story ? <a className="charts-favs__card" href={storyHref(story)}>{body}</a> : <span className="charts-favs__card">{body}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Two columns, one per brother: favourite characters, then three bar lists.
export default function BrotherSplit({ stats, stories }) {
  const bySlug = Object.fromEntries(stories.map(s => [s.slug, s]));
  const maxOf = (key) => Math.max(1, ...stats.flatMap(s => s[key].map(r => r.count)));
  const max = { tiers: maxOf('tiers'), media: maxOf('media'), genres: maxOf('genres') };

  return (
    <div className="charts-split-cols">
      {stats.map(s => (
        <section key={s.person.id} className={`charts-person charts-person--${s.person.id}`} aria-labelledby={`person-${s.person.id}`}>
          <h3 id={`person-${s.person.id}`} className="charts-person__name">
            <span className={`v2-initial charts-initial--${s.person.id === 'pratyush' ? 'p' : 'k'}`} aria-hidden="true">{s.person.initial}</span>
            {s.person.name}
            <span className="charts-person__count v2-num">{s.rated} rated</span>
          </h3>
          <Favourites personId={s.person.id} bySlug={bySlug} />
          <BarList title="Rating distribution" rows={s.tiers} max={max.tiers} personId={s.person.id} tierLabels />
          <BarList title="Stories by medium" rows={s.media} max={max.media} personId={s.person.id} />
          <BarList title="Top 5 genres" rows={s.genres} max={max.genres} personId={s.person.id} />
        </section>
      ))}
    </div>
  );
}
