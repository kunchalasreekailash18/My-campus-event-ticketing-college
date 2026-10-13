import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventCatalog from './components/EventCatalog';
import EventDetailModal from './components/EventDetailModal';
import TicketBookingModal from './components/TicketBookingModal';
import MyTicketsModal from './components/MyTicketsModal';
import OpenMindForum from './components/OpenMindForum';
import CreatePostModal from './components/CreatePostModal';
import OrganizerPortal from './components/OrganizerPortal';
import AuthModal from './components/AuthModal';
import NotificationToast from './components/NotificationToast';

export default function App() {
  const [activeTab, setActiveTab] = useState('events'); // events | openmind | tickets | organizer
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nbkrist_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
  const [showMyTicketsModal, setShowMyTicketsModal] = useState(false);
  const [latestBookedTicket, setLatestBookedTicket] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [ticketCount, setTicketCount] = useState(2);

  const showNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenAuth = (msg = '') => {
    setAuthPromptMessage(msg);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nbkrist_user', JSON.stringify(user));
    } catch (e) {}
    setShowAuthModal(false);
    showNotification(`👋 Welcome back, ${user.name}! (${user.role === 'coordinator' ? 'Coordinator' : user.branch + ' ' + user.year_of_study})`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nbkrist_user');
    } catch (e) {}
    showNotification('Logged out successfully from N.B.K.R.I.S.T portal.', 'info');
  };

  const handleBookingSuccess = (newTicket) => {
    setSelectedEventForBooking(null);
    setTicketCount((c) => c + (newTicket.quantity || 1));
    setLatestBookedTicket(newTicket);
    setShowMyTicketsModal(true);
    showNotification(`🎉 Pass ${newTicket.ticket_code} generated for ${newTicket.event_title}!`, 'success');
  };

  const handlePostCreated = () => {
    setShowCreatePostModal(false);
    showNotification('💡 Your idea proposal has been published to N.B.K.R.I.S.T OpenMind!', 'success');
  };

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth()}
        onLogout={handleLogout}
        ticketCount={ticketCount}
        onOpenMyTickets={() => setShowMyTicketsModal(true)}
      />

      <main className="main-content">
        {/* Hero Banner */}
        <section
          className="hero-banner"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)' }}
        >
          <div className="hero-tag">
            <span>🎓</span>
            <span>N.B.K.R. Institute of Science & Technology (Autonomous)</span>
          </div>
          <h1 className="hero-title">
            N.B.K.R.I.S.T CampusPulse: Events, Fests & OpenMind Portal
          </h1>
          <p className="hero-desc">
            Official portal for <strong>IEEE Events</strong>, <strong>CSE Dept Hackathons</strong> in <strong>Seminar Hall 1 & 2</strong>, <strong>ISTE Mechanical Symposiums</strong>, and the grand <strong>AURA College Fest</strong>. Login with your student email to register passes or pitch innovation ideas.
          </p>

          <div className="hero-actions">
            <button
              className={`btn ${activeTab === 'events' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setActiveTab('events')}
            >
              🎟️ Explore Events & Passes
            </button>
            <button
              className={`btn ${activeTab === 'openmind' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setActiveTab('openmind')}
            >
              💡 Campus OpenMind Ideas
            </button>
            {!currentUser && (
              <button
                className="btn btn-primary"
                onClick={() => handleOpenAuth()}
              >
                🔑 Student / Coordinator Login
              </button>
            )}
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'events' && (
          <EventCatalog
            currentUser={currentUser}
            onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
            onBookEvent={(ev) => setSelectedEventForBooking(ev)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'openmind' && (
          <OpenMindForum
            currentUser={currentUser}
            onOpenCreatePost={() => setShowCreatePostModal(true)}
            onOpenAuth={handleOpenAuth}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'organizer' && (
          <OrganizerPortal
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth()}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'tickets' && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎫</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#1e3a8a' }}>
              Your N.B.K.R.I.S.T Event Passes Wallet
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Access all your booked tickets, Seminar Hall 1 & 2 entry passes, Hackathon team details, and scannable QR passes.
            </p>
            <button className="btn btn-primary" onClick={() => setShowMyTicketsModal(true)}>
              View My Passes & Scannable QR Codes
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          promptMessage={authPromptMessage}
        />
      )}

      {selectedEventForDetail && (
        <EventDetailModal
          event={selectedEventForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedEventForDetail(null)}
          onBook={(ev) => setSelectedEventForBooking(ev)}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {selectedEventForBooking && (
        <TicketBookingModal
          event={selectedEventForBooking}
          currentUser={currentUser}
          onClose={() => setSelectedEventForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showMyTicketsModal && (
        <MyTicketsModal
          currentUser={currentUser}
          onClose={() => {
            setShowMyTicketsModal(false);
            setLatestBookedTicket(null);
          }}
          selectedTicketToView={latestBookedTicket}
        />
      )}

      {showCreatePostModal && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Floating Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
