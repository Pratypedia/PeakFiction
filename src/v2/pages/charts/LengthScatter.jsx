import React, { useMemo, useState } from 'react';
import { TIERS, SCORE_MIN, SCORE_MAX } from '../../../lib/tiers';
import { storyHref } from '../../lib/router';
import { bothRated } from '../../lib/storyMath';
import { GROUP_ORDER, fmt, scoreLabel } from './chartData';
import { ChartTooltip, DataTable, StoryTipBody, useWidth } from './shared';

const JITTER = 0.36; // in tier units; keeps half-step rows (x.5 averages) separate
const HIT_RADIUS = 26;

// Hours (log x) vs average rating (y). Ink dots; an optional medium emphasis greys the rest.
export default function LengthScatter({ data }) {
  const { points, buckets } = data;
  const [frameRef, width] = useWidth(720);
  const [hover, setHover] = useState(null);
  const [focusGroup, setFocusGroup] = useState(null);
  const [touch, setTouch] = useState(false);

  const groups = useMemo(
    () => GROUP_ORDER.filter(g => points.filter(p => p.group === g).length >= 3),
    [points],
  );

  const narrow = width < 520;
  const m = { top: 16, right: 14, bottom: 40, left: narrow ? 46 : 56 };
  const height = Math.round(Math.min(480, Math.max(320, width * 0.58)));
  const iw = Math.max(10, width - m.left - m.right);
  const ih = height - m.top - m.bottom;

  const maxHours = Math.max(...points.map(p => p.hours));
  const xMin = 0.8;
  const xMax = maxHours * 1.25;
  const lx = (h) => m.left + ((Math.log10(h) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * iw;
  const yMin = SCORE_MIN - 0.6;
  const yMax = SCORE_MAX + 0.6;
  const ly = (s) => m.top + ((yMax - s) / (yMax - yMin)) * ih;

  const xTicks = (narrow ? [1, 10, 100, 1000] : [1, 3, 10, 30, 100, 300, 1000]).filter(t => t <= xMax);

  const placed = useMemo(() => points.map(p => ({
    ...p,
    px: lx(p.hours),
    py: ly(p.score + p.jitter * JITTER),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [points, width, height]);

  const nearest = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    for (const p of placed) {
      if (focusGroup && p.group !== focusGroup) continue;
      const d = Math.hypot(p.px - mx, p.py - my);
      if (d < HIT_RADIUS && (!best || d < best.d)) best = { d, p };
    }
    return best ? best.p : null;
  };

  const onMove = (e) => { if (e.pointerType !== 'touch') setHover(nearest(e)); };

  // Mouse: click opens the hovered story. Touch: first tap shows the card, a second tap on it opens.
  const onTap = (e) => {
    const p = nearest(e);
    if (!p) { setHover(null); return; }
    setTouch(e.pointerType === 'touch');
    if (e.pointerType === 'touch' && hover?.story.slug !== p.story.slug) { setHover(p); return; }
    window.location.hash = storyHref(p.story);
  };

  const dim = (p) => focusGroup && p.group !== focusGroup;
  const ordered = [...placed].sort((a, b) => Number(!dim(a)) - Number(!dim(b)));

  const aria = `Scatter plot of ${points.length} stories, hours on a log scale against average rating. `
    + buckets.map(b => `${b.label}: ${b.count} stories, average ${scoreLabel(b.mean)}.`).join(' ');

  return (
    <figure className="charts-figure">
      <div className="charts-controls" role="group" aria-label="Highlight a medium">
        <span className="charts-controls__label">Highlight</span>
        <button type="button" className="v2-chip" aria-pressed={!focusGroup} onClick={() => setFocusGroup(null)}>All</button>
        {groups.map(g => (
          <button key={g} type="button" className="v2-chip" aria-pressed={focusGroup === g}
            onClick={() => setFocusGroup(focusGroup === g ? null : g)}>{g}</button>
        ))}
      </div>

      <div className="charts-frame" ref={frameRef}>
        <svg width={width} height={height} role="img" aria-label={aria}
          className={`charts-svg ${hover ? 'is-pointing' : ''}`}
          onPointerMove={onMove} onPointerLeave={(e) => { if (e.pointerType !== 'touch') setHover(null); }}
          onPointerUp={onTap}>
          {/* Tier gridlines */}
          {TIERS.map(t => (
            <g key={t.key}>
              <line x1={m.left} x2={width - m.right} y1={ly(t.score)} y2={ly(t.score)} className="charts-grid" />
              <text x={m.left - 10} y={ly(t.score)} className="charts-axis-label charts-axis-label--tier" textAnchor="end" dominantBaseline="central">
                {t.key}
              </text>
            </g>
          ))}
          {/* X axis */}
          <line x1={m.left} x2={width - m.right} y1={height - m.bottom} y2={height - m.bottom} className="charts-axis" />
          {xTicks.map(t => (
            <g key={t}>
              <line x1={lx(t)} x2={lx(t)} y1={height - m.bottom} y2={height - m.bottom + 5} className="charts-axis" />
              <text x={lx(t)} y={height - m.bottom + 18} textAnchor="middle" className="charts-axis-label v2-num">
                {fmt(t)}h
              </text>
            </g>
          ))}
          <text x={width - m.right} y={height - 4} textAnchor="end" className="charts-axis-title">
            Hours spent (log scale) →
          </text>

          {ordered.map(p => (
            <circle key={p.story.slug} cx={p.px} cy={p.py} r={4}
              className={`charts-dot ${dim(p) ? 'is-dim' : ''}`} />
          ))}
          {/* Bucket averages: the finding, drawn as three short rules */}
          {buckets.map(b => {
            if (b.mean == null) return null;
            const x1 = lx(Math.max(xMin, b.min));
            const x2 = lx(Math.min(xMax, b.max === Infinity ? xMax : b.max));
            const y = ly(b.mean);
            return (
              <g key={b.id} className="charts-bucket">
                <line x1={x1 + 3} x2={x2 - 3} y1={y} y2={y} className="charts-bucket__halo" />
                <line x1={x1 + 3} x2={x2 - 3} y1={y} y2={y} className="charts-bucket__rule" />
                <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" className="charts-bucket__label">
                  avg {scoreLabel(b.mean)}
                </text>
              </g>
            );
          })}

          {hover && <circle cx={hover.px} cy={hover.py} r={7} className="charts-dot charts-dot--active" />}
        </svg>

        {hover && (
          <ChartTooltip x={hover.px} y={hover.py - 40} frameWidth={width}>
            <StoryTipBody story={hover.story} extra={`${bothRated(hover.story) ? `Average ${scoreLabel(hover.score)}` : 'Only one of us has rated it'} · ${touch ? 'tap again' : 'click'} to open`} />
          </ChartTooltip>
        )}
      </div>

      <figcaption className="charts-figcap">
        Each dot is one story, placed by the hours it took and the average of our two ratings
        (dots are nudged up or down a little so ties don’t hide each other). Averages by length:{' '}
        {buckets.map((b, i) => (
          <React.Fragment key={b.id}>
            {i > 0 && '; '}{b.label.toLowerCase()}, <strong>{scoreLabel(b.mean)}</strong> ({b.count} stories)
          </React.Fragment>
        ))}.
      </figcaption>

      <DataTable
        summary="Show all stories as a table"
        caption="Hours and average rating per story"
        columns={[
          { key: 'name', label: 'Story', render: r => <a href={storyHref(r.story)}>{r.story.name}</a> },
          { key: 'group', label: 'Medium' },
          { key: 'hours', label: 'Hours', num: true, render: r => fmt(r.hours) },
          { key: 'score', label: 'Average', num: true, render: r => scoreLabel(r.score) },
        ]}
        rows={[...points].sort((a, b) => b.hours - a.hours).map(p => ({ ...p, key: p.story.slug }))}
      />
    </figure>
  );
}
