import React from 'react';
import { fmt } from './chartData';
import { DataTable } from './shared';

// Hero number + a single-colour bar list of hours by medium group (every value directly labelled).
export default function HoursFigure({ summary }) {
  const { total, workWeeks, workYears, days, groups, count } = summary;
  const max = Math.max(...groups.map(g => g.hours));
  const lead = groups[0];
  const leadShare = total ? lead.hours / total : 0;

  return (
    <div className="charts-hours">
      <div className="charts-hours__hero">
        <p className="charts-hours__number">{fmt(total)}<span className="charts-hours__unit"> hours</span></p>
        <p className="charts-hours__translate">
          That’s about <strong className="v2-num">{fmt(workWeeks)}</strong> forty-hour work weeks,
          or {workYears >= 1.5 ? <>roughly <strong className="v2-num">{fmt(workYears)}</strong> years of a full-time job</> : <>nearly a year of full-time work</>}.
          Back to back, it would take <strong className="v2-num">{fmt(days)}</strong> days without sleep.
        </p>
      </div>

      <figure className="charts-hours__figure">
        <figcaption className="charts-figcap">
          Hours by medium, across all {count} stories. {lead.group} account for {Math.round(leadShare * 100)}% of the total.
        </figcaption>
        <ul className="charts-barlist" aria-label="Hours by medium">
          {groups.map(g => (
            <li key={g.group} className="charts-barlist__row">
              <span className="charts-barlist__label">{g.group}</span>
              <span className="charts-barlist__track" aria-hidden="true">
                <span className="charts-barlist__bar" style={{ '--w': `${(g.hours / max) * 100}%` }} />
              </span>
              <span className="charts-barlist__value v2-num">
                {fmt(g.hours)}h <span className="charts-barlist__sub">· {g.count} {g.count === 1 ? 'story' : 'stories'}</span>
              </span>
            </li>
          ))}
        </ul>
      </figure>

      <DataTable
        caption="Hours by medium"
        columns={[
          { key: 'group', label: 'Medium' },
          { key: 'count', label: 'Stories', num: true },
          { key: 'hours', label: 'Hours', num: true, render: r => fmt(r.hours) },
          { key: 'share', label: 'Share', num: true, render: r => `${Math.round((r.hours / total) * 100)}%` },
          { key: 'top', label: 'Longest', render: r => `${r.top.name} (${fmt(r.top.hoursNum || 0)}h)` },
        ]}
        rows={groups.map(g => ({ ...g, key: g.group }))}
      />
    </div>
  );
}
