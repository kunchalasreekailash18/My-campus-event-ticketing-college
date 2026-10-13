import React from 'react';

export default function EventDetailModal({ event, currentUser, onClose, onBook, onOpenAuth }) {
  if (!event) return null;

  const seatsLeft = Math.max(0, event.total_seats - event.booked_seats);
  const isSoldOut = seatsLeft <= 0;
  const isCSEVenue = event.venue?.includes('Seminar Hall 1') || event.venue?.includes('Seminar Hall 2');

  const handleRegisterClick = () => {
    if (!currentUser) {
      onOpenAuth('Please log in with your N.B.K.R.I.S.T email to register for events.');
      return;
    }

    // Branch eligibility check
    const allowedBranches = event.allowed_branches || 'All Branches';
    if (allowedBranches !== 'All Branches') {
      const studentBranch = (currentUser.branch || '').toUpperCase();
      const branchesAllowed = allowedBranches.toUpperCase();

      let isAllowed = false;
      if (branchesAllowed.includes('ALL')) isAllowed = true;
      else if (branchesAllowed.includes('MECH') && studentBranch.includes('MECH')) isAllowed = true;
      else if (
        (branchesAllowed.includes('CSE') || branchesAllowed.includes('AIDS') || branchesAllowed.includes('AIML') || branchesAllowed.includes('IT')) &&
        (studentBranch.includes('CSE') || studentBranch.includes('AIDS') || studentBranch.includes('AIML') || studentBranch.includes('IT'))
      ) {
        isAllowed = true;
      } else if (branchesAllowed.includes(studentBranch)) {
        isAllowed = true;
      }

      if (!isAllowed) {
        alert(`❌ Registration Restricted: This event is only open to students of [${allowedBranches}]. You are enrolled in [${currentUser.branch}].`);
        return;
      }
    }

    // Year eligibility check
    const allowedYears = event.allowed_years || 'All Years';
    if (allowedYears !== 'All Years' && currentUser.year_of_study) {
      const studentYear = currentUser.year_of_study.toLowerCase();
      const yearsAllowed = allowedYears.toLowerCase();

      if (!yearsAllowed.includes(studentYear) && !yearsAllowed.includes('all')) {
        alert(`❌ Registration Restricted: This event is only open to [${allowedYears}] students. You are in [${currentUser.year_of_study}].`);
        return;
      }
    }

    onClose();
    onBook(event);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {event.category}
          </div>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '4px' }}>
            N.B.K.R.I.S.T Campus Event
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: '#1e1b4b' }}>
            {event.title}
          </h2>
          {event.tagline && (
            <p style={{ fontSize: '14px', color: '#4f46e5', fontWeight: 600, marginBottom: '14px' }}>
              {event.tagline}
            </p>
          )}

          {/* Eligibility Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Eligible Branches</div>
              <div style={{ fontWeight: 700, color: event.allowed_branches !== 'All Branches' ? '#b45309' : '#059669' }}>
                {event.allowed_branches || 'All Branches'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Eligible Years</div>
              <div style={{ fontWeight: 700, color: '#1e3a8a' }}>
                {event.allowed_years || 'All Years'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              fontSize: '13px'
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Date & Schedule</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{event.date}</div>
              <div style={{ color: '#475569' }}>{event.time}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Venue Location</div>
              <div style={{ fontWeight: 800, color: isCSEVenue ? '#4338ca' : '#0f172a' }}>
                {event.venue}
              </div>
              <div style={{ color: '#475569' }}>
                {isCSEVenue ? 'CSE Department Floor' : 'N.B.K.R.I.S.T Campus'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Organized By</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{event.organizer}</div>
              <div style={{ color: '#10b981', fontWeight: 600 }}>{seatsLeft} Seats Remaining</div>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Event Overview</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{event.description}</p>
          </div>

          {event.instructions && (
            <div style={{ marginBottom: '18px', background: '#fef3c7', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#92400e', border: '1px solid #fde68a' }}>
              <strong>📋 Guidelines & Instructions:</strong>
              <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{event.instructions}</div>
            </div>
          )}

          {event.is_hackathon === 1 && (
            <div style={{ marginBottom: '18px', background: '#f5f3ff', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#5b21b6', border: '1px solid #ddd6fe' }}>
              <strong>💻 Hackathon Team Rules:</strong>
              <div>Team Size: Up to {event.max_team_size || 4} students. The lead student registers and submits team members' roll numbers.</div>
            </div>
          )}

          {/* OFFICIAL FOOTER POINTS REQUIRED BY USER */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px',
              borderLeft: '4px solid #1e3a8a'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px' }}>
              🏛️ Official N.B.K.R.I.S.T Leadership & Department Endorsements
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Correspondent:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{event.correspondent_name || 'Sreenivasulu'}</strong>
              </div>
              {event.cse_hod_name && (
                <div>
                  <span style={{ color: '#64748b' }}>CSE Department HOD:</span>{' '}
                  <strong style={{ color: '#1e40af' }}>{event.cse_hod_name}</strong>
                </div>
              )}
              {event.physical_dept_head && (
                <div>
                  <span style={{ color: '#64748b' }}>Physical Dept Head:</span>{' '}
                  <strong style={{ color: '#ea580c' }}>{event.physical_dept_head}</strong>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-outline-dark" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              disabled={isSoldOut}
              onClick={handleRegisterClick}
            >
              {isSoldOut ? 'Sold Out' : (event.is_hackathon ? 'Register Hackathon Team' : 'Register & Get Pass')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
