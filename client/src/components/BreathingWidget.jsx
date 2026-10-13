import React, { useState, useEffect } from 'react';

export default function BreathingWidget() {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          }

          // Transition to next phase
          setPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold 1';
            if (currentPhase === 'Hold 1') return 'Exhale';
            if (currentPhase === 'Exhale') return 'Hold 2';
            if (currentPhase === 'Hold 2') {
              setCyclesCompleted((c) => c + 1);
              return 'Inhale';
            }
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const getCircleClass = () => {
    if (phase === 'Inhale') return 'inhale';
    if (phase === 'Hold 1') return 'hold';
    if (phase === 'Exhale') return 'exhale';
    return 'hold-small';
  };

  const getInstruction = () => {
    if (!isActive) return 'Click Start to begin 4-4-4-4 Box Breathing';
    if (phase === 'Inhale') return 'Breathe in slowly through your nose...';
    if (phase === 'Hold 1') return 'Gently hold your breath...';
    if (phase === 'Exhale') return 'Release tension and breathe out through your mouth...';
    return 'Rest comfortably before the next breath...';
  };

  return (
    <div className="breathing-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>🧘</span>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>3-Min Mindful Decompress</h3>
      </div>
      <p style={{ fontSize: '12px', color: '#c7d2fe', marginBottom: '16px' }}>
        Neuroscience-backed box breathing to reduce cortisol & mid-semester exam anxiety.
      </p>

      <div className="breath-circle-wrap">
        <div className={`breath-circle ${getCircleClass()}`}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              {isActive ? (phase.startsWith('Hold') ? 'HOLD' : phase.toUpperCase()) : 'READY'}
            </div>
            {isActive && <div style={{ fontSize: '20px', fontWeight: 800 }}>{secondsLeft}s</div>}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#e0e7ff', minHeight: '38px', marginBottom: '14px' }}>
        {getInstruction()}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '7px 18px' }}
          onClick={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setPhase('Inhale');
              setSecondsLeft(4);
            }
          }}
        >
          {isActive ? 'Pause' : 'Start Session'}
        </button>

        {cyclesCompleted > 0 && (
          <span style={{ alignSelf: 'center', fontSize: '12px', color: '#c7d2fe' }}>
            ✨ {cyclesCompleted} cycles completed
          </span>
        )}
      </div>
    </div>
  );
}

