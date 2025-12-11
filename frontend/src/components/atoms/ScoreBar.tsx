import React from 'react';
import './ScoreBar.css';

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score, showLabel = true }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span className="score-value" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
        {showLabel && (
          <span className="score-label" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </span>
        )}
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
    </div>
  );
};
