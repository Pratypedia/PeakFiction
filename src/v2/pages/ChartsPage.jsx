import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { TIER_KEYS } from '../../lib/tiers';
import {
  agreement, biggestDisagreements, distributions, fmt, genreBoard, hoursSummary, lengthVsRating, scoreLabel,
} from './charts/chartData';
import { ChartSection } from './charts/shared';
import HoursFigure from './charts/HoursFigure';
import LengthScatter from './charts/LengthScatter';
import AgreementMatrix from './charts/AgreementMatrix';
import RatingDistribution from './charts/RatingDistribution';
import Disagreements, { gapWords } from './charts/Disagreements';
import GenreDumbbell from './charts/GenreDumbbell';
import './ChartsPage.css';

const pct = (v) => `${Math.round(v * 100)}%`;

export default function ChartsPage({ stories = [] }) {
  const d = useMemo(() => ({
    hours: hoursSummary(stories),
    length: lengthVsRating(stories),
    agree: agreement(stories),
    dist: distributions(stories),
    splits: biggestDisagreements(stories),
    genres: genreBoard(stories),
  }), [stories]);

  const { hours, length, agree, dist, splits, genres } = d;

  const lead = hours.groups[0];
  const leadShare = hours.total ? lead.hours / hours.total : 0;
  const hoursHeadline = leadShare > 0.5
    ? `More than half of our time went to ${lead.group.toLowerCase()}`
    : `${lead.group} took the biggest share of our time`;

  // "What each of us rates": who is more generous, by average score.
  const [pd, kd] = dist;
  const generous = pd.avg >= kd.avg ? pd : kd;
  const stricter = generous === pd ? kd : pd;
  const distHeadline = Math.abs(pd.avg - kd.avg) < 0.15
    ? 'We hand out tiers in almost the same way'
    : `${generous.person.name} is the softer grader`;
  const mode = (x) => {
    const i = x.counts.indexOf(Math.max(...x.counts));
    return `${TIER_KEYS[i]} (${pct(x.shares[i])})`;
  };
  const distDek = `${generous.person.name} averages ${scoreLabel(generous.avg)}, ${stricter.person.name} ${scoreLabel(stricter.avg)}. `
    + `${pd.person.name}’s most common verdict is ${mode(pd)}; ${kd.person.name}’s is ${mode(kd)}.`;

  const agreeHeadline = `We land within one tier of each other ${pct(agree.withinOneRate)} of the time`;
  const lean = agree.pHigher === agree.kHigher ? 'neither of us is consistently the harsher one'
    : `when we differ, ${agree.pHigher > agree.kHigher ? 'Pratyush' : 'Kanav'} is usually the one rating higher (${Math.max(agree.pHigher, agree.kHigher)} of ${agree.pHigher + agree.kHigher})`;
  const agreeDek = `Of the ${agree.both.length} stories we’ve both rated, ${agree.exact} (${pct(agree.exactRate)}) got exactly the same tier, and ${lean}.`;

  const splitHeadline = splits.maxGap <= 2
    ? `Our biggest disagreements are only ${gapWords(splits.maxGap)}`
    : `${splits.rows[0]?.story.name} split us the most`;
  const splitDek = splits.tiedCount > 5
    ? `${splits.tiedCount} stories share the widest gap; here they are, longest first. Everything else we’ve both rated is closer.`
    : 'The stories where our two ratings sit furthest apart.';

  const topGenre = genres[0];
  const genreGap = [...genres]
    .filter(g => g.pratyush.n >= 3 && g.kanav.n >= 3)
    .sort((a, b) => Math.abs(b.pratyush.avg - b.kanav.avg) - Math.abs(a.pratyush.avg - a.kanav.avg))[0];

  return (
    <div className="charts-page">
      <PageHeader
        eyebrow="Charts"
        title={<>The numbers behind <span className="v2-italic">{hours.count} stories</span></>}
        lede="What we’ve spent our time on, whether it was worth it, and how often two brothers actually agree."
      />

      <div className="v2-container charts-sections">
        <ChartSection id="hours" number={1} kicker="Time spent"
          headline={hoursHeadline}
          dek={`Every story we’ve logged, added up. The single longest, ${hours.longest.name}, took ${fmt(hours.longest.hoursNum)} hours on its own.`}>
          <HoursFigure summary={hours} />
        </ChartSection>

        <ChartSection id="length" number={2} kicker="Does a longer story mean a better one?"
          headline={length.headline}
          dek="Hover or tap a dot to see the story, and click it to open. The three short rules mark the average rating for each length band.">
          <LengthScatter data={length} />
        </ChartSection>

        <ChartSection id="agree" number={3} kicker="How often do we agree?"
          headline={agreeHeadline} dek={agreeDek}>
          <AgreementMatrix data={agree} />
        </ChartSection>

        <ChartSection id="dist" number={4} kicker="What each of us rates"
          headline={distHeadline} dek={distDek}>
          <RatingDistribution data={dist} />
        </ChartSection>

        <ChartSection id="splits" number={5} kicker="Biggest disagreements"
          headline={splitHeadline} dek={splitDek}>
          <Disagreements data={splits} />
        </ChartSection>

        {genres.length > 0 && (
          <ChartSection id="genres" number={6} kicker="Genres"
            headline={`${topGenre.genre} is our best-rated genre`}
            dek={`It averages ${scoreLabel(topGenre.avg)} across ${topGenre.count} stories.`
              + (genreGap ? ` We split most on ${genreGap.genre}: ${scoreLabel(genreGap.pratyush.avg)} for Pratyush, ${scoreLabel(genreGap.kanav.avg)} for Kanav.` : '')}>
            <GenreDumbbell rows={genres} />
          </ChartSection>
        )}
      </div>
    </div>
  );
}
