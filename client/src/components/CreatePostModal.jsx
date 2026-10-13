import React, { useState } from 'react';
import { createPost } from '../utils/api';

const CATEGORIES = [
  'Ideas & Proposals',
  'Project Discussions',
  'Academic & Tech',
  'Campus Life'
];

const MOOD_TAGS = ['Idea / Proposal', 'Hackathon Teammates Wanted', 'Research Pitch', 'Campus Suggestion', 'Tech Discussion'];

export default function CreatePostModal({ currentUser, onClose, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Ideas & Proposals');
  const [moodTag, setMoodTag] = useState('Idea / Proposal');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and proposal description cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createPost({
        title,
        content,
        category,
        mood_tag: moodTag,
        is_anonymous: isAnonymous,
        user_id: currentUser?.id || null,
        author_name: currentUser?.name || 'N.B.K.R.I.S.T Student',
        author_branch: currentUser?.branch || 'CSE',
        author_year: currentUser?.year_of_study || '3rd Year'
      });

      onPostCreated(res);
    } catch (err) {
      setError(err.message || 'Failed to publish proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Pitch an Idea on N.B.K.R.I.S.T OpenMind</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Connect with peers, find mentors, or build project teams</div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Student Info preview */}
          {currentUser && (
            <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#3730a3', marginBottom: '14px' }}>
              Posting as: <strong>{currentUser.name}</strong> ({currentUser.branch} - {currentUser.year_of_study})
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Topic Tag</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`cat-pill ${moodTag === tag ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                  onClick={() => setMoodTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Idea / Proposal Headline *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AI-driven campus smart parking or autonomous drone club"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Idea Details & Objectives *</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describe your project, required skillsets, or proposed initiative."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
              />
              <span>🔒 Post Anonymously (Hide your name and display an animal avatar alias)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-outline-dark" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Publishing...' : 'Publish to OpenMind Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
