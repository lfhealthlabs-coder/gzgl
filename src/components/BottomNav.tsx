import { Home, Newspaper, Users, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isModerator } from '../services/feedService';

export type TabType = 'accueil' | 'actualite' | 'communaute' | 'profil' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [isUserModerator, setIsUserModerator] = useState(false);

  useEffect(() => {
    const checkModerator = async () => {
      const isMod = await isModerator();
      setIsUserModerator(isMod);
    };
    checkModerator();
  }, []);

  const tabs = [
    { id: 'accueil' as TabType, label: 'Accueil', icon: Home },
    { id: 'actualite' as TabType, label: "Fil d'actualité", icon: Newspaper },
    { id: 'communaute' as TabType, label: 'Communauté', icon: Users },
    { id: 'profil' as TabType, label: 'Profil', icon: User },
  ];

  // Adicionar aba de admin apenas para moderadores
  if (isUserModerator) {
    tabs.push({ id: 'admin' as TabType, label: 'Admin', icon: Shield });
  }

  const gridCols = tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className={`grid ${gridCols} gap-2`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin';

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`interactive flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 ${
                  isActive 
                    ? isAdminTab 
                      ? 'text-purple-600 scale-105' 
                      : 'text-[#18A238] scale-105'
                    : 'text-gray-500 hover:text-[#2BC047]'
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-1 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
