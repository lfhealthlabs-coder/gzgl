-- ============================================
-- SCRIPT SQL - TABELAS DE JACKPOTS E LOTERIAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CRIAR TABELA DE LOTERIAS
-- ============================================

CREATE TABLE IF NOT EXISTS lotteries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('europe', 'france', 'international')),
  pays TEXT NOT NULL,
  probabilite TEXT NOT NULL,
  has_api BOOLEAN DEFAULT false,
  api_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_lotteries_region ON lotteries(region);
CREATE INDEX IF NOT EXISTS idx_lotteries_pays ON lotteries(pays);

-- Habilitar RLS
ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler loterias
DROP POLICY IF EXISTS "Anyone can read lotteries" ON lotteries;
CREATE POLICY "Anyone can read lotteries" ON lotteries
  FOR SELECT
  USING (true);

-- ============================================
-- 2. CRIAR TABELA DE JACKPOTS
-- ============================================

CREATE TABLE IF NOT EXISTS jackpots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id TEXT NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  valeur NUMERIC(15, 2) NOT NULL,
  tirage TEXT, -- Dia da semana
  date_limite TIMESTAMP WITH TIME ZONE,
  date_tirage TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  is_past BOOLEAN DEFAULT false, -- Se o sorteio já aconteceu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lottery_id, date_tirage) -- Evitar duplicatas
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_jackpots_lottery_id ON jackpots(lottery_id);
CREATE INDEX IF NOT EXISTS idx_jackpots_date_tirage ON jackpots(date_tirage DESC);
CREATE INDEX IF NOT EXISTS idx_jackpots_is_past ON jackpots(is_past);
CREATE INDEX IF NOT EXISTS idx_jackpots_valeur ON jackpots(valeur DESC);

-- Habilitar RLS
ALTER TABLE jackpots ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler jackpots
DROP POLICY IF EXISTS "Anyone can read jackpots" ON jackpots;
CREATE POLICY "Anyone can read jackpots" ON jackpots
  FOR SELECT
  USING (true);

-- Política: Sistema pode inserir/atualizar jackpots
DROP POLICY IF EXISTS "System can manage jackpots" ON jackpots;
CREATE POLICY "System can manage jackpots" ON jackpots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_lotteries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_jackpots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_lotteries_updated_at ON lotteries;
CREATE TRIGGER trigger_update_lotteries_updated_at
  BEFORE UPDATE ON lotteries
  FOR EACH ROW
  EXECUTE FUNCTION update_lotteries_updated_at();

DROP TRIGGER IF EXISTS trigger_update_jackpots_updated_at ON jackpots;
CREATE TRIGGER trigger_update_jackpots_updated_at
  BEFORE UPDATE ON jackpots
  FOR EACH ROW
  EXECUTE FUNCTION update_jackpots_updated_at();

-- ============================================
-- 4. INSERIR LOTERIAS
-- ============================================

