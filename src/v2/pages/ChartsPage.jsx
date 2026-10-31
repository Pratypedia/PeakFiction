import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { PEOPLE } from '../lib/storyMath';
import { agreementCells, biggestDisagreements, brotherStats, leaderboards } from './charts/chartData';
import { ChartSection } from './charts/shared';
import LengthScatter from './charts/LengthScatter';
import AgreementMatrix from './charts/AgreementMatrix';
import Disagreements from './charts/Disagreements';
import Leaderboards from './charts/Leaderboards';
import BrotherSplit from './charts/BrotherSplit';
import './ChartsPage.css';

export default function ChartsPage({ stories = [] }) {
  const d = useMemo(() => ({
    agree: agreementCells(stories),
    splits: biggestDisagreements(stories),
    boards: leaderboards(stories),
    people: PEOPLE.map(p => brotherStats(stories, p)),
  }), [stories]);

  return (
    <div className="charts-page">
      <PageHeader
        title="Charts"
        lede="Every story we’ve rated, plotted a few different ways."
      />

      <div className="v2-container charts-sections">
        <ChartSection id="length" title="Length vs. rating"
          dek="How long each story took us against how we rated it. Hover or tap a dot to see the story; click it to open.">
          <LengthScatter stories={stories} />
        </ChartSection>

        <ChartSection id="agree" title="Where we agree and disagree"
          dek="Each square counts the stories we both rated, by Pratyush’s tier and Kanav’s.">
          <AgreementMatrix data={d.agree} />
        </ChartSection>

        {d.splits.length > 0 && (
          <ChartSection id="splits" title="Biggest disagreements"
            dek="The stories where our two ratings are furthest apart.">
            <Disagreements rows={d.splits} />
          </ChartSection>
        )}

        <ChartSection id="boards" title="Leaderboards">
          <Leaderboards data={d.boards} />
        </ChartSection>

        <ChartSection id="people" title="Pratyush vs. Kanav"
          dek="What each of us has rated. Bars in the same chart share one scale across both columns.">
          <BrotherSplit stats={d.people} stories={stories} />
        </ChartSection>
      </div>
    </div>
  );
}
