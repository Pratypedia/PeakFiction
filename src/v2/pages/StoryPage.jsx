import React, { useMemo } from 'react';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import Poster from '../components/Poster';
import PosterCard from '../components/PosterCard';
import TierBadge from '../components/TierBadge';
import MarginNote from '../components/MarginNote';
import ContactForm from '../components/ContactForm';
import Link from '../components/Link';
import PageHeader from '../components/PageHeader';
import { parseRank } from '../../lib/tiers';
import { PEOPLE, bestScore, disagreement } from '../lib/storyMath';
import './StoryPage.css';

const RELATED_COUNT = 6;

// Stories sharing the most genres, best rated first.
function relatedStories(story, stories) {
  const genres = new Set(story.genre);
  return stories
    .filter(s => s.slug !== story.slug)
    .map(s => ({ s, overlap: s.genre.filter(g => genres.has(g)).length }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || (bestScore(b.s) ?? 0) - (bestScore(a.s) ?? 0))
    .slice(0, RELATED_COUNT)
    .map(({ s }) => s);
}

function Verdict({ person, story }) {
  const rank = story[person.rankField];
  const comment = story[person.commentField];
  const rated = Boolean(parseRank(rank));
  return (
    <article className={`v2-verdict v2-verdict--${person.id}`}>
      <header className="v2-verdict__head">
        <span className="v2-verdict__who">
          <span className="v2-initial" aria-hidden="true">{person.initial}</span>
          {person.name}
        </span>
        <TierBadge rank={rank} size="lg" />
      </header>
      {comment ? (
        <blockquote className="v2-verdict__quote">{comment}</blockquote>
      ) : (
        <p className="v2-verdict__empty">
          {rated ? 'Rated it, but left no notes.' : "Hasn't rated this one yet."}
        </p>
      )}
    </article>
  );
}

export default function StoryPage({ stories, topStories, slug }) {
  const story = stories.find(s => s.slug === slug);
  const peakEntry = topStories.find(s => s.slug === slug);
  const related = useMemo(() => (story ? relatedStories(story, stories) : []), [story, stories]);

  if (!story) {
    return (
      <PageHeader eyebrow="Lost the trail" title="We couldn't find that story."
        lede="It may have been renamed. Try the full list instead.">
        <p><Link to="/stories" className="v2-button">Browse all stories</Link></p>
      </PageHeader>
    );
  }

  const gap = disagreement(story);
  const details = [
    story.length && { Icon: BookOpen, label: 'Length', value: story.length },
    story.hoursNum && { Icon: Clock, label: 'Time to finish', value: `${story.hoursNum} hours` },
  ].filter(Boolean);

  return (
    <article className="v2-story">
      <div className="v2-container">
        <Link to="/stories" className="v2-story__back">
          <ArrowLeft size={16} aria-hidden="true" /> All stories
        </Link>

        <div className="v2-story__hero">
          <div className="v2-story__poster">
            <Poster story={story} className="v2-story__img" />
            {peakEntry && (
              <Link to="/peak" className="v2-story__peak-stamp" title="See it on the Peak">
                <span>#{peakEntry.rank}</span> on our Peak
              </Link>
            )}
          </div>

          <div className="v2-story__intro">
            <p className="v2-eyebrow">{[...story.medium, ...story.genre].join(' · ')}</p>
            <h1 className="v2-story__title">{story.name}</h1>

            {details.length > 0 && (
              <dl className="v2-story__details">
                {details.map(({ Icon, label, value }) => (
                  <div key={label} className="v2-story__detail">
                    <dt><Icon size={15} aria-hidden="true" /> {label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="v2-story__verdicts">
              {PEOPLE.map(person => <Verdict key={person.id} person={person} story={story} />)}
            </div>

            {gap !== null && gap >= 2 && (
              <MarginNote rotate={-1.5} className="v2-story__note">
                We're {Math.round(gap)} tiers apart on this one. Pick a side!
              </MarginNote>
            )}

            {story.favoriteCharacters && (
              <p className="v2-story__favs">
                <span className="v2-eyebrow">Favourite characters</span>
                <span className="v2-story__favs-list">{story.favoriteCharacters}</span>
              </p>
            )}
          </div>
        </div>

        <section className="v2-story__contact" aria-label="Message me about this story">
          <ContactForm storyName={story.name}
            prompt={`Loved it? Hated it? Tell me what you thought of ${story.name}.`} />
        </section>

        {related.length > 0 && (
          <section className="v2-story__related" aria-labelledby="related-heading">
            <h2 id="related-heading" className="v2-story__related-title">If you liked this</h2>
            <div className="v2-story__related-grid">
              {related.map(s => <PosterCard key={s.slug} story={s} size="sm" />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
