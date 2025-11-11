interface FeatureCardsProps {
  onCardClick: (feature: string) => void;
}

export default function FeatureCards({ onCardClick }: FeatureCardsProps) {
  const features = [
    { id: 'commence', title: 'Commence ici!', image: '/image1.jpeg' },
    { id: 'ai',       title: 'Loto Gains AI', image: '/image2.jpeg' },
    { id: 'bonus',    title: 'Bonus',         image: '/image3.jpeg' },
    { id: 'turbo',    title: 'LotoTurbo',     image: '/image4.jpeg' },
    { id: '10x',      title: 'LotoGains 10X', image: '/image5.jpeg' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature) => (
        <button
          key={feature.id}
          onClick={() => onCardClick(feature.id)}
          className="interactive group aspect-square bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 p-6 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md overflow-hidden">
            <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
          </div>

          <h3 className="text-lg font-bold text-gray-800 text-center leading-tight">
            {feature.title}
          </h3>
        </button>
      ))}
    </div>
  );
}
