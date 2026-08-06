import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LayoutGrid, Info, ArrowUp, ArrowDown, Heart, MessageSquare } from 'lucide-react';
import '../mountain.css';

export default function MountainView({ stories, socialData, onViewChange }) {
  const [hoveredStory, setHoveredStory] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Reverse so the #1 rank is at the end of the array (peak of the mountain)
  const scoredStories = useMemo(() => {
    return [...stories].reverse();
  }, [stories]);

  const N = scoredStories.length;

  // Calculate positions mathematically
  const getMountainPoint = (p) => {
    // Top goes linearly from 90% (base) to 20% (peak)
    const top = 90 - (70 * p);
    
    // Calculate the mountain's width at this 'top' position to constrain amplitude.
    const fractionDownFromPeak = Math.max(0, (top - 19.0) / 81.0);
    const mountainWidth = 80 * fractionDownFromPeak;
    const maxAllowedAmplitude = Math.max(0, (mountainWidth / 2) - 2.5);
    
    // Desired amplitude increases towards the base
    const desiredAmplitude = 38 * (1 - p);
    const currentAmplitude = Math.min(desiredAmplitude, maxAllowedAmplitude);
    
    // Sine wave
    const numWaves = 3; 
    const sineWave = Math.sin(p * Math.PI * 2 * numWaves);
    
    const left = 50 + currentAmplitude * sineWave;
    
    return { top, left, percentUp: p };
  };

  // Precompute path distances for uniform flag spacing
  const pathData = useMemo(() => {
    const steps = 1000;
    let distances = [0];
    let totalLength = 0;
    let prevPt = getMountainPoint(0);
    
    for (let i = 1; i <= steps; i++) {
      const p = i / steps;
      const pt = getMountainPoint(p);
      const dx = pt.left - prevPt.left;
      // top is % of 400vh, left is % of 100vw. 1% top is approx 2.25x larger visually than 1% left on a typical screen.
      const dy = (pt.top - prevPt.top) * 2.25; 
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      totalLength += dist;
      distances.push(totalLength);
      prevPt = pt;
    }
    return { distances, totalLength, steps };
  }, []);

  const getFlagPosition = (index) => {
    if (N <= 1) return getMountainPoint(0.5);
    
    // Target distance along the path
    const targetDist = (index / (N - 1)) * pathData.totalLength;
    
    // Find corresponding 'p' for this distance
    let p = 1;
    for (let i = 0; i < pathData.distances.length - 1; i++) {
      if (targetDist >= pathData.distances[i] && targetDist <= pathData.distances[i+1]) {
        const segmentDist = pathData.distances[i+1] - pathData.distances[i];
        const fraction = segmentDist > 0 ? (targetDist - pathData.distances[i]) / segmentDist : 0;
        p = (i + fraction) / pathData.steps;
        break;
      }
    }
    
    return getMountainPoint(p);
  };

  // Generate smooth trail path using multiple segments
  const trailPath = useMemo(() => {
    if (N === 0) return '';
    const steps = 100;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const pt = getMountainPoint(p);
      if (i === 0) d += `M ${pt.left} ${pt.top} `;
      else d += `L ${pt.left} ${pt.top} `;
    }
    return d;
  }, [N]);

  // Scroll to bottom on mount so user starts at the base
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant'
      });
    }, 0);
  }, []);

  // Track scrolling for minimap
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMinimapClick = (percentUp) => {
    // percentUp is 1 at peak, 0 at base
    // scrollProgress is 0 at top of page (peak), 1 at bottom of page (base)
    const targetScrollProgress = 1 - percentUp;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    fastScrollTo(maxScroll * targetScrollProgress);
  };

  const fastScrollTo = (targetY) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 600; // Fast 600ms scroll regardless of distance
    let startTime = null;

    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutQuad(progress);
      
      window.scrollTo(0, startY + (distance * ease));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    requestAnimationFrame(animation);
  };

  return (
    <div className="mountain-container" ref={containerRef}>
      
      {/* Background Layers (Parallax/Gradients) */}
      <div className="mountain-sky"></div>
      <div className="stars-overlay"></div>
      <div className="clouds-overlay">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      
      {/* Title */}
      <div className="mountain-title">
        Peak Fiction
      </div>
      
      {/* CSS Procedural Mountain Shapes */}
      <div className="mountain-layer mountain-bg-left"></div>
      <div className="mountain-layer mountain-bg-right"></div>
      <div className="mountain-layer mountain-bg-main"></div>
      
      <div className="mountain-layer mountain-mid-1"></div>
      <div className="mountain-layer mountain-mid-2"></div>
      
      <div className="mountain-layer mountain-front-1"></div>
      <div className="mountain-layer mountain-front-2"></div>

      <div className="trees-back"></div>
      <div className="trees-front"></div>
      <div className="soil-base"></div>

      {/* Navigation Buttons */}
      <div className="nav-actions">

        <div className="scroll-btns">
          <button onClick={() => fastScrollTo(0)} className="nav-btn-scroll" title="Scroll to Peak">
            <ArrowUp size={20} />
          </button>
          <button onClick={() => fastScrollTo(document.documentElement.scrollHeight)} className="nav-btn-scroll" title="Scroll to Base">
            <ArrowDown size={20} />
          </button>
        </div>
      </div>

      {/* The Winding Trail (SVG) */}
      <svg className="trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d={trailPath}
          fill="none"
          stroke="#c4a484"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Flags */}
      <div className="flags-container">
        {scoredStories.map((story, i) => {
          const pos = getFlagPosition(i);
          const isPeak = story.rank <= 3;
          
          let flagClass = "flag-marker";
          if (isPeak) flagClass += " flag-peak";
          
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
              onClick={() => onViewChange('cards', story)}
            >
              <div className="flag-pole"></div>
              {!isPeak && (
                <svg className="flag-base-zigzag" viewBox="0 0 24 10" preserveAspectRatio="none">
                  <polyline points="0,10 6,0 12,10 18,0 24,10" fill="none" stroke="#ccc" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flag-banner">
                {isPeak ? '👑' : ''}
              </div>
              <div className="flag-label">
                {story.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredStory && (
        <div 
          className="story-tooltip"
          style={{
            top: `${hoveredStory.pos.top}%`,
            left: `${hoveredStory.pos.left}%`,
            transform: hoveredStory.pos.left > 50 
              ? 'translate(calc(-100% - 80px), -50%)' 
              : 'translate(80px, -50%)'
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
            <span className="tier-badge" style={{ fontSize: '1.6rem', padding: '4px 10px', fontWeight: 'bold' }}>{hoveredStory.rank}</span>
            <span className="score-badge">{hoveredStory.medium.join(', ')}</span>
          </div>
          <p className="tooltip-comments" style={{ color: '#fff', fontWeight: 'bold' }}>
            {hoveredStory.genre.join(', ')}
          </p>
          <div style={{ fontSize: '1.4rem', color: '#ccc', marginTop: '10px' }}>
            <div style={{ marginBottom: '4px' }}><strong>Length:</strong> {hoveredStory.length}</div>
            <div><strong>Hours of life:</strong> {hoveredStory.hours}</div>
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div><span style={{ color: '#a855f7', fontWeight: 'bold' }}>Pratyush:</span> {hoveredStory.rankingPratyush}</div>
              <div><span style={{ color: '#06b6d4', fontWeight: 'bold' }}>Kanav:</span> {hoveredStory.rankingKanav}</div>
            </div>
            
            {socialData && (socialData[hoveredStory.name]?.likes > 0 || socialData[hoveredStory.name]?.comments > 0) && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.2rem' }}>
                {socialData[hoveredStory.name]?.likes > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b8b' }}>
                    <Heart size={16} fill="currentColor" /> {socialData[hoveredStory.name].likes}
                  </div>
                )}
                {socialData[hoveredStory.name]?.comments > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa' }}>
                    <MessageSquare size={16} fill="currentColor" /> {socialData[hoveredStory.name].comments}
                  </div>
                )}
              </div>
            )}
          </div>
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
              // height depends on viewport ratio
              height: `${(window.innerHeight / document.documentElement.scrollHeight) * 100}%`
            }} 
          />
        </div>
      </div>
    </div>
  );
}
