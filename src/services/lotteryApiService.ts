import { supabase } from '@/lib/supabase';

/**
 * Service pour intégrer les APIs de loteries
 */

export interface LotteryResult {
  lotteryId: string;
  drawDate: Date;
  numbers: number[];
  bonusNumbers?: number[];
  jackpot?: number;
  winners?: {
    category: string;
    count: number;
    prize: number;
  }[];
}

// Configuration des APIs disponibles
const API_CONFIG = {
  // France - FDJ
  'loto-fr': {
    url: 'https://www.fdj.fr/api/service-rest/tirages/type/loto/annee/[YEAR]',
    parser: parseFDJResult
  },
  'euromillions-fr': {
    url: 'https://www.fdj.fr/api/service-rest/tirages/type/euromillions/annee/[YEAR]',
    parser: parseFDJResult
  },
  'keno-fr': {
    url: 'https://www.fdj.fr/api/service-rest/tirages/type/keno/annee/[YEAR]', 
    parser: parseFDJResult
  },
  
  // USA
  'powerball': {
    url: 'https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json',
    parser: parsePowerballResult
  },
  'mega-millions': {
    url: 'https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData',
    parser: parseMegaMillionsResult
  },
  
  // Brésil
  'mega-sena': {
    url: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena',
    parser: parseMegaSenaResult
  },
  
  // UK
  'lotto-uk': {
    url: 'https://api.lottery.co.uk/results/v1.0/allResults',
    parser: parseUKLotteryResult
  },
  'thunderball-uk': {
    url: 'https://api.lottery.co.uk/results/v1.0/allResults',
    parser: parseUKLotteryResult
  },
  'set-for-life-uk': {
    url: 'https://api.lottery.co.uk/results/v1.0/allResults',
    parser: parseUKLotteryResult
  },
  
  // Irlande
  'irish-lotto': {
    url: 'https://resultsservice.lottery.ie/api/results/v1',
    parser: parseIrishLotteryResult
  }
};

/**
 * Récupère les derniers résultats d'une loterie via son API
 */
export async function fetchLatestResults(lotteryId: string): Promise<LotteryResult | null> {
  const config = API_CONFIG[lotteryId as keyof typeof API_CONFIG];
  if (!config) {
    console.log(`Pas d'API configurée pour la loterie: ${lotteryId}`);
    return null;
  }

  try {
    const year = new Date().getFullYear();
    const url = config.url.replace('[YEAR]', year.toString());
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return config.parser(lotteryId, data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des résultats pour ${lotteryId}:`, error);
    return null;
  }
}

/**
 * Met à jour les jackpots avec les derniers résultats des APIs
 */
export async function updateJackpotsFromAPIs(): Promise<void> {
  try {
    // Récupérer toutes les loteries avec API
    const { data: lotteries, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('has_api', true);

    if (error || !lotteries) {
      console.error('Erreur lors de la récupération des loteries:', error);
      return;
    }

    // Mettre à jour chaque loterie
    for (const lottery of lotteries) {
      const result = await fetchLatestResults(lottery.id);
      
      if (result) {
        // Vérifier si ce tirage existe déjà
        const { data: existing } = await supabase
          .from('jackpots')
          .select('id')
          .eq('lottery_id', lottery.id)
          .eq('date_tirage', result.drawDate.toISOString())
          .maybeSingle();

        if (!existing) {
          // Créer un nouveau jackpot
          const { error: insertError } = await supabase
            .from('jackpots')
            .insert({
              lottery_id: lottery.id,
              valeur: result.jackpot || 0,
              date_tirage: result.drawDate,
              date_limite: new Date(result.drawDate.getTime() - 2 * 60 * 60 * 1000), // 2h avant
              tirage: getDayOfWeek(result.drawDate),
              notes: `Résultats API: ${result.numbers.join(', ')}`,
              is_past: true
            });

          if (insertError) {
            console.error(`Erreur insertion jackpot ${lottery.id}:`, insertError);
          } else {
            console.log(`Nouveau résultat ajouté pour ${lottery.id}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des jackpots:', error);
  }
}

// Parsers pour chaque API

function parseFDJResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    // Structure FDJ: tableau de tirages
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const latestDraw = data[0]; // Le plus récent
    
    return {
      lotteryId,
      drawDate: new Date(latestDraw.date_tirage),
      numbers: latestDraw.boules || [],
      bonusNumbers: latestDraw.numero_chance ? [latestDraw.numero_chance] : [],
      jackpot: latestDraw.rapport?.rang1?.montant || 0
    };
  } catch (error) {
    console.error('Erreur parsing FDJ:', error);
    return null;
  }
}

function parsePowerballResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const latestDraw = data[0];
    const numbers = latestDraw.field_winning_numbers.split(',').map((n: string) => parseInt(n.trim()));
    const powerball = parseInt(latestDraw.field_powerball);
    
    return {
      lotteryId,
      drawDate: new Date(latestDraw.field_draw_date),
      numbers: numbers.slice(0, 5),
      bonusNumbers: [powerball],
      jackpot: parseInt(latestDraw.field_jackpot_amount.replace(/[^0-9]/g, ''))
    };
  } catch (error) {
    console.error('Erreur parsing Powerball:', error);
    return null;
  }
}

function parseMegaMillionsResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    // Parser pour Mega Millions
    if (!data || !data.Drawing) return null;
    
    const drawing = data.Drawing;
    const numbers = [
      parseInt(drawing.N1),
      parseInt(drawing.N2), 
      parseInt(drawing.N3),
      parseInt(drawing.N4),
      parseInt(drawing.N5)
    ];
    
    return {
      lotteryId,
      drawDate: new Date(drawing.DrawingDate),
      numbers,
      bonusNumbers: [parseInt(drawing.MBall)],
      jackpot: parseInt(drawing.Jackpot.replace(/[^0-9]/g, '')) * 1000000
    };
  } catch (error) {
    console.error('Erreur parsing Mega Millions:', error);
    return null;
  }
}

function parseMegaSenaResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const latestDraw = data[0];
    
    return {
      lotteryId,
      drawDate: new Date(latestDraw.dataApuracao),
      numbers: latestDraw.listaDezenas.map((n: string) => parseInt(n)),
      jackpot: latestDraw.valorEstimadoProximoConcurso
    };
  } catch (error) {
    console.error('Erreur parsing Mega-Sena:', error);
    return null;
  }
}

function parseUKLotteryResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    if (!data || !data.draws || !Array.isArray(data.draws)) return null;
    
    // Filtrer pour obtenir le bon jeu
    const gameName = lotteryId.includes('thunderball') ? 'thunderball' : 
                     lotteryId.includes('set-for-life') ? 'set-for-life' : 'lotto';
    
    const draw = data.draws.find((d: any) => d.game === gameName);
    if (!draw) return null;
    
    return {
      lotteryId,
      drawDate: new Date(draw.drawDate),
      numbers: draw.balls.main,
      bonusNumbers: draw.balls.bonus || [],
      jackpot: draw.prizes?.[0]?.value || 0
    };
  } catch (error) {
    console.error('Erreur parsing UK Lottery:', error);
    return null;
  }
}

function parseIrishLotteryResult(lotteryId: string, data: any): LotteryResult | null {
  try {
    if (!data || !data.results || !Array.isArray(data.results)) return null;
    
    const latestDraw = data.results[0];
    
    return {
      lotteryId,
      drawDate: new Date(latestDraw.drawDate),
      numbers: latestDraw.numbers.map((n: string) => parseInt(n)),
      bonusNumbers: latestDraw.bonus ? [parseInt(latestDraw.bonus)] : [],
      jackpot: latestDraw.jackpot || 0
    };
  } catch (error) {
    console.error('Erreur parsing Irish Lottery:', error);
    return null;
  }
}

function getDayOfWeek(date: Date): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()];
}

/**
 * Recherche les APIs non officielles disponibles
 */
export async function searchUnofficialAPIs(lotteryName: string): Promise<any> {
  // Cette fonction pourrait utiliser des services tiers comme RapidAPI
  // ou d'autres agrégateurs de données de loteries
  
  const unofficialAPIs = {
    // Espagne
    'la-primitiva': 'https://api.loteriasyapuestas.es/v1/resultados/primitiva',
    'bonoloto': 'https://api.loteriasyapuestas.es/v1/resultados/bonoloto',
    
    // Allemagne
    'lotto-allemagne': 'https://www.lotto.de/api/lotto6aus49/results',
    
    // Suisse  
    'swiss-lotto': 'https://www.swisslos.ch/api/results',
    
    // Autres sources possibles
    'eurojackpot': 'https://www.eurojackpot.org/api/results/latest'
  };

  return unofficialAPIs[lotteryName as keyof typeof unofficialAPIs] || null;
}
