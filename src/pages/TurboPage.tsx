import { useState, useEffect } from 'react';
import { ArrowLeft, Zap, TrendingUp, Rocket } from 'lucide-react';

interface TurboPageProps {
  onBack: () => void;
}

interface UserData {
  id: string;
  hasTurbo: boolean;
  turboActivatedAt: number | null;
}

export default function TurboPage({ onBack }: TurboPageProps) {
  const [user, setUser] = useState<UserData>({ id: '', hasTurbo: false, turboActivatedAt: null });
  const [inputCode, setInputCode] = useState('');
  const [showActivation, setShowActivation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [showStars, setShowStars] = useState(false);

  // Inicializar usuário
  useEffect(() => {
    const storedUser = localStorage.getItem('lotoUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } else {
      // Criar novo usuário
      const newUser: UserData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hasTurbo: false,
        turboActivatedAt: null
      };
      localStorage.setItem('lotoUser', JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  // Som de ativação
  const playActivationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Gerar código
  const handleGenerateCode = () => {
    setShowStars(true);
    setTimeout(() => {
      setCodeGenerated(true);
      setShowStars(false);
    }, 2000);
  };

  // Ativar Turbo
  const handleActivateTurbo = () => {
    if (inputCode === '71777') {
      const updatedUser = {
        ...user,
        hasTurbo: true,
        turboActivatedAt: Date.now()
      };
      setUser(updatedUser);
      localStorage.setItem('lotoUser', JSON.stringify(updatedUser));
      
      setShowActivation(true);
      setShowConfetti(true);
      playActivationSound();
      
      setTimeout(() => {
        setShowActivation(false);
        setShowConfetti(false);
      }, 5000);
    } else {
      alert('❌ Code incorrect ! Réessayez.');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-gray-800 pb-20 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}

      {/* Stars Animation on Generate */}
      {showStars && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="pulsing-star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${16 + Math.random() * 24}px`
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}


      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle-light"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-yellow-200 bg-white/50 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg transition-all font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-900">LOTO</div>
          <div className="text-2xl font-bold text-yellow-600">TURBO</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold text-yellow-600">LotoTurbo</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Activez le mode turbo pour multiplier vos chances de gains
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-yellow-200 animate-slide-up">
          <p className="text-center text-lg text-gray-700 leading-relaxed">
            Découvrez la puissance exclusive du <span className="text-yellow-600 font-bold">Mode Turbo</span> qui révolutionne votre expérience de jeu.
            Générez votre code d'activation unique pour débloquer des fonctionnalités premium qui
            maximiseront vos chances de succès.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feature-card bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-50 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-yellow-700" size={32} />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent text-center mb-3">Précision 10X</h3>
            <p className="text-gray-600 text-center">
              Notre algorithme exclusif augmente la précision de génération de numéros gagnants par 10.
            </p>
          </div>

          <div className="feature-card bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-50 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-yellow-700" size={32} />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent text-center mb-3">+78% de chances</h3>
            <p className="text-gray-600 text-center">
              Augmentation vérifiée de 78% de chances de remporter le jackpot avec la technologie Turbo.
            </p>
          </div>

          <div className="feature-card bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-50 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="text-yellow-700" size={32} />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent text-center mb-3">Génération instantanée</h3>
            <p className="text-gray-600 text-center">
              Plus aucune attente entre les générations. Obtenez vos numéros en temps réel.
            </p>
          </div>
        </div>

        {/* Generate Code Button */}
        <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-200 rounded-2xl p-6 border-2 border-dashed border-yellow-400 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <button 
            onClick={handleGenerateCode}
            disabled={showStars}
            className="w-full py-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600 rounded-xl font-bold text-xl text-gray-900 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            GÉNÉRER UN NOUVEAU CODE
          </button>
        </div>

        {/* Activation Section - Aparece apenas após gerar código */}
        {codeGenerated && (
          <div className="bg-gradient-to-r from-yellow-50 via-amber-100 to-yellow-200 rounded-2xl p-8 border-2 border-yellow-400 shadow-xl animate-slide-up">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
              Votre code d'activation premium
            </h2>
            
            <div className="bg-white rounded-2xl p-8 mb-6 border-2 border-yellow-500 shadow-inner">
              <div className="text-7xl font-mono font-bold tracking-widest text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent golden-glow">
                71777
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6 border-l-4 border-yellow-600">
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent mb-3">Instructions d'utilisation:</h3>
              <p className="text-gray-700 leading-relaxed">
                Copiez ce code exclusif et rendez-vous sur l'application Loto Gains.
                Dans la section "Mode Turbo", collez ce code pour activer
                instantanément toutes les fonctionnalités premium. Ce code est
                valable pour une seule activation.
              </p>
            </div>
            
            {!user.hasTurbo && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Entrez le code d'activation"
                  className="w-full px-6 py-4 bg-white border-2 border-yellow-400 rounded-xl text-center text-2xl font-mono tracking-widest text-yellow-800 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  maxLength={5}
                />
                
                <button
                  onClick={handleActivateTurbo}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 rounded-xl font-bold text-xl text-gray-900 transition-all transform hover:scale-105 shadow-lg golden-button"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={28} />
                    Activer Turbo
                  </span>
                </button>
              </div>
            )}

            {user.hasTurbo && (
              <div className="bg-gradient-to-r from-green-50 via-green-100 to-emerald-100 rounded-xl p-6 border-2 border-green-400 shadow-md">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="text-yellow-600 animate-pulse" size={40} />
                    <h3 className="text-2xl font-bold text-green-700">LotoTurbo Activé !</h3>
                  </div>
                  <p className="text-lg text-green-600">
                    Toutes les fonctionnalités premium sont débloquées
                  </p>
                  <p className="text-sm text-gray-600">
                    Activé le {user.turboActivatedAt ? new Date(user.turboActivatedAt).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Activation Success Modal */}
      {showActivation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl p-12 text-center max-w-md mx-4 transform scale-in shadow-2xl border-4 border-white">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <Zap className="mx-auto mb-4 text-gray-900 animate-pulse drop-shadow-lg" size={80} />
            <h2 className="text-5xl font-bold mb-4 text-gray-900 drop-shadow-lg">Succès !</h2>
            <p className="text-3xl mb-3 font-bold text-gray-900">LotoTurbo activé !</p>
            <p className="text-xl text-gray-800 leading-relaxed">
              Vous avez débloqué la génération rapide et toutes les fonctionnalités avancées
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        .confetti {
          position: absolute;
          width: 12px;
          height: 12px;
          animation: confettiFall 3s linear infinite;
          border-radius: 2px;
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.4; }
        }

        .particle-light {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent);
          border-radius: 50%;
          animation: particleFloat 4s ease-in-out infinite;
        }

        .golden-glow {
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.6),
                       0 0 40px rgba(245, 158, 11, 0.4),
                       0 0 60px rgba(217, 119, 6, 0.3);
          animation: goldenPulse 2s ease-in-out infinite;
        }

        .golden-button {
          box-shadow: 0 4px 20px rgba(234, 179, 8, 0.4),
                      0 8px 40px rgba(250, 204, 21, 0.3);
          animation: goldenPulse 2s ease-in-out infinite;
        }

        @keyframes goldenPulse {
          0%, 100% { 
            box-shadow: 0 4px 20px rgba(234, 179, 8, 0.4),
                        0 8px 40px rgba(250, 204, 21, 0.3);
          }
          50% { 
            box-shadow: 0 4px 30px rgba(234, 179, 8, 0.6),
                        0 8px 60px rgba(250, 204, 21, 0.5);
          }
        }

        @keyframes scale-in {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .feature-card {
          cursor: pointer;
          transform-origin: center;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .feature-card:hover {
          transform: scale(1.15);
          box-shadow: 0 25px 50px rgba(234, 179, 8, 0.35);
        }

        @keyframes pulseStar {
          0% { 
            transform: scale(0) rotate(0deg); 
            opacity: 0;
          }
          50% { 
            transform: scale(1.5) rotate(180deg); 
            opacity: 1;
          }
          100% { 
            transform: scale(0) rotate(360deg); 
            opacity: 0;
          }
        }

        .pulsing-star {
          position: absolute;
          animation: pulseStar 2s ease-out forwards;
          filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.8));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

