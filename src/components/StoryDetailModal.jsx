import React, { useEffect } from 'react';
import { X, Star, Clock, BookOpen } from 'lucide-react';
import Poster from './Poster';
import ContactForm from './ContactForm';
import { tierKey, tierLabel } from '../lib/tiers';

export default function StoryDetailModal({ story, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !story) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={story.name}>
        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{story.name}</h2>
            <div className="tags-row" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {story.medium && story.medium.map((m, i) => (
                <span key={i} className="medium-tag">{m}</span>
              ))}
              {story.genre && story.genre.map((g, i) => (
                <span key={i} className="genre-tag">{g}</span>
              ))}
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-detail-body">
          {/* Left: Poster */}
          <div className="modal-detail-poster">
            <Poster story={story} />
          </div>

          {/* Right: Info */}
          <div className="modal-detail-info">
            <div className="modal-detail-stats">
              {story.length && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={16} /> <strong>Length:</strong> {story.length}
                </div>
              )}
              {story.hours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} /> <strong>Time to Read/Watch:</strong> {story.hours} hours
                </div>
              )}
            </div>

            {story.favoriteCharacters && (
              <div className="fav-character" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                <Star size={16} className="fav-icon" />
                <span style={{ fontSize: '0.9rem' }}>Fav Characters: <strong>{story.favoriteCharacters}</strong></span>
              </div>
            )}

            <div className="modal-detail-comments">
              {/* Pratyush */}
              <div className="brother-ratings-box" style={{ marginBottom: 0 }}>
                <div className="brother-rating-row">
                  <div className="brother-info">
                    <div className="avatar-badge avatar-pratyush">P</div>
                    <span className="brother-name">Pratyush</span>
                  </div>
                  <span className={`tier-badge ${tierKey(story.rankingPratyush)}`}>
                    {tierLabel(story.rankingPratyush, 'Pending')}
                  </span>
                </div>
                {story.commentsPratyush && (
                  <div className="comment-snippet" style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                    "{story.commentsPratyush}"
                  </div>
                )}
              </div>

              {/* Kanav */}
              <div className="brother-ratings-box" style={{ marginBottom: 0 }}>
                <div className="brother-rating-row">
                  <div className="brother-info">
                    <div className="avatar-badge avatar-kanav">K</div>
                    <span className="brother-name">Kanav</span>
                  </div>
                  <span className={`tier-badge ${tierKey(story.rankingKanav)}`}>
                    {tierLabel(story.rankingKanav, 'Pending')}
                  </span>
                </div>
                {story.commentsKanav && (
                  <div className="comment-snippet" style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                    "{story.commentsKanav}"
                  </div>
                )}
              </div>
            </div>

            <ContactForm key={story.slug} storyName={story.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
