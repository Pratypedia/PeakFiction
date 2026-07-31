import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function EditModal({ story, isOpen, onClose, onSave }) {
  if (!isOpen || !story) return null;

  const [formData, setFormData] = useState({
    score: story.score || '',
    rankingPratyush: story.rankingPratyush || '',
    commentsPratyush: story.commentsPratyush || '',
    rankingKanav: story.rankingKanav || '',
    commentsKanav: story.commentsKanav || '',
    favoriteCharacters: story.favoriteCharacters || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...story,
      ...formData
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Edit Entry</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{story.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Granular Score Input */}
          <div style={{ background: 'rgba(255, 183, 3, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 183, 3, 0.25)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: '#ffb703' }}>
              ★ Granular Score (0 - 10)
            </label>
            <input 
              type="text"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              placeholder="e.g. 9.8, 8.5, 7.2"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Score logic: 9+ = Peak | 7.5-9 = S | 5-7.5 = A | 0-5 = B
            </span>
          </div>

          {/* Pratyush Section */}
          <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.75rem' }}>
              👤 Pratyush's Ratings & Notes
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Ranking Tier
                </label>
                <select 
                  value={formData.rankingPratyush}
                  onChange={(e) => setFormData({ ...formData, rankingPratyush: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="">Unrated (-)</option>
                  <option value="Peak">🔥 Peak Tier</option>
                  <option value="S">⚡ S Tier</option>
                  <option value="A">✨ A Tier</option>
                  <option value="B">👍 B Tier</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Comments & Review
                </label>
                <textarea 
                  rows={3}
                  value={formData.commentsPratyush}
                  onChange={(e) => setFormData({ ...formData, commentsPratyush: e.target.value })}
                  placeholder="Add thoughts, favorite arcs, pitch for why it's peak..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Kanav Section */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#67e8f9', marginBottom: '0.75rem' }}>
              👤 Kanav's Ratings & Notes
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Ranking Tier
                </label>
                <select 
                  value={formData.rankingKanav}
                  onChange={(e) => setFormData({ ...formData, rankingKanav: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="">Unrated (-)</option>
                  <option value="Peak">🔥 Peak Tier</option>
                  <option value="S">⚡ S Tier</option>
                  <option value="A">✨ A Tier</option>
                  <option value="B">👍 B Tier</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Comments & Review
                </label>
                <textarea 
                  rows={3}
                  value={formData.commentsKanav}
                  onChange={(e) => setFormData({ ...formData, commentsKanav: e.target.value })}
                  placeholder="Add Kanav's thoughts, hot takes..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Favorites */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
              ⭐ Favorite Characters
            </label>
            <input 
              type="text"
              value={formData.favoriteCharacters}
              onChange={(e) => setFormData({ ...formData, favoriteCharacters: e.target.value })}
              placeholder="e.g. Gojo Satoru, Levi Ackerman, Sung Jin-Woo"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
