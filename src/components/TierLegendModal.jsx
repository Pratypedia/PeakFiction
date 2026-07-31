import React from 'react';
import { X, Flame, Zap, Sparkles, ThumbsUp, Clock } from 'lucide-react';

export default function TierLegendModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const tiers = [
    {
      name: 'Peak',
      icon: <Flame size={18} color="#ff6b8b" />,
      colorClass: 'Peak',
      scoreRange: '9.0 – 10.0',
      tagline: 'God Tier / Must Experience',
      description: 'I love this story, I will talk about it for hours and pitch it to you.'
    },
    {
      name: 'S',
      icon: <Zap size={18} color="#38ef7d" />,
      colorClass: 'S',
      scoreRange: '7.5 – 8.95',
      tagline: 'Exceptional',
      description: 'Exceptional story. Outstanding execution and storytelling.'
    },
    {
      name: 'A',
      icon: <Sparkles size={18} color="#c77dff" />,
      colorClass: 'A',
      scoreRange: '5.0 – 7.49',
      tagline: 'Great & Fun',
      description: 'Really fun story, minor issues but they don\'t distract from the story, not truly mindblowing.'
    },
    {
      name: 'B',
      icon: <ThumbsUp size={18} color="#90e0ef" />,
      colorClass: 'B',
      scoreRange: '0.0 – 4.99',
      tagline: 'Enjoyable with Flaws',
      description: 'I kinda enjoyed it, but there were definitely elements that took away from the story — obvious need for improvement at parts.'
    },
    {
      name: 'Pending',
      icon: <Clock size={18} color="#94a3b8" />,
      colorClass: 'Pending',
      scoreRange: 'N/A',
      tagline: 'Work in Progress (-)',
      description: 'Story is queued to be rated or commented on by Pratyush or Kanav.'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Ranking & Score Breakdown</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Here is the numerical score scale and tier definition used across the vault:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ minWidth: '85px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span className={`tier-badge ${tier.colorClass}`}>
                  {tier.name}
                </span>
                {tier.scoreRange !== 'N/A' && (
                  <span style={{ fontSize: '0.7rem', color: '#ffb703', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {tier.scoreRange}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  {tier.icon}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tier.tagline}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {tier.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
