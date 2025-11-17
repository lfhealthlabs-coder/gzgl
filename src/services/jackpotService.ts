// Serviço de gerenciamento de jackpots (integração com Supabase)

import { supabase } from '../lib/supabase';

export interface Lottery {
  id: string;
  name: string;
  url: string;
  region: 'europe' | 'france' | 'international';
  pays: string;
  probabilite: string;
  has_api: boolean;
  api_url?: string;
}

export interface Jackpot {
  id: string;
  lottery_id: string;
  valeur: number;
  tirage: string;
  date_limite: string;
  date_tirage: string;
  notes: string;
  is_past: boolean;
  lottery?: Lottery;
}

/**
 * Busca todas as loterias
 */
export async function fetchLotteries(): Promise<Lottery[]> {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .order('region', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar loterias:', error);
      return [];
    }

    return (data || []).map((lottery: any) => ({
      id: lottery.id,
      name: lottery.name,
      url: lottery.url,
      region: lottery.region,
      pays: lottery.pays,
      probabilite: lottery.probabilite,
      has_api: lottery.has_api,
      api_url: lottery.api_url || undefined,
    }));
  } catch (error) {
    console.error('Erro ao buscar loterias:', error);
    return [];
  }
}

/**
 * Busca jackpots com filtros opcionais
 */
export async function fetchJackpots(filters?: {
  region?: 'europe' | 'france' | 'international';
  lotteryId?: string;
  isPast?: boolean;
  limit?: number;
}): Promise<Jackpot[]> {
  try {
    // Primeiro buscar loterias se filtro por região
    let lotteryIds: string[] | undefined;
    if (filters?.region) {
      const { data: regionLotteries } = await supabase
        .from('lotteries')
        .select('id')
        .eq('region', filters.region);
      lotteryIds = regionLotteries?.map(l => l.id) || [];
      if (lotteryIds.length === 0) return [];
    }

    let query = supabase
      .from('jackpots')
      .select(`
        *,
        lotteries (
          id,
          name,
          url,
          region,
          pays,
          probabilite,
          has_api,
          api_url
        )
      `)
      .order('valeur', { ascending: false });

    if (lotteryIds && lotteryIds.length > 0) {
      query = query.in('lottery_id', lotteryIds);
    }

    if (filters?.lotteryId) {
      query = query.eq('lottery_id', filters.lotteryId);
    }

    if (filters?.isPast !== undefined) {
      query = query.eq('is_past', filters.isPast);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar jackpots:', error);
      return [];
    }

    return (data || []).map((jackpot: any) => ({
      id: jackpot.id,
      lottery_id: jackpot.lottery_id,
      valeur: parseFloat(jackpot.valeur),
      tirage: jackpot.tirage || '',
      date_limite: jackpot.date_limite ? new Date(jackpot.date_limite).toLocaleDateString('fr-FR') : '',
      date_tirage: new Date(jackpot.date_tirage).toLocaleDateString('fr-FR'),
      notes: jackpot.notes || '',
      is_past: jackpot.is_past || false,
      lottery: jackpot.lotteries ? {
        id: jackpot.lotteries.id,
        name: jackpot.lotteries.name,
        url: jackpot.lotteries.url,
        region: jackpot.lotteries.region,
        pays: jackpot.lotteries.pays,
        probabilite: jackpot.lotteries.probabilite,
        has_api: jackpot.lotteries.has_api,
        api_url: jackpot.lotteries.api_url || undefined,
      } : undefined,
    }));
  } catch (error) {
    console.error('Erro ao buscar jackpots:', error);
    return [];
  }
}

/**
 * Gera novos jackpots (chama função SQL)
 */
export async function generateJackpots(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('generate_jackpots');

    if (error) {
      console.error('Erro ao gerar jackpots:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao gerar jackpots:', error);
    return false;
  }
}

/**
 * Busca uma loteria por ID
 */
export async function fetchLotteryById(lotteryId: string): Promise<Lottery | null> {
  try {
    const { data, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar loteria:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      url: data.url,
      region: data.region,
      pays: data.pays,
      probabilite: data.probabilite,
      has_api: data.has_api,
      api_url: data.api_url || undefined,
    };
  } catch (error) {
    console.error('Erro ao buscar loteria:', error);
    return null;
  }
}

