import React, { useState, useMemo } from 'react';

import StatsBar from './StatsBar';
import FilterControls from './FilterControls';
import StoryCard from './StoryCard';
import StoryDetailModal from './StoryDetailModal';
import { playElevatorDing } from '../lib/audio';
import { TIER_ORDER, PENDING, tierKey, tierScore } from '../lib/tiers';

export default function CardView({ stories, socialData, socialAvailable, openSlug, onOpenStory, onCloseStory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const [isElevatorMoving, setIsElevatorMoving] = useState(false);
  const [floorDisplay, setFloorDisplay] = useState('Floor Peak');

  const detailStory = useMemo(
    () => (openSlug ? stories.find(s => s.slug === openSlug) || null : null),
    [openSlug, stories]
  );

  // Deep links (#/stories/<slug>) scroll the card into view behind the modal.
  const detailSlug = detailStory?.slug;
  React.useEffect(() => {
    if (!detailSlug) return;
    const timer = setTimeout(() => {
      document.getElementById(`story-card-${detailSlug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(timer);
  }, [detailSlug]);

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
        const pTier = tierKey(story.rankingPratyush);
        const kTier = tierKey(story.rankingKanav);
        const matches = selectedTier === PENDING
          ? pTier === PENDING && kTier === PENDING
          : pTier === selectedTier || kTier === selectedTier;
        if (!matches) return false;
      }

      return true;
    });
  }, [stories, searchQuery, selectedMedium, selectedTier, selectedGenre]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMedium('');
    setSelectedTier('');
    setSelectedGenre('');
  };

  // Group by the better of the two ratings.
  const groupedStories = useMemo(() => {
    const groups = {};
    filteredStories.forEach(story => {
      const best = [story.rankingPratyush, story.rankingKanav]
        .sort((a, b) => (tierScore(b) ?? -1) - (tierScore(a) ?? -1))[0];
      const label = tierKey(best);
      (groups[label] ??= []).push(story);
    });
    return groups;
  }, [filteredStories]);

  const populatedTiers = TIER_ORDER.filter(t => groupedStories[t]?.length > 0);
  const availableTiers = useMemo(() => {
    const present = new Set(stories.flatMap(s => [tierKey(s.rankingPratyush), tierKey(s.rankingKanav)]));
    return TIER_ORDER.filter(t => present.has(t));
  }, [stories]);

  const scrollToTier = (tier) => {
    if (isElevatorMoving) return;
    setIsElevatorMoving(true);
    setFloorDisplay(`Moving to ${tier}...`);

    setTimeout(() => {
      const el = document.getElementById(`tier-${tier}`);
      if (el) {
        el.scrollIntoView({ behavior: 'instant' });
      }
      playElevatorDing();
      setFloorDisplay(`Floor ${tier}`);
      
      setTimeout(() => {
        setIsElevatorMoving(false);
      }, 800);
    }, 1000);
  };

  return (
    <div className="cards-page-wrapper">
      <main className="container building-wrapper">
        <div className="building-roof"></div>
        <div className="building-container">
          <div className="top-dashboard-panel penthouse-section">
          <div className="hero-section" style={{ marginBottom: 0 }}>
            <h2 className="hero-title" style={{ color: 'white' }}>All stories</h2>
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
            tiers={availableTiers}
            onResetFilters={handleResetFilters}
          />
        </div>



        {populatedTiers.length > 0 && (
          <div className="elevator-panel">
            <div className="elevator-display-small">{isElevatorMoving ? 'MOVING...' : floorDisplay}</div>
            <div className="elevator-nav">
              {populatedTiers.map(tier => (
                <button 
                  key={tier} 
                  className={`elevator-btn ${tier}`} 
                  onClick={() => scrollToTier(tier)}
                  title={`Go to ${tier} Floor`}
                >
                  <span className="btn-inner">{tier === 'Pending' ? '?' : tier[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredStories.length > 0 ? (
          <div>
            {populatedTiers.map(tier => (
              <div key={tier} id={`tier-${tier}`} className="tier-section">
                <div className={`tier-divider ${tier}`}>
                  <h2 className="tier-title">{tier === 'Pending' ? 'Unrated / Pending' : `${tier} Tier`}</h2>
                  <div className="tier-divider-line"></div>
                </div>
                <div className="cards-grid">
                  {groupedStories[tier].map(story => (
                    <div key={story.slug} id={`story-card-${story.slug}`}>
                      <StoryCard 
                        story={story}
                        social={socialData[story.name] || { likes: 0, comments: 0 }}
                        onCardClick={onOpenStory}
                      />
                    </div>
                  ))}
                  {groupedStories[tier].length % 5 !== 0 && 
                    Array.from({ length: 5 - (groupedStories[tier].length % 5) }).map((_, i) => (
                      <div key={`mirror-${i}`} className="window-mirror">
                        <div className="window-glass"></div>
                      </div>
                    ))
                  }
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
        </div>
      </main>

      <footer className="app-footer building-ground">
        <div className="container">
          <p>🌌 <strong>Peak Fiction Vault</strong> — Maintained by Pratyush & Kanav</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            Built with React, Vite & Modern Dark Design
          </p>
        </div>
      </footer>



      <StoryDetailModal 
        story={detailStory}
        isOpen={Boolean(detailStory)}
        onClose={onCloseStory}
        socialAvailable={socialAvailable}
      />

      <div className={`elevator-doors ${isElevatorMoving ? 'closed' : 'open'}`}>
        <div className="elevator-door left"></div>
        <div className="elevator-door right"></div>
        {isElevatorMoving && (
          <div className="elevator-display-center">
            {floorDisplay}
          </div>
        )}
      </div>
    </div>
  );
}
