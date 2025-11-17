import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import { getUnreadCount } from '../services/notificationService';

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Atualizar contador de notificações não lidas
    const updateUnreadCount = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    };

    updateUnreadCount();
    
    // Atualizar a cada 5 segundos para notificações em tempo real
    const interval = setInterval(updateUnreadCount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = async () => {
    setIsNotificationsOpen(true);
    // Atualizar contador quando abrir
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  const handleCloseNotifications = async () => {
    setIsNotificationsOpen(false);
    // Atualizar contador quando fechar (já será atualizado pelo intervalo)
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src="/logoltapp.png"
              alt="LOTTO APP"
              className="w-12 h-12 object-contain drop-shadow-xl"
            />
          </div>

          <button 
            onClick={handleOpenNotifications}
            className="interactive relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-white shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

        </div>
      </header>

      {/* Modal de Notificações */}
      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={handleCloseNotifications}
      />
    </>
  );
}
