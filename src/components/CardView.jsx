import React, { useState, useMemo } from 'react';
import Header from './Header';
import StatsBar from './StatsBar';
import FilterControls from './FilterControls';
import StoryCard from './StoryCard';
import EditModal from './EditModal';
import StoryDetailModal from './StoryDetailModal';
import { Mountain } from 'lucide-react';

export default function CardView({ stories, socialData, setStories, onViewChange, targetStory, clearTargetStory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const [editingStory, setEditingStory] = useState(null);
  const [detailStory, setDetailStory] = useState(null);

  React.useEffect(() => {
    if (targetStory) {
      const story = stories.find(s => s.name === targetStory.name);
      if (story) {
        setDetailStory(story);
        setTimeout(() => {
          const el = document.getElementById(`story-card-${story.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      if (clearTargetStory) clearTargetStory();
    }
  }, [targetStory, stories, clearTargetStory]);

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
        const matchesHours = story.hours && story.hours.toString().includes(query);
        if (!matchesName && !matchesMedium && !matchesGenre && !matchesFav && !matchesHours) {
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

      return true;
    });
  }, [stories, searchQuery, selectedMedium, selectedTier, selectedGenre]);

  const handleSaveStory = (updatedStory) => {
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMedium('');
    setSelectedTier('');
    setSelectedGenre('');
  };

  const getTierValue = (rank) => {
    if (!rank) return 0;
    const cleanRank = rank.trim().toUpperCase();
    if (cleanRank === 'PEAK') return 10;
    if (cleanRank === 'S') return 9;
    if (cleanRank === 'A') return 8;
    if (cleanRank === 'B') return 7;
    if (cleanRank === 'C') return 6;
    if (cleanRank === 'D') return 5;
    if (cleanRank === 'F') return 3;
    return 0; // Pending
  };

  const getTierLabel = (val) => {
    switch(val) {
      case 10: return 'Peak';
      case 9: return 'S';
      case 8: return 'A';
      case 7: return 'B';
      case 6: return 'C';
      case 5: return 'D';
      case 3: return 'F';
      default: return 'Pending';
    }
  };

  const groupedStories = useMemo(() => {
    const groups = {};
    filteredStories.forEach(story => {
      const pVal = getTierValue(story.rankingPratyush);
      const kVal = getTierValue(story.rankingKanav);
      const highest = Math.max(pVal, kVal);
      const label = getTierLabel(highest);
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(story);
    });
    return groups;
  }, [filteredStories]);

  const orderedTiers = ['Peak', 'S', 'A', 'B', 'C', 'D', 'F', 'Pending'];
  const populatedTiers = orderedTiers.filter(t => groupedStories[t] && groupedStories[t].length > 0);

  const scrollToTier = (tier) => {
    const el = document.getElementById(`tier-${tier}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Header totalStories={stories ? stories.length : 0} />

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
        </div>

        {populatedTiers.length > 0 && (
          <div className="elevator-nav">
            {populatedTiers.map(tier => (
              <button 
                key={tier} 
                className={`elevator-btn ${tier}`} 
                onClick={() => scrollToTier(tier)}
                title={`Scroll to ${tier} Tier`}
              >
                {tier === 'Pending' ? '?' : tier[0]}
              </button>
            ))}
          </div>
        )}

        {filteredStories.length > 0 ? (
          <div>
            {populatedTiers.map(tier => (
              <div key={tier} id={`tier-${tier}`} className="tier-section">
                <div className={`tier-divider ${tier}`}>
                  <h2>{tier === 'Pending' ? 'Unrated / Pending' : `${tier} Tier`}</h2>
                  <div className="tier-divider-line"></div>
                </div>
                <div className="cards-grid">
                  {groupedStories[tier].map(story => (
                    <div key={story.id} id={`story-card-${story.id}`}>
                      <StoryCard 
                        story={story}
                        social={socialData[story.name] || { likes: 0, comments: 0 }}
                        onEdit={(s) => setEditingStory(s)}
                        onCardClick={(s) => setDetailStory(s)}
                      />
                    </div>
                  ))}
                </div>
              </div>
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

      <EditModal 
        story={editingStory}
        isOpen={Boolean(editingStory)}
        onClose={() => setEditingStory(null)}
        onSave={handleSaveStory}
      />

      <StoryDetailModal 
        story={detailStory}
        isOpen={Boolean(detailStory)}
        onClose={() => setDetailStory(null)}
      />
    </div>
  );
}
