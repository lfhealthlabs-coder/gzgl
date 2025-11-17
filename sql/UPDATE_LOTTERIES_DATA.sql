-- ============================================
-- SCRIPT SQL - ATUALIZAÇÃO DE DADOS DAS LOTERIAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Atualiza informações detalhadas das loterias com dados em francês
-- ============================================

-- ============================================
-- 1. LIMPAR DADOS ANTIGOS E RECRIAR
-- ============================================

-- Deletar todas as loterias antigas para recriar com dados atualizados
DELETE FROM jackpots;
DELETE FROM lotteries;

-- ============================================
-- 2. INSERIR LOTERIAS DA FRANÇA (10)
-- ============================================

INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  -- Loto
  ('loto-fr', 'Loto', 'https://www.fdj.fr/jeux/jeux-de-tirage/loto', 'france', 'France', 
   '1 sur 19 068 840', true, 'https://www.fdj.fr/api/loto'),
  
  -- EuroMillions My Million
  ('euromillions-fr', 'EuroMillions My Million', 'https://www.fdj.fr/jeux/jeux-de-tirage/euromillions', 'france', 'France', 
   '1 sur 139 838 160', true, 'https://www.fdj.fr/api/euromillions'),
  
  -- Keno Gagnant à Vie
  ('keno-fr', 'Keno Gagnant à Vie', 'https://www.fdj.fr/jeux/jeux-de-tirage/keno', 'france', 'France', 
   '1 sur 2 147 181', true, 'https://www.fdj.fr/jeux-de-tirage/keno'),
  
  -- Loto Super Cagnotte
  ('loto-super-cagnotte', 'Loto Super Cagnotte', 'https://www.fdj.fr', 'france', 'France', 
   '1 sur 19 068 840', false, NULL),
  
  -- EuroDreams France
  ('eurodreams-fr', 'EuroDreams', 'https://www.fdj.fr/jeux/jeux-de-tirage/eurodreams', 'france', 'France', 
   '1 sur 19 191 900', false, NULL),
  
  -- Amigo
  ('amigo-fr', 'Amigo', 'https://www.fdj.fr', 'france', 'France', 
   '1 sur 324 632', false, NULL),
  
  -- Cash (Raspadinha)
  ('cash-fr', 'Cash', 'https://www.fdj.fr', 'france', 'France', 
   '1 sur 3 250 000', false, NULL),
  
  -- Loto Week-end
  ('loto-week-end', 'Loto Week-end', 'https://www.fdj.fr', 'france', 'France', 
   '1 sur 19 068 840', false, NULL),
  
  -- Quinté+
  ('quinte-plus', 'Quinté+', 'https://www.pmu.fr', 'france', 'France', 
   '1 sur 7 893 600', false, NULL),
  
  -- Joker+
  ('joker-plus', 'Joker+', 'https://www.fdj.fr', 'france', 'France', 
   '1 sur 1 000 000', false, NULL)
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
-- 3. INSERIR LOTERIAS DA EUROPA (27)
-- ============================================

INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  -- EuroMillions
  ('euromillions', 'EuroMillions', 'https://www.euro-millions.com', 'europe', 'Europe', 
   '1 sur 139 838 160', false, NULL),
  
  -- Eurojackpot
  ('eurojackpot', 'Eurojackpot', 'https://www.eurojackpot.org', 'europe', 'Europe', 
   '1 sur 139 838 160', false, NULL),
  
  -- SuperEnalotto
  ('superenalotto', 'SuperEnalotto', 'https://www.superenalotto.it', 'europe', 'Italie', 
   '1 sur 622 614 630', false, NULL),
  
  -- El Gordo de la Primitiva
  ('el-gordo', 'El Gordo de la Primitiva', 'https://www.loteriaelgordo.es', 'europe', 'Espagne', 
   '1 sur 31 625 100', false, NULL),
  
  -- UK National Lottery
  ('lotto-uk', 'UK National Lottery', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', 
   '1 sur 45 057 474', false, NULL),
  
  -- UK Thunderball
  ('thunderball-uk', 'UK Thunderball', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', 
   '1 sur 8 060 598', false, NULL),
  
  -- EuroDreams Europe
  ('eurodreams-eu', 'EuroDreams', 'https://www.euro-millions.com', 'europe', 'Europe', 
   '1 sur 19 191 900', false, NULL),
  
  -- Lotto 6aus49 (Allemagne)
  ('lotto-allemagne', 'Lotto 6aus49', 'https://www.lotto.de', 'europe', 'Allemagne', 
   '1 sur 139 838 160', false, NULL),
  
  -- Lotto Österreich (Autriche)
  ('lotto-austria', 'Lotto 6aus45', 'https://www.lotterien.at', 'europe', 'Autriche', 
   '1 sur 8 145 060', false, NULL),
  
  -- Viking Lotto
  ('viking-lotto', 'Viking Lotto', 'https://www.vikinglotto.com', 'europe', 'Pays Nordiques', 
   '1 sur 61 000 000', false, NULL),
  
  -- Irish Lotto
  ('irish-lotto', 'Irish Lotto', 'https://www.lottery.ie', 'europe', 'Irlande', 
   '1 sur 10 737 573', false, NULL),
  
  -- Swiss Lotto
  ('swiss-lotto', 'Swiss Lotto', 'https://www.swisslos.ch', 'europe', 'Suisse', 
   '1 sur 31 474 716', false, NULL),
  
  -- Polish Lotto
  ('polish-lotto', 'Lotto Pologne', 'https://www.lotto.pl', 'europe', 'Pologne', 
   '1 sur 13 983 816', false, NULL),
  
  -- Dutch Lotto
  ('dutch-lotto', 'Lotto Pays-Bas', 'https://www.lotto.nl', 'europe', 'Pays-Bas', 
   '1 sur 8 145 060', false, NULL),
  
  -- Greek Lotto
  ('greek-lotto', 'Greek Lotto', 'https://www.opap.gr', 'europe', 'Grèce', 
   '1 sur 13 983 816', false, NULL),
  
  -- Belgian Lotto
  ('belgian-lotto', 'Lotto Belgique', 'https://www.loterie-nationale.be', 'europe', 'Belgique', 
   '1 sur 8 145 060', false, NULL),
  
  -- Set For Life UK
  ('set-for-life-uk', 'Set For Life', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni', 
   '1 sur 15 339 390', false, NULL),
  
  -- La Primitiva
  ('la-primitiva', 'La Primitiva', 'https://www.loteriasyapuestas.es', 'europe', 'Espagne', 
   '1 sur 139 838 160', false, NULL),
  
  -- Bonoloto
  ('bonoloto', 'Bonoloto', 'https://www.loteriasyapuestas.es', 'europe', 'Espagne', 
   '1 sur 13 983 816', false, NULL),
  
  -- Totoloto (Portugal)
  ('lotto-portugal', 'Totoloto', 'https://www.jogossantacasa.pt', 'europe', 'Portugal', 
   '1 sur 24 789 492', false, NULL),
  
  -- Swedish Lotto
  ('swedish-lotto', 'Swedish Lotto', 'https://www.svenskaspel.se', 'europe', 'Suède', 
   '1 sur 6 724 520', false, NULL),
  
  -- Norway Lotto
  ('norway-lotto', 'Norway Lotto', 'https://www.norsk-tipping.no', 'europe', 'Norvège', 
   '1 sur 5 379 616', false, NULL),
  
  -- Denmark Lotto
  ('denmark-lotto', 'Denmark Lotto', 'https://www.danskespil.dk', 'europe', 'Danemark', 
   '1 sur 8 347 680', false, NULL),
  
  -- Finnish Lotto (Veikkaus)
  ('finnish-lotto', 'Veikkaus Lotto', 'https://www.veikkaus.fi', 'europe', 'Finlande', 
   '1 sur 18 643 560', false, NULL),
  
  -- Czech Lotto (Sportka)
  ('czech-lotto', 'Sportka', 'https://www.sazka.cz', 'europe', 'République Tchèque', 
   '1 sur 13 983 816', false, NULL),
  
  -- Hungarian Lotto (Hatoslottó)
  ('hungarian-lotto', 'Hatoslottó', 'https://www.szerencsejatek.hu', 'europe', 'Hongrie', 
   '1 sur 8 145 060', false, NULL),
  
  -- Croatian Lotto
  ('croatian-lotto', 'Lotto 7/35', 'https://www.lutrija.hr', 'europe', 'Croatie', 
   '1 sur 15 380 937', false, NULL)
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
-- 4. INSERIR LOTERIAS INTERNACIONAIS (10)
-- ============================================

INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url) VALUES
  -- Powerball
  ('powerball', 'Powerball', 'https://www.powerball.com', 'international', 'États-Unis', 
   '1 sur 292 201 338', true, 'https://www.powerball.com/api/v1/numbers/powerball'),
  
  -- Mega Millions
  ('mega-millions', 'Mega Millions', 'https://www.megamillions.com', 'international', 'États-Unis', 
   '1 sur 302 575 350', true, 'https://www.megamillions.com/api/numbers'),
  
  -- Mega-Sena
  ('mega-sena', 'Mega-Sena', 'https://loterias.caixa.gov.br', 'international', 'Brésil', 
   '1 sur 50 063 860', true, 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'),
  
  -- Oz Lotto
  ('oz-lotto', 'Oz Lotto', 'https://www.ozlotteries.com', 'international', 'Australie', 
   '1 sur 62 891 499', false, NULL),
  
  -- Lotto Max
  ('lotto-max', 'Lotto Max', 'https://www.lotto649.com', 'international', 'Canada', 
   '1 sur 33 294 800', false, NULL),
  
  -- Lotto 6/49
  ('lotto-649', 'Lotto 6/49', 'https://www.lotto649.com', 'international', 'Canada', 
   '1 sur 13 983 816', false, NULL),
  
  -- Québec Max
  ('quebec-max', 'Québec Max', 'https://www.loteries.lotoquebec.com', 'international', 'Canada (Québec)', 
   '1 sur 33 294 800', false, NULL),
  
  -- Québec 49
  ('quebec-49', 'Québec 49', 'https://www.loteries.lotoquebec.com', 'international', 'Canada (Québec)', 
   '1 sur 13 983 816', false, NULL),
  
  -- Grande Vie (Daily Grand)
  ('grande-vie', 'Grande Vie', 'https://www.loteries.lotoquebec.com', 'international', 'Canada', 
   '1 sur 13 348 188', false, NULL),
  
  -- UK Lotto (adicionado para complementar)
  ('uk-lotto', 'UK Lotto', 'https://www.national-lottery.co.uk', 'europe', 'Royaume-Uni',
   '1 sur 45 057 474', false, NULL)
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
-- 5. GERAR JACKPOTS ATUALIZADOS
-- ============================================

-- Chamar a função para gerar os jackpots com os novos dados
SELECT generate_jackpots();

-- ============================================
-- ✅ LOTERIAS ATUALIZADAS COM DADOS PRECISOS!
-- ============================================
-- Total: 47 loterias
-- França: 10 loterias
-- Europa: 27 loterias
-- Internacional: 10 loterias
-- APIs disponíveis: 6 (Loto, EuroMillions MY, Keno, Powerball, Mega Millions, Mega-Sena)
-- ============================================

