import React from 'react';
import { generateQRCodeSVG } from '../utils/qrGenerator';

export default function TicketPass({ ticket, onClose }) {
  if (!ticket) return null;

  let teamMembers = [];
  if (ticket.team_members_json) {
    try {
      teamMembers = JSON.parse(ticket.team_members_json);
    } catch (e) {
      teamMembers = [];
    }
  }

  // QR Payload
  const qrPayload = JSON.stringify({
    institution: 'N.B.K.R.I.S.T',
    code: ticket.ticket_code,
    event: ticket.event_title,
    venue: ticket.event_venue,
    roll: ticket.attendee_roll_no,
    team: ticket.team_name || null,
    valid: true
  });

  const qrSvgHtml = generateQRCodeSVG(qrPayload, 170);

  const handlePrint = () => {
    window.print();
  };

  const isCheckedIn = ticket.status === 'CHECKED_IN';
  const isCSEVenue = ticket.event_venue?.includes('Seminar Hall 1') || ticket.event_venue?.includes('Seminar Hall 2');

  return (
    <div className="printable-ticket" style={{ width: '100%' }}>
      <div className="ticket-pass" style={{ maxWidth: '480px' }}>
        <div className="ticket-top" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ticket-top-badge" style={{ letterSpacing: '1px' }}>
              N.B.K.R.I.S.T &bull; {ticket.is_hackathon ? 'HACKATHON TEAM PASS' : (ticket.tier_name || 'STUDENT PASS')}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '20px',
                background: isCheckedIn ? '#10b981' : '#f59e0b',
                color: 'white'
              }}
            >
              {isCheckedIn ? '✓ CHECKED IN' : 'ACTIVE PASS'}
            </span>
          </div>

          <h2 className="ticket-event-title">{ticket.event_title}</h2>
          <div style={{ fontSize: '12px', color: '#bfdbfe', marginBottom: '14px' }}>
            Organized by {ticket.organizer || 'N.B.K.R.I.S.T'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#93c5fd', fontSize: '11px', textTransform: 'uppercase' }}>Date & Schedule</div>
              <div style={{ fontWeight: 600 }}>{ticket.event_date}</div>
              <div>{ticket.event_time}</div>
            </div>
            <div>
              <div style={{ color: '#93c5fd', fontSize: '11px', textTransform: 'uppercase' }}>Venue Location</div>
              <div style={{ fontWeight: 700, color: isCSEVenue ? '#fef08a' : 'white' }}>
                {ticket.event_venue}
              </div>
              {isCSEVenue && (
                <div style={{ fontSize: '10px', color: '#bfdbfe' }}>CSE Department Wing</div>
              )}
            </div>
          </div>
        </div>

        {/* Perforation Line */}
        <div className="ticket-perforation">
          <div className="ticket-cutout-left" />
          <div className="ticket-dash-line" />
          <div className="ticket-cutout-right" />
        </div>

        {/* Bottom Section */}
        <div className="ticket-bottom">
          <div className="ticket-qr-wrap">
            <div
              dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
              style={{ display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', borderRadius: '12px' }}
            />
            <div className="ticket-code-pill">{ticket.ticket_code}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Present at {ticket.event_venue} entrance for gate check-in
            </div>
          </div>

          {/* Hackathon Squad Details if applicable */}
          {ticket.is_hackathon === 1 && ticket.team_name && (
            <div
              style={{
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'left',
                marginBottom: '14px',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 800, color: '#6d28d9', marginBottom: '6px' }}>
                🚀 Team Name: {ticket.team_name}
              </div>
              {teamMembers.length > 0 && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>Registered Team Members:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {teamMembers.map((m, idx) => (
                      <div key={idx} style={{ color: '#334155' }}>
                        &bull; {m.name} ({m.roll_no || m.branch})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              textAlign: 'left',
              background: '#f8fafc',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              marginBottom: '14px'
            }}
          >
            <div>
              <div style={{ color: '#64748b' }}>Primary Student</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{ticket.attendee_name}</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Roll No / Email</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{ticket.attendee_roll_no || ticket.attendee_email}</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Branch & Year</div>
              <div style={{ fontWeight: 600 }}>{ticket.attendee_dept} {ticket.attendee_year ? `(${ticket.attendee_year})` : ''}</div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Pass Payment</div>
              <div style={{ fontWeight: 600, color: '#059669' }}>
                {ticket.total_price > 0 ? `₹${ticket.total_price * 80}` : 'Free'} &bull; {ticket.payment_ref || 'Verified'}
              </div>
            </div>
          </div>

          {/* Official Endorsements Footer */}
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#475569',
              textAlign: 'left',
              marginBottom: '16px',
              borderLeft: '3px solid #1e3a8a'
            }}
          >
            <div><strong>Correspondent:</strong> {ticket.correspondent_name || 'Sreenivasulu'}</div>
            {ticket.cse_hod_name && (
              <div><strong>CSE Department HOD:</strong> {ticket.cse_hod_name}</div>
            )}
            {ticket.physical_dept_head && (
              <div><strong>Physical Dept Head:</strong> {ticket.physical_dept_head}</div>
            )}
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ flex: 1 }}>
              <span>🖨️</span> Print / Save PDF
            </button>
            {onClose && (
              <button className="btn btn-outline-dark" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