-- França
INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  ('loto-fr', 'Loto', 'https://www.fdj.fr/jeux/jeux-de-tirage/loto', 'france', 'France', '1 sur 19 068 840', true, 'https://www.fdj.fr/api/loto'),
  ('euromillions-fr', 'EuroMillions My Million', 'https://www.fdj.fr/jeux/jeux-de-tirage/euromillions', 'france', 'France', '1 sur 139 838 160', true, 'https://www.fdj.fr/api/euromillions'),
  ('keno-fr', 'Keno', 'https://www.fdj.fr/jeux/jeux-de-tirage/keno', 'france', 'France', '1 sur 2 147 181', true, 'https://www.fdj.fr/api/keno'),
  ('loto-super-cagnotte', 'Loto Super Cagnotte', 'https://www.fdj.fr', 'france', 'France', '1 sur 19 068 840', false, NULL),
  ('eurodreams-fr', 'EuroDreams', 'https://www.fdj.fr/jeux/jeux-de-tirage/eurodreams', 'france', 'France', '1 sur 19 191 900', false, NULL),
  ('amigo-fr', 'Amigo', 'https://www.fdj.fr', 'france', 'France', '1 sur 1 906 884', false, NULL),
  ('cash-fr', 'Cash', 'https://www.fdj.fr', 'france', 'France', '1 sur 324 632', false, NULL),
  ('loto-week-end', 'Loto Week-end', 'https://www.fdj.fr', 'france', 'France', '1 sur 19 068 840', false, NULL),
  ('quinté-plus', 'Quinté+', 'https://www.pmu.fr', 'france', 'France', '1 sur 7 893 600', false, NULL),
  ('joker-plus', 'Joker+', 'https://www.fdj.fr', 'france', 'France', '1 sur 1 000 000', false, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  region = EXCLUDED.region,
  pays = EXCLUDED.pays,
  probabilite = EXCLUDED.probabilite,
  has_api = EXCLUDED.has_api,
  api_url = EXCLUDED.api_url,
  updated_at = NOW();

-- Europa
INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  ('euromillions', 'EuroMillions', 'https://www.euro-millions.com', 'europe', 'Europe', '1 sur 139 838 160', true, 'https://www.euro-millions.com/api/results'),
  ('eurojackpot', 'Eurojackpot', 'https://www.eurojackpot.org', 'europe', 'Europe', '1 sur 139 838 160', true, 'https://www.eurojackpot.org/api/results'),
  ('superenalotto', 'SuperEnalotto', 'https://www.superenalotto.it', 'europe', 'Italie', '1 sur 622 614 630', false, NULL),
  ('el-gordo', 'El Gordo', 'https://www.loteriaelgordo.es', 'europe', 'Espagne', '1 sur 31 625 100', false, NULL),
  ('lotto-uk', 'UK National Lottery', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', '1 sur 45 057 474', true, 'https://www.national-lottery.co.uk/api/results'),
  ('thunderball-uk', 'UK Thunderball', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', '1 sur 8 060 598', true, 'https://www.national-lottery.co.uk/api/thunderball'),
  ('eurodreams-eu', 'EuroDreams', 'https://www.euro-millions.com', 'europe', 'Europe', '1 sur 19 191 900', false, NULL),
  ('lotto-allemagne', 'Lotto 6aus49', 'https://www.lotto.de', 'europe', 'Allemagne', '1 sur 139 838 160', false, NULL),
  ('lotto-austria', 'Lotto Autriche', 'https://www.lotterien.at', 'europe', 'Autriche', '1 sur 8 145 060', false, NULL),
  ('viking-lotto', 'Viking Lotto', 'https://www.vikinglotto.com', 'europe', 'Scandinavie', '1 sur 98 172 096', false, NULL),
  ('irish-lotto', 'Irish Lotto', 'https://www.lottery.ie', 'europe', 'Irlande', '1 sur 10 737 573', true, 'https://www.lottery.ie/api/results'),
  ('swiss-lotto', 'Swiss Lotto', 'https://www.swisslos.ch', 'europe', 'Suisse', '1 sur 31 474 716', false, NULL),
  ('polish-lotto', 'Lotto Pologne', 'https://www.lotto.pl', 'europe', 'Pologne', '1 sur 13 983 816', false, NULL),
  ('dutch-lotto', 'Lotto Pays-Bas', 'https://www.lotto.nl', 'europe', 'Pays-Bas', '1 sur 8 145 060', false, NULL),
  ('greek-lotto', 'Greek Lotto', 'https://www.opap.gr', 'europe', 'Grèce', '1 sur 24 435 180', false, NULL),
  ('belgian-lotto', 'Lotto Belgique', 'https://www.loterie-nationale.be', 'europe', 'Belgique', '1 sur 13 983 816', false, NULL),
  ('set-for-life-uk', 'Set For Life', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', '1 sur 15 339 390', true, 'https://www.national-lottery.co.uk/api/setforlife'),
  ('la-primitiva', 'La Primitiva', 'https://www.loteriasyapuestas.es', 'europe', 'Espagne', '1 sur 13 983 816', false, NULL),
  ('bonoloto', 'Bonoloto', 'https://www.loteriasyapuestas.es', 'europe', 'Espagne', '1 sur 13 983 816', false, NULL),
  ('lotto-portugal', 'Totoloto', 'https://www.jogossantacasa.pt', 'europe', 'Portugal', '1 sur 13 983 816', false, NULL),
  ('swedish-lotto', 'Swedish Lotto', 'https://www.svenskaspel.se', 'europe', 'Suède', '1 sur 6 724 520', false, NULL),
  ('norway-lotto', 'Norway Lotto', 'https://www.norsk-tipping.no', 'europe', 'Norvège', '1 sur 5 379 616', false, NULL),
  ('denmark-lotto', 'Denmark Lotto', 'https://www.danskespil.dk', 'europe', 'Danemark', '1 sur 8 347 680', false, NULL),
  ('finnish-lotto', 'Veikkaus Lotto', 'https://www.veikkaus.fi', 'europe', 'Finlande', '1 sur 15 380 937', false, NULL),
  ('czech-lotto', 'Sportka', 'https://www.sazka.cz', 'europe', 'République Tchèque', '1 sur 13 983 816', false, NULL),
  ('hungarian-lotto', 'Hatoslottó', 'https://www.szerencsejatek.hu', 'europe', 'Hongrie', '1 sur 13 983 816', false, NULL),
  ('croatian-lotto', 'Lotto Croatia', 'https://www.lutrija.hr', 'europe', 'Croatie', '1 sur 13 983 816', false, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  region = EXCLUDED.region,
  pays = EXCLUDED.pays,
  probabilite = EXCLUDED.probabilite,
  has_api = EXCLUDED.has_api,
  api_url = EXCLUDED.api_url,
  updated_at = NOW();

-- Internacional
INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  ('powerball', 'Powerball', 'https://www.powerball.com', 'international', 'USA', '1 sur 292 201 338', true, 'https://www.powerball.com/api/results'),
  ('mega-millions', 'Mega Millions', 'https://www.megamillions.com', 'international', 'USA', '1 sur 302 575 350', true, 'https://www.megamillions.com/api/results'),
  ('mega-sena', 'Mega-Sena', 'https://loterias.caixa.gov.br', 'international', 'Brésil', '1 sur 50 063 860', true, 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'),
  ('oz-lotto', 'Oz Lotto', 'https://www.ozlotteries.com', 'international', 'Australie', '1 sur 45 379 620', false, NULL),
  ('lotto-max', 'Lotto Max', 'https://www.lotto649.com', 'international', 'Canada', '1 sur 33 294 800', false, NULL),
  ('lotto-649', 'Lotto 6/49', 'https://www.lotto649.com', 'international', 'Canada', '1 sur 13 983 816', false, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  region = EXCLUDED.region,
  pays = EXCLUDED.pays,
  probabilite = EXCLUDED.probabilite,
  has_api = EXCLUDED.has_api,
  api_url = EXCLUDED.api_url,
  updated_at = NOW();

-- ============================================
-- 5. FUNÇÃO PARA GERAR JACKPOTS
-- ============================================

CREATE OR REPLACE FUNCTION generate_jackpots()
RETURNS void AS $$
DECLARE
  lottery_record RECORD;
  base_value NUMERIC;
  day_offset INTEGER;
  date_tirage TIMESTAMP WITH TIME ZONE;
  date_limite TIMESTAMP WITH TIME ZONE;
  tirage_day TEXT;
  past_days_array INTEGER[] := ARRAY[14, 7];
  past_days INTEGER;
  notes_examples TEXT[] := ARRAY[
    'Jackpot record à gagner - Le plus gros jackpot européen de la saison',
    'Super Cagnotte ce weekend - Ne manquez pas cette chance exceptionnelle',
    'Jackpot en progression constante depuis 3 semaines consécutives',
    'Tirage exceptionnel - Double chance de gagner avec bonus inclus',
    'Record national - Plus gros jackpot de l''année en cours',
    'Promotion spéciale pour les nouveaux joueurs ce mois-ci',
    'Jackpot garanti minimum - Jamais en dessous du montant annoncé',
    'Tirage spécial avec gains supplémentaires et bonus multiplicateur',
    'Opportunité unique - Jackpot multiplié par 2 pour ce tirage',
    'Dernière chance avant réinitialisation du jackpot la semaine prochaine',
    'Gains multiples possibles avec les codes gagnants additionnels',
    'Jackpot accumulé sur plusieurs semaines - Montant exceptionnel',
    'Tirage anniversaire avec primes et cadeaux bonus',
    'Jackpot historique - Montant jamais atteint auparavant',
    'Super tirage de fin d''année avec jackpots garantis',
    'Cagnotte exceptionnelle suite à plusieurs tirages sans gagnant',
    'Prix record en jeu - Plus gros gain possible cette année',
    'Tirage spécial du mois avec bonus de participation',
    'Jackpot boosté grâce aux multiples reports successifs',
    'Gain maximum garanti avec multiplicateur de cagnotte actif',
    'Tirage événement avec récompenses supplémentaires',
    'Jackpot triple suite à l''accumulation des dernières semaines',
    'Promotion limitée - Bonus de bienvenue pour nouveaux participants',
    'Cagnotte millionnaire en jeu pour ce tirage exceptionnel',
    'Prix incroyable avec possibilité de gains secondaires',
    'Tirage bonus avec plusieurs millions en jeu',
    'Record de participation attendu - Jackpot historique',
    'Gain garanti avec minimum de 2 millions d''euros',
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
    'Super jackpot avec gains complémentaires assurés'
  ];
  notes_index INTEGER;
  date_tirage_passada TIMESTAMP WITH TIME ZONE;
  date_limite_passada TIMESTAMP WITH TIME ZONE;
  days_of_week TEXT[] := ARRAY['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
BEGIN
  -- Limpar jackpots antigos (manter apenas os últimos 30 dias)
  DELETE FROM jackpots WHERE jackpots.date_tirage < NOW() - INTERVAL '30 days' AND jackpots.is_past = true;
  
  -- Para cada loteria
  FOR lottery_record IN SELECT * FROM lotteries LOOP
    -- Definir valor base por região
    IF lottery_record.region = 'france' THEN
      base_value := (RANDOM() * 30000000 + 2000000)::NUMERIC;
    ELSIF lottery_record.region = 'europe' THEN
      base_value := (RANDOM() * 150000000 + 10000000)::NUMERIC;
    ELSE
      base_value := (RANDOM() * 300000000 + 50000000)::NUMERIC;
    END IF;
    
    -- Se tem API, adicionar sorteios das últimas 2 semanas (passados)
    IF lottery_record.has_api THEN
      FOREACH past_days IN ARRAY past_days_array LOOP
        date_tirage_passada := NOW() - (past_days || ' days')::INTERVAL;
        date_limite_passada := date_tirage_passada - INTERVAL '2 hours';
        tirage_day := days_of_week[EXTRACT(DOW FROM date_tirage_passada) + 1];
        
        INSERT INTO jackpots (
          lottery_id, valeur, tirage, date_limite, date_tirage, notes, is_past
        ) VALUES (
          lottery_record.id,
          (base_value * (0.8 + RANDOM() * 0.4))::NUMERIC,
          tirage_day,
          date_limite_passada,
          date_tirage_passada,
          'Tirage du ' || TO_CHAR(date_tirage_passada, 'DD/MM/YYYY') || ' - Résultats disponibles',
          true
        ) ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    
    -- Criar jackpot futuro (1 a 30 dias no futuro)
    day_offset := FLOOR(RANDOM() * 30 + 1)::INTEGER;
    date_tirage := NOW() + (day_offset || ' days')::INTERVAL;
    date_limite := date_tirage - INTERVAL '2 hours';
    tirage_day := days_of_week[EXTRACT(DOW FROM date_tirage) + 1];
    notes_index := (FLOOR(RANDOM() * array_length(notes_examples, 1))::INTEGER + 1);
    
    INSERT INTO jackpots (
      lottery_id, valeur, tirage, date_limite, date_tirage, notes, is_past
    ) VALUES (
      lottery_record.id,
      base_value,
      tirage_day,
      date_limite,
      date_tirage,
      notes_examples[notes_index],
      false
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. GERAR JACKPOTS INICIAIS
-- ============================================

SELECT generate_jackpots();

-- ============================================
-- ✅ TABELAS DE JACKPOTS CRIADAS!
-- ============================================

