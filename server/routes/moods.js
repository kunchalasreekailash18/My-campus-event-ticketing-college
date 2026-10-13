const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// Daily positive wellness quotes
const WELLNESS_QUOTES = [
  "You don't have to carry the whole semester at once. Just this one day, one step at a time.",
  "Taking a rest is productive work. Your brain consolidates and heals when you pause.",
  "Your grades are a reflection of a moment's test, not your infinite human potential.",
  "It is okay to ask for help. Reaching out is a sign of courage, not weakness.",
  "Deep breath in: you are capable, you belong here, and you are worthy of peace."
];

// GET today's campus mood breakdown
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = all(
      'SELECT mood, count(*) as count FROM campus_moods WHERE date_string = ? GROUP BY mood',
      [today]
    );

    const totalRes = get('SELECT count(*) as total FROM campus_moods WHERE date_string = ?', [today]);
    const total = totalRes ? totalRes.total : 0;

    const breakdown = {
      great: 0,
      good: 0,
      okay: 0,
      stressed: 0,
      overwhelmed: 0
    };

    rows.forEach(r => {
      if (breakdown[r.mood] !== undefined) {
        breakdown[r.mood] = r.count;
      }
    });

    const quote = WELLNESS_QUOTES[Math.floor(Math.random() * WELLNESS_QUOTES.length)];

    res.json({
      date: today,
      total_checkins: total,
      breakdown,
      quote
    });
  } catch (err) {
    console.error('Error fetching mood stats:', err);
    res.status(500).json({ error: 'Failed to retrieve mood stats' });
  }
});

// POST record mood check-in
router.post('/checkin', (req, res) => {
  try {
    const { mood, note } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const today = new Date().toISOString().slice(0, 10);
    run(
      'INSERT INTO campus_moods (mood, note, date_string) VALUES (?, ?, ?)',
      [mood.toLowerCase(), note || '', today]
    );

    res.status(201).json({ success: true, message: 'Mood recorded! Thank you for checking in.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mood check-in' });
  }
});

// POST wellness support / counselor request
router.post('/wellness/request', (req, res) => {
  try {
    const { name, contact_email, request_type, urgency, message } = req.body;

    if (!contact_email || !request_type) {
      return res.status(400).json({ error: 'Contact email and request type are required' });
    }

    const result = run(
      `INSERT INTO wellness_requests (name, contact_email, request_type, urgency, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name || 'Anonymous Student', contact_email, request_type, urgency || 'Medium', message || '']
    );

    res.status(201).json({
      success: true,
      message: 'Your request has been received confidentially. A counselor or peer listener will reach out within 24 hours.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit wellness request' });
  }
});

// GET wellness requests (for student wellness coordinators)
router.get('/wellness/requests', (req, res) => {
  try {
    const requests = all('SELECT * FROM wellness_requests ORDER BY created_at DESC');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wellness requests' });
  }
});

module.exports = router;

