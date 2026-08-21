import React from 'react';

export const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  if (status === 'NEW' || status === 'PROPOSED') color = 'bg-info/10 text-info border-info/20';
  if (status === 'OPEN' || status === 'IN_PROGRESS' || status === 'PENDING_APPROVAL') color = 'bg-warning/10 text-warning border-warning/20';
  if (status === 'RESOLVED' || status === 'CLOSED' || status === 'CONFIRMED' || status === 'APPROVED' || status === 'SUCCESS') color = 'bg-success/10 text-success border-success/20';
  if (status === 'REJECTED' || status === 'FAILED') color = 'bg-danger/10 text-danger border-danger/20';

  return (
    <span className={`badge border ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const SeverityBadge = ({ severity }: { severity: string }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  if (severity === 'LOW') color = 'bg-info/10 text-info border-info/20';
  if (severity === 'MEDIUM') color = 'bg-warning/10 text-warning border-warning/20';
  if (severity === 'HIGH') color = 'bg-danger/20 text-danger border-danger/30 font-bold';
  if (severity === 'CRITICAL') color = 'bg-red-900/50 text-red-400 border-red-500/50 font-bold animate-pulse';

  return (
    <span className={`badge border ${color}`}>
      {severity}
    </span>
  );
};

export const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  let color = 'text-slate-400';
  if (confidence >= 0.8) color = 'text-success';
  else if (confidence >= 0.5) color = 'text-warning';
  else color = 'text-danger';

  return (
    <span className={`text-sm font-mono font-medium ${color}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
};
