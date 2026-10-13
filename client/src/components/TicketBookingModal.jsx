import React, { useState } from 'react';
import { bookTicket } from '../utils/api';

export default function TicketBookingModal({ event, currentUser, onClose, onBookingSuccess }) {
  const isHackathon = event.is_hackathon === 1;

  // Student credentials from logged-in session (locked so nobody else can register with their name)
  const [name, setName] = useState(currentUser?.name || '');
  const [rollNo, setRollNo] = useState(currentUser?.phone_no ? (currentUser.college_email.split('@')[0].toUpperCase()) : '22NB1A05A1');
  const [email, setEmail] = useState(currentUser?.college_email || '');
  const [dept, setDept] = useState(currentUser?.branch || 'CSE');
  const [year, setYear] = useState(currentUser?.year_of_study || '3rd Year');
  const [phone, setPhone] = useState(currentUser?.phone_no || '');

  // Ticket tier & pricing
  const [tier, setTier] = useState(event.tiers?.[0]?.name || 'Standard Pass');
  const [unitPrice, setUnitPrice] = useState(event.tiers?.[0]?.price ?? (event.price || 0));
  const [quantity, setQuantity] = useState(1);

  // Hackathon specific fields
  const [teamName, setTeamName] = useState('');
  const [member2Name, setMember2Name] = useState('');
  const [member2Roll, setMember2Roll] = useState('');
  const [member2Branch, setMember2Branch] = useState(currentUser?.branch || 'CSE');

  const [member3Name, setMember3Name] = useState('');
  const [member3Roll, setMember3Roll] = useState('');
  const [member3Branch, setMember3Branch] = useState(currentUser?.branch || 'CSE');

  const [member4Name, setMember4Name] = useState('');
  const [member4Roll, setMember4Roll] = useState('');
  const [member4Branch, setMember4Branch] = useState(currentUser?.branch || 'CSE');

  const [agreedToInstructions, setAgreedToInstructions] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [simulatedPaid, setSimulatedPaid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = unitPrice * quantity;

  const handleTierChange = (e) => {
    const selectedName = e.target.value;
    setTier(selectedName);
    const found = event.tiers?.find((t) => t.name === selectedName);
    if (found) {
      setUnitPrice(found.price);
    }
  };

  const handleSimulateUPI = () => {
    const genRef = 'UPI-' + Math.floor(10000000 + Math.random() * 90000000);
    setPaymentRef(genRef);
    setSimulatedPaid(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !rollNo) {
      setError('Missing student identity. Please ensure you are logged in.');
      return;
    }

    if (isHackathon) {
      if (!teamName.trim()) {
        setError('Please provide a Team / Squad Name for this hackathon.');
        return;
      }
      if (!agreedToInstructions) {
        setError('You must acknowledge and agree to the hackathon guidelines & rules.');
        return;
      }
    }

    if (totalPrice > 0 && !paymentRef) {
      setError('Please complete the fee payment / transaction reference verification.');
      return;
    }

    setLoading(true);
    setError('');

    // Assemble team members list
    const teamMembersList = [
      { name: `${name} (Team Lead)`, roll_no: rollNo, branch: dept, email }
    ];

    if (member2Name && member2Roll) {
      teamMembersList.push({ name: member2Name, roll_no: member2Roll, branch: member2Branch });
    }
    if (member3Name && member3Roll) {
      teamMembersList.push({ name: member3Name, roll_no: member3Roll, branch: member3Branch });
    }
    if (member4Name && member4Roll) {
      teamMembersList.push({ name: member4Name, roll_no: member4Roll, branch: member4Branch });
    }

    try {
      const res = await bookTicket({
        event_id: event.id,
        user_id: currentUser?.id || null,
        tier_name: tier,
        attendee_name: name,
        attendee_email: email,
        attendee_roll_no: rollNo,
        attendee_dept: dept,
        attendee_year: year,
        attendee_phone: phone,
        quantity,
        unit_price: unitPrice,
        is_hackathon: isHackathon,
        team_name: isHackathon ? teamName : null,
        team_members: teamMembersList,
        payment_ref: paymentRef || 'COLLEGE-PASS'
      });

      onBookingSuccess(res.ticket);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: isHackathon ? '660px' : '560px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isHackathon ? '💻 Hackathon Group Registration' : '🎟️ N.B.K.R.I.S.T Pass Registration'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {event.title} &bull; <strong>{event.venue}</strong>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Locked Identity Badge */}
          <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', color: '#3730a3', marginBottom: '16px' }}>
            🔒 <strong>Authenticated Student Registration</strong>: Applying as <strong>{name}</strong> ({email}) from <strong>{dept} - {year}</strong>. No other student can book with your ID.
          </div>

          {/* Tier Selector */}
          <div className="form-group">
            <label className="form-label">Select Ticket Tier</label>
            <select className="form-select" value={tier} onChange={handleTierChange}>
              {event.tiers && event.tiers.length > 0 ? (
                event.tiers.map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} — {t.price > 0 ? `₹${t.price * 80}` : 'Free Entry'} {t.perks ? `(${t.perks})` : ''}
                  </option>
                ))
              ) : (
                <option value="Standard Pass">Standard Pass — Free Entry</option>
              )}
            </select>
          </div>

          {/* HACKATHON GROUP MEMBERS FIELDS */}
          {isHackathon ? (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', marginBottom: '10px' }}>
                👥 Team / Group Information (Max 4 Members)
              </div>

              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ByteBusters NBKR"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              {/* Member 1 (Lead - Locked) */}
              <div style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '12px' }}>
                <strong>Member 1 (Team Lead):</strong> {name} &bull; {dept} &bull; {email}
              </div>

              {/* Member 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 2 Name"
                  value={member2Name}
                  onChange={(e) => setMember2Name(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 2 Roll No"
                  value={member2Roll}
                  onChange={(e) => setMember2Roll(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  value={member2Branch}
                  onChange={(e) => setMember2Branch(e.target.value)}
                >
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="AIML">AIML</option>
                  <option value="IT">IT</option>
                  <option value="MECH">MECH</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              {/* Member 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 3 Name (Optional)"
                  value={member3Name}
                  onChange={(e) => setMember3Name(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 3 Roll No"
                  value={member3Roll}
                  onChange={(e) => setMember3Roll(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  value={member3Branch}
                  onChange={(e) => setMember3Branch(e.target.value)}
                >
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="AIML">AIML</option>
                  <option value="IT">IT</option>
                  <option value="MECH">MECH</option>
                  <option value="ECE">ECE</option>
                </select>
              </div>

              {/* Member 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 4 Name (Optional)"
                  value={member4Name}
                  onChange={(e) => setMember4Name(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  placeholder="Member 4 Roll No"
                  value={member4Roll}
                  onChange={(e) => setMember4Roll(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ fontSize: '12px', padding: '7px 10px' }}
                  value={member4Branch}
                  onChange={(e) => setMember4Branch(e.target.value)}
                >
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="AIML">AIML</option>
                  <option value="IT">IT</option>
                  <option value="MECH">MECH</option>
                  <option value="ECE">ECE</option>
                </select>
              </div>

              {/* Instructions Acknowledgement */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #cbd5e1' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={agreedToInstructions}
                    onChange={(e) => setAgreedToInstructions(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#4f46e5' }}
                    required
                  />
                  <span>
                    I confirm our team has reviewed the Hackathon guidelines, will bring our laptops to <strong>{event.venue}</strong>, and will adhere to N.B.K.R.I.S.T code of conduct.
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Pass Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    style={{ padding: '6px 12px' }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    style={{ padding: '6px 12px' }}
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Mobile *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Student Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* PAYMENT SIMULATION & TOTAL BREAKDOWN */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
              <span>Venue:</span>
              <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{event.venue}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: '#1e3a8a',
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '1px solid #e2e8f0'
              }}
            >
              <span>Total Payable:</span>
              <span>{totalPrice > 0 ? `₹${totalPrice * 80}` : 'FREE ENTRY PASS'}</span>
            </div>

            {totalPrice > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  UPI / Campus Fee Portal Simulation:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    placeholder="Enter UPI UTR / Ref (or click Simulate)"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={handleSimulateUPI}
                  >
                    Simulate Payment
                  </button>
                </div>
                {simulatedPaid && (
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                    ✓ Fee payment verified via N.B.K.R.I.S.T Virtual Gateway
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-outline-dark" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Confirming...' : (isHackathon ? 'Confirm & Generate Hackathon Pass' : 'Confirm Registration')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
