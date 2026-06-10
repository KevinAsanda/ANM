import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="text-green-600" size={18} />,
    error: <AlertCircle className="text-red-600" size={18} />,
    info: <Info className="text-blue-600" size={18} />
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${bgColors[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium pr-6">{message}</p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-slate-200/50 transition-colors"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
