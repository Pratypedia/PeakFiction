import React from 'react';
import { Star, MessageSquare, Heart } from 'lucide-react';

export default function StoryCard({ story, social, onCardClick }) {
  const getBadgeClass = (rank) => {
    if (!rank) return 'Pending';
    const cleanRank = rank.trim();
    if (cleanRank.toLowerCase() === 'peak') return 'Peak';
    if (cleanRank.toUpperCase() === 'S') return 'S';
    if (cleanRank.toUpperCase() === 'A') return 'A';
    if (cleanRank.toUpperCase() === 'B') return 'B';
    if (cleanRank.toUpperCase() === 'C') return 'C';
    if (cleanRank.toUpperCase() === 'D') return 'D';
    if (cleanRank.toUpperCase() === 'F') return 'F';
    return 'Pending';
  };

  const commentsCount = (story.commentsPratyush ? 1 : 0) + (story.commentsKanav ? 1 : 0);

  return (
    <div className="story-card" onClick={() => onCardClick && onCardClick(story)}>
      <div>
        {story.imageUrl && (
          <div style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <img src={story.imageUrl} alt={story.name} style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'contain' }} />
          </div>
        )}
        <div className="card-header">
          <h3 className="card-title">{story.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {story.hours && (
              <span 
                style={{
                  background: 'rgba(255, 183, 3, 0.15)',
                  border: '1px solid rgba(255, 183, 3, 0.4)',
                  color: '#ffb703',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Hours to Consume"
              >
                ⏳ {story.hours}h
              </span>
            )}

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
              {story.rankingPratyush || '-'}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '0.25rem 0' }} />

          {/* Kanav Row */}
          <div className="brother-rating-row">
            <div className="brother-info">
              <div className="avatar-badge avatar-kanav">K</div>
              <span className="brother-name">Kanav</span>
            </div>
            <span className={`tier-badge ${getBadgeClass(story.rankingKanav)}`}>
              {story.rankingKanav || '-'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {story.favoriteCharacters ? (
            <div className="fav-character" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
              <Star size={14} className="fav-icon" />
              <span>Favs: <strong>{story.favoriteCharacters}</strong></span>
            </div>
          ) : <div />}

          {commentsCount > 0 && (
            <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--text-muted)' }}>
              {[...Array(commentsCount)].map((_, i) => (
                <MessageSquare key={i} size={14} />
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Social Stats */}
        {social && (social.likes > 0 || social.comments > 0) && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '1rem' }}>
            {social.likes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ff6b8b' }}>
                <Heart size={16} fill="currentColor" /> {social.likes}
              </div>
            )}
            {social.comments > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa' }}>
                <MessageSquare size={16} fill="currentColor" /> {social.comments}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
