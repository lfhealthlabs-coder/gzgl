import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface VideoDetailPageProps {
  featureName: string;
  onBack: () => void;
}

export default function VideoDetailPage({ featureName, onBack }: VideoDetailPageProps) {

  const featureTitles: Record<string, string> = {
    commence: 'Commence ici!',
    ai: 'Loto Gains AI',
    bonus: 'Bonus',
    turbo: 'LotoTurbo',
    '10x': 'LotoGains 10X',
  };

  // MAPEA SOMENTE OS SCRIPTS POR FEATURE
  const playerScriptMap: Record<string, string> = {
    commence: "6911ca244098e8babc0cf75c", 
    bonus:    "6911ca244098e8babc0cf75c",
    "10x":    "6911ca244098e8babc0cf75c",
    turbo:    "6911ca244098e8babc0cf75c",
    ai:       "6911ca244098e8babc0cf75c"
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = `
      <vturb-smartplayer id="vid-${playerScriptMap[featureName]}" style="display:block;margin:0 auto;width:100%;max-width:400px;"></vturb-smartplayer>
    `;

    const s = document.createElement("script");
    s.src = `https://scripts.converteai.net/13f5e6d4-de8b-482f-86fc-5f5fd387ad67/players/${playerScriptMap[featureName]}/v4/player.js`;
    s.async = true;
    document.head.appendChild(s);

    return () => {
      // cleanup
      container.innerHTML = "";
    };
  }, [featureName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="interactive p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {featureTitles[featureName] || 'Vidéo'}
          </h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-4">
          <div ref={containerRef} />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {featureTitles[featureName]}
          </h2>
          <p className="text-gray-600 leading-relaxed">
  {featureName === 'commence' ? (
    <>
      Bienvenue dans <strong>LotoGains</strong> !<br /><br />
      C’est avec une immense joie que moi, Phillipe Durand, vous accueille dans cette nouvelle aventure.  
      À partir d’aujourd’hui, vous faites partie d’un groupe sélect de personnes qui ont décidé d’arrêter de dépendre uniquement de la chance
      et de commencer à jouer avec intelligence, stratégie et technologie de pointe.  
      Le LotoGains a été créé pour transformer votre manière de jouer et augmenter radicalement vos chances de succès.  
      Préparez-vous, car votre nouveau chapitre commence aujourd’hui avec LotoGains.
    </>
  ) : (
    <>Découvrez comment utiliser cette fonctionnalité pour maximiser vos gains.</>
  )}
</p>

        </div>
      </div>
    </div>
  );
}
