const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'campus.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;
let SQL = null;

async function initDB() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Ensure tables exist
  setupSchema();
  saveDB();
  return db;
}

function saveDB() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite DB to disk:', err);
  }
}

function setupSchema() {
  db.run(`
    -- Students table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      branch TEXT NOT NULL,
      college_email TEXT UNIQUE NOT NULL,
      phone_no TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Coordinators table
    CREATE TABLE IF NOT EXISTS coordinators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_no TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      branch TEXT DEFAULT 'CSE',
      role TEXT DEFAULT 'coordinator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Events table
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tagline TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      venue TEXT NOT NULL,
      organizer TEXT NOT NULL,
      banner_url TEXT,
      total_seats INTEGER NOT NULL,
      booked_seats INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      allowed_branches TEXT DEFAULT 'All Branches',
      allowed_years TEXT DEFAULT 'All Years',
      is_hackathon INTEGER DEFAULT 0,
      max_team_size INTEGER DEFAULT 1,
      correspondent_name TEXT DEFAULT 'Sreenivasulu',
      cse_hod_name TEXT,
      physical_dept_head TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      perks TEXT,
      available_count INTEGER NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT UNIQUE NOT NULL,
      event_id INTEGER NOT NULL,
      user_id INTEGER,
      tier_name TEXT NOT NULL,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT NOT NULL,
      attendee_roll_no TEXT NOT NULL,
      attendee_dept TEXT NOT NULL,
      attendee_year TEXT,
      attendee_phone TEXT,
      quantity INTEGER DEFAULT 1,
      total_price REAL DEFAULT 0,
      is_hackathon INTEGER DEFAULT 0,
      team_name TEXT,
      team_members_json TEXT,
      payment_status TEXT DEFAULT 'COMPLETED',
      payment_ref TEXT,
      status TEXT DEFAULT 'CONFIRMED',
      checked_in_at DATETIME,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS openmind_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      author_name TEXT NOT NULL,
      author_email TEXT,
      author_branch TEXT,
      author_year TEXT,
      is_anonymous INTEGER DEFAULT 1,
      category TEXT NOT NULL,
      mood_tag TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER,
      author_name TEXT NOT NULL,
      author_branch TEXT,
      is_anonymous INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      is_counselor INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES openmind_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      reaction_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campus_moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood TEXT NOT NULL,
      note TEXT,
      date_string TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Helpers for querying
function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (params && params.length) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDB();
  const lastIdRes = db.exec("SELECT last_insert_rowid() as id");
  const lastInsertRowid = lastIdRes.length && lastIdRes[0].values.length ? lastIdRes[0].values[0][0] : null;
  return { lastInsertRowid };
}

module.exports = {
  initDB,
  all,
  get,
  run,
  saveDB
};
