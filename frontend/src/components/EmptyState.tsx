import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const EmptyState = ({ message = "No data available", icon: Icon = ShieldAlert }: { message?: string, icon?: any }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-900/20 rounded-lg border border-slate-800/50 border-dashed">
      <Icon size={48} className="mb-4 text-slate-700" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-4"></div>
      <p className="text-sm animate-pulse">{message}</p>
    </div>
  );
};

export const ErrorState = ({ message = "An error occurred" }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-danger bg-danger/5 rounded-lg border border-danger/10">
      <ShieldAlert size={32} className="mb-3 opacity-80" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
