import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slideIn">
      <div className={`bg-gradient-to-r ${colors[type]} text-white rounded-2xl shadow-2xl p-4 pr-12 min-w-[280px] max-w-md flex items-center gap-3`}>
        <Icon className="w-6 h-6 flex-shrink-0" />
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


