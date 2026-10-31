import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  BarChart, Bar
} from 'recharts';
import Poster from './Poster';
import { tierScore, tierLabel, tierForScore, TIER_KEYS, tierKey, SCORE_MIN, SCORE_MAX, SCORE_TICKS } from '../lib/tiers';
import { consolidateMedium, slugify } from '../lib/stories';

// Helper to truncate long story names
const truncateName = (name) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length > 3) {
    return words.slice(0, 3).join(' ') + '...';
  }
  return name;
};

const AXIS_DOMAIN = [SCORE_MIN - 0.5, SCORE_MAX + 0.5];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, isBubbleChart }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="polaroid-card" style={{ width: '250px', zIndex: 1000, transform: 'rotate(2deg)' }}>
        <Poster story={data} className="polaroid-img" />
        <div style={{ marginTop: '10px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{truncateName(data.name)}</span>
          <div style={{ fontSize: '1.2rem', color: '#2563eb', marginTop: '4px' }}>
            Hours: {data.parsedHours} | {data.medium.join(', ')}
          </div>
          {isBubbleChart ? (
            <div style={{ fontSize: '1.1rem', marginTop: '4px', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
              <div style={{ color: '#2563eb' }}>P: {tierLabel(data.rankingPratyush)}</div>
              <div style={{ color: '#d97706' }}>K: {tierLabel(data.rankingKanav)}</div>
            </div>
          ) : (
            <div style={{ fontSize: '1.1rem', marginTop: '4px', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
              Rating: {tierForScore(data.yAxisValue)} ({data.yAxisValue.toFixed(1)})
            </div>
          )}
        </div>
        <div className="red-pin" style={{ top: '-10px' }}></div>
      </div>
    );
  }
  return null;
};

// Hand-picked favourites; the poster comes from the story they belong to.
const PRATYUSH_FAVORITES = [
  { character: 'Arthur Leywin', story: 'The Beginning After the end' },
  { character: 'Kim Dokja', story: 'omniscient readers viewpoint' },
  { character: 'Spider-Man', story: 'Marvel Cinematic Universe' },
];
const KANAV_FAVORITES = [
  { character: 'Regis', story: 'The Beginning After the end' },
  { character: 'Reiner', story: 'Attack on Titan' },
  { character: 'Levi', story: 'Attack on Titan' },
];

export default function ChartsView({ stories, onViewChange }) {
  const [scatterFilter, setScatterFilter] = useState('average'); // 'average', 'pratyush', 'kanav'
  const storiesBySlug = useMemo(() => Object.fromEntries(stories.map(s => [s.slug, s])), [stories]);

  // Parse stories to ensure they have valid hours
  const validStories = useMemo(() => {
    return stories
      .map(story => ({
        ...story,
        parsedHours: story.hoursNum,
        pVal: tierScore(story.rankingPratyush),
        kVal: tierScore(story.rankingKanav)
      }))
      .filter(s => s.parsedHours > 0); // Omit missing hours (log scale can't plot 0)
  }, [stories]);

  // Scatter Plot Data
  const scatterData = useMemo(() => {
    return validStories.map(story => {
      let yAxisValue = null;
      if (scatterFilter === 'pratyush') {
        yAxisValue = story.pVal;
      } else if (scatterFilter === 'kanav') {
        yAxisValue = story.kVal;
      } else {
        // Average
        if (story.pVal !== null && story.kVal !== null) {
          yAxisValue = (story.pVal + story.kVal) / 2;
        } else if (story.pVal !== null) {
          yAxisValue = story.pVal;
        } else if (story.kVal !== null) {
          yAxisValue = story.kVal;
        }
      }
      return { ...story, yAxisValue };
    }).filter(s => s.yAxisValue !== null); // Omit missing ratings for the selected view
  }, [validStories, scatterFilter]);

  // Bubble Chart Data with Agar.io-style clustering jitter around integer rating intersections
  const bubbleData = useMemo(() => {
    const rawBubbles = validStories.filter(s => s.pVal !== null && s.kVal !== null);

    // Group by exact rating coordinate (kVal, pVal)
    const groups = {};
    rawBubbles.forEach(story => {
      const key = `${story.kVal}_${story.pVal}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(story);
    });

    const result = [];
    Object.values(groups).forEach(group => {
      const N = group.length;
      if (N === 1) {
        result.push({
          ...group[0],
          plotKVal: group[0].kVal,
          plotPVal: group[0].pVal
        });
      } else {
        group.forEach((story, i) => {
          // Arrange points in concentric rings around (kVal, pVal)
          const ringIndex = Math.floor(i / 6);
          const posInRing = i % 6;
          const itemsInRing = Math.min(6, N - ringIndex * 6);
          const radius = 0.24 + ringIndex * 0.20;
          const angle = (posInRing / itemsInRing) * 2 * Math.PI + (ringIndex * 0.3);

          const plotKVal = Math.min(SCORE_MAX + 0.3, Math.max(SCORE_MIN - 0.3, story.kVal + radius * Math.cos(angle)));
          const plotPVal = Math.min(SCORE_MAX + 0.3, Math.max(SCORE_MIN - 0.3, story.pVal + radius * Math.sin(angle)));

          result.push({
            ...story,
            plotKVal,
            plotPVal
          });
        });
      }
    });

    return result;
  }, [validStories]);

  // Top 3 Genres and Mediums based on average rating
  const leaderboards = useMemo(() => {
    const genreStats = {};
    const mediumStats = {};
    

    stories.forEach(story => {
      const pVal = tierScore(story.rankingPratyush);
      const kVal = tierScore(story.rankingKanav);
      let avg = null;
      if (pVal !== null && kVal !== null) avg = (pVal + kVal) / 2;
      else if (pVal !== null) avg = pVal;
      else if (kVal !== null) avg = kVal;

      if (avg !== null) {
        story.genre.forEach(g => {
          if (!genreStats[g]) genreStats[g] = { sum: 0, count: 0 };
          genreStats[g].sum += avg;
          genreStats[g].count += 1;
        });
        const uniqueConsolidated = Array.from(new Set(story.medium.map(consolidateMedium)));
        uniqueConsolidated.forEach(cm => {
          if (!mediumStats[cm]) mediumStats[cm] = { sum: 0, count: 0 };
          mediumStats[cm].sum += avg;
          mediumStats[cm].count += 1;
        });
      }
    });

    const topGenres = Object.keys(genreStats)
      .filter(g => genreStats[g].count >= 2) 
      .map(g => ({ name: g, avg: genreStats[g].sum / genreStats[g].count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);
      
    const topMediums = Object.keys(mediumStats)
      .map(m => ({ name: m, avg: mediumStats[m].sum / mediumStats[m].count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);

    return { topGenres, topMediums };
  }, [stories]);

  // Collaborative Synergy & Top 3 Contested Cases calculation
  const agreementStats = useMemo(() => {
    const dualRated = stories.filter(s => {
      const p = tierScore(s.rankingPratyush);
      const k = tierScore(s.rankingKanav);
      return p !== null && k !== null;
    });
    if (dualRated.length === 0) return { rate: '0.0%', totalBoth: 0, topDisagreements: [] };

    let closeMatches = 0;
    const itemsWithDelta = dualRated.map(s => {
      const p = tierScore(s.rankingPratyush);
      const k = tierScore(s.rankingKanav);
      const delta = Math.abs(p - k);
      if (delta <= 1) closeMatches++;
      return { story: s, delta };
    });

    itemsWithDelta.sort((a, b) => b.delta - a.delta);
    const topDisagreements = itemsWithDelta.slice(0, 3).map(item => item.story);

    const rate = ((closeMatches / dualRated.length) * 100).toFixed(1) + '%';
    return { rate, totalBoth: dualRated.length, topDisagreements };
  }, [stories]);

  const getBrotherStats = (allStories, isPratyush) => {

    const ratingCounts = Object.fromEntries(TIER_KEYS.map(t => [t, 0]));
    const mediumCounts = {};
    const genreCounts = {};

    allStories.forEach(story => {
      const rank = isPratyush ? story.rankingPratyush : story.rankingKanav;
      if (tierScore(rank) === null) return;
      ratingCounts[tierKey(rank)]++;

      const uniqueConsolidated = Array.from(new Set(story.medium.map(consolidateMedium)));
      uniqueConsolidated.forEach(cm => {
        mediumCounts[cm] = (mediumCounts[cm] || 0) + 1;
      });

      story.genre.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const ratingData = TIER_KEYS.map(tier => ({ tier, count: ratingCounts[tier] }));
    const mediumData = Object.keys(mediumCounts).map(m => ({ name: m, count: mediumCounts[m] })).sort((a, b) => b.count - a.count);
    const genreData = Object.keys(genreCounts).map(g => ({ name: g, count: genreCounts[g] })).sort((a, b) => b.count - a.count).slice(0, 5);

    return { ratingData, mediumData, genreData };
  };

  const pratyushStats = useMemo(() => getBrotherStats(stories, true), [stories]);
  const kanavStats = useMemo(() => getBrotherStats(stories, false), [stories]);

  return (
    <div className="charts-page-wrapper">
      <div className="container" style={{ paddingTop: '8.1rem', paddingBottom: '4.05rem', position: 'relative' }}>
        
        <div className="hero-section" style={{ paddingBottom: '2.03rem' }}>
          <h2 className="hero-title">
            The Investigation Board
          </h2>
          <p className="hero-subtitle">
            Here are the secrets the data hides
          </p>
        </div>

        {/* Scatter Plot */}
        <div className="controls-card" style={{ position: 'relative', zIndex: 20, marginBottom: '2.7rem' }}>
          <div className="controls-row-top" style={{ marginBottom: '1.35rem' }}>
            <h3 style={{ fontSize: '2.03rem', fontWeight: 700 }}>Case File Length vs. Satisfaction</h3>
            <div className="view-mode-tabs">
              <button 
                className={`view-tab ${scatterFilter === 'average' ? 'active' : ''}`}
                onClick={() => setScatterFilter('average')}
              >
                Consensus Score
              </button>
              <button 
                className={`view-tab ${scatterFilter === 'pratyush' ? 'active' : ''}`}
                onClick={() => setScatterFilter('pratyush')}
              >
                Subject Pratyush's Ratings
              </button>
              <button 
                className={`view-tab ${scatterFilter === 'kanav' ? 'active' : ''}`}
                onClick={() => setScatterFilter('kanav')}
              >
                Subject Kanav's Ratings
              </button>
            </div>
          </div>
          <div style={{ background: '#f3e5ab', border: '1px solid #d4c284', padding: '1rem', position: 'relative' }}>
            <ResponsiveContainer width="100%" height={450}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(220, 38, 38, 0.2)" />
                <XAxis 
                  type="number" 
                  dataKey="parsedHours" 
                  name="Hours" 
                  scale="log"
                  domain={['dataMin', 'dataMax']}
                  ticks={[2, 5, 10, 20, 40, 100, 200, 600]}
                  stroke="#1f2937"
                  label={{ value: 'Hours of Investigation (Log Scale)', position: 'insideBottomRight', offset: -10, fill: '#1f2937' }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="yAxisValue" 
                  name="Rating" 
                  domain={AXIS_DOMAIN} 
                  stroke="#1f2937"
                  ticks={SCORE_TICKS}
                  tickFormatter={tierForScore}
                  label={{ value: 'Tier Rating', angle: -90, position: 'insideLeft', fill: '#1f2937' }} 
                />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isBubbleChart={false} />} wrapperStyle={{ zIndex: 1000 }} />
                <Scatter 
                  name="Stories" 
                  data={scatterData} 
                  onClick={(data) => onViewChange('cards', data.payload || data)}
                  style={{ cursor: 'pointer' }}
                >
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#dc2626" className="chart-node-hover" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Insights under Chart 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.7rem', marginBottom: '2.7rem', position: 'relative', zIndex: 10 }}>
          <div className="note-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="red-pin" style={{ top: '10px', left: 'auto', right: '10px' }}></div>
            <h3 style={{ fontFamily: 'Special Elite', color: '#111', fontSize: '1.4rem' }}>Collaborative Synergy</h3>
            <div className="stamp sepia" style={{ marginTop: '1rem', display: 'inline-block' }}>
              {agreementStats.rate} SYNERGY
            </div>
            <p style={{ marginTop: '1rem', color: '#111', fontSize: '1.5rem' }}>
              Rated within 1 tier across {agreementStats.totalBoth} shared cases.
            </p>
          </div>

          <div className="note-card" style={{ transform: 'rotate(1deg)', display: 'flex', flexDirection: 'column' }}>
            <div className="red-pin" style={{ top: '10px', left: 'auto', right: '10px' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div className="stamp red" style={{ marginTop: '0.5rem', marginBottom: '1.5rem', display: 'inline-block' }}>
                CONTRADICTION DETECTED
              </div>
            </div>
            
            {agreementStats.topDisagreements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {agreementStats.topDisagreements.map((story, i) => (
                  <div key={story.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ccc', paddingBottom: '4px' }}>
                    <span style={{ color: '#111', fontFamily: 'Special Elite', cursor: 'pointer' }} onClick={() => onViewChange('cards', story)}>{truncateName(story.name)}</span>
                    <span style={{ color: '#dc2626', fontFamily: 'Caveat', fontSize: '1.2rem' }}>Pratyush: {tierLabel(story.rankingPratyush)} vs Kanav: {tierLabel(story.rankingKanav)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>No contested cases found</div>
            )}
          </div>
        </div>

        {/* Bubble Chart */}
        <div className="controls-card">
          <div className="controls-row-top" style={{ marginBottom: '0.68rem' }}>
            <h3 style={{ fontSize: '2.03rem', fontWeight: 700 }}>The Cross-Examination Matrix</h3>
          </div>
          <p style={{ fontFamily: 'Caveat', fontSize: '1.8rem', color: '#111', marginBottom: '1.35rem' }}>
            Bubble size represents hours spent. Plotting Subject Kanav's Ratings against Subject Pratyush's Ratings. Hover or click to explore.
          </p>
          <div style={{ background: '#f3e5ab', border: '1px solid #d4c284', padding: '1rem', position: 'relative' }}>
            <ResponsiveContainer width="100%" height={550}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="plotKVal" 
                  name="Subject Kanav's Ratings" 
                  domain={AXIS_DOMAIN} 
                  stroke="#1f2937"
                  ticks={SCORE_TICKS}
                  tickFormatter={tierForScore}
                  label={{ value: "Subject Kanav's Ratings", position: 'insideBottom', offset: -10, fill: '#1f2937' }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="plotPVal" 
                  name="Subject Pratyush's Ratings" 
                  domain={AXIS_DOMAIN} 
                  stroke="#1f2937"
                  ticks={SCORE_TICKS}
                  tickFormatter={tierForScore}
                  label={{ value: "Subject Pratyush's Ratings", angle: -90, position: 'insideLeft', fill: '#1f2937' }} 
                />
                <ZAxis type="number" dataKey="parsedHours" range={[60, 2500]} name="Hours" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isBubbleChart={true} />} wrapperStyle={{ zIndex: 1000 }} />
                <Scatter 
                  name="Versus" 
                  data={bubbleData} 
                  onClick={(data) => onViewChange('cards', data.payload || data)}
                  style={{ cursor: 'pointer' }}
                >
                  {bubbleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="rgba(185, 28, 28, 0.5)" stroke="#7f1d1d" strokeWidth={2} className="chart-node-hover" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.7rem', marginBottom: '2.7rem' }}>
          <div className="controls-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.69rem', marginBottom: '1.35rem' }}>📋 Most Fruitful Categories</h3>
            {leaderboards.topGenres.map((g, i) => (
              <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.01rem 0', borderBottom: '1px solid rgba(139, 69, 19, 0.2)' }}>
                <span><strong style={{ opacity: 0.7 }}>#{i+1}</strong> {g.name}</span>
                <span className="score-badge">{g.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="controls-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.69rem', marginBottom: '1.35rem' }}>📂 Preferred Evidence Formats</h3>
            {leaderboards.topMediums.map((m, i) => (
              <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.01rem 0', borderBottom: '1px solid rgba(139, 69, 19, 0.2)' }}>
                <span><strong style={{ opacity: 0.7 }}>#{i+1}</strong> {m.name}</span>
                <span className="score-badge">{m.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brother Split View */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.7rem', marginBottom: '2.7rem' }}>
          {/* Pratyush Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.7rem' }}>
            <div className="note-card" style={{ textAlign: 'center', padding: '1.35rem' }}>
              <div className="red-pin" style={{ top: '10px' }}></div>
              <h3 style={{ fontSize: '2.43rem', fontFamily: 'Special Elite', color: '#2563eb', margin: 0 }}>Detective Pratyush's Profile</h3>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem', display: 'flex', alignItems: 'center', gap: '0.68rem' }}>
                👤 Persons of Interest
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
                {PRATYUSH_FAVORITES.map(({ character, story: storyName }) => {
                  const story = storiesBySlug[slugify(storyName)];
                  return (
                    <div key={character} className="polaroid-card" style={{ width: '100px', height: '120px', padding: '10px 10px 40px 10px', display: 'flex', flexDirection: 'column', cursor: story ? 'pointer' : 'default' }} onClick={() => story && onViewChange('cards', story)} title={story?.name}>
                      {story
                        ? <Poster story={story} style={{ flex: 1, width: '100%', minHeight: 0, objectFit: 'cover' }} />
                        : <div style={{ flex: 1, background: '#222', width: '100%' }}></div>}
                      <span style={{ bottom: '10px', left: '0', right: '0', textAlign: 'center', fontSize: '1.2rem' }}>{character}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Verdict Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.ratingData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="tier" stroke="#1f2937" />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#0369a1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Cases by Medium</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.mediumData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#1f2937" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Primary Investigative Genres</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.genreData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#1f2937" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#4338ca" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kanav Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.7rem' }}>
            <div className="note-card" style={{ textAlign: 'center', padding: '1.35rem', transform: 'rotate(-1deg)' }}>
              <div className="red-pin" style={{ top: '10px' }}></div>
              <h3 style={{ fontSize: '2.43rem', fontFamily: 'Special Elite', color: '#d97706', margin: 0 }}>Detective Kanav's Profile</h3>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem', display: 'flex', alignItems: 'center', gap: '0.68rem' }}>
                👤 Persons of Interest
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
                {KANAV_FAVORITES.map(({ character, story: storyName }) => {
                  const story = storiesBySlug[slugify(storyName)];
                  return (
                    <div key={character} className="polaroid-card" style={{ width: '100px', height: '120px', padding: '10px 10px 40px 10px', display: 'flex', flexDirection: 'column', cursor: story ? 'pointer' : 'default' }} onClick={() => story && onViewChange('cards', story)} title={story?.name}>
                      {story
                        ? <Poster story={story} style={{ flex: 1, width: '100%', minHeight: 0, objectFit: 'cover' }} />
                        : <div style={{ flex: 1, background: '#222', width: '100%' }}></div>}
                      <span style={{ bottom: '10px', left: '0', right: '0', textAlign: 'center', fontSize: '1.2rem' }}>{character}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Verdict Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.ratingData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="tier" stroke="#1f2937" />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Cases by Medium</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.mediumData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#1f2937" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#a21caf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1.35rem', fontSize: '1.49rem' }}>Primary Investigative Genres</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.genreData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#1f2937" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#1f2937" />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#f4ebd0', color: '#2c1e16', border: '1px solid #5d4037', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="#c2410c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
