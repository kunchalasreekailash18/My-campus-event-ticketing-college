# 🎓 CampusPulse: Campus OpenMind & Event Ticketing Platform

A full-stack campus community portal built with **HTML5, CSS3, JavaScript (ES6+), React.js, Node.js, Express.js**, and **SQLite Database**.

---

## 🌟 Key Features

### 🎟️ 1. Campus Event Discovery & Ticketing
- **Live Event Catalog**: Category filtering (`Tech & Coding`, `Cultural & Fest`, `Workshops`, `Sports`, `Career & Talks`) and live text search.
- **Dynamic Seating & Pass Tiers**: Real-time capacity bar, ticket tiers (Free Student Passes, VIP Mentorship, Workshop Kits).
- **Instant Booking Engine**: Collects student attendee info (Name, Roll Number / Student ID, Email, Department).
- **Digital E-Ticket Pass**:
  - Airline/Concert-style boarding pass layout.
  - Dynamically generated SVG QR code with embedded validation payload.
  - Formatted Print & Save as PDF functionality.
- **My Tickets Wallet**: Search passes by student Roll Number or Email at any time.

### 🧠 2. Campus OpenMind Sanctuary (Mental Wellness & Peer Support)
- **Safe Student Discussions**:
  - Filter by tags: `Mental Wellness`, `Academic Pressure`, `Career Doubts`, `Campus Life`, `Ideas & Clubs`.
  - Toggle between **100% Anonymous Posting** (with animal aliases like `CalmKoala_92`, `QuietOtter_15`) and identified posting.
- **Peer Empathy & Reactions**: Support upvotes, ❤️ Empathy, 💡 Helpful, and 🤝 Solidarity reactions.
- **Nested Advice Threads**: Students and verified campus counselors can offer supportive advice.
- **Campus Mood Pulse**:
  - 5-point daily mood check-in (`Great`, `Good`, `Okay`, `Stressed`, `Overwhelmed`).
  - Aggregated real-time campus mood breakdown bar and uplifting wellness quotes.
- **3-Minute Guided Box Breathing**:
  - Interactive neuroscience-backed 4-4-4-4 box breathing animation with expanding glowing circle to reduce exam panic.
- **Confidential Counselor Booking**:
  - Direct 1-on-1 confidential booking form for campus wellness center appointments.

### ⚡ 3. Organizer Suite & QR Entrance Scanner
- **Live KPI Dashboard**: Active events, tickets booked, attendee check-in rate, and community engagement metrics.
- **Digital QR Ticket Scanner**:
  - Validate ticket codes in real-time.
  - Check in attendees and authorize entrance.
  - Immediate duplicate entry prevention warning if a ticket has already been used.
- **Publish Campus Events**: Custom title, tier pricing, capacity, schedule, and banner URL.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, HTML5, CSS3 (Modern Glassmorphic Design), Vite |
| **Backend** | Node.js, Express.js (REST API, CORS, Static Serving) |
| **Database** | SQLite (Pure JS/WASM engine with disk persistence to `server/data/campus.sqlite`) |
| **Security & Utilities** | SVG QR Code Generator, Ticket Serial Generator, Duplicate Entry Blocker |

---

## 🚀 Running the Project

The server is currently running live on your system:

- **Unified Web Application & API**: [http://localhost:5000](http://localhost:5000)
- **Vite Hot-Reloading Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Commands to Run Manually:

```powershell
# In c:\assignment_programs\campus-platform:

# 1. Start backend server (port 5000)
cd server
node server.js

# 2. In a separate terminal, start Vite client dev server (port 3000)
cd client
npm run dev
```

---

## 📂 Project Structure

```
campus-platform/
├── package.json
├── README.md
├── server/
│   ├── package.json
│   ├── server.js              # Express app, static SPA serving & API endpoints
│   ├── db.js                  # SQLite database wrapper with disk persistence
│   ├── seed.js                # Initial mock events, tickets, forum posts & moods
│   ├── data/
│   │   └── campus.sqlite      # SQLite database file
│   └── routes/
│       ├── events.js          # Event catalog & CRUD
│       ├── tickets.js         # Booking, verification & entrance check-in
│       ├── openmind.js        # Posts, comments, upvotes & reactions
│       ├── moods.js           # Daily mood pulse & counselor requests
│       └── stats.js           # Organizer analytics overview
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx            # State coordinator, navigation tabs & modals
        ├── index.css          # Design system & print stylesheet
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EventCatalog.jsx
        │   ├── EventDetailModal.jsx
        │   ├── TicketBookingModal.jsx
        │   ├── TicketPass.jsx         # Boarding-pass e-ticket with QR code
        │   ├── MyTicketsModal.jsx
        │   ├── OpenMindForum.jsx      # Safe student discussions
        │   ├── CreatePostModal.jsx
        │   ├── MoodTracker.jsx        # Daily campus pulse
        │   ├── BreathingWidget.jsx    # Guided relaxation tool
        │   ├── CounselorBookingModal.jsx
        │   ├── OrganizerPortal.jsx    # QR scanner & event manager
        │   └── NotificationToast.jsx
        └── utils/
            ├── api.js                 # Frontend REST API client
            └── qrGenerator.js         # Pure JS SVG QR code generator
```

