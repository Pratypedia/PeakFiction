import React, { useState, useEffect } from 'react';
import { X, Star, Clock, BookOpen, Heart, MessageSquare } from 'lucide-react';
import Poster from './Poster';
import { tierKey, tierLabel } from '../lib/tiers';
import {
  fetchStorySocial, addLike, addComment, COMMENT_MAX_LENGTH, NAME_MAX_LENGTH,
} from '../lib/social';

export default function StoryDetailModal({ story, isOpen, onClose, socialAvailable }) {
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [newStance, setNewStance] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialError, setSocialError] = useState('');

  useEffect(() => {
    if (!isOpen || !story) return;
    setSocialError('');
    setHasLiked(Boolean(localStorage.getItem(`liked_${story.name}`)));
    setLikesCount(0);
    setComments([]);
    if (!socialAvailable) return;

    let cancelled = false;
    fetchStorySocial(story.name)
      .then(({ likes, comments }) => {
        if (cancelled) return;
        setLikesCount(likes);
        setComments(comments);
      })
      .catch(() => !cancelled && setSocialError('Could not load comments right now.'));
    return () => { cancelled = true; };
  }, [isOpen, story, socialAvailable]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleLike = async () => {
    if (hasLiked || !socialAvailable) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    localStorage.setItem(`liked_${story.name}`, 'true');
    try {
      await addLike(story.name);
    } catch {
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
      localStorage.removeItem(`liked_${story.name}`);
      setSocialError('Could not save your like. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !socialAvailable) return;
    setIsSubmitting(true);
    setSocialError('');
    try {
      const saved = await addComment({
        storyName: story.name, authorName: newName, content: newComment, stance: newStance,
      });
      setComments(prev => [saved, ...prev]);
      setNewComment('');
      setNewName('');
      setNewStance('neutral');
    } catch {
      setSocialError('Could not post your comment. Please try again.');
    }
    setIsSubmitting(false);
  };

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

            {/* Dynamic Social Section */}
            {socialAvailable ? (
              <>
                <div className="social-actions">
                  <button 
                    className={`like-btn ${hasLiked ? 'liked' : ''}`} 
                    onClick={handleLike}
                    disabled={hasLiked}
                  >
                    <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={18} /> {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                  </div>
                </div>

                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Leave a comment</h4>
                  <div className="comment-row">
                    <input 
                      type="text" 
                      className="comment-name-input" 
                      placeholder="Your Name (optional)" 
                      maxLength={NAME_MAX_LENGTH}
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                    <select 
                      className="comment-select" 
                      value={newStance}
                      onChange={e => setNewStance(e.target.value)}
                    >
                      <option value="neutral">Neutral</option>
                      <option value="agree">Agree with Rankings</option>
                      <option value="disagree">Disagree with Rankings</option>
                    </select>
                  </div>
                  <textarea 
                    className="comment-input" 
                    placeholder="What did you think of this story?" 
                    maxLength={COMMENT_MAX_LENGTH}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-end' }}>
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>

                <div className="comments-list">
                  {comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{c.author_name}</span>
                        <span className={`comment-stance stance-${c.ranking_stance}`}>
                          {c.ranking_stance}
                        </span>
                      </div>
                      <div className="comment-text">{c.content}</div>
                    </div>
                  ))}
                </div>
                {socialError && <p className="social-error">{socialError}</p>}
              </>
            ) : (
              <p className="social-offline">
                Likes and comments are offline right now. Say hi on Instagram{' '}
                <a href="https://instagram.com/pratypedia" target="_blank" rel="noopener noreferrer">@pratypedia</a> instead!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
