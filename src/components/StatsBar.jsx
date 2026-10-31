import React from 'react';
import { Flame, Zap, Sparkles, Database } from 'lucide-react';
import { tierKey } from '../lib/tiers';

export default function StatsBar({ stories }) {
  const countRank = (tier) =>
    stories.filter(s => tierKey(s.rankingPratyush) === tier || tierKey(s.rankingKanav) === tier).length;
  const peakCount = countRank('Peak');

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <div className="kpi-box">
        <div style={{ background: '#736757', padding: '0.65rem', borderRadius: '10px' }}>
          <Database size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stories.length}</div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(62, 39, 35, 0.8)', fontWeight: 600 }}>Total Vault Entries</div>
        </div>
      </div>

      <div className="kpi-box">
        <div style={{ background: '#736757', padding: '0.65rem', borderRadius: '10px' }}>
          <Flame size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{peakCount}</div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(62, 39, 35, 0.8)', fontWeight: 600 }}>Peak Tier Stories</div>
        </div>
      </div>

      <div className="kpi-box">
        <div style={{ background: '#736757', padding: '0.65rem', borderRadius: '10px' }}>
          <Zap size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{countRank('S')}</div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(62, 39, 35, 0.8)', fontWeight: 600 }}>S-Tier Stories</div>
        </div>
      </div>

      <div className="kpi-box">
        <div style={{ background: '#736757', padding: '0.65rem', borderRadius: '10px' }}>
          <Sparkles size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{countRank('A')}</div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(62, 39, 35, 0.8)', fontWeight: 600 }}>A-Tier Stories</div>
        </div>
      </div>
    </div>
  );
}
