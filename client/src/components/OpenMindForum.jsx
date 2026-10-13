import React, { useState, useEffect } from 'react';
import { getOpenMindPosts, upvotePost, reactToPost, addComment } from '../utils/api';

const FORUM_CATEGORIES = ['All', 'Ideas & Proposals', 'Project Discussions', 'Academic & Tech', 'Campus Life'];

export default function OpenMindForum({ currentUser, onOpenCreatePost, onOpenAuth, onNotification }) {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('trending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInput, setCommentInput] = useState({});

  useEffect(() => {
    loadPosts();
  }, [category, sort, search]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getOpenMindPosts({ category, sort, search });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load OpenMind posts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePostIdeaClick = () => {
    if (!currentUser) {
      onOpenAuth('Please log in with your N.B.K.R.I.S.T email to pitch ideas or discuss projects.');
      return;
    }
    onOpenCreatePost();
  };

  const handleUpvote = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );

    try {
      await upvotePost(postId);
      if (onNotification) onNotification('Upvoted idea! Thank you for supporting a fellow student.', 'success');
    } catch (err) {
      console.error('Failed upvote:', err);
    }
  };

  const handleReact = async (postId, reactionType) => {
    try {
      const res = await reactToPost(postId, reactionType);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, reactions: res.reactions } : p))
      );
    } catch (err) {
      console.error('Failed reaction:', err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('Please log in with your student email to reply to discussions.');
      return;
    }

    const content = commentInput[postId];
    if (!content || !content.trim()) return;

    try {
      const newComment = await addComment(postId, {
        content: content.trim(),
        user_id: currentUser.id,
        author_name: currentUser.name,
        author_branch: currentUser.branch,
        is_anonymous: false
      });

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comment_count: p.comment_count + 1,
              recent_comments: [...(p.recent_comments || []), newComment]
            };
          }
          return p;
        })
      );

      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      if (onNotification) onNotification('Your idea reply was posted!', 'success');
    } catch (err) {
      alert('Failed to post reply: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a' }}>
            🧠 N.B.K.R.I.S.T OpenMind: Student Ideas & Project Forum
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Pitch project ideas, find hackathon teammates, share innovations, and discuss campus initiatives.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handlePostIdeaClick}>
          <span>💡</span>
          <span>Pitch Your Idea</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="category-pills">
          {FORUM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '13px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="trending">🔥 Trending Ideas</option>
            <option value="recent">⏱️ Most Recent</option>
          </select>

          <div className="search-input-wrap" style={{ minWidth: '180px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search ideas & proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Posts list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading ideas and proposals...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💡</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No ideas posted yet</h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            Have a project concept or student club initiative? Be the first to pitch it!
          </p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handlePostIdeaClick}>
            Pitch an Idea
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => {
            const isExpanded = expandedComments[post.id];
            const comments = post.recent_comments || [];

            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="author-chip">
                    <div className="author-avatar" style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}>
                      {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'N'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{post.author_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {post.is_anonymous ? '🔒 Anonymous Student Alias' : `${post.author_branch || 'Student'} &bull; ${post.author_year || 'N.B.K.R.I.S.T'}`} &bull; {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="tag-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                      {post.category}
                    </span>
                    {post.mood_tag && (
                      <span className="tag-badge">
                        {post.mood_tag}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-text">{post.content}</p>

                <div className="post-footer">
                  <div className="reaction-group">
                    <button
                      className="reaction-btn"
                      style={{ color: '#1e40af', fontWeight: 700 }}
                      onClick={() => handleUpvote(post.id)}
                    >
                      ▲ {post.upvotes} Upvotes
                    </button>

                    <button className="reaction-btn" onClick={() => handleReact(post.id, 'lightbulb')}>
                      💡 Great Idea
                    </button>
                    <button className="reaction-btn" onClick={() => handleReact(post.id, 'hug')}>
                      🤝 Collaborate
                    </button>
                  </div>

                  <button
                    className="btn btn-outline-dark"
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                    onClick={() => toggleComments(post.id)}
                  >
                    💬 {post.comment_count} {post.comment_count === 1 ? 'Discussion' : 'Discussions'} {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Discussions / Comments Section */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                      Peer Collaboration & Feedback ({comments.length})
                    </h4>

                    {comments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {comments.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              fontSize: '13px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#1e293b' }}>
                                {c.author_name} {c.author_branch ? `(${c.author_branch})` : ''}
                              </span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ color: '#475569', lineHeight: 1.5 }}>{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add reply form */}
                    <form onSubmit={(e) => handleAddComment(post.id, e)} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        placeholder={currentUser ? "Share feedback or express interest to team up..." : "Login to join the discussion..."}
                        value={commentInput[post.id] || ''}
                        onChange={(e) =>
                          setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
