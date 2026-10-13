import React, { useState, useEffect } from 'react';
import { getPlatformStats, verifyTicket, checkInTicket, createEvent, cancelEvent, getEvents } from '../utils/api';


const CATEGORIES = [
  'IEEE Events',
  'CSE Dept Events',
  'College Fest',
  'ISTE / IST Events',
  'Physical Dept / Sports',
  'Workshops'
];

const VENUE_OPTIONS = [
  'Seminar Hall 1',
  'Seminar Hall 2',
  'N.B.K.R.I.S.T Main Open Air Auditorium & Grounds',
  'N.B.K.R.I.S.T Central Computing Center',
  'N.B.K.R.I.S.T Sports Stadium & Floodlit Turf'
];

const BRANCH_OPTIONS = [
  'All Branches',
  'MECH',
  'CSE, AIDS, AIML, IT',
  'CSE',
  'ECE',
  'EEE',
  'CIVIL'
];

const YEAR_OPTIONS = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '2nd, 3rd & 4th Year',
  '3rd & 4th Year'
];

// Small helper component for coordinator credential card with show/hide password
function CoordCard({ coord }) {
  const [showPwd, setShowPwd] = React.useState(false);
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
      <div>
        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '13px' }}>{coord.name}</div>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
          Roll No: <strong>{coord.rollNo}</strong> &nbsp;|&nbsp; Branch: <strong>{coord.branch}</strong>
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b' }}>Password:</span>
          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', letterSpacing: showPwd ? '0' : '3px', color: '#1e293b' }}>
            {showPwd ? coord.password : '••••••••'}
          </code>
          <button
            onClick={() => setShowPwd(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0' }}
            title={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerPortal({ currentUser, onOpenAuth, onNotification }) {
  const isCoordinator = currentUser && currentUser.role === 'coordinator';

  const [stats, setStats] = useState(null);
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [eventsList, setEventsList] = useState([]);

  // Create event form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IEEE Events');
  const [tagline, setTagline] = useState('');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('10:00 AM - 04:00 PM');
  const [endTime, setEndTime] = useState('16:00'); // for auto expiration
  const [venue, setVenue] = useState('Seminar Hall 1');
  const [organizer, setOrganizer] = useState('IEEE NBKRIST Student Branch');
  const [totalSeats, setTotalSeats] = useState(200);
  const [price, setPrice] = useState(0);
  const [allowedBranches, setAllowedBranches] = useState('All Branches');
  const [allowedYears, setAllowedYears] = useState('All Years');
  const [isHackathon, setIsHackathon] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);


  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const s = await getPlatformStats();
      setStats(s);
      const evs = await getEvents({ include_expired: 'true' });
      setEventsList(evs);
    } catch (err) {
      console.error('Failed to load coordinator data:', err);
    }
  }

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);

    // Auto-setup defaults
    if (selectedCat === 'IEEE Events') {
      setVenue('Seminar Hall 1');
      setAllowedBranches('CSE, AIDS, AIML, IT');
      setOrganizer('IEEE NBKRIST Student Branch');
      setIsHackathon(false);
    } else if (selectedCat === 'CSE Dept Events') {
      setVenue('Seminar Hall 2');
      setAllowedBranches('CSE, AIDS, AIML, IT');
      setOrganizer('Department of Computer Science & Engineering (CSE)');
      setIsHackathon(true);
    } else if (selectedCat === 'ISTE / IST Events') {
      setVenue('Seminar Hall 1');
      setAllowedBranches('MECH'); // IST conducted by Mechanical Branch
      setOrganizer('Department of Mechanical Engineering & ISTE Chapter');
      setIsHackathon(false);
    } else if (selectedCat === 'Physical Dept / Sports') {
      setVenue('N.B.K.R.I.S.T Sports Stadium & Floodlit Turf');
      setAllowedBranches('All Branches');
      setOrganizer('Department of Physical Education');
      setIsHackathon(false);
    } else if (selectedCat === 'College Fest') {
      setVenue('N.B.K.R.I.S.T Main Open Air Auditorium & Grounds');
      setAllowedBranches('All Branches');
      setOrganizer('N.B.K.R.I.S.T College Fest Committee');
      setIsHackathon(false);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || ticketInput).trim().toUpperCase();
    if (!code) return;

    setScanResult(null);
    try {
      const res = await verifyTicket(code);
      setScanResult(res);
    } catch (err) {
      setScanResult({ valid: false, error: err.message });
    }
  };

  const handleCheckInNow = async (code) => {
    setCheckingIn(true);
    try {
      const res = await checkInTicket(code);
      if (res.success) {
        if (onNotification) onNotification('Student verified & checked in at N.B.K.R.I.S.T gate!', 'success');
        setScanResult({
          valid: true,
          ticket: res.ticket,
          message: 'Entry Verified & Checked In!'
        });
        await loadData();
      }
    } catch (err) {
      if (onNotification) onNotification(err.message, 'error');
      setScanResult({
        valid: false,
        error: err.message
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);

    // Build ISO timestamp for automated expiration
    const endDatetime = `${date}T${endTime || '23:59'}:00.000Z`;

    try {
      await createEvent({
        title,
        category,
        tagline,
        date,
        time,
        end_datetime: endDatetime,
        venue,
        organizer,
        total_seats: Number(totalSeats),
        price: Number(price),
        allowed_branches: allowedBranches,
        allowed_years: allowedYears,
        is_hackathon: isHackathon ? 1 : 0,
        max_team_size: isHackathon ? Number(maxTeamSize) : 1,
        instructions,
        description
      });

      if (onNotification) onNotification(`N.B.K.R.I.S.T event "${title}" published successfully!`, 'success');
      setShowCreateModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      await loadData();
    } catch (err) {
      alert('Failed to publish event: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelEvent = async (ev) => {
    if (!window.confirm(`⚠️ Are you sure you want to CANCEL the event:\n"${ev.title}"?\n\nThis action cannot be undone and the event will be hidden from students.`)) {
      return;
    }
    setCancellingId(ev.id);
    try {
      const result = await cancelEvent(ev.id);
      if (onNotification) onNotification(result.message || `Event "${ev.title}" cancelled.`, 'success');
      await loadData();
    } catch (err) {
      if (onNotification) onNotification('Failed to cancel event: ' + err.message, 'error');
      else alert('Failed to cancel event: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  // If not logged in as coordinator, show Coordinator Gatekeeper

  if (!isCoordinator) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '44px', marginBottom: '14px' }}>⚡</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
          N.B.K.R.I.S.T Coordinator Suite
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Only authorized faculty and student coordinators can create events, manage branch eligibility, and operate the gate entrance scanner.
        </p>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '24px', fontSize: '13px' }}>
          <div style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '10px', fontSize: '14px' }}>
            🔐 Authorized Coordinator Credentials:
          </div>
          {[
            { rollNo: '24KB1A05W1', name: 'Kailash (Lead Coordinator)', branch: 'CSE', password: 'KAILASH@123' },
            { rollNo: '24KB1A0597', name: 'Student Coordinator', branch: 'CSE', password: '9032416879' }
          ].map((coord, i) => (
            <CoordCard key={i} coord={coord} />
          ))}
        </div>

        <button className="btn btn-primary" onClick={onOpenAuth} style={{ padding: '10px 24px', fontSize: '14px' }}>
          🔑 Login as Coordinator
        </button>
      </div>
    );

  }

  return (
    <div>
      {/* Coordinator Profile Card */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
            {(currentUser.name || 'C')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{currentUser.name}</div>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>
              Roll No: <strong>{currentUser.roll_no}</strong> &nbsp;|&nbsp; Branch: <strong>{currentUser.branch || 'CSE'}</strong> &nbsp;|&nbsp; Role: <strong style={{ textTransform: 'capitalize' }}>{currentUser.role}</strong>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
              ✅ Authorized coordinator — full event management access granted
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ background: 'white', color: '#1e3a8a', fontWeight: 700 }}>
          <span>➕</span>
          <span>Add New Campus Event</span>
        </button>
      </div>


      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL EVENTS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e3a8a' }}>{stats?.totalEvents ?? '...'}</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>Active & Scheduled</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>STUDENT PASSES ISSUED</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#4f46e5' }}>{stats?.totalTickets ?? '...'}</div>
          <div style={{ fontSize: '12px', color: '#6366f1' }}>Verified registrations</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CHECKED-IN ATTENDEES</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669' }}>{stats?.checkedInTickets ?? '...'}</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>Hall 1 & 2 Entrances</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CAMPUS IDEAS PITCHED</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#9333ea' }}>{stats?.totalPosts ?? '...'}</div>
          <div style={{ fontSize: '12px', color: '#a855f7' }}>On OpenMind Board</div>
        </div>
      </div>

      {/* QR Scanner & Ticket Check-In Simulator */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>📷</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a8a' }}>
            Gate Entrance Scanner (Seminar Hall 1, 2 & Main Stage)
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Scan attendee pass code to verify student identity, team members, and authorize entry.
        </p>

        <div style={{ display: 'flex', gap: '12px', maxWidth: '600px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter N.B.K.R.I.S.T Ticket Code (e.g. NBKR-2026-IEEE1)..."
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => handleVerify()}>
            Verify Pass
          </button>
        </div>

        {/* Quick Sample Passes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span>Try quick sample passes:</span>
          <button
            className="cat-pill"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              setTicketInput('NBKR-2026-IEEE1');
              handleVerify('NBKR-2026-IEEE1');
            }}
          >
            NBKR-2026-IEEE1 (IEEE @ Seminar Hall 1)
          </button>
          <button
            className="cat-pill"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              setTicketInput('NBKR-2026-HACK2');
              handleVerify('NBKR-2026-HACK2');
            }}
          >
            NBKR-2026-HACK2 (Hackathon Team Pass @ Seminar Hall 2)
          </button>
        </div>

        {/* Verification Result Box */}
        {scanResult && (
          <div
            style={{
              borderRadius: '12px',
              padding: '20px',
              border: scanResult.valid ? '1px solid #86efac' : '1px solid #fca5a5',
              background: scanResult.valid ? '#f0fdf4' : '#fef2f2'
            }}
          >
            {scanResult.valid ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                    ✅ VALID N.B.K.R.I.S.T PASS VERIFIED
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: scanResult.ticket.status === 'CHECKED_IN' ? '#15803d' : '#3b82f6',
                      color: 'white'
                    }}
                  >
                    STATUS: {scanResult.ticket.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px', color: '#1e293b' }}>
                  <div><strong>Student Name:</strong> {scanResult.ticket.attendee_name}</div>
                  <div><strong>Roll Number:</strong> {scanResult.ticket.attendee_roll_no}</div>
                  <div><strong>Branch & Year:</strong> {scanResult.ticket.attendee_dept} {scanResult.ticket.attendee_year ? `(${scanResult.ticket.attendee_year})` : ''}</div>
                  <div><strong>Event:</strong> {scanResult.ticket.event_title}</div>
                  <div>
                    <strong>Authorized Venue:</strong>{' '}
                    <span style={{ color: '#1e40af', fontWeight: 800 }}>{scanResult.ticket.event_venue}</span>
                  </div>
                  {scanResult.ticket.team_name && (
                    <div><strong>Hackathon Team:</strong> {scanResult.ticket.team_name}</div>
                  )}
                  {scanResult.ticket.checked_in_at && (
                    <div style={{ color: '#047857' }}><strong>Checked-in at:</strong> {scanResult.ticket.checked_in_at}</div>
                  )}
                </div>

                <div style={{ marginTop: '16px' }}>
                  {scanResult.ticket.status === 'CHECKED_IN' ? (
                    <div style={{ color: '#b45309', fontWeight: 700, fontSize: '13px' }}>
                      ⚠️ Notice: This ticket was ALREADY checked in for admission. Do not admit duplicate students.
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      disabled={checkingIn}
                      onClick={() => handleCheckInNow(scanResult.ticket.ticket_code)}
                    >
                      {checkingIn ? 'Authorizing...' : 'Authorize Admission & Check In Student'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '14px', marginBottom: '4px' }}>
                  ❌ INVALID PASS
                </div>
                <div style={{ fontSize: '13px', color: '#991b1b' }}>{scanResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Events Roster */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', color: '#1e3a8a' }}>
          All Managed Events & Auto-Expiration Status ({eventsList.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px 12px' }}>Event Name</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Venue</th>
                <th style={{ padding: '10px 12px' }}>Eligible Branches</th>
                <th style={{ padding: '10px 12px' }}>Eligible Years</th>
                <th style={{ padding: '10px 12px' }}>Seats</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsList.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: ev.status === 'cancelled' ? 0.55 : 1 }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="cat-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {ev.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: ev.venue.includes('Seminar Hall') ? '#4338ca' : '#475569' }}>
                    {ev.venue}
                  </td>
                  <td style={{ padding: '12px', color: '#b45309', fontWeight: 600 }}>
                    {ev.allowed_branches || 'All Branches'}
                  </td>
                  <td style={{ padding: '12px', color: '#1e3a8a' }}>
                    {ev.allowed_years || 'All Years'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong>{ev.booked_seats}</strong> / {ev.total_seats}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                      background: ev.status === 'cancelled' ? '#fee2e2' : '#dcfce7',
                      color: ev.status === 'cancelled' ? '#b91c1c' : '#166534'
                    }}>
                      {ev.status === 'cancelled' ? '🚫 Cancelled' : '✅ Active'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {ev.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleCancelEvent(ev)}
                        disabled={cancellingId === ev.id}
                        style={{
                          fontSize: '11px', padding: '4px 10px', borderRadius: '8px',
                          background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5',
                          fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        {cancellingId === ev.id ? 'Cancelling...' : '🚫 Cancel Event'}
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* CREATE EVENT MODAL WITH ALL SPECIFIC FIELDS REQUIRED */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">Publish New N.B.K.R.I.S.T Event</div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateEvent} className="modal-body">
              <div className="form-group">
                <label className="form-label">Name of the Event *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IEEE Tech Colloquium, CSE Hackathon, etc."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={handleCategoryChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short catchphrase"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>
              </div>

              {/* Date & Time with automated expiration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Time *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="10:00 AM - 04:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" title="Event automatically hides after this time">
                    End Time (Auto-Expire) *
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Venue */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Venue (CSE: Seminar Hall 1 or 2) *</label>
                  <select className="form-select" value={venue} onChange={(e) => setVenue(e.target.value)}>
                    {VENUE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Organizer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Organizer club or dept"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Branch & Year Eligibility */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Branch Participation *</label>
                  <select className="form-select" value={allowedBranches} onChange={(e) => setAllowedBranches(e.target.value)}>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    e.g. MECH for ISTE, CSE/AIDS for IEEE
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Year Participation *</label>
                  <select className="form-select" value={allowedYears} onChange={(e) => setAllowedYears(e.target.value)}>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    e.g. All Years or 3rd & 4th Year
                  </div>
                </div>
              </div>

              {/* Hackathon Checkbox & Max team size */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', background: '#f5f3ff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#5b21b6' }}>
                  <input
                    type="checkbox"
                    checked={isHackathon}
                    onChange={(e) => setIsHackathon(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }}
                  />
                  <span>Is this a Hackathon / Group Event?</span>
                </label>

                {isHackathon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '12px', color: '#5b21b6', fontWeight: 600 }}>Max Team Size:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '60px', padding: '4px 8px' }}
                      min="2"
                      max="6"
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Seat Capacity *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="10"
                    max="5000"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($) (0 for Free)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Details / Description *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Overview of the event, problem statements, and perks."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Rules & Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Bring laptops, ID card mandatory, dress code."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline-dark" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 2 }}>
                  {creating ? 'Publishing...' : 'Publish N.B.K.R.I.S.T Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
