import { X, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getRelativeTime,
  Notification 
} from '../services/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    const notifications = await getNotifications();
    setNotifications(notifications);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      
      // Atualizar notificações a cada 5 segundos quando o modal estiver aberto
      const interval = setInterval(() => {
        loadNotifications();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await loadNotifications();
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'reaction':
        return '❤️';
      case 'moderation_approved':
        return '✅';
      case 'moderation_rejected':
        return '❌';
      case 'jackpot':
        return '🎰';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'comment':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'reaction':
        return 'bg-pink-50 border-l-4 border-pink-400';
      case 'moderation_approved':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'moderation_rejected':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'jackpot':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'success':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'warning':
        return 'bg-orange-50 border-l-4 border-orange-400';
      default:
        return 'bg-blue-50 border-l-4 border-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-scaleIn shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} non lue(s)</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Tout marquer comme lu"
              >
                <CheckCheck className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1">
                Vous serez notifié des nouveaux résultats ici
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBg(notification.type, notification.read)} rounded-xl p-4 transition-all hover:shadow-md group`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  {/* Ícone */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-gray-800 ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#18A238] rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    {/* Info adicional para jackpots */}
                    {notification.type === 'jackpot' && notification.jackpotAmount && (
                      <div className="inline-flex gap-2 text-xs font-semibold text-gray-700 bg-white/50 rounded-lg px-2 py-1">
                        <span>💰 {notification.jackpotAmount}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                      
                      {/* Botão de deletar (aparece no hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer com dica */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-[#18A238]/5 to-[#F7D25F]/5 rounded-b-3xl">
          <p className="text-sm text-gray-600 text-center">
            💡 <span className="font-semibold">Astuce:</span> Vous recevrez des notifications chaque fois qu'un jackpot est tiré
          </p>
        </div>
      </div>
    </div>
  );
}

