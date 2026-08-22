import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`panel ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) => {
  return (
    <div className="panel-header flex justify-between items-center">
      <h3 className="text-slate-200">{title}</h3>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`panel-body ${className}`}>
      {children}
    </div>
  );
};
