import React, { useMemo, useState, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import '../mountain.css';

export default function MountainView({ stories, onViewChange }) {
  const [hoveredStory, setHoveredStory] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Filter and sort scored stories
  const scoredStories = useMemo(() => {
    return stories
      .filter(s => s.score && !isNaN(parseFloat(s.score)))
      .map(s => ({ ...s, numScore: parseFloat(s.score) }))
      .sort((a, b) => a.numScore - b.numScore);
  }, [stories]);

  const N = scoredStories.length;

  // Calculate positions mathematically (sine wave up the mountain)
  const getFlagPosition = (index) => {
    if (N <= 1) return { top: 50, left: 50, percentUp: 0.5 };
    const percentUp = index / (N - 1); // 0 (bottom) to 1 (top)
    
    // Top goes from 95% (base) to 10% (peak)
    const top = 95 - (85 * percentUp);
    
    // The mountain gets narrower at the top. 
    const maxAmplitude = 35;
    const currentAmplitude = maxAmplitude * (1 - percentUp);
    
    // Add phase shift to start at middle
    const wavePhase = percentUp * Math.PI * 6; // 3 full waves
    const left = 50 + currentAmplitude * Math.sin(wavePhase);

    return { top, left, percentUp };
  };

  const handleScroll = (e) => {
    const el = e.target;
    // Update CSS variable for highly performant JS-driven parallax
    el.style.setProperty('--scroll-y', `${el.scrollTop}px`);
    
    const maxScroll = el.scrollHeight - el.clientHeight;
    const progress = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
    setScrollProgress(progress);
  };

  const handleMinimapClick = (percentUp) => {
    const targetScrollProgress = 1 - percentUp;
    const el = containerRef.current;
    if (el) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTo({
        top: maxScroll * targetScrollProgress,
        behavior: 'smooth'
      });
    }
  };

  const renderFlags = (minPercent, maxPercent) => {
    return scoredStories.map((story, i) => {
      const pos = getFlagPosition(i);
      // Only render flags that belong in this segment
      if (pos.percentUp < minPercent || pos.percentUp >= maxPercent) return null;

      const isB = pos.percentUp < 0.3;
      const isPeak = pos.percentUp > 0.85;
      const hasComments = story.commentsPratyush || story.commentsKanav;
      
      let flagClass = "flag-marker";
      if (isPeak) flagClass += " flag-peak";
      else if (isB && !hasComments) flagClass += " flag-b-empty";
      
      return (
        <div 
          key={story.id} 
          className={flagClass}
          style={{ 
            top: `${pos.top}%`, 
            left: `${pos.left}%` 
          }}
          onMouseEnter={() => setHoveredStory({ ...story, pos })}
          onMouseLeave={() => setHoveredStory(null)}
        >
          <div className="flag-pole"></div>
          <div className="flag-banner">
            {isPeak ? '👑' : ''}
          </div>
          <div className="flag-label">
            {story.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div 
      className="mountain-container" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div className="scroll-spacer">
        
        {/* Parallax Layers */}
        <div className="layer-segment layer-peak"></div>
        <div className="layer-segment layer-s"></div>
        <div className="layer-segment layer-clouds"></div>
        <div className="layer-segment layer-a"></div>
        <div className="layer-segment layer-b"></div>

        {/* Flag Wrappers bound to the same parallax speeds as their respective images */}
        
        {/* Peak Flags (Parallax 0.7) */}
        <div className="flags-container" style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.7))' }}>
          {renderFlags(0.8, 1.01)}
        </div>

        {/* S Flags (Parallax 0.5) */}
        <div className="flags-container" style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.5))' }}>
          {renderFlags(0.6, 0.8)}
        </div>

        {/* Clouds Flags (Parallax 0.35) */}
        <div className="flags-container" style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.35))' }}>
          {renderFlags(0.4, 0.6)}
        </div>

        {/* A Flags (Parallax 0.2) */}
        <div className="flags-container" style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.2))' }}>
          {renderFlags(0.2, 0.4)}
        </div>

        {/* B Flags (Parallax 0) */}
        <div className="flags-container" style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0))' }}>
          {renderFlags(0, 0.2)}
        </div>

      </div>

      {/* Navigation Button */}
      <button 
        onClick={() => onViewChange('cards')}
        className="nav-btn-cards"
      >
        <LayoutGrid size={20} /> Editor View
      </button>

      {/* Tooltip rendered safely outside moving layers but positioned absolutely to the screen */}
      {hoveredStory && (
        <div 
          className="story-tooltip fixed-tooltip"
          style={{
            // Convert percentage into fixed pixel coordinates relative to viewport
            // This ensures it doesn't glitch while parallaxing
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed'
          }}
        >
          {hoveredStory.imageUrl && (
            <img 
              src={hoveredStory.imageUrl} 
              alt={hoveredStory.name} 
              className="tooltip-image"
            />
          )}
          <h4>{hoveredStory.name}</h4>
          <div className="tooltip-meta">
            <span className="tier-badge">{hoveredStory.rankingPratyush || hoveredStory.rankingKanav || 'Ranked'}</span>
            <span className="score-badge">Score: {hoveredStory.score}</span>
          </div>
          {(hoveredStory.commentsPratyush || hoveredStory.commentsKanav) && (
            <p className="tooltip-comments">
              {hoveredStory.commentsPratyush || hoveredStory.commentsKanav}
            </p>
          )}
        </div>
      )}

      {/* VS Code Style Minimap */}
      <div className="minimap">
        <div className="minimap-track">
          {scoredStories.map((story, i) => {
            const pos = getFlagPosition(i);
            return (
              <div 
                key={`mini-${story.id}`}
                className="minimap-dot"
                style={{ top: `${pos.top}%`, left: '50%' }}
                onClick={() => handleMinimapClick(pos.percentUp)}
                title={story.name}
              />
            );
          })}
          <div 
            className="minimap-viewport" 
            style={{ 
              top: `${scrollProgress * 100}%`,
              height: containerRef.current ? `${(containerRef.current.clientHeight / containerRef.current.scrollHeight) * 100}%` : '25%'
            }} 
          />
        </div>
      </div>
    </div>
  );
}
