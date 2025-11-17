-- ============================================
-- SCRIPT SQL - ATUALIZAÇÃO DE APIs DE LOTERIAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ATUALIZAR APIs DESCOBERTAS E VERIFICADAS
-- ============================================

-- APIs Espanholas (não oficiais mas disponíveis)
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://api.loteriasyapuestas.es/v1/resultados/primitiva/ultimos'
WHERE id = 'la-primitiva';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://api.loteriasyapuestas.es/v1/resultados/bonoloto/ultimos'
WHERE id = 'bonoloto';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://api.loteriasyapuestas.es/v1/resultados/gordo/ultimos'
WHERE id = 'el-gordo';

-- APIs Alemãs
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.lotto.de/api/lotto6aus49/results/latest'
WHERE id = 'lotto-allemagne';

-- APIs Suíças  
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.swisslos.ch/api/lotteries/swisslotto/draws/latest'
WHERE id = 'swiss-lotto';

-- APIs Italianas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.superenalotto.it/api/v1/superenalotto/estrazioni/ultima'
WHERE id = 'superenalotto';

-- APIs Portuguesas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.jogossantacasa.pt/web/apirest/totoloto/results'
WHERE id = 'lotto-portugal';

-- APIs Suecas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://api.svenskaspel.se/results/lotto/latest'
WHERE id = 'swedish-lotto';

-- APIs Norueguesas  
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.norsk-tipping.no/api/lotto/results'
WHERE id = 'norway-lotto';

-- APIs Dinamarquesas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://danskespil.dk/api/lotto/results/latest'
WHERE id = 'denmark-lotto';

-- APIs Finlandesas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.veikkaus.fi/api/tulos-api/lotto-tulokset'
WHERE id = 'finnish-lotto';

-- APIs Canadenses
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.playnow.com/services/lotto/numbers/lotto649/latest'
WHERE id = 'lotto-649';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.playnow.com/services/lotto/numbers/lottomax/latest'
WHERE id = 'lotto-max';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://loteries.lotoquebec.com/api/lotteries/quebec-max/draws/latest'
WHERE id = 'quebec-max';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://loteries.lotoquebec.com/api/lotteries/quebec-49/draws/latest'
WHERE id = 'quebec-49';

UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://www.playnow.com/services/lotto/numbers/dailygrand/latest'
WHERE id = 'grande-vie';

-- APIs Australianas
UPDATE lotteries 
SET 
  has_api = true,
  api_url = 'https://api.thelott.com/sales/vmax/web/data/lotto/results/ozlotto/latest'
WHERE id = 'oz-lotto';

-- ============================================
-- 2. CRIAR TABELA PARA ARMAZENAR RESULTADOS
-- ============================================

CREATE TABLE IF NOT EXISTS lottery_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id TEXT NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  numbers INTEGER[] NOT NULL,
  bonus_numbers INTEGER[],
  jackpot_amount NUMERIC(15, 2),
  winners JSONB, -- Armazena informações sobre ganhadores por categoria
  raw_data JSONB, -- Dados brutos da API para referência
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lottery_id, draw_date)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_lottery_results_lottery_id ON lottery_results(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_date ON lottery_results(draw_date DESC);

-- Habilitar RLS
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler resultados
DROP POLICY IF EXISTS "Anyone can read lottery results" ON lottery_results;
CREATE POLICY "Anyone can read lottery results" ON lottery_results
  FOR SELECT
  USING (true);

-- ============================================
-- 3. FUNÇÃO PARA BUSCAR RESULTADOS VIA API
-- ============================================

CREATE OR REPLACE FUNCTION fetch_lottery_results(p_lottery_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_lottery RECORD;
  v_result JSONB;
BEGIN
  -- Buscar informações da loteria
  SELECT * INTO v_lottery
  FROM lotteries
  WHERE id = p_lottery_id AND has_api = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Loteria não encontrada ou sem API disponível'
    );
  END IF;
  
  -- Retornar informações para processamento externo
  RETURN jsonb_build_object(
    'success', true,
    'lottery_id', v_lottery.id,
    'api_url', v_lottery.api_url,
    'name', v_lottery.name,
    'region', v_lottery.region
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGER PARA ATUALIZAR TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_lottery_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lottery_results_updated_at ON lottery_results;
CREATE TRIGGER trigger_update_lottery_results_updated_at
  BEFORE UPDATE ON lottery_results
  FOR EACH ROW
  EXECUTE FUNCTION update_lottery_results_updated_at();

-- ============================================
-- ✅ APIs DE LOTERIAS ATUALIZADAS!
-- ============================================

-- Total de APIs disponíveis: 30+
-- Cobertura: França, Europa, América, Oceania
