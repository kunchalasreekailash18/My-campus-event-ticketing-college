const express = require('express');
const router = express.Router();
const { get, all } = require('../db');

router.get('/overview', (req, res) => {
  try {
    const totalEvents = get('SELECT count(*) as count FROM events WHERE status != "cancelled"').count;
    const totalTickets = get('SELECT count(*) as count FROM tickets').count;
    const checkedInTickets = get('SELECT count(*) as count FROM tickets WHERE status = "CHECKED_IN"').count;
    const totalPosts = get('SELECT count(*) as count FROM openmind_posts').count;
    const totalComments = get('SELECT count(*) as count FROM post_comments').count;
    const today = new Date().toISOString().slice(0, 10);
    const todayMoods = get('SELECT count(*) as count FROM campus_moods WHERE date_string = ?', [today]).count;

    // Category distribution
    const categories = all('SELECT category, count(*) as count FROM events GROUP BY category');

    res.json({
      totalEvents,
      totalTickets,
      checkedInTickets,
      totalPosts,
      totalComments,
      todayMoods,
      categories
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

module.exports = router;

