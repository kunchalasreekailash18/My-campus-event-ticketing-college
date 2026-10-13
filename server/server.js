const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDB, all, get, run } = require('./db');

const authRouter = require('./routes/auth');
const eventsRouter = require('./routes/events');
const ticketsRouter = require('./routes/tickets');
const openmindRouter = require('./routes/openmind');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/openmind', openmindRouter);
app.use('/api/stats', statsRouter);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    institution: 'N.B.K.R.I.S.T',
    platform: 'N.B.K.R.I.S.T Campus OpenMind & Event Ticketing Platform',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if it exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Auto-seed coordinators and initial data if database is new
async function startServer() {
  try {
    await initDB();
    console.log(' SQLite Database initialized successfully.');

    // Ensure default coordinators exist
    // 1st coordinator: Roll No 24KB1A05W1, Password KAILASH@123
    // 2nd coordinator: Roll No 24KB1A0597, Password 9032416879
    const c1 = get('SELECT id FROM coordinators WHERE upper(roll_no) = "24KB1A05W1"');
    if (!c1) {
      run(
        `INSERT INTO coordinators (roll_no, password, name, branch, role)
         VALUES ('24KB1A05W1', 'KAILASH@123', 'Kailash (Lead Coordinator)', 'CSE', 'coordinator')`
      );
      console.log(' Coordinator 24KB1A05W1 initialized.');
    }

    const c2 = get('SELECT id FROM coordinators WHERE upper(roll_no) = "24KB1A0597"');
    if (!c2) {
      run(
        `INSERT INTO coordinators (roll_no, password, name, branch, role)
         VALUES ('24KB1A0597', '9032416879', 'Student Coordinator 24KB1A0597', 'CSE', 'coordinator')`
      );
      console.log(' Coordinator 24KB1A0597 initialized.');
    }

    // Check if initial seeding needed
    const eventCount = all('SELECT count(*) as count FROM events')[0].count;
    if (eventCount === 0) {
      console.log(' Database is empty. Running initial N.B.K.R.I.S.T seed script...');
      require('./seed');
    }

    app.listen(PORT, () => {
      console.log('========================================================');
      console.log(` N.B.K.R.I.S.T Platform running at: http://localhost:${PORT}`);
      console.log(` Health check endpoint: http://localhost:${PORT}/api/health`);
      console.log('========================================================');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
