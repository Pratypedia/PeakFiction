import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Flag } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Poster from '../components/Poster';
import RatingPair from '../components/RatingPair';
import MarginNote from '../components/MarginNote';
import { storyHref } from '../lib/router';
import MountainArt from './peak/MountainArt';
import { computeLayout } from './peak/layout';
import './PeakPage.css';

const SCROLL_KEY = 'pf-peak-scroll';

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function StopCard({ story, stop }) {
  const meta = [story.medium.join(' · '), story.length || (story.hoursNum ? `${story.hoursNum}h` : null)]
    .filter(Boolean).join(' · ');
  return (
    <a className={`peak-card ${stop.top ? 'peak-card--top' : ''} ${stop.rank === 1 ? 'peak-card--summit' : ''}`}
      href={storyHref(story)}
      style={{ left: stop.cardX, top: stop.y, width: stop.cardW }}>
      <span className="peak-card__art">
        <Poster story={story} className="peak-card__img" alt="" />
      </span>
      <span className="peak-card__body">
        <span className="peak-card__eyebrow">
          {stop.rank === 1 && <Flag size={13} aria-hidden="true" className="peak-card__flag" />}
          {stop.rank === 1 ? 'The summit · No. 1' : `No. ${stop.rank}`}
        </span>
        <span className="peak-card__title">{story.name}</span>
        {meta && <span className="peak-card__meta">{meta}</span>}
        <RatingPair story={story} size="sm" />
      </span>
    </a>
  );
}

export default function PeakPage({ topStories }) {
  const ranked = useMemo(() => [...topStories].sort((a, b) => a.rank - b.rank), [topStories]);
  const count = ranked.length;
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef(null);
  const maskRef = useRef(null);
  const restoredRef = useRef(false);
  const [width, setWidth] = useState(() => document.documentElement.clientWidth || 1200);
  const [current, setCurrent] = useState(count);

  const layout = useMemo(() => computeLayout(width, count), [width, count]);

  // Track the section's width; the whole drawing is laid out in its pixels.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseScrollTop = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    return Math.max(0, el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight);
  }, []);

  // Open at base camp (or where the reader left off this session). App scrolls to the
  // top in its own effect, which runs after ours, so wait a frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let target = baseScrollTop();
      try {
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (saved !== null && Number.isFinite(Number(saved))) target = Number(saved);
      } catch { /* storage blocked */ }
      window.scrollTo({ top: target, behavior: 'instant' });
      restoredRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [baseScrollTop]);

  // Scroll → which stop you're at, and how much of the trail is inked.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const focusY = window.innerHeight * 0.42 - top; // the trail is inked up to here
      const centreY = window.innerHeight * 0.5 - top;
      let nearest = layout.stops[0];
      for (const s of layout.stops) {
        if (Math.abs(s.y - centreY) < Math.abs(nearest.y - centreY)) nearest = s;
      }
      setCurrent(nearest.rank);
      if (maskRef.current) {
        const frac = reduced ? 1 : layout.drawnAt(focusY);
        maskRef.current.style.strokeDashoffset = String(1000 * (1 - frac));
      }
      if (restoredRef.current) {
        try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY))); } catch { /* ignore */ }
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [layout, reduced]);

  const jump = (to) => {
    window.scrollTo({ top: to === 'summit' ? 0 : baseScrollTop(), behavior: reduced ? 'auto' : 'smooth' });
  };

  const summit = layout.stops[0];
  const climbed = count > 1 ? (count - current) / (count - 1) : 1;

  return (
    <div className="peak-page">
      <PageHeader eyebrow="Our top 25" title={<>The <span className="v2-italic">Peak</span></>}
        lede="The 25 stories we'd climb a mountain to recommend.">
        <p className="peak-intro">
          Read it bottom-up: the trail starts at base camp with #25 and climbs to our favourite.
          <button type="button" className="v2-button peak-intro__button" onClick={() => jump('base')}>
            <ArrowDown size={16} aria-hidden="true" /> Start at base camp
          </button>
        </p>
      </PageHeader>

      <section ref={sectionRef} className={`peak-climb ${layout.mobile ? 'peak-climb--mobile' : ''}`}
        style={{ height: layout.height }} aria-labelledby="peak-list-title">
        <h2 id="peak-list-title" className="v2-visually-hidden">The top 25, from number 1 down</h2>
        <MountainArt ref={maskRef} layout={layout} drawn={reduced} />

        {!layout.mobile && summit && (
          <div className="peak-climb__note" style={{ right: layout.W - layout.cx + 70, top: summit.y - 92 }}>
            <MarginNote rotate={-4}>Worth every step.</MarginNote>
          </div>
        )}

        <ol className="peak-stops" role="list">
          {ranked.map((story, i) => {
            const stop = layout.stops[i];
            const reached = reduced || stop.rank >= current;
            return (
              <li key={story.slug} className={`peak-stop ${reached ? 'is-reached' : ''} ${stop.rank === current ? 'is-current' : ''}`}>
                <span className={`peak-marker ${stop.top ? 'peak-marker--top' : ''}`} aria-hidden="true"
                  style={{ left: stop.x, top: stop.y }}>
                  {stop.rank}
                </span>
                <StopCard story={story} stop={stop} />
              </li>
            );
          })}
        </ol>

        <div className="peak-basecamp">
          <p className="v2-eyebrow">Base camp</p>
          <p className="peak-basecamp__text">Scroll up to climb from #{count} to the summit.</p>
          <button type="button" className="v2-button" onClick={() => jump('summit')}>
            <ArrowUp size={16} aria-hidden="true" /> Skip to the summit
          </button>
        </div>
      </section>

      <aside className="peak-alt" aria-label="Climb progress">
        <span className="peak-alt__gauge" aria-hidden="true">
          <span className="peak-alt__dot" style={{ bottom: `${climbed * 100}%` }} />
        </span>
        <p className="peak-alt__reading">
          <span className="peak-alt__label">Stop</span>
          <span className="peak-alt__rank v2-num">#{current}</span>
          <span className="peak-alt__of">of {count}</span>
        </p>
        <span className="peak-alt__actions">
          <button type="button" className="peak-alt__btn" onClick={() => jump('summit')} aria-label="Jump to the summit">
            <ArrowUp size={15} aria-hidden="true" /><span className="peak-alt__btn-text">Summit</span>
          </button>
          <button type="button" className="peak-alt__btn" onClick={() => jump('base')} aria-label="Jump to base camp">
            <ArrowDown size={15} aria-hidden="true" /><span className="peak-alt__btn-text">Base</span>
          </button>
        </span>
      </aside>
    </div>
  );
}
