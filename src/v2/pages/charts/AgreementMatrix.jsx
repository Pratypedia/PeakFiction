import React, { useState } from 'react';
import { TIER_KEYS } from '../../../lib/tiers';
import TierBadge from '../../components/TierBadge';
import PosterCard from '../../components/PosterCard';
import { DataTable } from './shared';

const TIER_INDEX = Object.fromEntries(TIER_KEYS.map((k, i) => [k, i]));

// Pratyush tier (rows) × Kanav tier (columns). Ink shade = how many stories; diagonal = same tier.
export default function AgreementMatrix({ data }) {
  const { cells, max, both } = data;
  const [selected, setSelected] = useState(null); // `${p}|${k}`

  // Trim to the tiers either brother actually used for a shared story, keeping order and the square shape.
  const used = new Set();
  for (const key of cells.keys()) key.split('|').forEach(t => used.add(t));
  const first = Math.min(...[...used].map(t => TIER_INDEX[t]));
  const last = Math.max(...[...used].map(t => TIER_INDEX[t]));
  const tiers = TIER_KEYS.slice(first, last + 1);

  const shade = (n) => (n ? 14 + Math.round((n / max) * 70) : 0); // % ink mixed into paper
  const selectedStories = selected ? cells.get(selected) || [] : [];
  const [selP, selK] = selected ? selected.split('|') : [];

  const tableRows = [];
  for (const p of tiers) for (const k of tiers) {
    const list = cells.get(`${p}|${k}`);
    if (list) tableRows.push({ key: `${p}|${k}`, p, k, n: list.length, names: list.map(s => s.name).join(', ') });
  }

  return (
    <figure className="charts-figure">
      <div className="charts-matrix-wrap">
        <div className="charts-matrix" style={{ '--n': tiers.length }}
          role="group" aria-label={`Agreement matrix for ${both.length} stories we both rated. Rows are Pratyush's tier, columns are Kanav's.`}>
          <p className="charts-matrix__axis charts-matrix__axis--k" aria-hidden="true">
            <span className="v2-initial charts-initial--k">K</span> Rated by Kanav →
          </p>
          <p className="charts-matrix__axis charts-matrix__axis--p" aria-hidden="true">
            <span className="v2-initial charts-initial--p">P</span> Rated by Pratyush →
          </p>
          {tiers.map((k, j) => (
            <div key={`h-${k}`} className="charts-matrix__head" aria-hidden="true" style={{ gridRow: 2, gridColumn: 3 + j }}>
              <TierBadge rank={k} size="sm" title={`Kanav: ${k}`} />
            </div>
          ))}
          {tiers.map((p, i) => (
            <React.Fragment key={p}>
              <div className="charts-matrix__head charts-matrix__head--row" aria-hidden="true" style={{ gridRow: 3 + i, gridColumn: 2 }}>
                <TierBadge rank={p} size="sm" title={`Pratyush: ${p}`} />
              </div>
              {tiers.map((k, j) => {
                const pos = { gridRow: 3 + i, gridColumn: 3 + j };
                const key = `${p}|${k}`;
                const n = cells.get(key)?.length || 0;
                const gap = Math.abs(TIER_INDEX[p] - TIER_INDEX[k]);
                const cls = [
                  'charts-cell',
                  gap === 0 ? 'is-same' : gap === 1 ? 'is-near' : '',
                  n ? 'has-count' : '',
                  shade(n) > 48 ? 'is-dark' : '',
                  selected === key ? 'is-selected' : '',
                ].join(' ');
                const label = `Pratyush ${p}, Kanav ${k}: ${n} ${n === 1 ? 'story' : 'stories'}`;
                return n ? (
                  <button key={key} type="button" className={cls} style={{ ...pos, '--shade': `${shade(n)}%` }}
                    aria-label={label} aria-pressed={selected === key} title={label}
                    onClick={() => setSelected(selected === key ? null : key)}>
                    <span className="v2-num">{n}</span>
                  </button>
                ) : (
                  <span key={key} className={cls} style={pos} aria-hidden="true" />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <ul className="charts-matrix__legend" aria-label="Legend">
          <li><span className="charts-swatch charts-swatch--same" aria-hidden="true" /> Same tier</li>
          <li><span className="charts-swatch charts-swatch--near" aria-hidden="true" /> One tier apart</li>
          <li>
            <span className="charts-ramp" aria-hidden="true" />
            <span className="v2-num">1 → {max}</span> stories
          </li>
        </ul>
      </div>

      <figcaption className="charts-figcap">
        Squares on the outlined diagonal are stories we put in the same tier; the shaded band either side is one tier apart.
        Above the diagonal, Kanav rated it lower; below, Pratyush did.
      </figcaption>

      <div className="charts-matrix__detail" aria-live="polite">
        {selected ? (
          <>
            <div className="charts-matrix__detail-head">
              <p>
                <strong>Pratyush {selP} · Kanav {selK}</strong>
                <span className="charts-muted v2-num"> — {selectedStories.length} {selectedStories.length === 1 ? 'story' : 'stories'}</span>
              </p>
              <button type="button" className="v2-chip" onClick={() => setSelected(null)}>Clear</button>
            </div>
            <div className="charts-cards">
              {selectedStories.map(s => <PosterCard key={s.slug} story={s} size="sm" showMeta={false} />)}
            </div>
          </>
        ) : (
          <p className="charts-muted charts-matrix__hint">Pick any numbered square to see which stories are in it.</p>
        )}
      </div>

      <DataTable
        caption="Stories by Pratyush tier and Kanav tier"
        columns={[
          { key: 'p', label: 'Pratyush' },
          { key: 'k', label: 'Kanav' },
          { key: 'n', label: 'Stories', num: true },
          { key: 'names', label: 'Which' },
        ]}
        rows={tableRows}
      />
    </figure>
  );
}
