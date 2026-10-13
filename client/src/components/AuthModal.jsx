import React, { useState } from 'react';
import { studentRegister, studentLogin, coordinatorLogin } from '../utils/api';

const BRANCHES = [
  'CSE',
  'AIDS',
  'AIML',
  'IT',
  'MECH',
  'ECE',
  'EEE',
  'CIVIL'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [authRole, setAuthRole] = useState('student'); // 'student' | 'coordinator'
  const [isRegisterMode, setIsRegisterMode] = useState(false); // student register vs login

  // Student form state
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Coordinator form state
  const [coordRollNo, setCoordRollNo] = useState('');
  const [coordPassword, setCoordPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Student Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 5) {
          throw new Error('Password must be at least 5 characters long.');
        }

        const res = await studentRegister({
          name,
          branch,
          college_email: collegeEmail,
          phone_no: phoneNo,
          year_of_study: yearOfStudy,
          password
        });

        onLoginSuccess(res.user);
      } else {
        const res = await studentLogin({
          college_email: collegeEmail,
          password
        });

        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Coordinator Submit
  const handleCoordinatorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await coordinatorLogin({
        roll_no: coordRollNo,
        password: coordPassword
      });

      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Coordinator login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCoord1 = () => {
    setCoordRollNo('24KB1A05W1');
    setCoordPassword('KAILASH@123');
  };

  const fillCoord2 = () => {
    setCoordRollNo('24KB1A0597');
    setCoordPassword('9032416879');
  };

  const fillSampleStudent = () => {
    setCollegeEmail('saicharan.cse@nbkrist.edu.in');
    setPassword('nbkr@123');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">N.B.K.R.I.S.T Portal Access</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Secure authentication for Events, Fests & Campus OpenMind
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Role selector tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              className="btn"
              style={{
                background: authRole === 'student' ? 'white' : 'transparent',
                color: authRole === 'student' ? '#1e3a8a' : '#64748b',
                boxShadow: authRole === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: 700,
                fontSize: '13px',
                padding: '8px 12px'
              }}
              onClick={() => {
                setAuthRole('student');
                setError('');
              }}
            >
              🎓 Student Login
            </button>

            <button
              type="button"
              className="btn"
              style={{
                background: authRole === 'coordinator' ? 'white' : 'transparent',
                color: authRole === 'coordinator' ? '#1e3a8a' : '#64748b',
                boxShadow: authRole === 'coordinator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: 700,
                fontSize: '13px',
                padding: '8px 12px'
              }}
              onClick={() => {
                setAuthRole('coordinator');
                setError('');
              }}
            >
              ⚡ Coordinator Login
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* STUDENT FORM */}
          {authRole === 'student' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b' }}>
                  {isRegisterMode ? 'First Time Student Registration' : 'Student Sign In'}
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError('');
                  }}
                >
                  {isRegisterMode ? 'Already have an account? Login' : 'First Time? Register Here'}
                </button>
              </div>

              <form onSubmit={handleStudentSubmit}>
                {isRegisterMode && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. V. Sai Charan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Branch *</label>
                        <select className="form-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Year of Study *</label>
                        <select className="form-select" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="10-digit mobile number"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">N.B.K.R.I.S.T College Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@nbkrist.edu.in"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isRegisterMode ? 'Set Password *' : 'Password *'}</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {isRegisterMode && (
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {loading ? 'Authenticating...' : (isRegisterMode ? 'Register & Enter Portal' : 'Login as Student')}
                </button>

                {!isRegisterMode && (
                  <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                    <span>Testing with demo account: </span>
                    <button
                      type="button"
                      className="cat-pill"
                      style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '6px' }}
                      onClick={fillSampleStudent}
                    >
                      Fill Demo Student (saicharan.cse@nbkrist.edu.in)
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* COORDINATOR FORM */}
          {authRole === 'coordinator' && (
            <div>
              <div style={{ background: '#ede9fe', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#5b21b6', marginBottom: '16px' }}>
                ⚡ <strong>Authorized Coordinators Only</strong>: Login using your assigned Roll Number and Password to add new campus events and manage gate attendance.
              </div>

              <form onSubmit={handleCoordinatorSubmit}>
                <div className="form-group">
                  <label className="form-label">Coordinator Roll Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 24KB1A05W1 or 24KB1A0597"
                    value={coordRollNo}
                    onChange={(e) => setCoordRollNo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Coordinator Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter coordinator password"
                    value={coordPassword}
                    onChange={(e) => setCoordPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {loading ? 'Verifying...' : 'Login as Coordinator'}
                </button>

                {/* Pre-configured Coordinator Quick Buttons */}
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                    Quick Login (Pre-set N.B.K.R.I.S.T Coordinators):
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cat-pill"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={fillCoord1}
                    >
                      Coordinator 1 (24KB1A05W1 &bull; Kailash)
                    </button>
                    <button
                      type="button"
                      className="cat-pill"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={fillCoord2}
                    >
                      Coordinator 2 (24KB1A0597)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
