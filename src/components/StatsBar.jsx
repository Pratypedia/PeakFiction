import React from 'react';
import { Flame, Zap, Sparkles, ThumbsUp, Database } from 'lucide-react';

export default function StatsBar({ stories }) {
  const countRank = (rank) => stories.filter(s => s.rankingPratyush === rank || s.rankingKanav === rank).length;
  const peakCount = stories.filter(s => s.rankingPratyush === 'Peak' || s.rankingKanav === 'Peak').length;

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Database size={22} color="#c084fc" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stories.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Vault Entries</div>
        </div>
      </div>

      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div style={{ background: 'rgba(255, 59, 92, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Flame size={22} color="#ff6b8b" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b8b' }}>{peakCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Tier Stories</div>
        </div>
      </div>

      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div style={{ background: 'rgba(0, 245, 212, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Zap size={22} color="#38ef7d" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38ef7d' }}>{countRank('S')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>S-Tier Stories</div>
        </div>
      </div>

      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div style={{ background: 'rgba(157, 78, 221, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Sparkles size={22} color="#c77dff" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c77dff' }}>{countRank('A')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>A-Tier Stories</div>
        </div>
      </div>
    </div>
  );
}
