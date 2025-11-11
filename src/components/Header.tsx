import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-40">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src="/logoltapp.png"
            alt="LOTTO APP"
            className="w-12 h-12 object-contain drop-shadow-xl"
          />
        </div>

        <button className="interactive relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

      </div>
    </header>
  );
}
