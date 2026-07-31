import React, { useState, useMemo } from 'react';
import Header from './Header';
import StatsBar from './StatsBar';
import FilterControls from './FilterControls';
import StoryCard from './StoryCard';
import TierLegendModal from './TierLegendModal';
import EditModal from './EditModal';
import { Flame, Mountain } from 'lucide-react';

export default function CardView({ stories, setStories, onViewChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all'); 
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // Extract unique mediums
  const allMediums = useMemo(() => {
    const set = new Set();
    stories.forEach(s => {
      if (Array.isArray(s.medium)) {
        s.medium.forEach(m => set.add(m));
      }
    });
    return Array.from(set).sort();
  }, [stories]);

  // Extract unique genres
  const allGenres = useMemo(() => {
    const set = new Set();
    stories.forEach(s => {
      if (Array.isArray(s.genre)) {
        s.genre.forEach(g => set.add(g));
      }
    });
    return Array.from(set).sort();
  }, [stories]);

  // Filtered stories logic
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = story.name.toLowerCase().includes(query);
        const matchesMedium = story.medium.some(m => m.toLowerCase().includes(query));
        const matchesGenre = story.genre.some(g => g.toLowerCase().includes(query));
        const matchesFav = story.favoriteCharacters.toLowerCase().includes(query);
        const matchesScore = story.score && story.score.toString().includes(query);
        if (!matchesName && !matchesMedium && !matchesGenre && !matchesFav && !matchesScore) {
          return false;
        }
      }

      if (selectedMedium && !story.medium.includes(selectedMedium)) {
        return false;
      }
      if (selectedGenre && !story.genre.includes(selectedGenre)) {
        return false;
      }
      if (selectedTier) {
        const pRank = story.rankingPratyush || 'Pending';
        const kRank = story.rankingKanav || 'Pending';
        if (pRank !== selectedTier && kRank !== selectedTier) {
          return false;
        }
      }

      if (viewMode === 'pratyush') {
        if (!story.rankingPratyush && selectedTier) return false;
      } else if (viewMode === 'kanav') {
        if (!story.rankingKanav && selectedTier) return false;
      } else if (viewMode === 'peak') {
        if (story.rankingPratyush !== 'Peak' && story.rankingKanav !== 'Peak') {
          return false;
        }
      } else if (viewMode === 'debates') {
        if (!story.rankingPratyush || !story.rankingKanav || story.rankingPratyush === story.rankingKanav) {
          return false;
        }
      }

      return true;
    });
  }, [stories, searchQuery, viewMode, selectedMedium, selectedTier, selectedGenre]);

  const handleSaveStory = (updatedStory) => {
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Medium',
      'Genre',
      'Length',
      'Score/10',
      'Ranking - Pratyush',
      'Comments - Pratyush',
      'Ranking - Kanav',
      'Comments - Kanav',
      'Favorite Character(s)'
    ];

    const rows = stories.map(s => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.medium.join(', ')}"`,
      `"${s.genre.join(', ')}"`,
      `"${(s.length || '').replace(/"/g, '""')}"`,
      `"${(s.score || '').replace(/"/g, '""')}"`,
      `"${s.rankingPratyush || '-'}"`,
      `"${(s.commentsPratyush || '').replace(/"/g, '""')}"`,
      `"${s.rankingKanav || '-'}"`,
      `"${(s.commentsKanav || '').replace(/"/g, '""')}"`,
      `"${(s.favoriteCharacters || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Peak_Fiction_Updated.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMedium('');
    setSelectedTier('');
    setSelectedGenre('');
    setViewMode('all');
  };

  return (
    <div>
      <Header 
        onOpenLegend={() => setIsLegendOpen(true)}
        onExportCSV={handleExportCSV}
      />
      
      {/* View Switcher Bar */}
      <div className="container" style={{ padding: '1rem 0' }}>
        <button 
          onClick={() => onViewChange('mountain')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', fontSize: '1.1rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #00c6ff, #0072ff)', border: 'none' }}
        >
          <Mountain size={20} /> View Interactive Mountain
        </button>
      </div>

      <main className="container" style={{ paddingTop: '1rem' }}>
        <div className="hero-section">
          <h2 className="hero-title gradient-text">Fictional Universes & Rankings</h2>
          <p className="hero-subtitle">
            Every story, anime, manhwa, novel, book, comic, and movie we've experienced.
          </p>
        </div>

        <StatsBar stories={stories} />

        <FilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedMedium={selectedMedium}
          setSelectedMedium={setSelectedMedium}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          allMediums={allMediums}
          allGenres={allGenres}
          onResetFilters={handleResetFilters}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Showing {filteredStories.length} {filteredStories.length === 1 ? 'Story' : 'Stories'}
          </h3>
          {viewMode === 'peak' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ff6b8b', fontWeight: 600, fontSize: '0.875rem' }}>
              <Flame size={16} /> Peak Tier Showcase
            </span>
          )}
        </div>

        {filteredStories.length > 0 ? (
          <div className="cards-grid">
            {filteredStories.map(story => (
              <StoryCard 
                key={story.id}
                story={story}
                onEdit={(s) => setEditingStory(s)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No stories matched your filters</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your search query, medium, or tier filters.
            </p>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>🌌 <strong>Peak Fiction Vault</strong> — Maintained by Pratyush & Kanav</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            Built with React, Vite & Modern Dark Design
          </p>
        </div>
      </footer>

      <TierLegendModal 
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      <EditModal 
        story={editingStory}
        isOpen={Boolean(editingStory)}
        onClose={() => setEditingStory(null)}
        onSave={handleSaveStory}
      />
    </div>
  );
}
