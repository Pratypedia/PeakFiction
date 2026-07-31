import React from 'react';
import { Edit3, Star, Award } from 'lucide-react';

export default function StoryCard({ story, onEdit }) {
  const getBadgeClass = (rank) => {
    if (!rank) return 'Pending';
    const cleanRank = rank.trim();
    if (cleanRank.toLowerCase() === 'peak') return 'Peak';
    if (cleanRank.toUpperCase() === 'S') return 'S';
    if (cleanRank.toUpperCase() === 'A') return 'A';
    if (cleanRank.toUpperCase() === 'B') return 'B';
    return 'Pending';
  };

  return (
    <div className="story-card">
      <div>
        {story.imageUrl && (
          <div style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <img src={story.imageUrl} alt={story.name} style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'contain' }} />
          </div>
        )}
        <div className="card-header">
          <h3 className="card-title">{story.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {story.score && (
              <span 
                style={{
                  background: 'rgba(255, 183, 3, 0.15)',
                  border: '1px solid rgba(255, 183, 3, 0.4)',
                  color: '#ffb703',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Granular Score out of 10"
              >
                ★ {story.score}
              </span>
            )}
            <button 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.2rem',
                borderRadius: '4px',
                transition: 'color 0.2s'
              }}
              onClick={() => onEdit(story)}
              title="Edit story rating, score & comments"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div className="tags-row">
          {story.medium && story.medium.map((m, i) => (
            <span key={i} className="medium-tag">
              {m}
            </span>
          ))}
          {story.genre && story.genre.map((g, i) => (
            <span key={i} className="genre-tag">
              {g}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="brother-ratings-box">
          {/* Pratyush Row */}
          <div className="brother-rating-row">
            <div className="brother-info">
              <div className="avatar-badge avatar-pratyush">P</div>
              <span className="brother-name">Pratyush</span>
            </div>
            <span className={`tier-badge ${getBadgeClass(story.rankingPratyush)}`}>
              {story.rankingPratyush || 'Pending'}
            </span>
          </div>
          {story.commentsPratyush && (
            <div className="comment-snippet">
              "{story.commentsPratyush}"
            </div>
          )}

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '0.25rem 0' }} />

          {/* Kanav Row */}
          <div className="brother-rating-row">
            <div className="brother-info">
              <div className="avatar-badge avatar-kanav">K</div>
              <span className="brother-name">Kanav</span>
            </div>
            <span className={`tier-badge ${getBadgeClass(story.rankingKanav)}`}>
              {story.rankingKanav || 'Pending'}
            </span>
          </div>
          {story.commentsKanav && (
            <div className="comment-snippet">
              "{story.commentsKanav}"
            </div>
          )}
        </div>

        {story.favoriteCharacters && (
          <div className="fav-character">
            <Star size={14} className="fav-icon" />
            <span>Favs: <strong>{story.favoriteCharacters}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
