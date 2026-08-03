import React from 'react';

export default function Header({ totalStories = 0 }) {
  return (
    <header className="app-header">
      <div className="container header-content">
        <div className="logo-group">
          <span className="logo-icon">🌌</span>
          <div>
            <h1 className="logo-title gradient-text">Peak Fiction</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
              <span className="subtitle-badge">Pratyush & Kanav's Vault</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {totalStories} Stories</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

