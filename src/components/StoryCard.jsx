import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Poster from './Poster';
import { tierKey, tierLabel } from '../lib/tiers';

export default function StoryCard({ story, onCardClick }) {
  const commentsCount = (story.commentsPratyush ? 1 : 0) + (story.commentsKanav ? 1 : 0);

  return (
    <div
      className="story-card"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick?.(story)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick?.(story); } }}
    >
      <div>
        <div style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
          <Poster story={story} style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'contain', display: 'block' }} />
        </div>
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
            <span className={`tier-badge ${tierKey(story.rankingPratyush)}`}>
              {tierLabel(story.rankingPratyush)}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '0.25rem 0' }} />

          {/* Kanav Row */}
          <div className="brother-rating-row">
            <div className="brother-info">
              <div className="avatar-badge avatar-kanav">K</div>
              <span className="brother-name">Kanav</span>
            </div>
            <span className={`tier-badge ${tierKey(story.rankingKanav)}`}>
              {tierLabel(story.rankingKanav)}
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

      </div>
    </div>
  );
}
