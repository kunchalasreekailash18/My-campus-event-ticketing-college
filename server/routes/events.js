const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// GET all events with filtering & automatic expiration removal
router.get('/', (req, res) => {
  try {
    const { category, search, include_expired } = req.query;
    const nowIso = new Date().toISOString();

    let sql = 'SELECT * FROM events WHERE status != "cancelled"';
    const params = [];

    // Automatic expiration: if not explicitly requesting expired events, only show future/active events
    if (include_expired !== 'true') {
      sql += ' AND (end_datetime >= ? OR end_datetime IS NULL OR end_datetime = "")';
      params.push(nowIso);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR organizer LIKE ? OR venue LIKE ? OR allowed_branches LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY date ASC';

    const events = all(sql, params);

    // Enrich with tiers & official footer names
    for (const ev of events) {
      ev.tiers = all('SELECT * FROM ticket_tiers WHERE event_id = ? ORDER BY price ASC', [ev.id]);

      // Ensure official names are set
      if (!ev.correspondent_name) ev.correspondent_name = 'Sreenivasulu';
      if ((ev.category.includes('Sports') || ev.category.includes('Physical') || ev.title.toLowerCase().includes('sports')) && !ev.physical_dept_head) {
        ev.physical_dept_head = 'Mallikarjuna';
      }
      if ((ev.category.includes('IEEE') || ev.category.includes('CSE')) && !ev.cse_hod_name) {
        ev.cse_hod_name = 'Dr. Rajasekar Reddy';
      }
    }

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET single event by id
router.get('/:id', (req, res) => {
  try {
    const event = get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    event.tiers = all('SELECT * FROM ticket_tiers WHERE event_id = ? ORDER BY price ASC', [event.id]);

    if (!event.correspondent_name) event.correspondent_name = 'Sreenivasulu';
    if ((event.category.includes('Sports') || event.category.includes('Physical') || event.title.toLowerCase().includes('sports')) && !event.physical_dept_head) {
      event.physical_dept_head = 'Mallikarjuna';
    }
    if ((event.category.includes('IEEE') || event.category.includes('CSE')) && !event.cse_hod_name) {
      event.cse_hod_name = 'Dr. Rajasekar Reddy';
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// POST create event (Coordinator action)
router.post('/', (req, res) => {
  try {
    const {
      title,
      tagline,
      category,
      description,
      date,
      time,
      end_datetime,
      venue,
      organizer,
      banner_url,
      total_seats,
      price,
      allowed_branches,
      allowed_years,
      is_hackathon,
      max_team_size,
      instructions,
      tiers
    } = req.body;

    if (!title || !category || !date || !venue) {
      return res.status(400).json({ error: 'Event Name, Category, Date, and Venue are required' });
    }

    const defaultBanner = banner_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

    // Calculate end_datetime if not passed (default to date at 23:59:59)
    const endDateTimeFinal = end_datetime || `${date}T23:59:59.000Z`;

    // Official footer names assignment
    const correspondent = 'Sreenivasulu';
    let cseHod = null;
    let sportsHead = null;

    if (category.includes('IEEE') || category.includes('CSE') || title.includes('CSE') || title.includes('IEEE')) {
      cseHod = 'Dr. Rajasekar Reddy';
    }
    if (category.includes('Sports') || category.includes('Physical') || title.toLowerCase().includes('sports')) {
      sportsHead = 'Mallikarjuna';
    }

    const result = run(
      `INSERT INTO events (
        title, tagline, category, description, date, time, end_datetime, venue, organizer,
        banner_url, total_seats, booked_seats, price, allowed_branches, allowed_years,
        is_hackathon, max_team_size, correspondent_name, cse_hod_name, physical_dept_head,
        instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        tagline || '',
        category,
        description || '',
        date,
        time || '10:00 AM - 04:00 PM',
        endDateTimeFinal,
        venue,
        organizer || 'N.B.K.R.I.S.T Student Chapter',
        defaultBanner,
        Number(total_seats) || 150,
        Number(price) || 0,
        allowed_branches || 'All Branches',
        allowed_years || 'All Years',
        is_hackathon ? 1 : 0,
        Number(max_team_size) || (is_hackathon ? 4 : 1),
        correspondent,
        cseHod,
        sportsHead,
        instructions || ''
      ]
    );

    const newEventId = result.lastInsertRowid;

    if (tiers && Array.isArray(tiers) && tiers.length > 0) {
      for (const t of tiers) {
        run(
          `INSERT INTO ticket_tiers (event_id, name, price, perks, available_count)
           VALUES (?, ?, ?, ?, ?)`,
          [newEventId, t.name, Number(t.price) || 0, t.perks || '', Number(t.available_count) || total_seats]
        );
      }
    } else {
      run(
        `INSERT INTO ticket_tiers (event_id, name, price, perks, available_count)
         VALUES (?, 'Standard Student Pass', ?, 'Full Admission', ?)`,
        [newEventId, Number(price) || 0, Number(total_seats) || 150]
      );
    }

    const createdEvent = get('SELECT * FROM events WHERE id = ?', [newEventId]);
    createdEvent.tiers = all('SELECT * FROM ticket_tiers WHERE event_id = ?', [newEventId]);

    res.status(201).json(createdEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PATCH cancel event (Coordinator action)
router.patch('/:id/cancel', (req, res) => {
  try {
    const eventId = req.params.id;
    const event = get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.status === 'cancelled') {
      return res.status(400).json({ error: 'Event is already cancelled' });
    }
    run('UPDATE events SET status = ? WHERE id = ?', ['cancelled', eventId]);
    res.json({ success: true, message: `Event "${event.title}" has been cancelled.` });
  } catch (err) {
    console.error('Error cancelling event:', err);
    res.status(500).json({ error: 'Failed to cancel event' });
  }
});

module.exports = router;

