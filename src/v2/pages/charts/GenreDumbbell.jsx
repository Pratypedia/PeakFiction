import React, { useState } from 'react';
import { TIERS } from '../../../lib/tiers';
import { PEOPLE } from '../../lib/storyMath';
import { scoreLabel } from './chartData';
import { ChartTooltip, DataTable, useWidth } from './shared';

const MIN_PERSON = 2; // a brother's dot needs at least two of his ratings behind it

// One row per genre: a dot for each brother's average, joined by a rule. Sorted by the combined average.
export default function GenreDumbbell({ rows }) {
  const [frameRef, width] = useWidth(720);
  const [hover, setHover] = useState(null);

  const narrow = width < 560;
  const labelW = narrow ? 0 : 168;
  const rowH = narrow ? 48 : 34;
  const m = { top: 8, right: narrow ? 32 : 44, bottom: 30, left: labelW + (narrow ? 14 : 8) };
  const height = m.top + rows.length * rowH + m.bottom;
  const iw = Math.max(10, width - m.left - m.right);

  const values = rows.flatMap(r => PEOPLE.map(p => (r[p.id].n >= MIN_PERSON ? r[p.id].avg : null)).filter(v => v != null));
  const lo = Math.max(3, Math.floor(Math.min(...values)) - 0.25);
  const hi = Math.min(10, Math.ceil(Math.max(...values)) + 0.25);
  const lx = (v) => m.left + ((v - lo) / (hi - lo)) * iw;
  const ticks = TIERS.filter(t => t.score >= lo && t.score <= hi);
  const rowY = (i) => m.top + i * rowH + (narrow ? rowH - 14 : rowH / 2);

  return (
    <figure className="charts-figure">
      <ul className="charts-legend" aria-label="Legend">
        {PEOPLE.map(p => (
          <li key={p.id}><span className={`charts-key charts-key--${p.id} charts-key--dot`} aria-hidden="true" /> {p.name}’s average</li>
        ))}
      </ul>
      <div className="charts-frame" ref={frameRef}>
        <svg width={width} height={height} className="charts-svg" role="img"
          aria-label={`Average rating by genre. Highest: ${rows[0]?.genre}, ${scoreLabel(rows[0]?.avg)}. Lowest: ${rows.at(-1)?.genre}, ${scoreLabel(rows.at(-1)?.avg)}.`}
          onPointerLeave={() => setHover(null)}>
          {ticks.map(t => (
            <g key={t.key}>
              <line x1={lx(t.score)} x2={lx(t.score)} y1={m.top} y2={height - m.bottom} className="charts-grid" />
              <text x={lx(t.score)} y={height - m.bottom + 18} textAnchor="middle" className="charts-axis-label charts-axis-label--tier">{t.key}</text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y = rowY(i);
            const pv = r.pratyush.n >= MIN_PERSON ? r.pratyush.avg : null;
            const kv = r.kanav.n >= MIN_PERSON ? r.kanav.avg : null;
            const both = [pv, kv].filter(v => v != null);
            return (
              <g key={r.genre} className={hover === i ? 'is-hover' : ''}>
                {hover === i && <rect x={0} y={m.top + i * rowH} width={width} height={rowH} className="charts-band-hover" />}
                <text x={narrow ? m.left : labelW} y={narrow ? y - 16 : y} textAnchor={narrow ? 'start' : 'end'}
                  dominantBaseline="central" className="charts-row-label">{r.genre}</text>
                {both.length === 2 && <line x1={lx(Math.min(...both))} x2={lx(Math.max(...both))} y1={y} y2={y} className="charts-dumbbell" />}
                {kv != null && <circle cx={lx(kv)} cy={y} r={5} className="charts-pdot charts-pdot--kanav" />}
                {pv != null && <circle cx={lx(pv)} cy={y} r={5} className="charts-pdot charts-pdot--pratyush" />}
                <text x={width - 4} y={y} textAnchor="end" dominantBaseline="central" className="charts-axis-label v2-num">{r.count}</text>
                <rect x={0} y={m.top + i * rowH} width={width} height={rowH} fill="transparent"
                  onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
              </g>
            );
          })}
          <text x={width - 4} y={height - m.bottom + 18} textAnchor="end" className="charts-axis-title">stories</text>
        </svg>
        {hover != null && (
          <ChartTooltip x={lx(rows[hover].avg) - 40} y={rowY(hover) + rowH / 2 + 50} frameWidth={width} width={210}>
            <p className="charts-tip__title">{rows[hover].genre}</p>
            <ul className="charts-tip__rows">
              {PEOPLE.map(p => (
                <li key={p.id}>
                  <span className={`charts-key charts-key--${p.id} charts-key--dot`} aria-hidden="true" />
                  <span>{p.name}</span>
                  <span className="v2-num">{scoreLabel(rows[hover][p.id].avg)} · {rows[hover][p.id].n} rated</span>
                </li>
              ))}
            </ul>
            <p className="charts-tip__meta">Together: {scoreLabel(rows[hover].avg)} over {rows[hover].count} stories</p>
          </ChartTooltip>
        )}
      </div>
      <figcaption className="charts-figcap">
        Genres with at least three rated stories, best first by our combined average; the count on the right is how many stories. A brother’s dot only appears once he has rated two or more in that genre, and a story can sit in several genres.
        Scores use our tier scale (Peak 10 down to F 3), so “A−” means just under A on average.
      </figcaption>
      <DataTable
        caption="Average rating by genre"
        columns={[
          { key: 'genre', label: 'Genre' },
          { key: 'count', label: 'Stories', num: true },
          { key: 'avg', label: 'Together', num: true, render: r => scoreLabel(r.avg) },
          ...PEOPLE.map(p => ({ key: p.id, label: p.name, num: true, render: r => (r[p.id].n ? `${scoreLabel(r[p.id].avg)} (${r[p.id].n})` : '–') })),
        ]}
        rows={rows.map(r => ({ ...r, key: r.genre }))}
      />
    </figure>
  );
}
