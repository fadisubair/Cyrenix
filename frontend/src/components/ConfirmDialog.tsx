import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
            {type === 'danger' && <AlertTriangle className="text-danger" size={20} />}
            {type === 'warning' && <AlertTriangle className="text-warning" size={20} />}
            {title}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-sm text-slate-300">
          {message}
        </div>
        
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
