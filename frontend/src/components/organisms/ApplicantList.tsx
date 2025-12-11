import React from 'react';
import { ApplicantCard } from './ApplicantCard';
import type { Applicant, ApplicantStatus } from '../../types';
import './ApplicantList.css';

interface ApplicantListProps {
  applicants: Applicant[];
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const ApplicantList: React.FC<ApplicantListProps> = ({
  applicants,
  onStatusChange,
  onDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="applicant-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading applicants...</p>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="applicant-list-empty">
        <div className="empty-icon">📋</div>
        <h3>No applicants yet</h3>
        <p>Upload resumes to start tracking candidates</p>
      </div>
    );
  }

  return (
    <div className="applicant-list">
      {applicants.map((applicant, index) => (
        <ApplicantCard
          key={applicant.id}
          applicant={applicant}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          expanded={index === 0}
        />
      ))}
    </div>
  );
};
