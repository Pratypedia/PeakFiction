import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from '../../components/Link';
import Poster from '../../components/Poster';

function MountainSketch() {
  return (
    <svg className="ap-door__sketch" viewBox="0 0 160 80" fill="none" aria-hidden="true">
      <path d="M4 76 L 46 34 L 62 48 L 92 12 L 124 46 L 138 36 L 156 76" stroke="currentColor"
        strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M84 22 L 92 12 L 100 22 L 96 20 L 92 24 L 88 20 Z" fill="currentColor" opacity="0.18" />
      <path d="M20 76 C 50 70, 64 62, 76 50 S 86 30, 92 14" stroke="currentColor" strokeWidth="1.2"
        strokeDasharray="2 4" strokeLinecap="round" opacity="0.7" />
      <path d="M92 12 L 92 2 L 104 5.5 L 92 9" stroke="var(--tier-peak)" strokeWidth="1.4"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BarSketch() {
  const bars = [18, 34, 52, 64, 44, 30, 16, 10];
  return (
    <svg className="ap-door__sketch" viewBox="0 0 160 80" fill="none" aria-hidden="true">
      <path d="M8 76 H 154" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {bars.map((h, i) => (
        <rect key={i} x={14 + i * 17.5} y={76 - h} width="11" height={h} rx="1.5"
          stroke="currentColor" strokeWidth="1.3" fill={i === 3 ? 'currentColor' : 'none'}
          fillOpacity={i === 3 ? 0.14 : 0} />
      ))}
      <path d="M12 58 C 40 40, 66 6, 80 10 S 120 50, 150 66" stroke="var(--ink-3)" strokeWidth="1.3"
        strokeDasharray="3 3" strokeLinecap="round" />
    </svg>
  );
}

function PosterStrip({ stories }) {
  return (
    <div className="ap-door__strip" aria-hidden="true">
      {stories.map(s => (
        <div key={s.slug} className="ap-door__mini">
          <Poster story={s} className="ap-door__mini-img" alt="" />
        </div>
      ))}
    </div>
  );
}

export default function Doorways({ stories, topStories }) {
  // A few posters from deeper in the list, so this card doesn't repeat the hero's fan.
  const pick = stories.filter(s => s.poster || s.imageUrl);
  const step = Math.max(1, Math.floor(pick.length / 5));
  const strip = [1, 2, 3, 4].map(i => pick[i * step]).filter(Boolean);

  const doors = [
    {
      to: '/peak', title: 'The Peak', blurb: `Our top ${topStories.length}, stacked up the mountain.`,
      cta: 'Climb it', art: <MountainSketch />,
    },
    {
      to: '/stories', title: 'All stories',
      blurb: <><span className="v2-num">{stories.length}</span> stories, and every verdict we've handed out.</>,
      cta: 'Browse them', art: <PosterStrip stories={strip} />,
    },
    {
      to: '/charts', title: 'Charts', blurb: 'Where the hours went, and where we disagree.',
      cta: 'See the numbers', art: <BarSketch />,
    },
  ];

  return (
    <section className="ap-doors v2-container" aria-labelledby="ap-doors-title">
      <header className="ap-section-head">
        <p className="v2-eyebrow">Where to next</p>
        <h2 id="ap-doors-title" className="ap-section-title ap-section-title--sm">Pick a door.</h2>
      </header>
      <ul className="ap-doors__list">
        {doors.map(d => (
          <li key={d.to}>
            <Link to={d.to} className="ap-door">
              <div className="ap-door__art">{d.art}</div>
              <h3 className="ap-door__title">{d.title}</h3>
              <p className="ap-door__blurb">{d.blurb}</p>
              <span className="ap-door__cta">{d.cta} <ArrowRight size={16} aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
