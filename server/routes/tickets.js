const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NBKR-2026-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST Book / Register for an Event Pass
router.post('/book', (req, res) => {
  try {
    const {
      event_id,
      user_id,
      tier_name,
      attendee_name,
      attendee_email,
      attendee_roll_no,
      attendee_dept,
      attendee_year,
      attendee_phone,
      quantity = 1,
      unit_price = 0,
      is_hackathon = false,
      team_name,
      team_members = [],
      payment_ref
    } = req.body;

    if (!event_id || !attendee_name || !attendee_email || !attendee_roll_no) {
      return res.status(400).json({ error: 'Missing required attendee information or event ID' });
    }

    const event = get('SELECT * FROM events WHERE id = ?', [event_id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check expiration
    const nowIso = new Date().toISOString();
    if (event.end_datetime && event.end_datetime < nowIso) {
      return res.status(400).json({ error: 'Sorry! The registration window and time for this event has expired.' });
    }

    // Check branch eligibility
    const allowedBranches = event.allowed_branches || 'All Branches';
    if (allowedBranches !== 'All Branches') {
      const studentBranch = (attendee_dept || '').toUpperCase();
      const branchesAllowed = allowedBranches.toUpperCase();

      let isBranchAllowed = false;
      if (branchesAllowed.includes('ALL')) {
        isBranchAllowed = true;
      } else if (branchesAllowed.includes('MECH') && studentBranch.includes('MECH')) {
        isBranchAllowed = true;
      } else if (
        (branchesAllowed.includes('CSE') || branchesAllowed.includes('AIDS') || branchesAllowed.includes('AIML') || branchesAllowed.includes('IT')) &&
        (studentBranch.includes('CSE') || studentBranch.includes('AIDS') || studentBranch.includes('AIML') || studentBranch.includes('IT'))
      ) {
        isBranchAllowed = true;
      } else if (branchesAllowed.includes(studentBranch)) {
        isBranchAllowed = true;
      }

      if (!isBranchAllowed) {
        return res.status(403).json({
          error: `Eligibility Notice: This event is only open to students of [${allowedBranches}]. Your registered branch is [${attendee_dept}].`
        });
      }
    }

    // Check year eligibility
    const allowedYears = event.allowed_years || 'All Years';
    if (allowedYears !== 'All Years' && attendee_year) {
      const studentYear = attendee_year.toLowerCase();
      const yearsAllowed = allowedYears.toLowerCase();

      if (!yearsAllowed.includes(studentYear) && !yearsAllowed.includes('all')) {
        return res.status(403).json({
          error: `Eligibility Notice: This event is only open to [${allowedYears}] students. You are registered in [${attendee_year}].`
        });
      }
    }

    // Check seat capacity
    const qty = parseInt(quantity, 10) || 1;
    if (event.booked_seats + qty > event.total_seats) {
      return res.status(400).json({ error: 'Sorry! All seats have been filled for this event.' });
    }

    const ticketCode = generateTicketCode();
    const totalPrice = (parseFloat(unit_price) || 0) * qty;

    const teamMembersJson = (is_hackathon && team_members.length > 0) ? JSON.stringify(team_members) : null;
    const paymentStatus = totalPrice > 0 ? 'COMPLETED' : 'FREE';

    run(
      `INSERT INTO tickets (
        ticket_code, event_id, user_id, tier_name, attendee_name, attendee_email,
        attendee_roll_no, attendee_dept, attendee_year, attendee_phone, quantity,
        total_price, is_hackathon, team_name, team_members_json, payment_status,
        payment_ref, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        ticketCode,
        event_id,
        user_id || null,
        tier_name || 'Standard Pass',
        attendee_name,
        attendee_email,
        attendee_roll_no,
        attendee_dept || 'General',
        attendee_year || '',
        attendee_phone || '',
        qty,
        totalPrice,
        is_hackathon ? 1 : 0,
        team_name || null,
        teamMembersJson,
        paymentStatus,
        payment_ref || (totalPrice > 0 ? 'UPI-VERIFIED-NBKR' : 'COLLEGE-PASS')
      ]
    );

    // Update booked seats on event
    run('UPDATE events SET booked_seats = booked_seats + ? WHERE id = ?', [qty, event_id]);

    const createdTicket = get(
      `SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time,
              e.venue as event_venue, e.banner_url, e.organizer, e.correspondent_name,
              e.cse_hod_name, e.physical_dept_head
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.ticket_code = ?`,
      [ticketCode]
    );

    res.status(201).json({
      message: 'Event pass generated successfully! Your place is confirmed.',
      ticket: createdTicket
    });
  } catch (err) {
    console.error('Error booking ticket:', err);
    res.status(500).json({ error: 'Failed to process event pass booking' });
  }
});

// GET My Tickets (search by email or roll number, or user_id)
router.get('/my', (req, res) => {
  try {
    const { email, roll_no, user_id } = req.query;
    let sql = `
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time,
             e.venue as event_venue, e.banner_url, e.organizer, e.correspondent_name,
             e.cse_hod_name, e.physical_dept_head
      FROM tickets t
      JOIN events e ON t.event_id = e.id
    `;
    const params = [];

    if (user_id) {
      sql += ' WHERE t.user_id = ?';
      params.push(user_id);
    } else if (email && roll_no) {
      sql += ' WHERE (lower(t.attendee_email) = ? OR upper(t.attendee_roll_no) = ?)';
      params.push(email.toLowerCase(), roll_no.toUpperCase());
    } else if (email) {
      sql += ' WHERE lower(t.attendee_email) = ?';
      params.push(email.toLowerCase());
    } else if (roll_no) {
      sql += ' WHERE upper(t.attendee_roll_no) = ?';
      params.push(roll_no.toUpperCase());
    }

    sql += ' ORDER BY t.booking_date DESC LIMIT 50';

    const tickets = all(sql, params);
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
});

// GET Verify Ticket by Ticket Code (used by Coordinator QR scanner)
router.get('/verify/:ticketCode', (req, res) => {
  try {
    const { ticketCode } = req.params;
    const ticket = get(
      `SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time,
              e.venue as event_venue, e.organizer, e.correspondent_name, e.cse_hod_name,
              e.physical_dept_head
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE upper(t.ticket_code) = ?`,
      [ticketCode.trim().toUpperCase()]
    );

    if (!ticket) {
      return res.status(404).json({ valid: false, error: 'Invalid Ticket! No ticket found with code ' + ticketCode });
    }

    res.json({
      valid: true,
      ticket
    });
  } catch (err) {
    res.status(500).json({ error: 'Error validating ticket' });
  }
});

// POST Check-in attendee with ticket code
router.post('/checkin/:ticketCode', (req, res) => {
  try {
    const ticketCode = req.params.ticketCode.trim().toUpperCase();
    const ticket = get('SELECT * FROM tickets WHERE upper(ticket_code) = ?', [ticketCode]);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (ticket.status === 'CHECKED_IN') {
      return res.status(400).json({
        success: false,
        alreadyCheckedIn: true,
        checked_in_at: ticket.checked_in_at,
        error: `Notice: Ticket ${ticketCode} was ALREADY scanned for admission at ${ticket.checked_in_at}!`
      });
    }

    const now = new Date().toISOString();
    run('UPDATE tickets SET status = "CHECKED_IN", checked_in_at = ? WHERE upper(ticket_code) = ?', [now, ticketCode]);

    const updated = get(
      `SELECT t.*, e.title as event_title, e.date as event_date, e.venue as event_venue
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE upper(t.ticket_code) = ?`,
      [ticketCode]
    );

    res.json({
      success: true,
      message: 'Attendee admission authorized and recorded!',
      ticket: updated
    });
  } catch (err) {
    console.error('Error checking in ticket:', err);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
});

module.exports = router;
