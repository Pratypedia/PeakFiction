import React from 'react';
import Poster from '../../components/Poster';
import MarginNote from '../../components/MarginNote';
import { storyHref } from '../../lib/router';

// Fan order, left to right: #4, #2, #1, #3, #5 — the #1 sits on top in the middle.
const FAN = [4, 2, 1, 3, 5];

export default function Hero({ topStories }) {
  const byRank = new Map(topStories.map(s => [s.rank, s]));
  const fan = FAN.map(rank => byRank.get(rank)).filter(Boolean);

  return (
    <section className="ap-hero v2-container" aria-labelledby="ap-hero-title">
      <div className="ap-hero__text">
        <p className="v2-eyebrow">About Peak Fiction</p>
        <h1 id="ap-hero-title" className="ap-hero__title">
          I have consumed an <span className="v2-italic">obscene</span> amount of fiction.
        </h1>
        <p className="ap-hero__lede">
          Hi, my name is <strong>Pratyush</strong>. This is where my brother Kanav and I rank every
          anime, manga, manhwa, novel, book, movie and show we've gotten through, from Peak all the
          way down to F.
        </p>
        <ol className="ap-scale" aria-label="The tiers, best to worst">
          {['Peak', 'S', 'A', 'B', 'C', 'D', 'E', 'F'].map(t => (
            <li key={t} className={`ap-scale__tier ap-scale__tier--${t.toLowerCase()}`}>{t}</li>
          ))}
        </ol>
      </div>

      <div className="ap-fan" aria-label="Our top five">
        {fan.map(story => (
          <a key={story.slug} href={storyHref(story)}
            className={`ap-fan__card ap-fan__card--r${story.rank}`}
            aria-label={`#${story.rank}: ${story.name}`}>
            <Poster story={story} className="ap-fan__img" alt="" />
          </a>
        ))}
        {byRank.get(1) && (
          <div className="ap-fan__note" aria-hidden="true">
            <MarginNote who="pratyush" rotate={-4} as="span">our current #1</MarginNote>
            <svg className="ap-fan__arrow" viewBox="0 0 60 50" fill="none">
              <path d="M6 6 C 22 6, 40 14, 46 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M38 32 L 46 40 L 52 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
