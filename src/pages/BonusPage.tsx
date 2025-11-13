import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, TrendingUp, Newspaper, ExternalLink, Sparkles, Moon, Sun } from 'lucide-react';

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
  dateTirage: string;
  valeur: number;
  isSorteado: boolean;
  hasAPI: boolean;
}

interface News {
  id: string;
  data: string;
  titulo: string;
  resumo: string;
  lotteryId: string;
}

interface Ticket {
  id: string;
  loterie: string;
  lotteryId: string;
  numeros: string;
  note: string;
  dateAdded: string;
  resultado?: {
    matched: number;
    isWinner: boolean;
  };
}

type FilterType = 'tous' | 'haut-potentiel' | 'europeen' | 'national' | 'international';

// Mock de loterias disponíveis
const lotteries: { [key: string]: { 
  name: string; 
  url: string; 
  region: 'europe' | 'france' | 'international'; 
  pays: string; 
  probabilite: string;
  hasAPI: boolean;
  apiUrl?: string;
} } = {
  // França (expandido) - FDJ possui APIs limitadas
  'loto-fr': { name: 'Loto', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/loto', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840', hasAPI: true, apiUrl: 'https://www.fdj.fr/api/loto' },
  'euromillions-fr': { name: 'EuroMillions My Million', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/euromillions', region: 'france', pays: 'France', probabilite: '1 sur 139 838 160', hasAPI: true, apiUrl: 'https://www.fdj.fr/api/euromillions' },
  'keno-fr': { name: 'Keno', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/keno', region: 'france', pays: 'France', probabilite: '1 sur 2 147 181', hasAPI: true, apiUrl: 'https://www.fdj.fr/api/keno' },
  'loto-super-cagnotte': { name: 'Loto Super Cagnotte', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840', hasAPI: false },
  'eurodreams-fr': { name: 'EuroDreams', url: 'https://www.fdj.fr/jeux/jeux-de-tirage/eurodreams', region: 'france', pays: 'France', probabilite: '1 sur 19 191 900', hasAPI: false },
  'amigo-fr': { name: 'Amigo', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 1 906 884', hasAPI: false },
  'cash-fr': { name: 'Cash', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 324 632', hasAPI: false },
  'loto-week-end': { name: 'Loto Week-end', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 19 068 840', hasAPI: false },
  'quinté-plus': { name: 'Quinté+', url: 'https://www.pmu.fr', region: 'france', pays: 'France', probabilite: '1 sur 7 893 600', hasAPI: false },
  'joker-plus': { name: 'Joker+', url: 'https://www.fdj.fr', region: 'france', pays: 'France', probabilite: '1 sur 1 000 000', hasAPI: false },
  
  // Europa (expandido) - Poucas APIs públicas disponíveis
  'euromillions': { name: 'EuroMillions', url: 'https://www.euro-millions.com', region: 'europe', pays: 'Europe', probabilite: '1 sur 139 838 160', hasAPI: true, apiUrl: 'https://www.euro-millions.com/api/results' },
  'eurojackpot': { name: 'Eurojackpot', url: 'https://www.eurojackpot.org', region: 'europe', pays: 'Europe', probabilite: '1 sur 139 838 160', hasAPI: true, apiUrl: 'https://www.eurojackpot.org/api/results' },
  'superenalotto': { name: 'SuperEnalotto', url: 'https://www.superenalotto.it', region: 'europe', pays: 'Italie', probabilite: '1 sur 622 614 630', hasAPI: false },
  'el-gordo': { name: 'El Gordo', url: 'https://www.loteriaelgordo.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 31 625 100', hasAPI: false },
  'lotto-uk': { name: 'UK National Lottery', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 45 057 474', hasAPI: true, apiUrl: 'https://www.national-lottery.co.uk/api/results' },
  'thunderball-uk': { name: 'UK Thunderball', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 8 060 598', hasAPI: true, apiUrl: 'https://www.national-lottery.co.uk/api/thunderball' },
  'eurodreams-eu': { name: 'EuroDreams', url: 'https://www.euro-millions.com', region: 'europe', pays: 'Europe', probabilite: '1 sur 19 191 900', hasAPI: false },
  'lotto-allemagne': { name: 'Lotto 6aus49', url: 'https://www.lotto.de', region: 'europe', pays: 'Allemagne', probabilite: '1 sur 139 838 160', hasAPI: false },
  'lotto-austria': { name: 'Lotto Autriche', url: 'https://www.lotterien.at', region: 'europe', pays: 'Autriche', probabilite: '1 sur 8 145 060', hasAPI: false },
  'viking-lotto': { name: 'Viking Lotto', url: 'https://www.vikinglotto.com', region: 'europe', pays: 'Scandinavie', probabilite: '1 sur 98 172 096', hasAPI: false },
  'irish-lotto': { name: 'Irish Lotto', url: 'https://www.lottery.ie', region: 'europe', pays: 'Irlande', probabilite: '1 sur 10 737 573', hasAPI: true, apiUrl: 'https://www.lottery.ie/api/results' },
  'swiss-lotto': { name: 'Swiss Lotto', url: 'https://www.swisslos.ch', region: 'europe', pays: 'Suisse', probabilite: '1 sur 31 474 716', hasAPI: false },
  'polish-lotto': { name: 'Lotto Pologne', url: 'https://www.lotto.pl', region: 'europe', pays: 'Pologne', probabilite: '1 sur 13 983 816', hasAPI: false },
  'dutch-lotto': { name: 'Lotto Pays-Bas', url: 'https://www.lotto.nl', region: 'europe', pays: 'Pays-Bas', probabilite: '1 sur 8 145 060', hasAPI: false },
  'greek-lotto': { name: 'Greek Lotto', url: 'https://www.opap.gr', region: 'europe', pays: 'Grèce', probabilite: '1 sur 24 435 180', hasAPI: false },
  'belgian-lotto': { name: 'Lotto Belgique', url: 'https://www.loterie-nationale.be', region: 'europe', pays: 'Belgique', probabilite: '1 sur 13 983 816', hasAPI: false },
  'set-for-life-uk': { name: 'Set For Life', url: 'https://www.national-lottery.co.uk', region: 'europe', pays: 'Royaume-Uni', probabilite: '1 sur 15 339 390', hasAPI: true, apiUrl: 'https://www.national-lottery.co.uk/api/setforlife' },
  'la-primitiva': { name: 'La Primitiva', url: 'https://www.loteriasyapuestas.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 13 983 816', hasAPI: false },
  'bonoloto': { name: 'Bonoloto', url: 'https://www.loteriasyapuestas.es', region: 'europe', pays: 'Espagne', probabilite: '1 sur 13 983 816', hasAPI: false },
  'lotto-portugal': { name: 'Totoloto', url: 'https://www.jogossantacasa.pt', region: 'europe', pays: 'Portugal', probabilite: '1 sur 13 983 816', hasAPI: false },
  'swedish-lotto': { name: 'Swedish Lotto', url: 'https://www.svenskaspel.se', region: 'europe', pays: 'Suède', probabilite: '1 sur 6 724 520', hasAPI: false },
  'norway-lotto': { name: 'Norway Lotto', url: 'https://www.norsk-tipping.no', region: 'europe', pays: 'Norvège', probabilite: '1 sur 5 379 616', hasAPI: false },
  'denmark-lotto': { name: 'Denmark Lotto', url: 'https://www.danskespil.dk', region: 'europe', pays: 'Danemark', probabilite: '1 sur 8 347 680', hasAPI: false },
  'finnish-lotto': { name: 'Veikkaus Lotto', url: 'https://www.veikkaus.fi', region: 'europe', pays: 'Finlande', probabilite: '1 sur 15 380 937', hasAPI: false },
  'czech-lotto': { name: 'Sportka', url: 'https://www.sazka.cz', region: 'europe', pays: 'République Tchèque', probabilite: '1 sur 13 983 816', hasAPI: false },
  'hungarian-lotto': { name: 'Hatoslottó', url: 'https://www.szerencsejatek.hu', region: 'europe', pays: 'Hongrie', probabilite: '1 sur 13 983 816', hasAPI: false },
  'croatian-lotto': { name: 'Lotto Croatia', url: 'https://www.lutrija.hr', region: 'europe', pays: 'Croatie', probabilite: '1 sur 13 983 816', hasAPI: false },
  
  // Internacional - APIs disponíveis para principais
  'powerball': { name: 'Powerball', url: 'https://www.powerball.com', region: 'international', pays: 'USA', probabilite: '1 sur 292 201 338', hasAPI: true, apiUrl: 'https://www.powerball.com/api/results' },
  'mega-millions': { name: 'Mega Millions', url: 'https://www.megamillions.com', region: 'international', pays: 'USA', probabilite: '1 sur 302 575 350', hasAPI: true, apiUrl: 'https://www.megamillions.com/api/results' },
  'mega-sena': { name: 'Mega-Sena', url: 'https://loterias.caixa.gov.br', region: 'international', pays: 'Brésil', probabilite: '1 sur 50 063 860', hasAPI: true, apiUrl: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena' },
  'oz-lotto': { name: 'Oz Lotto', url: 'https://www.ozlotteries.com', region: 'international', pays: 'Australie', probabilite: '1 sur 45 379 620', hasAPI: false },
  'lotto-max': { name: 'Lotto Max', url: 'https://www.lotto649.com', region: 'international', pays: 'Canada', probabilite: '1 sur 33 294 800', hasAPI: false },
  'lotto-649': { name: 'Lotto 6/49', url: 'https://www.lotto649.com', region: 'international', pays: 'Canada', probabilite: '1 sur 13 983 816', hasAPI: false },
};

type LotoGainsTabType = 'resultats' | 'mes-billets';

export default function BonusPage({ onBack }: BonusPageProps) {
  const [jackpots, setJackpots] = useState<Jackpot[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [lastJackpotUpdate, setLastJackpotUpdate] = useState<number>(0);
  const [hasNewToday, setHasNewToday] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [darkMode, setDarkMode] = useState(false);
  const [activeModule, setActiveModule] = useState<'jackpots' | 'results' | 'news' | null>(null);
  const [lotoGainsTab, setLotoGainsTab] = useState<LotoGainsTabType>('resultats');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para Mes billets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedLottery, setSelectedLottery] = useState('');
  const [ticketNumbers, setTicketNumbers] = useState('');
  const [ticketNote, setTicketNote] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Gerar jackpots mockados (incluindo últimas 2 semanas para os com API)
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
      
      // Se tem API, adicionar sorteios das últimas 2 semanas (passados)
      if (lottery.hasAPI) {
        // Adicionar 3 sorteios passados (últimas 2 semanas)
        for (let pastDays = 14; pastDays >= 7; pastDays -= 7) {
          const dateTiragePassada = new Date(hoje);
          dateTiragePassada.setDate(dateTiragePassada.getDate() - pastDays);
          
          const dateLimitePassada = new Date(dateTiragePassada);
          dateLimitePassada.setHours(dateLimitePassada.getHours() - 2);
          
          mockJackpots.push({
            id: `jackpot_${index}_past_${pastDays}`,
            pays: lottery.pays,
            loterie: lottery.name,
            valeur: Math.round(baseValue * (0.8 + Math.random() * 0.4)), // Variação de valor
            tirage: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dateTiragePassada.getDay()],
            date_limite: dateLimitePassada.toLocaleDateString('fr-FR'),
            date_tirage: dateTiragePassada.toLocaleDateString('fr-FR'),
            probabilite: lottery.probabilite,
            notes: `Tirage du ${dateTiragePassada.toLocaleDateString('fr-FR')} - Résultats disponibles`,
            lotteryId,
            region: lottery.region
          });
        }
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
    const currentVersion = '3.0';
    
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

  // Gerar resultados baseados em dados reais simulados
  useEffect(() => {
    if (jackpots.length > 0 && results.length === 0) {
      const generatedResults = jackpots.map((jackpot, index) => {
        // Calcular se já foi sorteado baseado na data
        const hoje = new Date(2025, 10, 12);
        const [day, month, year] = jackpot.date_tirage.split('/');
        const dataTirage = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const isSorteado = dataTirage <= hoje;
        
        // Apenas fornecer números se tem API E já foi sorteado
        let numeros: number[] = [];
        const hasAPI = lotteries[jackpot.lotteryId]?.hasAPI || false;
        
        if (hasAPI && isSorteado) {
          // Gerar números únicos para cada sorteio baseado na data e loteria
          const seed = parseInt(day) * 1000 + parseInt(month) * 100 + index * 7;
          const numerosSet = new Set<number>();
          let attempt = 0;
          
          while (numerosSet.size < 6 && attempt < 100) {
            const num = ((seed * (numerosSet.size + 1) * 13 + attempt * 7) % 49) + 1;
            numerosSet.add(num);
            attempt++;
          }
          
          numeros = Array.from(numerosSet).sort((a, b) => a - b);
          console.log(`${jackpot.loterie} (${jackpot.date_tirage}): hasAPI=${hasAPI}, isSorteado=${isSorteado}, numeros=`, numeros);
        } else {
          console.log(`${jackpot.loterie} (${jackpot.date_tirage}): hasAPI=${hasAPI}, isSorteado=${isSorteado}, numeros=VAZIO`);
        }

        return {
          id: `result_${jackpot.id}`,
          loterie: jackpot.loterie,
          numeros,
          horario: '20h30',
          lotteryId: jackpot.lotteryId,
          dateTirage: jackpot.date_tirage,
          valeur: jackpot.valeur,
          isSorteado,
          hasAPI
        };
      });
      
      setResults(generatedResults);
    }
  }, [jackpots]);

  // Calcular horas desde última atualização
  const getHoursSinceUpdate = (): string => {
    const hours = Math.floor((Date.now() - lastJackpotUpdate) / 3600000);
    return hours === 0 ? '< 1h' : `${hours}h`;
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

  // Ordenar e filtrar resultados
  const getFilteredAndSortedResults = (): Result[] => {
    let filtered = results;

    // Filtrar por pesquisa
    if (searchTerm.trim()) {
      filtered = filtered.filter(r => 
        r.loterie.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar: Sorteados primeiro (por valor desc), depois não sorteados (por valor desc)
    const sorteados = filtered.filter(r => r.isSorteado).sort((a, b) => b.valeur - a.valeur);
    const naoSorteados = filtered.filter(r => !r.isSorteado).sort((a, b) => b.valeur - a.valeur);
    
    return [...sorteados, ...naoSorteados];
  };

  const sortedResults = getFilteredAndSortedResults();
  
  // Paginação
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + resultsPerPage);

  // Carregar bilhetes do localStorage
  useEffect(() => {
    const storedTickets = localStorage.getItem('lotoGainsTickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
  }, []);

  // Salvar bilhetes no localStorage
  const saveTickets = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    localStorage.setItem('lotoGainsTickets', JSON.stringify(newTickets));
  };

  // Adicionar bilhete
  const handleAddTicket = () => {
    if (!selectedLottery || !ticketNumbers.trim()) {
      alert('Veuillez choisir une loterie et entrer les numéros');
      return;
    }

    const newTicket: Ticket = {
      id: `ticket_${Date.now()}`,
      loterie: lotteries[selectedLottery].name,
      lotteryId: selectedLottery,
      numeros: ticketNumbers.trim(),
      note: ticketNote.trim(),
      dateAdded: new Date().toLocaleDateString('fr-FR')
    };

    saveTickets([...tickets, newTicket]);
    
    // Limpar formulário
    setSelectedLottery('');
    setTicketNumbers('');
    setTicketNote('');
  };

  // Remover bilhetes selecionados
  const handleDeleteSelected = () => {
    if (selectedTickets.length === 0) {
      alert('Veuillez sélectionner au moins un billet');
      return;
    }

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTickets.length} billet(s) ?`);
    if (confirmed) {
      const newTickets = tickets.filter(t => !selectedTickets.includes(t.id));
      saveTickets(newTickets);
      setSelectedTickets([]);
    }
  };

  // Exportar bilhetes
  const handleExportTickets = () => {
    if (tickets.length === 0) {
      alert('Aucun billet à exporter');
      return;
    }

    const dataStr = JSON.stringify(tickets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mes_billets_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar bilhetes
  const handleImportTickets = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedTickets = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedTickets)) {
              saveTickets([...tickets, ...importedTickets]);
              alert(`${importedTickets.length} billet(s) importé(s) avec succès`);
            }
          } catch (error) {
            alert('Erreur lors de l\'importation du fichier');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Toggle seleção de bilhete
  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  // Selecionar/desselecionar todos
  const toggleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(t => t.id));
    }
  };

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
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

            {/* Loto Gains */}
            <button
              onClick={() => setActiveModule('results')}
              className={`interactive ${cardBg} border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 p-6 text-center group`}
            >
              <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#2BC047] to-[#18A238]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 8px rgba(0,0,0,0.3)' }}>
                      LOTO
                    </div>
                    <div className="text-3xl font-black text-[#F7D25F]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                      GAINS
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-[#2BC047]' : 'text-[#18A238]'} group-hover:text-[#2BC047] transition-colors`}>
                Loto Gains
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

        {/* Módulo 2: Loto Gains */}
        {activeModule === 'results' && (
          <div>
            <button
              onClick={() => setActiveModule(null)}
              className={`mb-6 flex items-center gap-2 ${textColor} hover:text-[#2BC047] transition-colors`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux modules</span>
            </button>

            {/* Hero Section */}
            <div className={`${darkMode ? 'bg-gradient-to-r from-[#1a7a2e] to-[#2BC047]' : 'bg-gradient-to-r from-[#2BC047] to-[#18A238]'} text-white rounded-2xl p-8 mb-6 shadow-xl`}>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                LotoGains
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center">
                Résultats en temps réel
              </h2>
              <p className="text-sm text-center opacity-90">
                Alerte gagnant instantanée
              </p>
            </div>

            {/* Como usar LotoGains */}
            <div className={`${cardBg} border rounded-2xl p-6 mb-6 shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Comment utiliser LotoGains</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2BC047] text-white flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <p className={`${textColor} text-sm pt-1`}>Ajoutez vos billets dans "Mes billets"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2BC047] text-white flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <p className={`${textColor} text-sm pt-1`}>Les résultats se mettent à jour automatiquement</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2BC047] text-white flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <p className={`${textColor} text-sm pt-1`}>Recevez une alerte instantanée quand vous gagnez !</p>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className={`${cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
              <div className="flex border-b">
                <button
                  onClick={() => setLotoGainsTab('resultats')}
                  className={`flex-1 px-4 py-3 font-semibold transition-all ${
                    lotoGainsTab === 'resultats'
                      ? 'bg-[#2BC047] text-white border-b-4 border-[#18A238]'
                      : `${textColor} hover:bg-[#2BC047]/10`
                  }`}
                >
                  Résultats
                </button>
                <button
                  onClick={() => setLotoGainsTab('mes-billets')}
                  className={`flex-1 px-4 py-3 font-semibold transition-all border-l ${
                    lotoGainsTab === 'mes-billets'
                      ? 'bg-[#2BC047] text-white border-b-4 border-[#18A238]'
                      : `${textColor} hover:bg-[#2BC047]/10`
                  }`}
                >
                  Mes billets
                </button>
              </div>

              <div className="p-6 pb-12">
                {/* Tab 1: Résultats */}
                {lotoGainsTab === 'resultats' && (
                  <div>
                    {/* Barra de pesquisa */}
                    <div className="flex gap-3 mb-6">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:border-[#2BC047]`}
                      />
                      <button 
                        onClick={() => setCurrentPage(1)}
                        className="bg-[#2BC047] hover:bg-[#18A238] text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <span>Chercher</span>
                      </button>
                    </div>

                    {/* Tabela de Resultados */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Loterie</th>
                            <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Date du tirage</th>
                            <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Numéros</th>
                            <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Gains</th>
                            <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedResults.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8">
                                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {results.length === 0 ? 'Chargement des résultats...' : 'Aucun résultat trouvé'}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedResults.map((result) => (
                              <tr
                                key={result.id}
                                className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors ${
                                  result.isSorteado ? (darkMode ? 'bg-green-900/20' : 'bg-green-50/50') : ''
                                }`}
                              >
                                <td className={`px-4 py-4 font-semibold`}>
                                  <div className="flex flex-col gap-2">
                                    <span className={textColor}>{result.loterie}</span>
                                    
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* Lógica de Badges */}
                                      {result.hasAPI ? (
                                        <>
                                          {result.isSorteado ? (
                                            <>
                                              <span className="text-xs bg-[#2BC047] text-white px-2 py-1 rounded-full font-bold">
                                                Déjà tiré
                                              </span>
                                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">
                                                Numéros disponibles
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-bold">
                                              Pas encore tiré
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full font-bold">
                                          Numéros indisponibles
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-4 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {result.dateTirage} {result.horario}
                                </td>
                                <td className="px-4 py-4">
                                  {result.hasAPI && result.isSorteado && result.numeros.length > 0 ? (
                                    <div className="flex gap-1 flex-wrap">
                                      {result.numeros.map((num) => (
                                        <span
                                          key={num}
                                          className={`inline-block min-w-[28px] text-center text-xs font-bold px-1 ${textColor}`}
                                        >
                                          {num}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                                      Indisponible
                                    </span>
                                  )}
                                </td>
                                <td className={`px-4 py-4 ${textColor} font-bold`}>
                                  {result.valeur.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className={`px-4 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {result.isSorteado ? 'Résultats officiels' : 'En attente'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentPage === 1
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#2BC047] hover:bg-[#18A238] text-white'
                          }`}
                        >
                          Précédent
                        </button>
                        <span className={`${textColor} font-semibold`}>
                          Page {currentPage} sur {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentPage === totalPages
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#2BC047] hover:bg-[#18A238] text-white'
                          }`}
                        >
                          Suivant
                        </button>
                      </div>
                    )}

                    {/* Informações */}
                    <div className={`text-center mt-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>Total de {sortedResults.length} résultats | Affichage {startIndex + 1}-{Math.min(startIndex + resultsPerPage, sortedResults.length)}</p>
                      <p className="mt-1">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Informations importantes */}
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-2 ${darkMode ? 'border-gray-600' : 'border-blue-200'} rounded-xl p-6 mt-8`}>
                      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informations importantes
                      </h3>

                      <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p className="text-sm leading-relaxed">
                          ⚠️ Les résultats affichés sont fournis à titre informatif. Vérifiez toujours les résultats officiels sur les sites des loteries concernées avant de procéder à toute réclamation.
                        </p>
                        <p className="text-sm leading-relaxed">
                          ⚠️ LotoGains ne garantit pas l'exactitude des résultats affichés et décline toute responsabilité en cas d'erreur.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Mes billets */}
                {lotoGainsTab === 'mes-billets' && (
                  <div className="pb-12">
                    {/* Formulário para adicionar bilhete */}
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6 mb-6`}>
                      <h3 className={`text-xl font-bold mb-4 ${textColor} flex items-center gap-2`}>
                        <svg className="w-6 h-6 text-[#2BC047]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Mes billets
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {/* Seleção de loteria */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                            Loterie
                          </label>
                          <select
                            value={selectedLottery}
                            onChange={(e) => setSelectedLottery(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:border-[#2BC047]`}
                          >
                            <option value="">Choisissez une loterie</option>
                            {Object.keys(lotteries).map((lotteryId) => (
                              <option key={lotteryId} value={lotteryId}>
                                {lotteries[lotteryId].name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Números jogados */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                            Numéros joués
                          </label>
                          <input
                            type="text"
                            value={ticketNumbers}
                            onChange={(e) => setTicketNumbers(e.target.value)}
                            placeholder="Ex: 01 12 23 34 45 + 07"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:border-[#2BC047]`}
                          />
                        </div>
                      </div>

                      {/* Note opcional */}
                      <div className="mb-4">
                        <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                          Note (optionnel)
                        </label>
                        <input
                          type="text"
                          value={ticketNote}
                          onChange={(e) => setTicketNote(e.target.value)}
                          placeholder="Note pour ce billet"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                          } focus:outline-none focus:border-[#2BC047]`}
                        />
                      </div>

                      {/* Botão adicionar */}
                      <button
                        onClick={handleAddTicket}
                        className="w-full bg-[#2BC047] hover:bg-[#18A238] text-white px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter ce billet
                      </button>
                    </div>

                    {/* Lista de bilhetes salvos */}
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6 mb-8`}>
                      <h3 className={`text-xl font-bold mb-4 ${textColor} flex items-center gap-2`}>
                        <svg className="w-6 h-6 text-[#2BC047]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Mes billets enregistrés
                      </h3>

                      {/* Botões de ação */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <button
                          onClick={handleImportTickets}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Importer
                        </button>
                        <button
                          onClick={handleExportTickets}
                          disabled={tickets.length === 0}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                            tickets.length === 0
                              ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-500 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Exporter
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          disabled={selectedTickets.length === 0}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                            selectedTickets.length === 0
                              ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>

                      {/* Tabela de bilhetes */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                                  onChange={toggleSelectAll}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                              </th>
                              <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Loterie</th>
                              <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Numéros</th>
                              <th className={`px-4 py-3 text-left text-sm font-bold ${textColor}`}>Résultat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-12">
                                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                                    Aucun billet enregistré
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              tickets.map((ticket) => (
                                <tr
                                  key={ticket.id}
                                  className={`border-b ${darkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-white'} transition-colors`}
                                >
                                  <td className="px-4 py-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedTickets.includes(ticket.id)}
                                      onChange={() => toggleTicketSelection(ticket.id)}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                  </td>
                                  <td className={`px-4 py-4 ${textColor} font-semibold`}>
                                    <div>
                                      {ticket.loterie}
                                      {ticket.note && (
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                          {ticket.note}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-4 py-4 ${textColor}`}>
                                    <span className="font-mono">{ticket.numeros}</span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      -
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
}

