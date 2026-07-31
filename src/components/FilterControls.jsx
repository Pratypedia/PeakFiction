import React from 'react';
import { Search, Filter, Flame, Users, Sparkles, RefreshCw } from 'lucide-react';

export default function FilterControls({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedMedium,
  setSelectedMedium,
  selectedTier,
  setSelectedTier,
  selectedGenre,
  setSelectedGenre,
  allMediums,
  allGenres,
  onResetFilters
}) {
  const tiers = ['Peak', 'S', 'A', 'B', 'Pending'];

  return (
    <div className="controls-card">
      <div className="controls-row-top">
        {/* View Mode Tabs */}
        <div className="view-mode-tabs">
          <button 
            className={`view-tab ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            <Users size={16} />
            <span>Dual View</span>
          </button>

          <button 
            className={`view-tab ${viewMode === 'pratyush' ? 'active' : ''}`}
            onClick={() => setViewMode('pratyush')}
          >
            <span>👤 Pratyush</span>
          </button>

          <button 
            className={`view-tab ${viewMode === 'kanav' ? 'active' : ''}`}
            onClick={() => setViewMode('kanav')}
          >
            <span>👤 Kanav</span>
          </button>

          <button 
            className={`view-tab ${viewMode === 'peak' ? 'active' : ''}`}
            onClick={() => setViewMode('peak')}
          >
            <Flame size={16} color="#ff3b5c" />
            <span>Peak Only</span>
          </button>

          <button 
            className={`view-tab ${viewMode === 'debates' ? 'active' : ''}`}
            onClick={() => setViewMode('debates')}
          >
            <Sparkles size={16} color="#c77dff" />
            <span>Debates</span>
          </button>
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search stories, characters, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Groups */}
      <div className="filter-groups">
        {/* Tier Filter */}
        <div className="filter-row">
          <span className="filter-label">Tier:</span>
          <div className="chip-container">
            <button 
              className={`chip ${selectedTier === '' ? 'active' : ''}`}
              onClick={() => setSelectedTier('')}
            >
              All Tiers
            </button>
            {tiers.map((t) => (
              <button
                key={t}
                className={`chip ${selectedTier === t ? 'active' : ''}`}
                onClick={() => setSelectedTier(selectedTier === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Medium Filter */}
        <div className="filter-row">
          <span className="filter-label">Medium:</span>
          <div className="chip-container">
            <button 
              className={`chip ${selectedMedium === '' ? 'active' : ''}`}
              onClick={() => setSelectedMedium('')}
            >
              All Formats
            </button>
            {allMediums.map((m) => (
              <button
                key={m}
                className={`chip ${selectedMedium === m ? 'active' : ''}`}
                onClick={() => setSelectedMedium(selectedMedium === m ? '' : m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Top Genres Filter */}
        <div className="filter-row">
          <span className="filter-label">Genre:</span>
          <div className="chip-container">
            <button 
              className={`chip ${selectedGenre === '' ? 'active' : ''}`}
              onClick={() => setSelectedGenre('')}
            >
              All Genres
            </button>
            {allGenres.slice(0, 10).map((g) => (
              <button
                key={g}
                className={`chip ${selectedGenre === g ? 'active' : ''}`}
                onClick={() => setSelectedGenre(selectedGenre === g ? '' : g)}
              >
                {g}
              </button>
            ))}
          </div>
          
          {(selectedMedium || selectedTier || selectedGenre || searchQuery) && (
            <button 
              onClick={onResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-pink)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginLeft: 'auto'
              }}
            >
              <RefreshCw size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
