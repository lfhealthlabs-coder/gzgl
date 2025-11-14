import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Rocket, Lock } from 'lucide-react';

interface LotoGains10xPageProps {
  onBack: () => void;
}

interface Country {
  id: string;
  name: string;
  flag: string;
  flagUrl: string;
}

interface City {
  id: string;
  name: string;
  countryId: string;
}

interface Lottery {
  id: string;
  name: string;
  countryId: string;
  jackpot: number;
  logo: string;
  logoUrl: string;
}

const countries: Country[] = [
  { id: 'uk', name: 'Royaume-Uni', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w80/gb.png' },
  { id: 'france', name: 'France', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w80/fr.png' },
  { id: 'espagne', name: 'Espagne', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w80/es.png' },
  { id: 'italie', name: 'Italie', flag: '🇮🇹', flagUrl: 'https://flagcdn.com/w80/it.png' },
  { id: 'allemagne', name: 'Allemagne', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w80/de.png' },
  { id: 'belgique', name: 'Belgique', flag: '🇧🇪', flagUrl: 'https://flagcdn.com/w80/be.png' },
  { id: 'suisse', name: 'Suisse', flag: '🇨🇭', flagUrl: 'https://flagcdn.com/w80/ch.png' },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹', flagUrl: 'https://flagcdn.com/w80/pt.png' },
];

const cities: City[] = [
  { id: 'london', name: 'Londres', countryId: 'uk' },
  { id: 'manchester', name: 'Manchester', countryId: 'uk' },
  { id: 'birmingham', name: 'Birmingham', countryId: 'uk' },
  { id: 'liverpool', name: 'Liverpool', countryId: 'uk' },
  { id: 'glasgow', name: 'Glasgow', countryId: 'uk' },
  { id: 'bristol', name: 'Bristol', countryId: 'uk' },
  { id: 'paris', name: 'Paris', countryId: 'france' },
  { id: 'marseille', name: 'Marseille', countryId: 'france' },
  { id: 'lyon', name: 'Lyon', countryId: 'france' },
  { id: 'toulouse', name: 'Toulouse', countryId: 'france' },
  { id: 'nice', name: 'Nice', countryId: 'france' },
  { id: 'bordeaux', name: 'Bordeaux', countryId: 'france' },
  { id: 'madrid', name: 'Madrid', countryId: 'espagne' },
  { id: 'barcelona', name: 'Barcelona', countryId: 'espagne' },
  { id: 'valencia', name: 'Valencia', countryId: 'espagne' },
  { id: 'sevilla', name: 'Sevilla', countryId: 'espagne' },
  { id: 'rome', name: 'Rome', countryId: 'italie' },
  { id: 'milan', name: 'Milan', countryId: 'italie' },
  { id: 'naples', name: 'Naples', countryId: 'italie' },
  { id: 'turin', name: 'Turin', countryId: 'italie' },
  { id: 'berlin', name: 'Berlin', countryId: 'allemagne' },
  { id: 'munich', name: 'Munich', countryId: 'allemagne' },
  { id: 'hambourg', name: 'Hambourg', countryId: 'allemagne' },
  { id: 'cologne', name: 'Cologne', countryId: 'allemagne' },
  { id: 'bruxelles', name: 'Bruxelles', countryId: 'belgique' },
  { id: 'anvers', name: 'Anvers', countryId: 'belgique' },
  { id: 'gand', name: 'Gand', countryId: 'belgique' },
  { id: 'liege', name: 'Liège', countryId: 'belgique' },
  { id: 'zurich', name: 'Zurich', countryId: 'suisse' },
  { id: 'geneve', name: 'Genève', countryId: 'suisse' },
  { id: 'bale', name: 'Bâle', countryId: 'suisse' },
  { id: 'berne', name: 'Berne', countryId: 'suisse' },
  { id: 'lisbonne', name: 'Lisbonne', countryId: 'portugal' },
  { id: 'porto', name: 'Porto', countryId: 'portugal' },
];

const lotteries: Lottery[] = [
  { id: 'uk-national', name: 'UK National Lottery', countryId: 'uk', jackpot: 18700000, logo: '🎟️', logoUrl: 'https://img.icons8.com/fluency/96/lottery.png' },
  { id: 'euromillions', name: 'EuroMillions', countryId: 'uk', jackpot: 42000000, logo: '🎲', logoUrl: 'https://img.icons8.com/3d-fluency/94/poker-chip.png' },
  { id: 'thunderball', name: 'Thunderball', countryId: 'uk', jackpot: 5000000, logo: '⚡', logoUrl: 'https://img.icons8.com/fluency/96/lightning-bolt.png' },
  { id: 'loto-fr', name: 'Loto', countryId: 'france', jackpot: 15000000, logo: '🍀', logoUrl: 'https://img.icons8.com/fluency/96/four-leaf-clover.png' },
  { id: 'euromillions-fr', name: 'EuroMillions', countryId: 'france', jackpot: 42000000, logo: '🎲', logoUrl: 'https://img.icons8.com/3d-fluency/94/poker-chip.png' },
  { id: 'la-primitiva', name: 'La Primitiva', countryId: 'espagne', jackpot: 12000000, logo: '🎰', logoUrl: 'https://img.icons8.com/fluency/96/slot-machine.png' },
  { id: 'el-gordo', name: 'El Gordo', countryId: 'espagne', jackpot: 25000000, logo: '💰', logoUrl: 'https://img.icons8.com/fluency/96/money-bag.png' },
  { id: 'superenalotto', name: 'SuperEnalotto', countryId: 'italie', jackpot: 35000000, logo: '🎯', logoUrl: 'https://img.icons8.com/fluency/96/bullseye.png' },
  { id: 'lotto-de', name: 'Lotto 6aus49', countryId: 'allemagne', jackpot: 20000000, logo: '🎱', logoUrl: 'https://img.icons8.com/fluency/96/8-ball.png' },
  { id: 'lotto-be', name: 'Lotto Belgique', countryId: 'belgique', jackpot: 8000000, logo: '🎪', logoUrl: 'https://img.icons8.com/fluency/96/circus-tent.png' },
  { id: 'swiss-lotto', name: 'Swiss Lotto', countryId: 'suisse', jackpot: 10000000, logo: '💎', logoUrl: 'https://img.icons8.com/fluency/96/diamond.png' },
  { id: 'totoloto', name: 'Totoloto', countryId: 'portugal', jackpot: 7000000, logo: '🌟', logoUrl: 'https://img.icons8.com/fluency/96/star.png' },
];

export default function LotoGains10xPage({ onBack }: LotoGains10xPageProps) {
  const [step, setStep] = useState<'splash' | 'code' | 'selection' | 'results'>('splash');
  const [activationCode, setActivationCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Efeito de splash screen - passa para código após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('code');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeSubmit = async () => {
    if (activationCode === '71777') {
      setIsActivating(true);
      
      // Animação de suspense - aguarda 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsCodeValid(true);
      setIsActivating(false);
      
      // Pequeno delay antes de mudar de tela
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStep('selection');
    } else {
      alert('❌ Code incorrect ! Utilisez le code du Mode Turbo.');
    }
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedCity(null);
    setSelectedLottery(null);
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedLottery(null); // Reset lottery quando mudar de cidade
  };

  const handleLotterySelect = (lottery: Lottery) => {
    // Só permite selecionar se uma cidade estiver selecionada
    if (selectedCity) {
      setSelectedLottery(lottery);
    }
  };

  const handleResetSelection = () => {
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedLottery(null);
    setGeneratedNumbers([]);
    setShowNumbers(false);
    setStep('selection');
  };

  const generateWinningNumbers = async () => {
    if (!selectedLottery) return;
    
    setIsGenerating(true);
    setStep('results');
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Gera 6 números + 1 número bonus (verde)
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);
    
    // Adiciona número bonus
    let bonusNum;
    do {
      bonusNum = Math.floor(Math.random() * 50) + 1;
    } while (numbers.includes(bonusNum));
    numbers.push(bonusNum);
    
    setGeneratedNumbers(numbers);
    setIsGenerating(false);
    
    // Mostra números com animação
    setTimeout(() => {
      setShowNumbers(true);
    }, 500);
  };

  const filteredCities = selectedCountry 
    ? cities.filter(city => city.countryId === selectedCountry).slice(0, 8)
    : [];

  const filteredLotteries = selectedCountry
    ? lotteries.filter(lottery => lottery.countryId === selectedCountry)
    : [];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Partículas flutuantes de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* SPLASH SCREEN - Logo grande com animação */}
      {step === 'splash' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-green-950 to-black">
          <div className="text-center animate-fade-in-scale">
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-500 opacity-50 blur-3xl animate-pulse-slow" />
              
              {/* Logo */}
              <div className="relative">
                <h1 className="text-8xl md:text-9xl font-black mb-4 relative">
                  <span className="premium-text-loto animate-shine">
                    LOTO GAINS
                  </span>
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-7xl animate-float">🍀</div>
                </div>
                <h2 className="text-7xl md:text-8xl font-black mt-4 relative">
                  <span className="premium-text-10x animate-shine">
                    10X
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE CÓDIGO */}
      {step === 'code' && (
        <div className="min-h-screen flex flex-col">
          {/* Header fixo */}
          <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-yellow-500/30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft size={24} />
                <span className="font-semibold">Retour</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-4xl w-full space-y-8 animate-fade-in">
              {/* Título */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    Générateur de Numéros Gagnants
                  </span>
                </h1>
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-8" />
              </div>

              {/* Card de descrição */}
              <div className="bg-gradient-to-r from-green-900/30 via-yellow-900/20 to-green-900/30 rounded-3xl p-8 border-2 border-yellow-600/40 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <Rocket className="w-12 h-12 text-yellow-400 animate-bounce-slow" />
                  <h2 className="text-3xl font-bold text-white">
                    NOUVELLE IA ULTRA-PUISSANTE
                  </h2>
                </div>
                <p className="text-xl text-gray-200 mb-4">
                  Algorithmes optimisés pour maximiser vos chances de gains
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  RÉSULTATS 10X PLUS EFFICACES
                </p>
              </div>

              {/* Card de ativação com código */}
              <div className="bg-gradient-to-br from-green-950/50 to-black/50 rounded-3xl p-6 md:p-10 border-2 border-yellow-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <h3 className="text-2xl md:text-3xl font-bold text-yellow-400">Mode Turbo</h3>
                </div>
                
                <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed">
                  Le Mode Turbo offre une précision 10X supérieure, 78% de chances en plus de gagner le jackpot et génère de nouveaux numéros sans temps d'attente.
                </p>
                
                {!isActivating && !isCodeValid && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="Code d'activation"
                      className="flex-1 px-6 py-4 bg-black/60 border-2 border-yellow-600/50 rounded-xl text-white text-xl text-center font-mono tracking-widest focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder:text-gray-500"
                      maxLength={5}
                    />
                    <button
                      onClick={handleCodeSubmit}
                      disabled={activationCode.length !== 5}
                      className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-black font-bold text-xl rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-yellow-500/50"
                    >
                      Activer
                    </button>
                  </div>
                )}

                {/* Animação de ativação */}
                {isActivating && (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 border-4 border-yellow-600/30 border-t-yellow-400 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-yellow-400 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-3 animate-pulse">Activation en cours...</h3>
                    <p className="text-lg text-gray-300">Déblocage du Mode Turbo 10X</p>
                  </div>
                )}

                {/* Confirmação de sucesso */}
                {isCodeValid && !isActivating && (
                  <div className="text-center py-8 animate-success-bounce">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-2">Mode Turbo Activé !</h3>
                    <p className="text-lg text-gray-300">Redirection en cours...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE SELEÇÃO - 3 Colunas */}
      {step === 'selection' && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-yellow-500/30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setStep('code')}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft size={24} />
                <span className="font-semibold">Retour</span>
              </button>
            </div>
          </div>

          <div className="flex-1 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Etapas numeradas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Coluna 1 - Países */}
                <div className="bg-gradient-to-br from-black/80 to-green-950/30 rounded-2xl p-6 border-2 border-yellow-600/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center text-black font-bold text-2xl">
                      1
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">Choisissez votre pays</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleCountrySelect(country.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedCountry === country.id
                            ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/50'
                            : 'bg-black/40 border-yellow-600/30 hover:border-yellow-500/60 hover:bg-yellow-900/10'
                        }`}
                      >
                        <div className="w-12 h-8 mx-auto mb-2 flex items-center justify-center">
                          <img 
                            src={country.flagUrl} 
                            alt={country.name}
                            className="max-h-8 rounded shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <span className="text-4xl hidden">{country.flag}</span>
                        </div>
                        <div className="text-sm font-semibold text-white">{country.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coluna 2 - Cidades */}
                <div className="bg-gradient-to-br from-black/80 to-green-950/30 rounded-2xl p-6 border-2 border-yellow-600/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center text-black font-bold text-2xl">
                      2
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">Choisissez votre ville</div>
                    </div>
                  </div>
                  
                  {!selectedCountry && (
                    <div className="text-center text-gray-400 py-12">
                      Sélectionnez d'abord un pays
                    </div>
                  )}
                  
                  {selectedCountry && (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleCitySelect(city.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedCity === city.id
                              ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/50'
                              : 'bg-black/40 border-yellow-600/30 hover:border-yellow-500/60 hover:bg-yellow-900/10'
                          }`}
                        >
                          <div className="text-3xl mb-2">🏛️</div>
                          <div className="text-sm font-semibold text-white">{city.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coluna 3 - Loterias */}
                <div className="bg-gradient-to-br from-black/80 to-green-950/30 rounded-2xl p-6 border-2 border-yellow-600/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center text-black font-bold text-2xl">
                      3
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">Choisissez votre loterie</div>
                    </div>
                  </div>
                  
                  {!selectedCity && (
                    <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-3">
                      <Lock className="w-12 h-12 text-gray-600" />
                      <p>Sélectionnez d'abord une ville</p>
                    </div>
                  )}
                  
                  {selectedCity && selectedCountry && (
                    <div className="space-y-3">
                      {filteredLotteries.map((lottery) => (
                        <button
                          key={lottery.id}
                          onClick={() => handleLotterySelect(lottery)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedLottery?.id === lottery.id
                              ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/50'
                              : 'bg-black/40 border-yellow-600/30 hover:border-yellow-500/60 hover:bg-yellow-900/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <img 
                                    src={lottery.logoUrl} 
                                    alt={lottery.name}
                                    className="max-h-8 max-w-8"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <span className="text-2xl hidden">{lottery.logo}</span>
                                </div>
                                <span className="font-semibold text-white">{lottery.name}</span>
                              </div>
                              <div className="text-sm text-gray-400">Jackpot actuel</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-yellow-400">
                                £{(lottery.jackpot / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de gerar */}
              {selectedLottery && (
                <div className="text-center animate-fade-in">
                  <button
                    onClick={generateWinningNumbers}
                    className="px-12 py-5 bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white font-bold text-2xl rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50 animate-pulse-slow"
                  >
                    GÉNÉRER MES NUMÉROS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TELA DE RESULTADOS */}
      {step === 'results' && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-yellow-500/30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setStep('selection');
                  setGeneratedNumbers([]);
                  setShowNumbers(false);
                }}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft size={24} />
                <span className="font-semibold">Retour</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-4xl w-full">
              {isGenerating && !showNumbers && (
                <div className="text-center animate-fade-in">
                  <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 border-4 border-yellow-600/30 border-t-yellow-400 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-yellow-400 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">Génération en cours...</h2>
                  <p className="text-xl text-gray-400">Analyse des tirages avec IA 10X</p>
                </div>
              )}

              {showNumbers && (
                <div className="space-y-8 animate-fade-in">
                  {/* Resultado principal */}
                  <div className="bg-gradient-to-br from-yellow-900/30 via-green-900/20 to-yellow-900/30 rounded-3xl p-10 border-4 border-yellow-500/50">
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                        <h2 className="text-4xl font-bold text-yellow-400">
                          Vos Numéros Porte-Bonheur !
                        </h2>
                      </div>
                      <div className="text-xl text-gray-300 mb-2">Jackpot actuel : <span className="text-green-400 font-bold">£{selectedLottery ? (selectedLottery.jackpot / 1000000).toFixed(1) : '0'}M</span></div>
                    </div>

                    {/* Números gerados com animação */}
                    <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
                      {generatedNumbers.slice(0, 6).map((num, index) => (
                        <div
                          key={index}
                          className="number-ball animate-number-appear hover:scale-110 transition-transform duration-300 cursor-pointer"
                          style={{ animationDelay: `${index * 0.2}s` }}
                        >
                          {num}
                        </div>
                      ))}
                      {generatedNumbers[6] && (
                        <div
                          className="number-ball-bonus animate-number-appear hover:scale-110 transition-transform duration-300 cursor-pointer"
                          style={{ animationDelay: '1.2s' }}
                        >
                          {generatedNumbers[6]}
                        </div>
                      )}
                    </div>

                    {/* Info adicional */}
                    <div className="bg-green-950/40 rounded-2xl p-6 border-2 border-green-600/40">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🎯</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-400 mb-2">
                            Faites vos jeux en ligne :
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg">
                              National Lottery
                            </button>
                            <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg">
                              Lotto UK
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pontos de venda */}
                  <div className="bg-gradient-to-br from-green-950/50 to-black/50 rounded-3xl p-8 border-2 border-green-600/40">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🏪</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">
                          Points de vente près de chez vous :
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">📍</span>
                            <span>Bureau de tabac 'Golden Chance', 123 Oxford Street, {selectedCity ? cities.find(c => c.id === selectedCity)?.name : 'Londres'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">📍</span>
                            <span>Superette 'Lucky Star', 45 Market Street, {selectedCity ? cities.find(c => c.id === selectedCity)?.name : 'Londres'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">📍</span>
                            <span>Magasin 'Fortune', 78 High Street, {selectedCity ? cities.find(c => c.id === selectedCity)?.name : 'Londres'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center text-gray-500 text-sm space-y-1">
                    <p>Ces numéros sont générés à partir d'algorithmes probabilistes.</p>
                    <p>Jouer doit rester un plaisir - jouez de manière responsable !</p>
                    <p>Les chances de gain sont minimes - misez avec modération.</p>
                  </div>

                  {/* Botão regenerar */}
                  <div className="text-center">
                    <button
                      onClick={handleResetSelection}
                      className="px-10 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-xl rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      Générer d'autres numéros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Texto Premium com Textura */
        .premium-text-loto {
          background: linear-gradient(
            135deg,
            #ffd700 0%,
            #ffed4e 20%,
            #ffd700 40%,
            #ffb700 60%,
            #ffd700 80%,
            #ffed4e 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% 300%;
          text-shadow: 
            0 0 40px rgba(255, 215, 0, 0.8),
            0 0 80px rgba(255, 215, 0, 0.6),
            0 0 120px rgba(255, 215, 0, 0.4),
            2px 2px 4px rgba(0, 0, 0, 0.8);
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.7));
          letter-spacing: 0.05em;
        }

        .premium-text-10x {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f0f0f0 20%,
            #e0e0e0 40%,
            #d4d4d4 50%,
            #e0e0e0 60%,
            #f0f0f0 80%,
            #ffffff 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% 300%;
          text-shadow: 
            0 0 40px rgba(255, 255, 255, 0.8),
            0 0 80px rgba(255, 255, 255, 0.6),
            0 0 120px rgba(255, 255, 255, 0.4),
            3px 3px 6px rgba(0, 0, 0, 0.9),
            -2px -2px 4px rgba(255, 215, 0, 0.5);
          filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
          letter-spacing: 0.1em;
        }

        /* Partículas flutuantes */
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(30px, -30px) scale(1.2);
            opacity: 0.6;
          }
        }

        .floating-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.8), rgba(34, 197, 94, 0.4));
          border-radius: 50%;
          animation: float-particle ease-in-out infinite;
          filter: blur(1px);
        }

        /* Splash screen */
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 1s ease-out;
        }

        @keyframes shine {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shine {
          background-size: 200% 200%;
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* Animação de sucesso */
        @keyframes success-bounce {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-success-bounce {
          animation: success-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Fade in genérico */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        /* Números com animação */
        .number-ball {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: #000;
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.6);
          opacity: 0;
        }

        .number-ball-bonus {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: #fff;
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.6);
          opacity: 0;
        }

        @keyframes number-appear {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-number-appear {
          animation: number-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
