import Header from '../components/Header';
import { User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';

export default function ProfilPage() {
      const menuItems = [
  { icon: Settings,   label: 'Paramètres',    color: 'from-[#0B5F21] to-[#18A238]' },
  { icon: Bell,       label: 'Notifications', color: 'from-[#0B5F21] to-[#18A238]' },
  { icon: HelpCircle, label: 'Aide',          color: 'from-[#0B5F21] to-[#18A238]' },
  { icon: LogOut,     label: 'Déconnexion',   color: 'from-[#0B5F21] to-[#18A238]' },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-8 space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-full flex items-center justify-center shadow-lg mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Utilisateur</h2>
          <p className="text-gray-500">user@example.com</p>
        </div>

        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="interactive w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex items-center gap-4 hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
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
    </div>
  );
}
