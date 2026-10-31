import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts from 0 to `target` the first time the returned ref scrolls into view.
 * With reduced motion (or no IntersectionObserver) it shows the final value straight away.
 */
export default function useCountUp(target, { duration = 1600 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(() =>
    prefersReducedMotion() || typeof IntersectionObserver === 'undefined' ? target : 0);
  const [done, setDone] = useState(value === target);

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return undefined;
    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
        setValue(target * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
        else setDone(true);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration, done]);

  return [ref, done ? target : value, done];
}
