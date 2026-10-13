const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// Student Register (First Time)
router.post('/student/register', (req, res) => {
  try {
    const { name, branch, college_email, phone_no, year_of_study, password } = req.body;

    if (!name || !branch || !college_email || !phone_no || !year_of_study || !password) {
      return res.status(400).json({ error: 'All fields (Name, Branch, College Email, Phone, Year, Password) are required' });
    }

    const emailTrimmed = college_email.trim().toLowerCase();
    const existing = get('SELECT id FROM users WHERE lower(college_email) = ?', [emailTrimmed]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this College Email already exists. Please login instead.' });
    }

    const result = run(
      `INSERT INTO users (name, branch, college_email, phone_no, year_of_study, password, role)
       VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [name.trim(), branch, emailTrimmed, phone_no.trim(), year_of_study, password]
    );

    const user = get('SELECT id, name, branch, college_email, phone_no, year_of_study, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({
      message: 'Student account registered successfully! You are now logged in.',
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete student registration' });
  }
});

// Student Login
router.post('/student/login', (req, res) => {
  try {
    const { college_email, password } = req.body;
    if (!college_email || !password) {
      return res.status(400).json({ error: 'College Email and Password are required' });
    }

    const emailTrimmed = college_email.trim().toLowerCase();
    const user = get(
      'SELECT id, name, branch, college_email, phone_no, year_of_study, role, created_at, password FROM users WHERE lower(college_email) = ?',
      [emailTrimmed]
    );

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid College Email or Password.' });
    }

    const { password: _, ...userSafe } = user;
    res.json({
      message: 'Login successful!',
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to process student login' });
  }
});

// Coordinator Login
router.post('/coordinator/login', (req, res) => {
  try {
    const { roll_no, password } = req.body;
    if (!roll_no || !password) {
      return res.status(400).json({ error: 'Coordinator Roll No and Password are required' });
    }

    const rollTrimmed = roll_no.trim().toUpperCase();
    const coord = get(
      'SELECT id, roll_no, name, branch, role, password FROM coordinators WHERE upper(roll_no) = ?',
      [rollTrimmed]
    );

    if (!coord || coord.password !== password) {
      return res.status(401).json({ error: 'Invalid Coordinator credentials.' });
    }

    const { password: _, ...coordSafe } = coord;
    res.json({
      message: 'Welcome Coordinator!',
      user: coordSafe
    });
  } catch (err) {
    console.error('Coordinator login error:', err);
    res.status(500).json({ error: 'Failed to process coordinator login' });
  }
});

module.exports = router;

