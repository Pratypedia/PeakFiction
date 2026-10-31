// The cardboard lift: a call panel of paper-disc floor buttons, the doors that close
// over the page for the ride, and the hook that runs it. Floors are tier sections.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { PENDING } from '../../../lib/tiers';
import { TIER_META, tierVars } from '../../lib/tierMeta';
import { playElevatorDing } from '../../../lib/audio';

const CLOSE_MS = 1000; // doors close, "travel"
const HOLD_MS = 800; // doors stay shut after arrival, then open
const OPEN_MS = 700; // door opening animation
const FLASH_MS = 1100; // reduced-motion arrival flash

export const floorId = tier => `pf-floor-${tier.toLowerCase()}`;
export const floorHeadingId = tier => `pf-tier-${tier.toLowerCase()}`;

/** Short label used on buttons and the indicator. */
export const floorGlyph = tier => (tier === PENDING ? '?' : tier);
/** Wording for signs and announcements. */
export const floorName = tier => (tier === PENDING ? 'the basement' : tier);
export const floorSign = tier => (tier === PENDING ? 'Basement' : `Floor ${tier}`);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Height of everything pinned to the top of the viewport (nav + sticky toolbar). */
function stickyOffset() {
  const nav = document.querySelector('.v2-nav');
  const toolbar = document.querySelector('.pf-stories-toolbar');
  return (nav?.offsetHeight || 64) + (toolbar?.offsetHeight || 0);
}

export function useElevator(floors) {
  const [current, setCurrent] = useState(floors[0] ?? null);
  // phase: idle → closing → arrived → opening → idle   (reduced motion: idle → flash → idle)
  const [ride, setRide] = useState({ phase: 'idle', target: null, direction: null });
  const timers = useRef([]);
  const moving = ride.phase !== 'idle';
  const movingRef = useRef(false);
  movingRef.current = moving;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Track which floor we're on while scrolling.
  useEffect(() => {
    if (!floors.length) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (movingRef.current) return;
      const line = stickyOffset() + 48;
      let here = floors[0];
      for (const tier of floors) {
        const el = document.getElementById(floorId(tier));
        if (el && el.getBoundingClientRect().top <= line) here = tier;
      }
      // A short last floor can never reach the line; at the very bottom, you're on it.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const last = document.getElementById(floorId(floors[floors.length - 1]));
      if (atBottom && last && last.getBoundingClientRect().top < window.innerHeight) here = floors[floors.length - 1];
      setCurrent(here);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [floors]);

  const arrive = useCallback(tier => {
    const section = document.getElementById(floorId(tier));
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - stickyOffset() - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    }
    setCurrent(tier);
    playElevatorDing();
  }, []);

  const call = useCallback(
    tier => {
      if (movingRef.current) return;
      movingRef.current = true;
      const from = floors.indexOf(current);
      const to = floors.indexOf(tier);
      const direction = to < from ? 'up' : to > from ? 'down' : 'same';
      const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
      const focusHeading = () =>
        document.getElementById(floorHeadingId(tier))?.focus({ preventScroll: true });

      if (prefersReducedMotion()) {
        arrive(tier);
        setRide({ phase: 'flash', target: tier, direction });
        focusHeading();
        later(() => setRide({ phase: 'idle', target: null, direction: null }), FLASH_MS);
        return;
      }

      setRide({ phase: 'closing', target: tier, direction });
      later(() => {
        arrive(tier);
        setRide(r => ({ ...r, phase: 'arrived' }));
      }, CLOSE_MS);
      later(() => setRide(r => ({ ...r, phase: 'opening' })), CLOSE_MS + HOLD_MS);
      later(() => {
        setRide({ phase: 'idle', target: null, direction: null });
        focusHeading();
      }, CLOSE_MS + HOLD_MS + OPEN_MS);
    },
    [floors, current, arrive]
  );

  return { current: floors.includes(current) ? current : floors[0], ride, moving, call };
}

function rideText({ phase, target, direction }) {
  if (!target) return '';
  if (phase === 'closing') {
    if (direction === 'up') return `Going up to ${floorName(target)}…`;
    if (direction === 'down') return `Going down to ${floorName(target)}…`;
    return `Back to ${floorName(target)}…`;
  }
  return floorSign(target);
}

export function ElevatorPanel({ floors, current, ride, onCall }) {
  const moving = ride.phase !== 'idle';
  const shown = moving && ride.target ? ride.target : current;
  const announcement = moving ? rideText(ride) : floorSign(current);
  const Arrow = ride.direction === 'up' ? ArrowUp : ride.direction === 'down' ? ArrowDown : null;
  const listRef = useRef(null);

  // On the phone bar the buttons scroll sideways: keep the lit floor in view.
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const btn = list.querySelector('[aria-current="location"]');
    if (!btn) return;
    const { offsetLeft: x, offsetWidth: w } = btn.parentElement;
    if (x < list.scrollLeft || x + w > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: x - list.clientWidth / 2 + w / 2, behavior: 'smooth' });
    }
  }, [current]);

  return (
    <div className="pf-elevator-rail">
      <nav className="pf-elevator" aria-label="Lift: jump to a tier floor" data-moving={moving}>
        <div className="pf-elevator__display">
          <span className="pf-elevator__display-label" aria-hidden="true">Floor</span>
          <span className="pf-elevator__display-floor" aria-hidden="true" data-long={(shown || floors[0]) === 'Peak' || undefined}>
            {ride.phase === 'closing' && Arrow && <Arrow size={12} strokeWidth={2.5} className="pf-elevator__arrow" />}
            {floorGlyph(shown || floors[0])}
          </span>
          <span className="v2-visually-hidden" aria-live="polite">{announcement}</span>
        </div>
        <ul className="pf-elevator__buttons" role="list" ref={listRef}>
          {floors.map(tier => (
            <li key={tier}>
              <button
                type="button"
                className={`pf-elevator__btn pf-elevator__btn--${tier.toLowerCase()}`}
                aria-label={`Go to ${TIER_META[tier]?.name ?? tier} floor`}
                aria-current={tier === current ? 'location' : undefined}
                data-target={ride.target === tier || undefined}
                aria-disabled={moving || undefined}
                onClick={() => onCall(tier)}
              >
                {floorGlyph(tier)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function ElevatorDoors({ ride }) {
  if (ride.phase === 'idle') return null;
  const flash = ride.phase === 'flash';
  return (
    <div className={`pf-lift pf-lift--${ride.phase}`} aria-hidden="true"
      style={{ '--ride-tier': tierVars(ride.target).color }}>
      {!flash && (
        <>
          <div className="pf-lift__door pf-lift__door--left">
            <span className="pf-lift__stencil">Peak Fiction</span>
          </div>
          <div className="pf-lift__door pf-lift__door--right">
            <span className="pf-lift__stencil">Lift Co.</span>
          </div>
        </>
      )}
      <div className="pf-lift__sign" key={ride.phase === 'closing' ? 'going' : 'here'}>
        <span className="pf-lift__sign-dial" data-long={ride.target === 'Peak' || undefined}>{floorGlyph(ride.target)}</span>
        <span className="pf-lift__sign-text">{rideText(ride)}</span>
      </div>
    </div>
  );
}
