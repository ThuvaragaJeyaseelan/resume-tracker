import React from 'react';
import { Badge } from '../atoms';
import type { ApplicantStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicantStatus;
}

const statusConfig: Record<ApplicantStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  new: { label: 'New', variant: 'info' },
  reviewed: { label: 'Reviewed', variant: 'default' },
  shortlisted: { label: 'Shortlisted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  hired: { label: 'Hired', variant: 'success' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <Badge variant={config.variant} size="small">
      {config.label}
    </Badge>
  );
};
