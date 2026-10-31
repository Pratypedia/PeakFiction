import React from 'react';
import TierBadge from '../../components/TierBadge';
import { scoreLabel } from './chartData';

function Board({ id, title, note, rows }) {
  return (
    <section className="charts-board" aria-labelledby={id}>
      <h3 id={id} className="charts-board__title">{title}</h3>
      <p className="charts-board__note">{note}</p>
      <ol className="charts-board__list">
        {rows.map((r, i) => (
          <li key={r.name} className="charts-board__row">
            <span className="charts-board__rank v2-num" aria-hidden="true">{i + 1}</span>
            <span className="charts-board__name">
              {r.name}
              <span className="charts-board__count v2-num">{r.count} {r.count === 1 ? 'story' : 'stories'}</span>
            </span>
            <span className="charts-board__score">
              <span className="v2-visually-hidden">Average rating </span>
              <TierBadge rank={scoreLabel(r.avg)} size="md" title={`Average rating: ${scoreLabel(r.avg)}`} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Two side-by-side top-3 lists: best genres and best formats by average rating.
export default function Leaderboards({ data }) {
  return (
    <div className="charts-boards">
      <Board id="board-genres" title="Top genres" note="By average rating, genres with two or more rated stories." rows={data.genres} />
      <Board id="board-formats" title="Top formats" note="By average rating, grouping anime with shows, manga and manhwa with comics." rows={data.formats} />
    </div>
  );
}
