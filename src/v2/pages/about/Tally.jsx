import React from 'react';
import MarginNote from '../../components/MarginNote';
import useCountUp from './useCountUp';

// Pratyush's counts, low-balled on purpose. Hours = count × minutes-per-unit.
const STATS = [
  { key: 'comic', label: 'Comic chapters', count: 7796, minutes: 5 },
  { key: 'novel', label: 'Novel chapters', count: 8709, minutes: 5 },
  { key: 'episodes', label: 'Show episodes', count: 1783, minutes: 20 },
  { key: 'movies', label: 'Movies', count: 78, minutes: 120 },
  { key: 'books', label: 'Books', count: 43, minutes: 600 },
];

const TOTAL_HOURS = STATS.reduce((sum, s) => sum + (s.count * s.minutes) / 60, 0); // 2,555.75
const WORK_WEEKS = Math.round(TOTAL_HOURS / 40); // 64

const fmt = (n, digits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function rateLabel(minutes) {
  return minutes >= 60 ? `${minutes / 60} h` : `${minutes} min`;
}

export default function Tally() {
  const [hoursRef, hours] = useCountUp(TOTAL_HOURS, { duration: 1800 });
  const [weeksRef, weeks] = useCountUp(WORK_WEEKS, { duration: 1400 });

  return (
    <section className="ap-tally" aria-labelledby="ap-tally-title">
      <div className="v2-container">
        <header className="ap-section-head">
          <p className="v2-eyebrow">The damage</p>
          <h2 id="ap-tally-title" className="ap-section-title">
            Let's try to figure out how much this <span className="v2-italic">really</span> looks like.
          </h2>
        </header>

        <dl className="ap-stats">
          {STATS.map(s => (
            <div key={s.key} className="ap-stat">
              <dt className="ap-stat__label">{s.label}</dt>
              <dd className="ap-stat__count v2-num">{fmt(s.count)}</dd>
              <dd className="ap-stat__rate">× {rateLabel(s.minutes)} each</dd>
            </div>
          ))}
        </dl>

        <div className="ap-sum">
          <div className="ap-sum__working">
            <p className="ap-sum__prose v2-prose">
              Estimating that it takes me 5 minutes per novel or comic chapter, 20 minutes per show
              episode, 2 hours per movie, and 10 hours per book, this amounts to
            </p>
            <p className="ap-total" ref={hoursRef}>
              <span className="v2-visually-hidden">{fmt(TOTAL_HOURS, 2)} hours</span>
              <span className="ap-total__num v2-num" aria-hidden="true">{fmt(hours, 2)}</span>
              <span className="ap-total__unit" aria-hidden="true">hours</span>
            </p>
            <p className="ap-weeks" ref={weeksRef}>
              Or almost{' '}
              <strong className="ap-weeks__num v2-num">
                <span aria-hidden="true">{fmt(weeks)}</span>
                <span className="v2-visually-hidden">{WORK_WEEKS}</span>
              </strong>{' '}
              <strong>forty-hour work weeks</strong>: over a year's worth of employment just consuming fiction!
            </p>
          </div>

          <aside className="ap-caveat">
            <MarginNote rotate={1.5}>
              I have probably missed some, and I have intentionally left out a lot.
            </MarginNote>
            <p className="ap-caveat__text">
              For example, I don't know how many Disney movies I have watched... So instead, I'm
              low-balling these figures and sticking only to the numbers I can defend.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
