const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

const ANONYMOUS_ALIASES = [
  'TechPioneer_NBKR', 'CodeNinja_CSE', 'CuriousThinker', 'Innovator_MECH',
  'CampusVoice_26', 'FutureArchitect', 'CircuitMaster_ECE', 'IdeaSpark',
  'ByteRider', 'DataWizard_AIDS', 'QuantumSeeker', 'CampusExplorer'
];

function getRandomAlias() {
  const alias = ANONYMOUS_ALIASES[Math.floor(Math.random() * ANONYMOUS_ALIASES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${alias}_${num}`;
}

// GET OpenMind posts
router.get('/posts', (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let sql = 'SELECT * FROM openmind_posts WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR author_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (sort === 'recent') {
      sql += ' ORDER BY created_at DESC';
    } else {
      sql += ' ORDER BY upvotes DESC, created_at DESC';
    }

    const posts = all(sql, params);

    for (const post of posts) {
      const commentCount = get(
        'SELECT count(*) as count FROM post_comments WHERE post_id = ?',
        [post.id]
      );
      post.comment_count = commentCount ? commentCount.count : 0;

      post.recent_comments = all(
        'SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC',
        [post.id]
      );

      const reactions = all(
        'SELECT reaction_type, count(*) as count FROM post_reactions WHERE post_id = ? GROUP BY reaction_type',
        [post.id]
      );
      post.reactions = reactions;
    }

    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch OpenMind posts' });
  }
});

// GET single post with comments
router.get('/posts/:id', (req, res) => {
  try {
    const post = get('SELECT * FROM openmind_posts WHERE id = ?', [req.params.id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments = all(
      'SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC',
      [post.id]
    );

    post.reactions = all(
      'SELECT reaction_type, count(*) as count FROM post_reactions WHERE post_id = ? GROUP BY reaction_type',
      [post.id]
    );

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post details' });
  }
});

// POST create idea / discussion post
router.post('/posts', (req, res) => {
  try {
    const { title, content, category, mood_tag, is_anonymous, user_id, author_name, author_branch, author_year } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const isAnon = is_anonymous ? 1 : 0;
    const author = isAnon ? getRandomAlias() : (author_name || 'N.B.K.R.I.S.T Student');

    const result = run(
      `INSERT INTO openmind_posts (
        user_id, author_name, author_branch, author_year, is_anonymous,
        category, mood_tag, title, content, upvotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        user_id || null,
        author,
        isAnon ? null : (author_branch || null),
        isAnon ? null : (author_year || null),
        isAnon,
        category,
        mood_tag || 'Idea / Proposal',
        title,
        content
      ]
    );

    const createdPost = get('SELECT * FROM openmind_posts WHERE id = ?', [result.lastInsertRowid]);
    createdPost.comment_count = 0;
    createdPost.recent_comments = [];
    createdPost.reactions = [];

    res.status(201).json(createdPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// POST upvote
router.post('/posts/:id/upvote', (req, res) => {
  try {
    run('UPDATE openmind_posts SET upvotes = upvotes + 1 WHERE id = ?', [req.params.id]);
    const updated = get('SELECT upvotes FROM openmind_posts WHERE id = ?', [req.params.id]);
    res.json({ upvotes: updated ? updated.upvotes : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// POST reaction
router.post('/posts/:id/react', (req, res) => {
  try {
    const { reaction_type } = req.body;
    if (!reaction_type) {
      return res.status(400).json({ error: 'reaction_type required' });
    }

    run(
      'INSERT INTO post_reactions (post_id, reaction_type) VALUES (?, ?)',
      [req.params.id, reaction_type]
    );

    const reactions = all(
      'SELECT reaction_type, count(*) as count FROM post_reactions WHERE post_id = ? GROUP BY reaction_type',
      [req.params.id]
    );

    res.json({ reactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record reaction' });
  }
});

// POST comment
router.post('/posts/:id/comments', (req, res) => {
  try {
    const { content, author_name, author_branch, is_anonymous, user_id } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const isAnon = is_anonymous ? 1 : 0;
    const author = isAnon ? getRandomAlias() : (author_name || 'N.B.K.R.I.S.T Student');

    const result = run(
      `INSERT INTO post_comments (post_id, user_id, author_name, author_branch, is_anonymous, content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, user_id || null, author, isAnon ? null : (author_branch || null), isAnon, content]
    );

    const createdComment = get('SELECT * FROM post_comments WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(createdComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
