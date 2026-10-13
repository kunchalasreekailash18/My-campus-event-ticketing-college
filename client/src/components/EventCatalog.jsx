import React, { useState, useEffect } from 'react';
import { getEvents } from '../utils/api';

const CATEGORIES = [
  'All',
  'IEEE Events',
  'CSE Dept Events',
  'College Fest',
  'ISTE / IST Events',
  'Physical Dept / Sports',
  'Workshops'
];

export default function EventCatalog({ currentUser, onSelectEvent, onBookEvent, onOpenAuth }) {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [category, search]);

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await getEvents({ category, search });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryBadgeColor = (cat) => {
    if (cat === 'IEEE Events') return { bg: '#1e40af', text: '#ffffff' };
    if (cat === 'College Fest') return { bg: '#db2777', text: '#ffffff' };
    if (cat === 'ISTE / IST Events') return { bg: '#0d9488', text: '#ffffff' };
    if (cat === 'CSE Dept Events') return { bg: '#4f46e5', text: '#ffffff' };
    if (cat.includes('Sports') || cat.includes('Physical')) return { bg: '#ea580c', text: '#ffffff' };
    return { bg: 'rgba(15, 23, 42, 0.75)', text: '#ffffff' };
  };

  const handleApplyClick = (ev) => {
    if (!currentUser) {
      onOpenAuth('Please log in with your N.B.K.R.I.S.T email to register for events.');
      return;
    }
    onBookEvent(ev);
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'IEEE Events' ? '⚡ IEEE Events' : ''}
              {cat === 'College Fest' ? '🎉 College Fest' : ''}
              {cat === 'ISTE / IST Events' ? '🏆 ISTE (IST) MECH Events' : ''}
              {cat === 'CSE Dept Events' ? '💻 CSE Dept Events' : ''}
              {cat.includes('Sports') ? '⚽ Sports & Games' : ''}
              {cat === 'Workshops' ? '🛠️ Workshops' : ''}
              {cat === 'All' ? '🌟 All Active Events' : ''}
            </button>
          ))}
        </div>

        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search IEEE, Fest, CSE Seminar Hall 1 & 2..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
          <div>Loading N.B.K.R.I.S.T campus events...</div>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎪</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No active events found</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Events past their scheduled end time are automatically archived from this page.
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((ev) => {
            const seatsLeft = Math.max(0, ev.total_seats - ev.booked_seats);
            const fillPct = Math.min(100, Math.round((ev.booked_seats / ev.total_seats) * 100));
            const isSoldOut = seatsLeft <= 0;
            const badgeStyle = getCategoryBadgeColor(ev.category);
            const isCSEVenue = ev.venue.includes('Seminar Hall 1') || ev.venue.includes('Seminar Hall 2');

            return (
              <div key={ev.id} className="event-card">
                <div className="event-banner-wrap">
                  <img
                    src={ev.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'}
                    alt={ev.title}
                    className="event-banner-img"
                  />
                  <div
                    className="event-badge"
                    style={{ background: badgeStyle.bg, color: badgeStyle.text }}
                  >
                    {ev.category}
                  </div>
                  <div className="event-price-tag">
                    {ev.price > 0 ? `₹${ev.price * 80}` : 'FREE PASS'}
                  </div>
                </div>

                <div className="event-body">
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-desc">{ev.description}</p>

                  {/* Branch & Year Eligibility Tag */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      marginBottom: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div>
                      <strong>🎯 Eligible Branches:</strong>{' '}
                      <span style={{ color: ev.allowed_branches !== 'All Branches' ? '#b45309' : '#059669', fontWeight: 600 }}>
                        {ev.allowed_branches || 'All Branches'}
                      </span>
                    </div>
                    <div>
                      <strong>📅 Eligible Years:</strong>{' '}
                      <span style={{ color: '#4338ca', fontWeight: 600 }}>
                        {ev.allowed_years || 'All Years'}
                      </span>
                    </div>
                    {ev.is_hackathon === 1 && (
                      <div style={{ color: '#7c3aed', fontWeight: 700 }}>
                        💻 Hackathon (Teams of up to {ev.max_team_size || 4})
                      </div>
                    )}
                  </div>

                  <div className="event-meta">
                    <div className="meta-item">
                      <span>📅</span>
                      <span><strong>{ev.date}</strong> &bull; {ev.time}</span>
                    </div>

                    <div className="meta-item">
                      <span>📍</span>
                      <span>
                        <strong style={{ color: isCSEVenue ? '#4338ca' : '#0f172a' }}>
                          {ev.venue}
                        </strong>
                        {isCSEVenue && (
                          <span style={{ marginLeft: '6px', fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            CSE Dept Venue
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span>🏛️</span>
                      <span>{ev.organizer}</span>
                    </div>
                  </div>

                  {/* Official Footers Mentioning Sreenivasulu, Mallikarjuna, Rajasekar Reddy */}
                  <div
                    style={{
                      background: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      color: '#475569',
                      marginBottom: '14px',
                      borderLeft: '3px solid #1e3a8a'
                    }}
                  >
                    <div><strong>Correspondent:</strong> {ev.correspondent_name || 'Sreenivasulu'}</div>
                    {ev.cse_hod_name && (
                      <div><strong>CSE HOD:</strong> {ev.cse_hod_name}</div>
                    )}
                    {ev.physical_dept_head && (
                      <div><strong>Physical Dept Head:</strong> {ev.physical_dept_head}</div>
                    )}
                  </div>

                  <div className="seat-progress-container">
                    <div className="seat-info">
                      <span>{seatsLeft > 0 ? `${seatsLeft} seats remaining` : 'Housefull'}</span>
                      <span>{fillPct}% Reserved</span>
                    </div>
                    <div className="seat-bar">
                      <div className="seat-fill" style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-outline-dark"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                      onClick={() => onSelectEvent(ev)}
                    >
                      Details & Rules
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1.5, padding: '8px 12px', fontSize: '13px' }}
                      disabled={isSoldOut}
                      onClick={() => handleApplyClick(ev)}
                    >
                      {isSoldOut ? 'Sold Out' : (ev.is_hackathon ? 'Register Team' : 'Apply Pass')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
