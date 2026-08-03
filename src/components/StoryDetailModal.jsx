import React, { useState, useEffect } from 'react';
import { X, Star, Clock, BookOpen, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function StoryDetailModal({ story, isOpen, onClose }) {
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [newStance, setNewStance] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && story && supabase) {
      fetchSocialData();
    }
  }, [isOpen, story]);

  const fetchSocialData = async () => {
    // Fetch likes
    const { count: likes } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('story_name', story.name);
    setLikesCount(likes || 0);

    // Fetch comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('story_name', story.name)
      .order('created_at', { ascending: false });
    setComments(commentsData || []);
    
    // Check local storage for like
    const liked = localStorage.getItem(`liked_${story.name}`);
    if (liked) setHasLiked(true);
  };

  const handleLike = async () => {
    if (hasLiked) return;
    if (!supabase) {
      alert("Database connection is not configured. Please ensure your .env file is set up and restart your dev server.");
      return;
    }
    
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    localStorage.setItem(`liked_${story.name}`, 'true');

    const { error } = await supabase.from('likes').insert([{ story_name: story.name }]);
    if (error) {
      console.error("Error inserting like:", error);
      alert("Failed to save like: " + error.message);
      // Revert optimistic update
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
      localStorage.removeItem(`liked_${story.name}`);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!supabase) {
      alert("Database connection is not configured. Please ensure your .env file is set up and restart your dev server.");
      return;
    }

    setIsSubmitting(true);
    const commentData = {
      story_name: story.name,
      author_name: newName.trim() || 'Anonymous',
      content: newComment.trim(),
      ranking_stance: newStance
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select();

    if (error) {
      console.error("Error inserting comment:", error);
      alert("Failed to post comment: " + error.message);
    } else if (data) {
      setComments([data[0], ...comments]);
      setNewComment('');
      setNewName('');
      setNewStance('neutral');
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !story) return null;

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
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
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-detail-body">
          {/* Left: Poster */}
          {story.imageUrl && (
            <div className="modal-detail-poster">
              <img src={story.imageUrl} alt={story.name} />
            </div>
          )}

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
                  <span className={`tier-badge ${getBadgeClass(story.rankingPratyush)}`}>
                    {story.rankingPratyush || 'Pending'}
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
                  <span className={`tier-badge ${getBadgeClass(story.rankingKanav)}`}>
                    {story.rankingKanav || 'Pending'}
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

          </div>
        </div>
      </div>
    </div>
  );
}
