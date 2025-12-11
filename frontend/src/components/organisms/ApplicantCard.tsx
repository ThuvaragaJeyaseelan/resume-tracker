import React, { useState } from 'react';
import { Button, Badge, ScoreBar } from '../atoms';
import { StatusBadge } from '../molecules';
import type { Applicant, ApplicantStatus } from '../../types';
import { getResumeDownloadUrl } from '../../services/api';
import './ApplicantCard.css';

interface ApplicantCardProps {
  applicant: Applicant;
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onDelete: (id: string) => void;
  expanded?: boolean;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onStatusChange,
  onDelete,
  expanded: initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const statusOptions: ApplicantStatus[] = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];

  return (
    <div className={`applicant-card ${expanded ? 'expanded' : ''}`}>
      <div className="applicant-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="applicant-main-info">
          <div className="applicant-score-mini">
            <span className="score-number">{applicant.priorityScore}</span>
          </div>
          <div className="applicant-identity">
            <h3 className="applicant-name">{applicant.name}</h3>
            <p className="applicant-email">{applicant.email}</p>
          </div>
        </div>
        <div className="applicant-quick-info">
          <StatusBadge status={applicant.status} />
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="applicant-card-body">
          <div className="applicant-score-section">
            <ScoreBar score={applicant.priorityScore} />
          </div>

          {applicant.summary && (
            <div className="applicant-section">
              <h4>Summary</h4>
              <p>{applicant.summary}</p>
            </div>
          )}

          {applicant.keySkills && applicant.keySkills.length > 0 && (
            <div className="applicant-section">
              <h4>Key Skills</h4>
              <div className="skills-list">
                {applicant.keySkills.map((skill, idx) => (
                  <Badge key={idx} variant="info" size="small">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="applicant-details-grid">
            {applicant.experience && (
              <div className="applicant-detail">
                <h4>Experience</h4>
                <p>{applicant.experience}</p>
              </div>
            )}
            {applicant.education && (
              <div className="applicant-detail">
                <h4>Education</h4>
                <p>{applicant.education}</p>
              </div>
            )}
          </div>

          {applicant.highlights && applicant.highlights.length > 0 && (
            <div className="applicant-section">
              <h4>Highlights</h4>
              <ul className="highlights-list">
                {applicant.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {applicant.concerns && applicant.concerns.length > 0 && (
            <div className="applicant-section">
              <h4>Potential Concerns</h4>
              <ul className="concerns-list">
                {applicant.concerns.map((concern, idx) => (
                  <li key={idx}>{concern}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="applicant-actions">
            <div className="status-selector">
              <label>Status:</label>
              <select
                value={applicant.status}
                onChange={(e) => onStatusChange(applicant.id, e.target.value as ApplicantStatus)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <a
                href={getResumeDownloadUrl(applicant.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-small"
              >
                Download Resume
              </a>
              <Button
                variant="danger"
                size="small"
                onClick={() => onDelete(applicant.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
