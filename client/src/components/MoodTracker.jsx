import React, { useState, useEffect } from 'react';
import { getMoodStats, submitMoodCheckin } from '../utils/api';

const MOODS = [
  { key: 'great', label: 'Great', emoji: '😊', color: '#10b981' },
  { key: 'good', label: 'Good', emoji: '🙂', color: '#06b6d4' },
  { key: 'okay', label: 'Okay', emoji: '😐', color: '#f59e0b' },
  { key: 'stressed', label: 'Stressed', emoji: '😟', color: '#f97316' },
  { key: 'overwhelmed', label: 'Overwhelmed', emoji: '😫', color: '#ef4444' }
];

export default function MoodTracker({ onNotification }) {
  const [stats, setStats] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getMoodStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load mood stats:', err);
    }
  }

  async function handleCheckin(moodKey) {
    if (loading) return;
    setLoading(true);
    setSelectedMood(moodKey);
    try {
      await submitMoodCheckin(moodKey);
      if (onNotification) {
        onNotification(`Thank you for checking in as "${moodKey}"! Your voice helps campus listen.`, 'success');
      }
      await loadStats();
    } catch (err) {
      if (onNotification) {
        onNotification('Could not record mood check-in', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  const total = stats?.total_checkins || 0;

  return (
    <div className="mood-tracker-card">
      <div className="mood-header">
        <div>
          <div className="mood-title">
            <span>✨</span>
            <span>Campus Daily Pulse: How are you feeling today?</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Anonymous aggregate check-ins ({total} student responses today)
          </div>
        </div>
        {stats?.quote && (
          <div className="mood-quote">
            "{stats.quote}"
          </div>
        )}
      </div>

      <div className="mood-options-grid">
        {MOODS.map((m) => {
          const count = stats?.breakdown?.[m.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isSelected = selectedMood === m.key;

          return (
            <button
              key={m.key}
              className={`mood-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCheckin(m.key)}
              disabled={loading}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-name">{m.label}</span>
              <span className="mood-count">{count} votes ({pct}%)</span>
            </button>
          );
        })}
      </div>

      {total > 0 && (
        <div>
          <div className="mood-progress-bar">
            {MOODS.map((m) => {
              const count = stats?.breakdown?.[m.key] || 0;
              const pct = (count / total) * 100;
              return (
                <div
                  key={m.key}
                  className="mood-segment"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: m.color
                  }}
                  title={`${m.label}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
            <span>Calm & Positive Vibes</span>
            <span>Support & Stress Area</span>
          </div>
        </div>
      )}
    </div>
  );
}

