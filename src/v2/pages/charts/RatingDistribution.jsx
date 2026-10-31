import React, { useState } from 'react';
import { TIER_KEYS } from '../../../lib/tiers';
import { ChartTooltip, DataTable, useWidth } from './shared';

const pct = (v) => `${Math.round(v * 100)}%`;

// Grouped columns: share of each brother's ratings in each tier, one shared y scale.
export default function RatingDistribution({ data }) {
  const [frameRef, width] = useWidth(720);
  const [hover, setHover] = useState(null); // tier index

  const narrow = width < 520;
  const m = { top: 20, right: 8, bottom: 34, left: 40 };
  const height = narrow ? 240 : 280;
  const iw = Math.max(10, width - m.left - m.right);
  const ih = height - m.top - m.bottom;

  const maxShare = Math.max(...data.flatMap(d => d.shares));
  const yTop = Math.ceil((maxShare * 100) / 10) * 10 / 100;
  const ly = (v) => m.top + ih - (v / yTop) * ih;
  const yTicks = [];
  for (let t = 0; t <= yTop + 1e-9; t += yTop > 0.4 ? 0.2 : 0.1) yTicks.push(t);

  const band = iw / TIER_KEYS.length;
  const barW = Math.min(24, (band - 10) / 2);
  const gap = 2;

  // Rounded top (4px), square at the baseline.
  const colPath = (x, y, w, h) => {
    if (h <= 0) return '';
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  };

  const aria = data.map(d => `${d.person.name} rated ${d.rated} stories; ${pct(d.topShare)} are Peak or S.`).join(' ');

  return (
    <figure className="charts-figure">
      <ul className="charts-legend" aria-label="Legend">
        {data.map(d => (
          <li key={d.person.id}>
            <span className={`charts-key charts-key--${d.person.id}`} aria-hidden="true" />
            {d.person.name} <span className="charts-muted v2-num">· {d.rated} rated</span>
          </li>
        ))}
      </ul>

      <div className="charts-frame" ref={frameRef}>
        <svg width={width} height={height} role="img" aria-label={aria} className="charts-svg"
          onPointerLeave={() => setHover(null)}>
          {yTicks.map(t => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={ly(t)} y2={ly(t)} className={t === 0 ? 'charts-axis' : 'charts-grid'} />
              <text x={m.left - 8} y={ly(t)} textAnchor="end" dominantBaseline="central" className="charts-axis-label v2-num">{pct(t)}</text>
            </g>
          ))}
          {TIER_KEYS.map((k, i) => {
            const cx = m.left + band * i + band / 2;
            return (
              <g key={k}>
                {hover === i && <rect x={cx - band / 2 + 2} y={m.top} width={band - 4} height={ih} className="charts-band-hover" />}
                {data.map((d, j) => {
                  const v = d.shares[i];
                  const x = cx - barW - gap / 2 + j * (barW + gap);
                  const y = ly(v);
                  return <path key={d.person.id} d={colPath(x, y, barW, ly(0) - y)} className={`charts-col charts-col--${d.person.id}`} />;
                })}
                <text x={cx} y={height - m.bottom + 20} textAnchor="middle" className="charts-axis-label charts-axis-label--tier">{k}</text>
                <rect x={cx - band / 2} y={m.top} width={band} height={ih + m.bottom} fill="transparent"
                  onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
              </g>
            );
          })}
        </svg>

        {hover != null && (
          <ChartTooltip x={m.left + band * (hover + 1) - 8} xFlip={m.left + band * hover + 8} y={m.top + ih * 0.45} frameWidth={width} width={210}>
            <p className="charts-tip__title">{TIER_KEYS[hover]} tier</p>
            <ul className="charts-tip__rows">
              {data.map(d => (
                <li key={d.person.id}>
                  <span className={`charts-key charts-key--${d.person.id}`} aria-hidden="true" />
                  <span>{d.person.name}</span>
                  <span className="v2-num">{pct(d.shares[hover])} <span className="charts-muted">({d.counts[hover]})</span></span>
                </li>
              ))}
            </ul>
          </ChartTooltip>
        )}
      </div>

      <figcaption className="charts-figcap">
        Each bar is the share of that brother’s own ratings in a tier, so the two are comparable even though
        Pratyush has rated more stories.
      </figcaption>

      <DataTable
        caption="Ratings per tier for each brother"
        columns={[
          { key: 'tier', label: 'Tier' },
          ...data.map(d => ({ key: d.person.id, label: d.person.name, num: true, render: r => `${r[d.person.id].c} (${pct(r[d.person.id].s)})` })),
        ]}
        rows={TIER_KEYS.map((k, i) => ({
          key: k,
          tier: k,
          ...Object.fromEntries(data.map(d => [d.person.id, { c: d.counts[i], s: d.shares[i] }])),
        }))}
      />
    </figure>
  );
}
