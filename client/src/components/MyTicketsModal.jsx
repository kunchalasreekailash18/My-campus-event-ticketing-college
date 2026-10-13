import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../utils/api';
import TicketPass from './TicketPass';

export default function MyTicketsModal({ currentUser, onClose, selectedTicketToView }) {
  const [tickets, setTickets] = useState([]);
  const [query, setQuery] = useState(currentUser?.college_email || '');
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(selectedTicketToView || null);

  useEffect(() => {
    if (currentUser?.college_email) {
      loadTickets({ email: currentUser.college_email });
    } else {
      loadTickets();
    }
  }, [currentUser]);

  async function loadTickets(searchParam = {}) {
    setLoading(true);
    try {
      const data = await getMyTickets(searchParam);
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      loadTickets();
    } else {
      loadTickets({ roll_no: query.trim(), email: query.trim() });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">My Event Passes & Tickets</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Digital QR tickets registered to you</div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {activeTicket ? (
            <div>
              <button
                className="btn btn-outline-dark"
                style={{ marginBottom: '16px', fontSize: '13px', padding: '6px 12px' }}
                onClick={() => setActiveTicket(null)}
              >
                &larr; Back to Tickets List
              </button>
              <TicketPass ticket={activeTicket} />
            </div>
          ) : (
            <div>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Student Roll No or Email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  Search
                </button>
              </form>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading your tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎟️</div>
                  <h4 style={{ fontWeight: 700 }}>No tickets found</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Book an event ticket from the catalog to see your passes and scannable QR code here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        background: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px' }}>{t.event_title}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: t.status === 'CHECKED_IN' ? '#dcfce7' : '#e0e7ff',
                              color: t.status === 'CHECKED_IN' ? '#15803d' : '#3730a3'
                            }}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          📅 {t.event_date} &bull; 📍 {t.event_venue}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                          Code: <strong>{t.ticket_code}</strong> &bull; {t.tier_name} ({t.quantity} pass)
                        </div>
                      </div>

                      <button
                        className="btn btn-outline-dark"
                        style={{ fontSize: '13px', padding: '8px 14px' }}
                        onClick={() => setActiveTicket(t)}
                      >
                        View Pass 🎫
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

