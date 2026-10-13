import React from 'react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  ticketCount,
  onOpenMyTickets
}) {
  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <div className="brand" onClick={() => setActiveTab('events')}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}>
            NBKR
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">N.B.K.R.I.S.T</span>
              <span className="brand-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                Campus Portal
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              IEEE &bull; CSE &bull; ISTE &bull; College Fest &bull; OpenMind
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span>🎟️</span>
            <span>Campus Events</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'openmind' ? 'active' : ''}`}
            onClick={() => setActiveTab('openmind')}
          >
            <span>🧠</span>
            <span>OpenMind Ideas</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tickets');
              if (onOpenMyTickets) onOpenMyTickets();
            }}
          >
            <span>📋</span>
            <span>My Passes</span>
            {ticketCount > 0 && <span className="badge-count">{ticketCount}</span>}
          </button>

          <button
            className={`nav-btn ${activeTab === 'organizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizer')}
          >
            <span>⚡</span>
            <span>Coordinator Suite</span>
          </button>
        </nav>

        {/* User Session status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: currentUser.role === 'coordinator' ? '#ede9fe' : '#e0e7ff',
                  border: `1px solid ${currentUser.role === 'coordinator' ? '#c4b5fd' : '#c7d2fe'}`,
                  borderRadius: '10px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{currentUser.role === 'coordinator' ? '⚡' : '🎓'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e1b4b', lineHeight: 1.2 }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {currentUser.role === 'coordinator'
                      ? `Coordinator &bull; ${currentUser.roll_no}`
                      : `${currentUser.branch} &bull; ${currentUser.year_of_study}`}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-outline-dark"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                onClick={onLogout}
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
              onClick={onOpenAuth}
            >
              <span>🔑</span>
              <span>Student / Coordinator Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
