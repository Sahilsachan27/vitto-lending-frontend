import React from 'react';

const ScoreRing = ({ score, approved }) => {
  const min = 300, max = 900;
  const pct = (score - min) / (max - min);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = approved ? 'var(--green)' : 'var(--red)';

  return (
    <div className="score-ring">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--bg3)" strokeWidth="7" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="score-number">
        <span className="num" style={{ color }}>{score}</span>
        <span className="label">score</span>
      </div>
    </div>
  );
};

export default ScoreRing;
