import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PosterCard from '../components/PosterCard';
import TierBadge from '../components/TierBadge';
import { TIER_META, tierVars } from '../lib/tierMeta';
import { totalHours, disagreement } from '../lib/storyMath';
import { tierLabel } from '../../lib/tiers';
import FilterToolbar from './stories/FilterToolbar';
import { useFilterOptions, useStoryFilters, DISAGREE_MIN } from './stories/useStoryFilters';
import './StoriesPage.css';

const fmt = n => Math.round(n).toLocaleString('en-US');

function formatGap(gap) {
  const whole = Math.round(gap);
  const label = Math.abs(gap - whole) < 0.05 ? String(whole) : `~${whole}`;
  return `${label} tier${whole === 1 ? '' : 's'} apart`;
}

function Grid({ stories, showGap }) {
  return (
    <ul className="pf-stories-grid" role="list">
      {stories.map(story => (
        <li key={story.slug} className="pf-stories-grid__item">
          {showGap && (
            <p className="pf-stories-gap v2-num" title={`Pratyush ${tierLabel(story.rankingPratyush)}, Kanav ${tierLabel(story.rankingKanav)}`}>
              {formatGap(disagreement(story))}
            </p>
          )}
          <PosterCard story={story} />
        </li>
      ))}
    </ul>
  );
}

function TierSection({ tier, stories }) {
  const meta = TIER_META[tier];
  const { color } = tierVars(tier);
  const headingId = `pf-tier-${tier.toLowerCase()}`;
  return (
    <section className="pf-stories-tier" aria-labelledby={headingId} style={{ '--section-tier': color }}>
      <header className="pf-stories-tier__head">
        <TierBadge rank={tier === 'Pending' ? '' : tier} size="lg" title="" />
        <div className="pf-stories-tier__text">
          <h2 className="pf-stories-tier__name" id={headingId}>{meta.name}</h2>
          <p className="pf-stories-tier__blurb">{meta.blurb}</p>
        </div>
        <p className="pf-stories-tier__count v2-num">
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </p>
      </header>
      <Grid stories={stories} />
    </section>
  );
}

export default function StoriesPage({ stories = [] }) {
  const options = useFilterOptions(stories);
  const { filters, update, toggleIn, reset, activeCount, results, groups } = useStoryFilters(stories);
  const hours = useMemo(() => totalHours(stories), [stories]);

  return (
    <div className="pf-stories">
      <PageHeader
        eyebrow="The whole shelf"
        title={<>All <span className="v2-italic">stories</span></>}
        lede={`${fmt(stories.length)} stories, ${fmt(hours)} hours, rated by two brothers who rarely agree.`}
      />

      <FilterToolbar
        options={options}
        filters={filters}
        update={update}
        toggleIn={toggleIn}
        reset={reset}
        activeCount={activeCount}
        resultCount={results.length}
        total={stories.length}
      />

      <div className="v2-container pf-stories-body">
        {filters.disagree && results.length > 0 && (
          <p className="pf-stories-intro">
            Stories where <span className="pf-who pf-who--pratyush">Pratyush</span> and{' '}
            <span className="pf-who pf-who--kanav">Kanav</span> sit {DISAGREE_MIN} or more tiers apart,
            biggest arguments first.
          </p>
        )}

        {results.length === 0 ? (
          <div className="pf-stories-empty">
            <p className="pf-stories-empty__title">Nothing on the shelf matches that.</p>
            <p className="pf-stories-empty__text">
              {filters.disagree && activeCount === 1
                ? 'Turns out we agree on everything that fits those filters. Rare, but it happens.'
                : 'Try a looser search, or clear the filters and browse the whole shelf.'}
            </p>
            <button type="button" className="v2-button" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" /> Reset filters
            </button>
          </div>
        ) : groups ? (
          groups.map(g => <TierSection key={g.tier} tier={g.tier} stories={g.stories} />)
        ) : (
          <section aria-label="Results">
            <Grid stories={results} showGap={filters.disagree} />
          </section>
        )}
      </div>
    </div>
  );
}
