import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      button: 'bg-red-500 hover:bg-red-600 text-white',
      border: 'border-red-200',
    },
    warning: {
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      border: 'border-yellow-200',
    },
    info: {
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
      border: 'border-blue-200',
    },
  };

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors ${colorScheme.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}



