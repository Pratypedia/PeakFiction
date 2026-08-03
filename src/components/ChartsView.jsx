import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  BarChart, Bar
} from 'recharts';
import Header from './Header';
import StoryDetailModal from './StoryDetailModal';

// Helper to convert tier strings to numerical values (0 to 10)
const getTierValue = (rank) => {
  if (!rank || rank === '-') return null; // We use null for missing ratings
  const cleanRank = rank.trim().toUpperCase();
  if (cleanRank === 'PEAK') return 10;
  if (cleanRank === 'S') return 9;
  if (cleanRank === 'A') return 8;
  if (cleanRank === 'B') return 7;
  if (cleanRank === 'C') return 6;
  if (cleanRank === 'D') return 5;
  if (cleanRank === 'F') return 3;
  return null;
};

// Helper for formatting Y-axis labels
const formatTierLabel = (val) => {
  if (val >= 10) return 'Peak';
  if (val >= 9) return 'S';
  if (val >= 8) return 'A';
  if (val >= 7) return 'B';
  if (val >= 6) return 'C';
  if (val >= 5) return 'D';
  if (val >= 3) return 'F';
  return '';
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, isBubbleChart }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="story-tooltip chart-tooltip" style={{ position: 'relative', transform: 'none', top: 0, left: 0, width: '250px', padding: '16px', zIndex: 1000 }}>
        {data.imageUrl && (
          <img src={data.imageUrl} alt={data.name} className="tooltip-image" />
        )}
        <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{data.name}</h4>
        <div className="tooltip-meta" style={{ marginBottom: '8px' }}>
          <span className="score-badge" style={{ fontSize: '1rem', padding: '4px 8px' }}>{data.medium.join(', ')}</span>
        </div>
        <div style={{ fontSize: '1rem', color: '#ccc', marginTop: '10px' }}>
          <div><strong>Hours:</strong> {data.parsedHours}</div>
          {isBubbleChart ? (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div><span style={{ color: '#a855f7', fontWeight: 'bold' }}>Pratyush:</span> {data.rankingPratyush || 'None'}</div>
              <div><span style={{ color: '#06b6d4', fontWeight: 'bold' }}>Kanav:</span> {data.rankingKanav || 'None'}</div>
            </div>
          ) : (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div><strong>Rating:</strong> {data.yAxisValue.toFixed(1)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function ChartsView({ stories }) {
  const [scatterFilter, setScatterFilter] = useState('average'); // 'average', 'pratyush', 'kanav'
  const [detailStory, setDetailStory] = useState(null);

  // Parse stories to ensure they have valid hours
  const validStories = useMemo(() => {
    return stories
      .map(story => {
        let parsedHours = null;
        if (story.hours) {
          // Extract numbers (e.g., "500+", "2,000")
          const cleanStr = story.hours.toString().replace(/,/g, '');
          const numMatch = cleanStr.match(/\d+(\.\d+)?/);
          if (numMatch) parsedHours = parseFloat(numMatch[0]);
        }
        return {
          ...story,
          parsedHours,
          pVal: getTierValue(story.rankingPratyush),
          kVal: getTierValue(story.rankingKanav)
        };
      })
      .filter(s => s.parsedHours !== null && !isNaN(s.parsedHours)); // Omit missing hours
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

          const plotKVal = Math.min(10.3, Math.max(2.2, story.kVal + radius * Math.cos(angle)));
          const plotPVal = Math.min(10.3, Math.max(2.2, story.pVal + radius * Math.sin(angle)));

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
    
    const consolidateMedium = (m) => {
      const low = m.toLowerCase();
      if (['novel', 'book'].includes(low)) return 'Books + Novels';
      if (['show', 'anime'].includes(low)) return 'Shows';
      if (['manhwa', 'manga', 'comic'].includes(low)) return 'Comics';
      if (low === 'movie') return 'Movies';
      if (low === 'game') return 'Games';
      return 'Other';
    };

    stories.forEach(story => {
      const pVal = getTierValue(story.rankingPratyush);
      const kVal = getTierValue(story.rankingKanav);
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

  // Agreement Rate & Top 3 Hot Takes calculation
  const agreementStats = useMemo(() => {
    const dualRated = stories.filter(s => {
      const p = getTierValue(s.rankingPratyush);
      const k = getTierValue(s.rankingKanav);
      return p !== null && k !== null;
    });
    if (dualRated.length === 0) return { rate: '0.0%', totalBoth: 0, topDisagreements: [] };

    let closeMatches = 0;
    const itemsWithDelta = dualRated.map(s => {
      const p = getTierValue(s.rankingPratyush);
      const k = getTierValue(s.rankingKanav);
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
    const consolidateMedium = (m) => {
      const low = m.toLowerCase();
      if (['novel', 'book'].includes(low)) return 'Books + Novels';
      if (['show', 'anime'].includes(low)) return 'Shows';
      if (['manhwa', 'manga', 'comic'].includes(low)) return 'Comics';
      if (low === 'movie') return 'Movies';
      if (low === 'game') return 'Games';
      return 'Other';
    };

    const ratingCounts = { Peak: 0, S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    const mediumCounts = {};
    const genreCounts = {};

    allStories.forEach(story => {
      const rank = isPratyush ? story.rankingPratyush : story.rankingKanav;
      if (!rank || rank === '-') return;
      
      const cleanRank = rank.trim().toUpperCase();
      if (cleanRank === 'PEAK') ratingCounts.Peak++;
      else if (cleanRank === 'S') ratingCounts.S++;
      else if (cleanRank === 'A') ratingCounts.A++;
      else if (cleanRank === 'B') ratingCounts.B++;
      else if (cleanRank === 'C') ratingCounts.C++;
      else if (cleanRank === 'D') ratingCounts.D++;
      else if (cleanRank === 'F') ratingCounts.F++;

      const uniqueConsolidated = Array.from(new Set(story.medium.map(consolidateMedium)));
      uniqueConsolidated.forEach(cm => {
        mediumCounts[cm] = (mediumCounts[cm] || 0) + 1;
      });

      story.genre.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const ratingData = ['Peak', 'S', 'A', 'B', 'C', 'D', 'F'].map(tier => ({ tier, count: ratingCounts[tier] }));
    const mediumData = Object.keys(mediumCounts).map(m => ({ name: m, count: mediumCounts[m] })).sort((a, b) => b.count - a.count);
    const genreData = Object.keys(genreCounts).map(g => ({ name: g, count: genreCounts[g] })).sort((a, b) => b.count - a.count).slice(0, 5);

    return { ratingData, mediumData, genreData };
  };

  const pratyushStats = useMemo(() => getBrotherStats(stories, true), [stories]);
  const kanavStats = useMemo(() => getBrotherStats(stories, false), [stories]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '3rem' }}>
        <div className="hero-section" style={{ paddingBottom: '1.5rem' }}>
          <h2 className="hero-title gradient-text">Data & Analysis</h2>
          <p className="hero-subtitle">
            Explore the relationship between time investment and our enjoyment.
          </p>
        </div>

        {/* Scatter Plot */}
        <div className="controls-card" style={{ position: 'relative', zIndex: 20, marginBottom: '2rem' }}>
          <div className="controls-row-top" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Length vs. Rating</h3>
            <div className="view-mode-tabs">
              <button 
                className={`view-tab ${scatterFilter === 'average' ? 'active' : ''}`}
                onClick={() => setScatterFilter('average')}
              >
                Average Rating
              </button>
              <button 
                className={`view-tab ${scatterFilter === 'pratyush' ? 'active' : ''}`}
                onClick={() => setScatterFilter('pratyush')}
              >
                Pratyush's Rating
              </button>
              <button 
                className={`view-tab ${scatterFilter === 'kanav' ? 'active' : ''}`}
                onClick={() => setScatterFilter('kanav')}
              >
                Kanav's Rating
              </button>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={450}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  dataKey="parsedHours" 
                  name="Hours" 
                  stroke="#94a3b8"
                  label={{ value: 'Hours of Life', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="yAxisValue" 
                  name="Rating" 
                  domain={[2, 10.5]} 
                  stroke="#94a3b8"
                  tickFormatter={formatTierLabel}
                  label={{ value: 'Tier Rating', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
                />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isBubbleChart={false} />} wrapperStyle={{ zIndex: 1000 }} />
                <Scatter 
                  name="Stories" 
                  data={scatterData} 
                  onClick={(data) => setDetailStory(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="rgba(168, 85, 247, 0.8)" className="chart-node-hover" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Insights under Chart 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
          <div className="controls-card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.8rem', background: 'rgba(52, 211, 153, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '10px', lineHeight: 1 }}>
                🤝
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agreement Rate
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
              {agreementStats.rate} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Synergy</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Rated within 1 tier across {agreementStats.totalBoth} shared stories.
            </div>
          </div>

          <div className="controls-card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '10px', lineHeight: 1 }}>
                🥊
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top 3 Hot Takes (Disagreements)
              </div>
            </div>

            {agreementStats.topDisagreements.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {agreementStats.topDisagreements.map((story, i) => (
                  <div 
                    key={story.id} 
                    onClick={() => setDetailStory(story)}
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)', 
                      borderRadius: '10px', 
                      padding: '0.85rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      gap: '0.5rem'
                    }}
                    className="chart-node-hover"
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>
                        #{i + 1} Hot Take
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {story.name}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ color: '#a855f7', fontWeight: 700 }}>Pratyush: {story.rankingPratyush}</span>
                      <span style={{ color: '#64748b', margin: '0 0.3rem' }}>vs</span>
                      <span style={{ color: '#06b6d4', fontWeight: 700 }}>Kanav: {story.rankingKanav}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No debates found</div>
            )}
          </div>
        </div>

        {/* Bubble Chart */}
        <div className="controls-card">
          <div className="controls-row-top" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Versus & Vibe Interactive Matrix</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Bubble size represents hours spent. Plotting Kanav's Rating against Pratyush's Rating. Hover or click to explore.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={550}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  dataKey="plotKVal" 
                  name="Kanav's Rating" 
                  domain={[2, 10.5]} 
                  stroke="#06b6d4"
                  ticks={[3, 5, 6, 7, 8, 9, 10]}
                  tickFormatter={formatTierLabel}
                  label={{ value: "Kanav's Rating", position: 'insideBottom', offset: -10, fill: '#06b6d4' }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="plotPVal" 
                  name="Pratyush's Rating" 
                  domain={[2, 10.5]} 
                  stroke="#a855f7"
                  ticks={[3, 5, 6, 7, 8, 9, 10]}
                  tickFormatter={formatTierLabel}
                  label={{ value: "Pratyush's Rating", angle: -90, position: 'insideLeft', fill: '#a855f7' }} 
                />
                <ZAxis type="number" dataKey="parsedHours" range={[60, 2500]} name="Hours" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isBubbleChart={true} />} wrapperStyle={{ zIndex: 1000 }} />
                <Scatter 
                  name="Versus" 
                  data={bubbleData} 
                  onClick={(data) => setDetailStory(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {bubbleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="rgba(236, 72, 153, 0.7)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={2} className="chart-node-hover" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="controls-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ffb703' }}>🏆 Highest Rated Genres</h3>
            {leaderboards.topGenres.map((g, i) => (
              <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span><strong style={{ opacity: 0.5 }}>#{i+1}</strong> {g.name}</span>
                <span className="score-badge">{g.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="controls-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#06b6d4' }}>🏆 Highest Rated Mediums</h3>
            {leaderboards.topMediums.map((m, i) => (
              <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span><strong style={{ opacity: 0.5 }}>#{i+1}</strong> {m.name}</span>
                <span className="score-badge">{m.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brother Split View */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Pratyush Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', margin: 0 }}>Pratyush</h3>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⭐ Favorite Characters
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {['Arthur Leywin', 'Kim Dokja', 'Spider-Man'].map(char => (
                  <span key={char} className="chip active" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#e9d5ff' }}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Ratings Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.ratingData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tier" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Stories by Medium</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.mediumData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Genres Consumed</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pratyushStats.genreData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kanav Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#67e8f9', margin: 0 }}>Kanav</h3>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⭐ Favorite Characters
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {['Regis', 'Reiner', 'Levi'].map(char => (
                  <span key={char} className="chip active" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem', background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#c7d2fe' }}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Ratings Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.ratingData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tier" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Stories by Medium</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.mediumData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="controls-card" style={{ marginBottom: 0 }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Genres Consumed</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kanavStats.genreData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <StoryDetailModal 
        story={detailStory}
        isOpen={Boolean(detailStory)}
        onClose={() => setDetailStory(null)}
      />
    </div>
  );
}
