# 🎓 N.B.K.R.I.S.T CampusPulse: Events, Fests & OpenMind Portal

An enterprise-grade, full-stack campus portal developed for **N.B.K.R. Institute of Science & Technology (Autonomous), Vidyanagar** using **HTML5, CSS3, JavaScript (ES6+), React.js, Node.js, Express.js**, and **SQLite Database**.

---

## 🌟 Key Capabilities & Requirements Implemented

### 1. 🔐 Dual Authentication System
- **Student Registration & Login**:
  - **First-Time Sign-Up**: Students provide `Full Name`, `Branch` (CSE, AIDS, AIML, IT, MECH, ECE, EEE, CIVIL), `College Email` (`@nbkrist.edu.in`), `Phone Number`, `Year of Study` (1st, 2nd, 3rd, 4th Year), and `Set Password`.
  - **Account Protection**: Identity is locked to the authenticated student's session. No other student can register for events or post ideas on their behalf!
- **Coordinator Role**:
  - Authorized coordinators manage and add events for all branches.
  - **Default Pre-set Coordinator Accounts**:
    - **Coordinator 1**: Roll No: `24KB1A05W1` &bull; Password: `KAILASH@123` *(Kailash - Lead Coordinator)*
    - **Coordinator 2**: Roll No: `24KB1A0597` &bull; Password: `9032416879`

---

### 2. 🏛️ Department Venues & Official Leadership Endorsements
- **CSE Department Venues**:
  - CSE events are strictly held in **Seminar Hall 1** or **Seminar Hall 2** with highlighted visual badges.
- **Mandatory Footer Endorsements**:
  - **All Events**: Correspondent **Sreenivasulu**
  - **IEEE & CSE Events**: CSE Department HOD **Dr. Rajasekar Reddy**
  - **Games / Physical Department Events**: Physical Department Head **Mallikarjuna**

---

### 3. 🎯 Branch & Year Participation Rules
- **ISTE / IST Events**: Conducted by the **Mechanical Department (MECH)** with options for *MECH Only* or *All Branches*.
- **IEEE Events**: Conducted by **CSE** with participation restricted to *CSE, AIDS, AIML, IT* or *All Branches*.
- **Year Restrictions**: Events can be open to *All Years*, *1st Year*, *2nd Year*, *3rd Year*, *4th Year*, or *2nd, 3rd & 4th Year*.
- Enforced at both the API layer and the UI prior to registration.

---

### 4. ⏱️ Automated Event Expiration (Time-Based)
- Every event has a scheduled date, start time, and **end time**.
- When an event's time has passed, it is **automatically removed / hidden** from the active events catalog.

---

### 5. 💻 Hackathon Group Registration & Payment Simulation
- For Hackathon events:
  - Students enter a **Team / Squad Name**.
  - Provide group member details: Member 1 (Lead), Member 2, Member 3, and Member 4 with Name, Roll Number, and Branch.
  - View guidelines and instructions before submission.
  - Complete UPI / College Fee Portal payment simulation with transaction reference verification.

---

### 6. 💡 Campus OpenMind: Student Innovation & Project Forum
- Authenticated students can pitch project ideas, post research concepts, discuss campus initiatives, and search for hackathon teammates.
- Supports both identified student profiles (`Name`, `Branch`, `Year`) and privacy-preserving anonymous animal aliases.

---

## 🚀 Running the Project

The application is running live:

- **Web Application & REST API**: [http://localhost:5000](http://localhost:5000)
- **Vite Client Dev Server**: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **API Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Quick Start Commands:

```powershell
# In c:\assignment_programs\campus-platform:

# Run the Express server (port 5000)
cd server
node server.js

# In another terminal, run Vite client (port 3000)
cd client
npm run dev
```

---

## 🐙 Pushing to Your GitHub Repository

A Git repository has already been initialized and committed in this folder. To publish to your GitHub:

```powershell
cd c:\assignment_programs\campus-platform

# 1. Add your remote GitHub repo URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 2. Push your master branch
git branch -M main
git push -u origin main
```

---

## 🔑 Default Login Credentials

| Role | Identifier | Password | Access / Scope |
|---|---|---|---|
| **Lead Coordinator** | `24KB1A05W1` | `KAILASH@123` | Can create any branch event & access QR scanner |
| **Student Coordinator** | `24KB1A0597` | `9032416879` | Can create any branch event & access QR scanner |
| **Demo Student** | `saicharan.cse@nbkrist.edu.in` | `nbkr@123` | CSE 3rd Year Student &bull; Apply passes & pitch ideas |
