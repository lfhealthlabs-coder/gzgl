import { Phone } from 'lucide-react';

export default function FloatingSupportButton() {
  const handleClick = () => {
    window.location.href = 'mailto:griffomakers@gmail.com';
  };

  return (
    <button
      onClick={handleClick}
      className="interactive fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center z-40 group"
      aria-label="Contacter le support"
    >
      <Phone className="w-6 h-6 text-[#18A238] group-hover:rotate-12 transition-transform duration-300" />
    </button>
  );
}
