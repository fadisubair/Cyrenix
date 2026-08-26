import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    success: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
    warning: 'bg-amber-900/50 text-amber-400 border border-amber-800',
    danger: 'bg-red-900/50 text-red-400 border border-red-800',
    info: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
