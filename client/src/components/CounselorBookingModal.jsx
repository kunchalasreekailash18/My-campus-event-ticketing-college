import React, { useState } from 'react';
import { submitWellnessRequest } from '../utils/api';

export default function CounselorBookingModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('Confidential Counselor Session');
  const [urgency, setUrgency] = useState('Medium');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await submitWellnessRequest({
        name,
        contact_email: email,
        request_type: requestType,
        urgency,
        message
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Error submitting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">N.B.K.R.I.S.T Student Wellness Cell</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Confidential, caring, and peer-supported</div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>💚</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Request Received</h3>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                A licensed counselor or senior student welfare mentor from the N.B.K.R.I.S.T Wellness Cell will contact you at <strong>{email}</strong> within 24 hours. Your details remain strictly confidential.
              </p>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                🚨 N.B.K.R.I.S.T Campus Student Helpline: <strong>+91 8624-228247 (Vidyanagar Campus)</strong>
              </div>
              <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#ede9fe', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#5b21b6', marginBottom: '16px' }}>
                🤝 N.B.K.R.I.S.T cares about your mental health. Whether you are dealing with exam pressure, hostel adjustment, or personal concerns, we are here to support you.
              </div>

              <div className="form-group">
                <label className="form-label">Support Category</label>
                <select className="form-select" value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                  <option value="Confidential Counselor Session">1-on-1 Confidential Counselor Session</option>
                  <option value="Peer Listener (Student Mentor)">Trained Peer Listener (Student-to-Student)</option>
                  <option value="Academic & Exam Burnout Coaching">Academic & Exam Burnout Coaching</option>
                  <option value="Hostel & Campus Adjustment Support">Hostel & Campus Adjustment Support</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Student Preferred Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Anonymous Student or Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email (for meeting link / appointment) *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rollno@nbkrist.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select className="form-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="Normal">Routine (Within 2-3 days)</option>
                  <option value="Medium">Medium (Within 24 hours)</option>
                  <option value="Immediate">Urgent / Today</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brief Note (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Anything specific you'd like us to know before our meeting?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline-dark" onClick={onClose} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Submitting...' : 'Request Confidential Session'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
