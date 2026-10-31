import React, { useLayoutEffect, useRef, useState } from 'react';
import Poster from '../../components/Poster';
import RatingPair from '../../components/RatingPair';

/** Measures an element's content width so SVG charts can be drawn at real pixel size. */
export function useWidth(initial = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Floating card positioned inside a `position: relative` chart frame. Flips to stay in bounds. */
export function ChartTooltip({ x, xFlip = x, y, frameWidth, children, width = 240 }) {
  const gap = 14;
  const flip = x + gap + width > frameWidth;
  const left = flip ? Math.max(0, xFlip - gap - width) : x + gap;
  return (
    <div className="charts-tip" style={{ left, top: y, width }} role="presentation">
      {children}
    </div>
  );
}

/** Tooltip body for a single story: poster thumb, title, meta, both ratings. */
export function StoryTipBody({ story, extra }) {
  return (
    <div className="charts-tip__story">
      <div className="charts-tip__thumb"><Poster story={story} className="charts-tip__img" /></div>
      <div className="charts-tip__text">
        <p className="charts-tip__title">{story.name}</p>
        <p className="charts-tip__meta">
          {story.medium.join(' · ')}
          {story.hoursNum ? <span className="v2-num"> · {story.hoursNum}h</span> : null}
        </p>
        <RatingPair story={story} size="sm" />
        {extra && <p className="charts-tip__meta">{extra}</p>}
      </div>
    </div>
  );
}

/** Collapsible table view: the accessible, exact twin of a chart. */
export function DataTable({ summary = 'Show the numbers', caption, columns, rows }) {
  return (
    <details className="charts-table">
      <summary>{summary}</summary>
      <div className="charts-table__scroll">
        <table>
          {caption && <caption className="v2-visually-hidden">{caption}</caption>}
          <thead>
            <tr>{columns.map(c => <th key={c.key} scope="col" className={c.num ? 'is-num' : ''}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key ?? i}>
                {columns.map(c => <td key={c.key} className={c.num ? 'is-num' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** One page section: a plain descriptive title, an optional one-line description, then the graphic. */
export function ChartSection({ id, title, dek, children }) {
  return (
    <section className="charts-section" aria-labelledby={`${id}-title`}>
      <header className="charts-section__head">
        <h2 id={`${id}-title`} className="charts-section__title">{title}</h2>
        {dek && <p className="charts-section__dek">{dek}</p>}
      </header>
      {children}
    </section>
  );
}
