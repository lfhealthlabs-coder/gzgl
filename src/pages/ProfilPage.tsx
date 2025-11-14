import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Camera, Bell, HelpCircle, LogOut } from 'lucide-react';
import { getProfile, updateProfile, UserProfile } from '../services/profileService';
import Toast, { ToastType } from '../components/Toast';
import NotificationsModal from '../components/NotificationsModal';
import HelpModal from '../components/HelpModal';
import { getUnreadCount } from '../services/notificationService';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface ProfilPageProps {
  onLogout?: () => void;
}

export default function ProfilPage({ onLogout }: ProfilPageProps) {
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', photoUrl: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega o perfil ao montar o componente
  useEffect(() => {
    const loadProfile = async () => {
      const userProfile = await getProfile();
      setProfile(userProfile);
      setEditName(userProfile.name);
    };
    
    loadProfile();
    
    // Carrega contagem de notificações não lidas
    setUnreadNotifications(getUnreadCount());
  }, []);

  // Atualiza contagem de notificações quando o modal de notificações fecha
  useEffect(() => {
    if (!isNotificationsModalOpen) {
      setUnreadNotifications(getUnreadCount());
    }
  }, [isNotificationsModalOpen]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updatedProfile = await updateProfile({ photo: file });
      setProfile(updatedProfile);
      showToast('Photo mise à jour avec succès !', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement de la photo', 'error');
    }

    // Limpa o input para permitir selecionar a mesma foto novamente
    e.target.value = '';
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      showToast('Le nom ne peut pas être vide', 'error');
      return;
    }

    try {
      const updatedProfile = await updateProfile({ name: editName.trim() });
      setProfile(updatedProfile);
      setIsEditing(false);
      showToast('Nom mis à jour avec succès !', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour du nom', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile.name);
    setIsEditing(false);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      showToast('Déconnexion réussie !', 'success');
    } else {
      showToast('Déconnexion en cours...', 'info');
    }
  };

  const menuItems = [
    { 
      icon: Bell, 
      label: 'Notifications', 
      color: 'from-[#0B5F21] to-[#18A238]', 
      action: () => setIsNotificationsModalOpen(true),
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { 
      icon: HelpCircle, 
      label: 'Aide', 
      color: 'from-blue-500 to-blue-600', 
      action: () => setIsHelpModalOpen(true) 
    },
    { 
      icon: LogOut, 
      label: 'Déconnexion', 
      color: 'from-red-500 to-red-600', 
      action: handleLogoutClick
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-8 space-y-6">
        {/* Card do Perfil */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Foto do Perfil */}
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {profile.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Botão de Upload */}
              <button
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 transition-colors group-hover:scale-110 transform duration-200"
                title="Changer la photo"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Nome Editável */}
            {isEditing ? (
              <div className="w-full max-w-xs space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#18A238] rounded-xl focus:outline-none text-center text-xl font-bold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-1 text-sm bg-gradient-to-r from-[#18A238] to-[#0B5F21] text-white rounded-lg hover:from-[#0B5F21] hover:to-[#0B5F21] transition-all"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 
                  className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-[#18A238] transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Cliquer pour modifier"
                >
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-400 italic">Cliquer pour modifier</p>
              </div>
            )}

            {/* Email (não editável) */}
            <p className="text-gray-500">{profile.email}</p>

            {/* Texto Fixo */}
            <div className="mt-4 pt-4 border-t border-gray-100 w-full">
              <p className="text-[#18A238] font-semibold text-lg">
                ✨ Votre accès est à vie. ✨
              </p>
            </div>
          </div>
        </div>

        {/* Menu de Opções */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="interactive w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex items-center gap-4 hover:scale-[1.02] relative"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center relative`}>
                  <Icon className="w-6 h-6 text-white" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-800 flex-1 text-left">
                  {item.label}
                </span>
                <span className="text-gray-400">›</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Modal de Notificações */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      {/* Modal de Ajuda */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Toast de Notificação */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
