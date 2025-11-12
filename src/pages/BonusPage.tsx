import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, TrendingUp, Newspaper, ExternalLink, Sparkles, CheckCircle2, Moon, Sun } from 'lucide-react';

interface BonusPageProps {
  onBack: () => void;
}

interface Jackpot {
  id: string;
  pays: string;
  loterie: string;
  valeur: number;
  tirage: string;
  date_limite: string;
  date_tirage: string;
  probabilite: string;
  notes: string;
  lotteryId: string;
  region: 'europe' | 'france' | 'international';
}

interface Result {
  id: string;
  loterie: string;
  numeros: number[];
  horario: string;
  lotteryId: string;
}

interface News {
  id: string;
  data: string;
  titulo: string;
  resumo: string;
  lotteryId: string;
}

interface UserHistory {
  numeros: number[];
  loterie: string;
}

type FilterType = 'tous' | 'haut-potentiel' | 'europeen' | 'national' | 'international';

// Mock de loterias disponíveis
const lotteries: { [key: string]: { name: string; url: string; region: 'europe' | 'france' | 'international'; pays: string; probabilite: string } } = {
  // França (expandido)
  'loto-fr': { name: 'Loto', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/loto', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840' },
  'euromillions-fr': { name: 'EuroMillions My Million', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/euromillions', region: 'france', pays: 'France', probabilite: '1 sur 139 838 160' },
  'keno-fr': { name: 'Keno', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/keno', region: 'france', pays: 'France', probabilite: '1 sur 2 147 181' },
  'loto-super-cagnotte': { name: 'Loto Super Cagnotte', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840' },
  'eurodreams-fr': { name: 'EuroDreams', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/eurodreams', region: 'france', pays: 'France', probabilite: '1 sur 19 191 900' },
  'amigo-fr': { name: 'Amigo', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 1 906 884' },
  'cash-fr': { name: 'Cash', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 324 632' },
  'loto-week-end': { name: 'Loto Week-end', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840' },
  'quinté-plus': { name: 'Quinté+', url: 'https://www.pmu.fr', region: 'france', pays: 'France', probabilite: '1 sur 7 893 600' },
  'joker-plus': { name: 'Joker+', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 1 000 000' },
  
  // Europa (expandido)
  'euromillions': { name: 'EuroMillions', url: 'https://www.euro-millions.com', region: 'europe', pays: 'Europe', probabilite: '1 sur 139 838 160' },
  'eurojackpot': { name: 'Eurojackpot', url: 'https://www.eurojackpot.org', region: 'europe', pays: 'Europe', probabilite: '1 sur 139 838 160' },
  'superenalotto': { name: 'SuperEnalotto', url: 'https://www.superenalotto.it', region: 'europe', pays: 'Italie', probabilite: '1 sur 622 614 630' },
  'el-gordo': { name: 'El Gordo', url: 'https://www.loteriaelgordo.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 31 625 100' },
  'lotto-uk': { name: 'UK National Lottery', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 45 057 474' },
  'thunderball-uk': { name: 'UK Thunderball', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 8 060 598' },
  'eurodreams-eu': { name: 'EuroDreams', url: 'https://www.euro-millions.com', region: 'europe', pays: 'Europe', probabilite: '1 sur 19 191 900' },
  'lotto-allemagne': { name: 'Lotto 6aus49', url: 'https://www.lotto.de', region: 'europe', pays: 'Allemagne', probabilite: '1 sur 139 838 160' },
  'lotto-austria': { name: 'Lotto Autriche', url: 'https://www.lotterien.at', region: 'europe', pays: 'Autriche', probabilite: '1 sur 8 145 060' },
  'viking-lotto': { name: 'Viking Lotto', url: 'https://www.vikinglotto.com', region: 'europe', pays: 'Scandinavie', probabilite: '1 sur 98 172 096' },
  'irish-lotto': { name: 'Irish Lotto', url: 'https://www.lottery.ie', region: 'europe', pays: 'Irlande', probabilite: '1 sur 10 737 573' },
  'swiss-lotto': { name: 'Swiss Lotto', url: 'https://www.swisslos.ch', region: 'europe', pays: 'Suisse', probabilite: '1 sur 31 474 716' },
  'polish-lotto': { name: 'Lotto Pologne', url: 'https://www.lotto.pl', region: 'europe', pays: 'Pologne', probabilite: '1 sur 13 983 816' },
  'dutch-lotto': { name: 'Lotto Pays-Bas', url: 'https://www.lotto.nl', region: 'europe', pays: 'Pays-Bas', probabilite: '1 sur 8 145 060' },
  'greek-lotto': { name: 'Greek Lotto', url: 'https://www.opap.gr', region: 'europe', pays: 'Grèce', probabilite: '1 sur 24 435 180' },
  'belgian-lotto': { name: 'Lotto Belgique', url: 'https://www.loterie-nationale.be', region: 'europe', pays: 'Belgique', probabilite: '1 sur 13 983 816' },
  'set-for-life-uk': { name: 'Set For Life', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 15 339 390' },
  'la-primitiva': { name: 'La Primitiva', url: 'https://www.loteriasyapuestas.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 13 983 816' },
  'bonoloto': { name: 'Bonoloto', url: 'https://www.loteriasyapuestas.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 13 983 816' },
  'lotto-portugal': { name: 'Totoloto', url: 'https://www.jogossantacasa.pt', region: 'europe', pays: 'Portugal', probabilite: '1 sur 13 983 816' },
  'swedish-lotto': { name: 'Swedish Lotto', url: 'https://www.svenskaspel.se', region: 'europe', pays: 'Suède', probabilite: '1 sur 6 724 520' },
  'norway-lotto': { name: 'Norway Lotto', url: 'https://www.norsk-tipping.no', region: 'europe', pays: 'Norvège', probabilite: '1 sur 5 379 616' },
  'denmark-lotto': { name: 'Denmark Lotto', url: 'https://www.danskespil.dk', region: 'europe', pays: 'Danemark', probabilite: '1 sur 8 347 680' },
  'finnish-lotto': { name: 'Veikkaus Lotto', url: 'https://www.veikkaus.fi', region: 'europe', pays: 'Finlande', probabilite: '1 sur 15 380 937' },
  'czech-lotto': { name: 'Sportka', url: 'https://www.sazka.cz', region: 'europe', pays: 'République Tchèque', probabilite: '1 sur 13 983 816' },
  'hungarian-lotto': { name: 'Hatoslottó', url: 'https://www.szerencsejatek.hu', region: 'europe', pays: 'Hongrie', probabilite: '1 sur 13 983 816' },
  'croatian-lotto': { name: 'Lotto Croatia', url: 'https://www.lutrija.hr', region: 'europe', pays: 'Croatie', probabilite: '1 sur 13 983 816' },
  
  // Internacional
  'powerball': { name: 'Powerball', url: 'https://www.powerball.com', region: 'international', pays: 'USA', probabilite: '1 sur 292 201 338' },
  'mega-millions': { name: 'Mega Millions', url: 'https://www.megamillions.com', region: 'international', pays: 'USA', probabilite: '1 sur 302 575 350' },
  'mega-sena': { name: 'Mega-Sena', url: 'https://loterias.caixa.gov.br', region: 'international', pays: 'Brésil', probabilite: '1 sur 50 063 860' },
  'oz-lotto': { name: 'Oz Lotto', url: 'https://www.ozlotteries.com', region: 'international', pays: 'Australie', probabilite: '1 sur 45 379 620' },
  'lotto-max': { name: 'Lotto Max', url: 'https://www.lotto649.com', region: 'international', pays: 'Canada', probabilite: '1 sur 33 294 800' },
  'lotto-649': { name: 'Lotto 6/49', url: 'https://www.lotto649.com', region: 'international', pays: 'Canada', probabilite: '1 sur 13 983 816' },
};

export default function BonusPage({ onBack }: BonusPageProps) {
  const [jackpots, setJackpots] = useState<Jackpot[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [lastJackpotUpdate, setLastJackpotUpdate] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [matchedNumbers, setMatchedNumbers] = useState<number>(0);
  const [hasNewToday, setHasNewToday] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [darkMode, setDarkMode] = useState(false);
  const [activeModule, setActiveModule] = useState<'jackpots' | 'results' | 'news' | null>(null);

  // Gerar jackpots mockados
  const getTodayJackpots = (): Jackpot[] => {
    const lotteryIds = Object.keys(lotteries);
    const mockJackpots: Jackpot[] = [];
    
    const notesExamples = [
      'Jackpot record à gagner - Le plus gros jackpot européen de la saison',
      'Super Cagnotte ce weekend - Ne manquez pas cette chance exceptionnelle',
      'Jackpot en progression constante depuis 3 semaines consécutives',
      'Tirage exceptionnel - Double chance de gagner avec bonus inclus',
      'Record national - Plus gros jackpot de l\'année en cours',
      'Promotion spéciale pour les nouveaux joueurs ce mois-ci',
      'Jackpot garanti minimum - Jamais en dessous du montant annoncé',
      'Tirage spécial avec gains supplémentaires et bonus multiplicateur',
      'Opportunité unique - Jackpot multiplié par 2 pour ce tirage',
      'Dernière chance avant réinitialisation du jackpot la semaine prochaine',
      'Gains multiples possibles avec les codes gagnants additionnels',
      'Jackpot accumulé sur plusieurs semaines - Montant exceptionnel',
      'Tirage anniversaire avec primes et cadeaux bonus',
      'Jackpot historique - Montant jamais atteint auparavant',
      'Super tirage de fin d\'année avec jackpots garantis',
      'Cagnotte exceptionnelle suite à plusieurs tirages sans gagnant',
      'Prix record en jeu - Plus gros gain possible cette année',
      'Tirage spécial du mois avec bonus de participation',
      'Jackpot boosté grâce aux multiples reports successifs',
      'Gain maximum garanti avec multiplicateur de cagnotte actif',
      'Tirage événement avec récompenses supplémentaires',
      'Jackpot triple suite à l\'accumulation des dernières semaines',
      'Promotion limitée - Bonus de bienvenue pour nouveaux participants',
      'Cagnotte millionnaire en jeu pour ce tirage exceptionnel',
      'Prix incroyable avec possibilité de gains secondaires',
      'Tirage bonus avec plusieurs millions en jeu',
      'Record de participation attendu - Jackpot historique',
      'Gain garanti avec minimum de 2 millions d\'euros',
      'Super chance de devenir millionnaire dès ce tirage',
      'Jackpot exceptionnel rarement atteint dans cette loterie',
      'Montant record suite aux reports des tirages précédents',
      'Tirage spécial automne avec jackpots boostés',
      'Cagnotte géante - Plus gros gain de la décennie',
      'Opportunité rare avec jackpot multiplié et bonus actifs',
      'Prix maximal en jeu - Derniers jours pour participer',
      'Jackpot augmenté de 50% pour ce tirage unique',
      'Gain exceptionnel avec bonus de participation garantis',
      'Tirage historique - Ne ratez pas cette chance unique',
      'Cagnotte record attendue pour le prochain tirage',
      'Super jackpot avec gains complémentaires assurés',
    ];
    
    // Data base: 12 de novembro de 2025 (atualidade)
    const hoje = new Date(2025, 10, 12); // Mês 10 = novembro (0-indexed)
    
    // Criar jackpots para cada loteria
    lotteryIds.forEach((lotteryId, index) => {
      const lottery = lotteries[lotteryId];
      
      // Definir valores base por região
      let baseValue;
      if (lottery.region === 'france') {
        baseValue = Math.random() * 30000000 + 2000000; // 2M a 32M
      } else if (lottery.region === 'europe') {
        baseValue = Math.random() * 150000000 + 10000000; // 10M a 160M
      } else {
        baseValue = Math.random() * 300000000 + 50000000; // 50M a 350M
      }
      
      // Sortear data futura (1 a 30 dias no futuro)
      const dayOffset = Math.floor(Math.random() * 30) + 1;
      const dateTirage = new Date(hoje);
      dateTirage.setDate(dateTirage.getDate() + dayOffset);
      
      const dateLimite = new Date(dateTirage);
      dateLimite.setHours(dateLimite.getHours() - 2); // 2h antes do sorteio
      
      mockJackpots.push({
        id: `jackpot_${index}`,
        pays: lottery.pays,
        loterie: lottery.name,
        valeur: Math.round(baseValue),
        tirage: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dateTirage.getDay()],
        date_limite: dateLimite.toLocaleDateString('fr-FR'),
        date_tirage: dateTirage.toLocaleDateString('fr-FR'),
        probabilite: lottery.probabilite,
        notes: notesExamples[index % notesExamples.length],
        lotteryId,
        region: lottery.region
      });
    });
    
    // Ordenar por valor decrescente
    return mockJackpots.sort((a, b) => b.valeur - a.valeur);
  };

  // Gerar resultado aleatório
  const generateRandomResult = (): Result => {
    const lotteryIds = Object.keys(lotteries);
    const lotteryId = lotteryIds[Math.floor(Math.random() * lotteryIds.length)];
    const numeros: number[] = [];
    
    for (let i = 0; i < 6; i++) {
      let num;
      do {
        num = Math.floor(Math.random() * 60) + 1;
      } while (numeros.includes(num));
      numeros.push(num);
    }
    
    numeros.sort((a, b) => a - b);
    
    return {
      id: `result_${Date.now()}_${Math.random()}`,
      loterie: lotteries[lotteryId].name,
      numeros,
      horario: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      lotteryId
    };
  };

  // Gerar notícias mockadas
  const generateNews = (): News[] => {
    const mockNews: News[] = [];
    const lotteryIds = Object.keys(lotteries);
    
    const titles = [
      'Nouveau jackpot record!',
      'Gagnant de la semaine révélé',
      'Changements dans les règles de tirage',
      'Double chance ce weekend',
      'Promotion spéciale pour les membres',
      'Statistiques du mois',
      'Nouveau jeu disponible'
    ];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockNews.push({
        id: `news_${i}`,
        data: date.toLocaleDateString('fr-FR'),
        titulo: titles[i],
        resumo: `Découvrez les dernières actualités concernant ${lotteries[lotteryIds[i % lotteryIds.length]].name}. Ne manquez pas cette opportunité!`,
        lotteryId: lotteryIds[i % lotteryIds.length]
      });
    }
    
    return mockNews;
  };

  // Inicializar jackpots
  useEffect(() => {
    const storedJackpots = localStorage.getItem('bonusJackpots');
    const storedUpdate = localStorage.getItem('bonusJackpotsUpdate');
    const storedVersion = localStorage.getItem('bonusJackpotsVersion');
    
    const now = Date.now();
    const fourAM = new Date();
    fourAM.setHours(4, 0, 0, 0);
    const lastFourAM = fourAM.getTime() > now ? fourAM.getTime() - 86400000 : fourAM.getTime();
    
    // Versão atual - incrementar quando mudar a estrutura dos dados
    const currentVersion = '2.0';
    
    // Regenerar se: não existir, versão diferente, ou passou das 4h
    const shouldRegenerate = !storedJackpots || 
                            !storedUpdate || 
                            storedVersion !== currentVersion ||
                            parseInt(storedUpdate) < lastFourAM;
    
    if (shouldRegenerate) {
      const newJackpots = getTodayJackpots();
      console.log('Gerando novos jackpots:', newJackpots.length);
      setJackpots(newJackpots);
      localStorage.setItem('bonusJackpots', JSON.stringify(newJackpots));
      localStorage.setItem('bonusJackpotsUpdate', now.toString());
      localStorage.setItem('bonusJackpotsVersion', currentVersion);
      setLastJackpotUpdate(now);
    } else {
      const loadedJackpots = JSON.parse(storedJackpots);
      console.log('Carregando jackpots do cache:', loadedJackpots.length);
      setJackpots(loadedJackpots);
      setLastJackpotUpdate(parseInt(storedUpdate));
    }
  }, []);

  // Inicializar notícias
  useEffect(() => {
    const storedNews = localStorage.getItem('bonusNews');
    const storedNewsUpdate = localStorage.getItem('bonusNewsUpdate');
    
    const now = Date.now();
    const fiveAM = new Date();
    fiveAM.setHours(5, 0, 0, 0);
    const lastFiveAM = fiveAM.getTime() > now ? fiveAM.getTime() - 86400000 : fiveAM.getTime();
    
    if (!storedNews || !storedNewsUpdate || parseInt(storedNewsUpdate) < lastFiveAM) {
      const newNews = generateNews();
      setNews(newNews);
      localStorage.setItem('bonusNews', JSON.stringify(newNews));
      localStorage.setItem('bonusNewsUpdate', now.toString());
      
      // Verificar se há notícias de hoje
      const today = new Date().toLocaleDateString('fr-FR');
      setHasNewToday(newNews.some(n => n.data === today));
    } else {
      const loadedNews = JSON.parse(storedNews);
      setNews(loadedNews);
      
      // Verificar se há notícias de hoje
      const today = new Date().toLocaleDateString('fr-FR');
      setHasNewToday(loadedNews.some((n: News) => n.data === today));
    }
  }, []);

  // Simulador de resultados em tempo real (novo resultado a cada 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      const newResult = generateRandomResult();
      setResults(prev => [newResult, ...prev].slice(0, 10));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Calcular horas desde última atualização
  const getHoursSinceUpdate = (): string => {
    const hours = Math.floor((Date.now() - lastJackpotUpdate) / 3600000);
    return hours === 0 ? '< 1h' : `${hours}h`;
  };

  // Comparar com bilhetes do usuário
  const compareWithTickets = (resultNumeros: number[]) => {
    const storedHistory = localStorage.getItem('userHistory');
    if (!storedHistory) {
      alert('Aucun billet trouvé dans votre historique.');
      return;
    }
    
    const history: UserHistory[] = JSON.parse(storedHistory);
    let maxMatches = 0;
    
    history.forEach(ticket => {
      const matches = ticket.numeros.filter(num => resultNumeros.includes(num)).length;
      if (matches > maxMatches) maxMatches = matches;
    });
    
    setMatchedNumbers(maxMatches);
    
    if (maxMatches > 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    alert(`Meilleur résultat: ${maxMatches} numéro(s) correspondant(s)!`);
  };

  // Abrir link da loteria
  const openLotteryLink = (lotteryId: string) => {
    const lottery = lotteries[lotteryId];
    if (lottery) {
      window.open(lottery.url, '_blank');
    }
  };

  // Filtrar jackpots
  const getFilteredJackpots = (): Jackpot[] => {
    console.log('Total de jackpots:', jackpots.length);
    console.log('Filtro ativo:', activeFilter);
    
    let result: Jackpot[];
    
    switch (activeFilter) {
      case 'haut-potentiel':
        // Pegar os melhores de cada região
        const france = jackpots.filter(j => j.region === 'france').slice(0, 2);
        const europe = jackpots.filter(j => j.region === 'europe').slice(0, 3);
        const international = jackpots.filter(j => j.region === 'international').slice(0, 2);
        result = [...france, ...europe, ...international].sort((a, b) => b.valeur - a.valeur);
        break;
      case 'europeen':
        result = jackpots.filter(j => j.region === 'europe');
        break;
      case 'national':
        result = jackpots.filter(j => j.region === 'france');
        break;
      case 'international':
        result = jackpots.filter(j => j.region === 'international');
        break;
      default:
        result = jackpots; // tous
    }
    
    console.log('Jackpots filtrados:', result.length);
    if (result.length > 0) {
      console.log('Primeiro jackpot:', result[0]);
    }
    
    return result;
  };

  const filteredJackpots = getFilteredJackpots();

  const bgColor = darkMode 
    ? 'bg-gray-900' 
    : 'bg-gradient-to-br from-[#2BC047]/5 via-white to-[#F7D25F]/10';
  
  const cardBg = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const textColor = darkMode ? 'text-white' : 'text-gray-800';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Simple Header - Não sticky */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 ${textColor} hover:text-[#2BC047] transition-colors`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Retour</span>
          </button>
          
          <h1 className={`text-xl font-bold ${textColor}`}>
            Bonus & Actualités
          </h1>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:bg-[#2BC047]/20 px-3 py-2 rounded-full transition-all`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-xs font-medium">Mode {darkMode ? 'clair' : 'sombre'}</span>
          </button>
        </div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="text-[#F7D25F]" size={20} />
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Module Selection Cards */}
        {!activeModule && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Jackpots Instantanés */}
            <button
              onClick={() => setActiveModule('jackpots')}
              className={`interactive ${cardBg} border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 p-6 text-center group`}
            >
              <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#2BC047] to-[#18A238]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 8px rgba(0,0,0,0.3)' }}>
                      JACKPOTS
                    </div>
                    <div className="text-3xl font-black text-[#F7D25F]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                      INSTANTANÉS
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-[#2BC047]' : 'text-[#18A238]'} group-hover:text-[#2BC047] transition-colors`}>
                Jackpots Instantanés
              </h3>
            </button>

            {/* Résultats en Temps Réel */}
            <button
              onClick={() => setActiveModule('results')}
              className={`interactive ${cardBg} border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 p-6 text-center group`}
            >
              <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#2BC047] to-[#18A238]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 8px rgba(0,0,0,0.3)' }}>
                      RÉSULTATS
                    </div>
                    <div className="text-3xl font-black text-[#F7D25F]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                      EN TEMPS RÉEL
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-[#2BC047]' : 'text-[#18A238]'} group-hover:text-[#2BC047] transition-colors`}>
                Résultats en temps réel
              </h3>
            </button>

            {/* Mises à Jour Quotidiennes */}
            <button
              onClick={() => setActiveModule('news')}
              className={`interactive ${cardBg} border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 p-6 text-center group`}
            >
              <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#2BC047] to-[#18A238]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 8px rgba(0,0,0,0.3)' }}>
                      MISES
                    </div>
                    <div className="text-3xl font-black text-[#F7D25F]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                      À JOUR QUOTIDIENNES
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-[#2BC047]' : 'text-[#18A238]'} group-hover:text-[#2BC047] transition-colors`}>
                Mises à jour quotidiennes
              </h3>
            </button>
          </div>
        )}
        {/* Módulo 1: Jackpots */}
        {activeModule === 'jackpots' && (
          <div>
            {/* Botão Retour ANTES da Hero Section */}
            <button
              onClick={() => setActiveModule(null)}
              className={`mb-4 flex items-center gap-2 ${textColor} hover:text-[#2BC047] transition-colors`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux modules</span>
            </button>

            {/* Hero Section dentro do módulo Jackpots */}
            <div className={`${darkMode ? 'bg-gradient-to-r from-[#1a7a2e] to-[#2BC047]' : 'bg-gradient-to-r from-[#2BC047] to-[#18A238]'} text-white rounded-2xl p-8 mb-6 shadow-xl`}>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                LotoGains — Jackpots Instantanés
              </h1>
              <p className="text-base md:text-lg mb-4 max-w-3xl mx-auto text-center opacity-95">
                En un seul clic, vous aurez accès aux loteries les plus convoitées du pays, celles qui 
                offrent le plus grand potentiel pour décrocher un prix exceptionnel.
              </p>
              <div className="bg-white/10 backdrop-blur-sm border-l-4 border-[#F7D25F] rounded-lg p-4 max-w-3xl mx-auto">
                <p className="text-sm italic text-center">
                  ❝ Votre chance de transformer un simple clic en une victoire incroyable commence ici. ❞
                </p>
              </div>
            </div>

            <section className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                  <Trophy className="text-[#F7D25F]" />
                  Jackpots Instantanés
                </h2>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Clock size={16} />
                  <span>Mise à jour il y a {getHoursSinceUpdate()}</span>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { id: 'tous', label: 'Tous', icon: Trophy },
                  { id: 'haut-potentiel', label: 'Haut Potentiel', icon: Sparkles },
                  { id: 'europeen', label: 'Européen', icon: TrendingUp },
                  { id: 'national', label: 'National', icon: Trophy },
                  { id: 'international', label: 'International', icon: ExternalLink },
                ].map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as FilterType)}
                      className={`interactive flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#2BC047] to-[#18A238] text-white shadow-lg scale-105'
                          : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:bg-[#2BC047]/20`
                      }`}
                    >
                      <Icon size={18} />
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* Debug info */}
              {jackpots.length === 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Debug: Nenhum jackpot carregado!</p>
                  <p className="text-sm">Verifique o console para mais detalhes.</p>
                </div>
              )}

              {/* Lista de Jackpots */}
              <div className="space-y-4">
                {filteredJackpots.length === 0 ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Aucun jackpot disponible pour ce filtre.</p>
                    <p className="text-xs mt-2">Total de jackpots carregados: {jackpots.length}</p>
                  </div>
                ) : (
                  filteredJackpots.map((jackpot, index) => (
                    <div
                      key={jackpot.id}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#2BC047]/10 to-[#F7D25F]/10'} rounded-xl p-5 border ${darkMode ? 'border-gray-600' : 'border-[#2BC047]/20'} hover:border-[#2BC047] transition-all hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#F7D25F] text-black px-3 py-1 rounded-full text-xs font-bold">
                              #{index + 1}
                            </span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{jackpot.pays}</span>
                          </div>
                          <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>{jackpot.loterie}</h3>
                          <p className="text-4xl font-bold text-[#F7D25F] mb-3">
                            {jackpot.valeur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </p>
                          
                          {/* Novas informações detalhadas */}
                          <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-[#2BC047]" />
                              <span className="font-semibold">Date du tirage:</span>
                              <span>{jackpot.date_tirage}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <TrendingUp size={14} className="text-[#2BC047]" />
                              <span className="font-semibold">Probabilité:</span>
                              <span>{jackpot.probabilite}</span>
                            </div>
                            
                            <div className="flex items-start gap-2 mt-2">
                              <Sparkles size={14} className="text-[#F7D25F] mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-semibold">Notes:</span>
                                <p className="text-xs mt-1">{jackpot.notes}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => openLotteryLink(jackpot.lotteryId)}
                          className="bg-gradient-to-r from-[#2BC047] to-[#18A238] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 self-start"
                        >
                          Voir la loterie
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Módulo 2: Resultados em Tempo Real */}
        {activeModule === 'results' && (
          <div>
            <button
              onClick={() => setActiveModule(null)}
              className={`mb-6 flex items-center gap-2 ${textColor} hover:text-[#2BC047] transition-colors`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux modules</span>
            </button>

            <section className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                  <TrendingUp className="text-[#2BC047]" />
                  Résultats en Temps Réel
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2BC047] rounded-full animate-pulse" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>En direct</span>
                </div>
              </div>

              {results.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Chargement des résultats...
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#2BC047]/10 to-[#F7D25F]/10'} rounded-xl p-4 border ${darkMode ? 'border-gray-600' : 'border-[#2BC047]/20'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-lg font-bold ${textColor}`}>{result.loterie}</h3>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{result.horario}</span>
                      </div>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {result.numeros.map((num) => (
                          <div
                            key={num}
                            className="w-12 h-12 bg-gradient-to-br from-[#2BC047] to-[#18A238] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => compareWithTickets(result.numeros)}
                        className="w-full bg-gradient-to-r from-[#2BC047] to-[#18A238] hover:shadow-lg text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Comparer avec mes billets
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Módulo 3: Atualizações Diárias (News) */}
        {activeModule === 'news' && (
          <div>
            <button
              onClick={() => setActiveModule(null)}
              className={`mb-6 flex items-center gap-2 ${textColor} hover:text-[#2BC047] transition-colors`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux modules</span>
            </button>

            <section className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                  <Newspaper className="text-[#2BC047]" />
                  Actualités
                </h2>
                {hasNewToday && (
                  <span className="bg-gradient-to-r from-[#F7D25F] to-[#FFA500] text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                    Nouveautés du jour
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#2BC047]/10 to-[#F7D25F]/10'} rounded-xl p-4 border ${darkMode ? 'border-gray-600' : 'border-[#2BC047]/20'} hover:border-[#2BC047] transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.data}</span>
                          <span className="text-xs bg-[#2BC047] text-white px-2 py-1 rounded-full font-semibold">
                            {lotteries[item.lotteryId]?.name || 'Général'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${textColor}`}>{item.titulo}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.resumo}</p>
                      </div>
                      <button
                        onClick={() => openLotteryLink(item.lotteryId)}
                        className="bg-gradient-to-r from-[#2BC047] to-[#18A238] hover:shadow-lg text-white p-2 rounded-lg transition-all"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}

