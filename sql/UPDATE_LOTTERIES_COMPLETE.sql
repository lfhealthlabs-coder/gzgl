-- ============================================
-- SCRIPT SQL - ATUALIZAÇÃO COMPLETA DAS LOTERIAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADICIONAR NOVAS COLUNAS NA TABELA LOTTERIES
-- ============================================

ALTER TABLE lotteries 
ADD COLUMN IF NOT EXISTS draw_days TEXT,
ADD COLUMN IF NOT EXISTS draw_frequency TEXT,
ADD COLUMN IF NOT EXISTS prize_value TEXT,
ADD COLUMN IF NOT EXISTS number_format TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================
-- 2. ATUALIZAR LOTERIAS FRANCESAS COM INFORMAÇÕES COMPLETAS
-- ============================================

-- Loto
UPDATE lotteries 
SET 
  draw_days = 'Lundi, Mercredi, Samedi',
  draw_frequency = '3 fois par semaine',
  prize_value = 'Jackpot minimum 2 millions €, accumule +1M€ par tirage',
  number_format = '5 numéros de 1-49 + 1 Numéro Chance de 1-10',
  description = 'Loterie nationale française organisée par la FDJ. Les joueurs choisissent 5 numéros et 1 numéro chance. Comprend périodiquement des tirages spéciaux Super Loto avec des prix plus importants.',
  url = 'https://www.fdj.fr/jeux/jeux-de-tirage/loto/resultats',
  has_api = true,
  api_url = 'https://www.fdj.fr/api/service-rest/tirages/type/loto/annee/[YEAR]'
WHERE id = 'loto-fr';

-- EuroMillions My Million
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Vendredi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot initial 17M€, plafond ~250M€; My Million 1M€',
  number_format = '5 numéros de 1-50 + 2 Étoiles de 1-12',
  description = 'Version française d''EuroMillions avec tirage My Million exclusif offrant 1 million € garanti à chaque tirage. Une des plus grandes loteries d''Europe.',
  has_api = true,
  api_url = 'https://www.fdj.fr/api/service-rest/tirages/type/euromillions/annee/[YEAR]'
WHERE id = 'euromillions-fr';

-- Keno Gagnant à Vie
UPDATE lotteries 
SET 
  draw_days = 'Tous les jours',
  draw_frequency = 'Quotidien',
  prize_value = 'Jusqu''à 100.000€/an à vie ou 2M€ en une fois',
  number_format = '20 numéros tirés de 1-56, jouer jusqu''à 10',
  description = 'Loterie quotidienne de type keno offrant la possibilité de gagner une rente viagère. Inclut options Multiplicateur et Joker+ pour chances supplémentaires.',
  has_api = true,
  api_url = 'https://www.fdj.fr/api/service-rest/tirages/type/keno/annee/[YEAR]'
WHERE id = 'keno-fr';

-- Loto Super Cagnotte
UPDATE lotteries 
SET 
  draw_days = 'Dates spéciales (vendredi 13, etc.)',
  draw_frequency = 'Occasionnel',
  prize_value = 'Jackpot spécial ~10-13M€',
  number_format = '5 numéros de 1-49 + 1 Numéro Chance de 1-10',
  description = 'Tirages spéciaux du Loto avec jackpot garanti exceptionnellement élevé. Organisé lors d''événements spéciaux comme les vendredis 13.',
  probabilite = '1 sur 19 068 840'
WHERE id = 'loto-super-cagnotte';

-- EuroDreams
UPDATE lotteries 
SET 
  draw_days = 'Lundi, Jeudi',
  draw_frequency = '2 fois par semaine',
  prize_value = '20.000€/mois pendant 30 ans',
  number_format = '6 numéros de 1-40 + 1 Numéro Dream de 1-5',
  description = 'Nouvelle loterie européenne de rente viagère lancée en 2023. Le gagnant reçoit une rente mensuelle garantie au lieu d''un jackpot unique.',
  probabilite = '1 sur 19 191 900',
  url = 'https://www.fdj.fr/jeux/jeux-de-tirage/eurodreams'
WHERE id = 'eurodreams-fr';

-- Amigo
UPDATE lotteries 
SET 
  draw_days = 'Tous les jours (6h-21h)',
  draw_frequency = '~250 tirages/jour (toutes les 5 min)',
  prize_value = 'Jusqu''à ~100.000€',
  number_format = '12 numéros tirés de 1-28 (7 bleus + 5 jaunes)',
  description = 'Jeu de loterie rapide type keno instantané disponible en points de vente. Tirages toutes les 5 minutes avec affichage en direct.',
  probabilite = '1 sur 1 906 884',
  url = 'https://www.fdj.fr/jeux/jeux-de-tirage/amigo'
WHERE id = 'amigo-fr';

-- Cash (mise à jour pour clarifier)
UPDATE lotteries 
SET 
  draw_days = 'Sans objet (instantané)',
  draw_frequency = 'Instantané',
  prize_value = 'Maximum 500.000€',
  number_format = 'Grattage instantané',
  description = 'Jeu de grattage instantané de la gamme Illiko. Résultat immédiat par grattage, sans tirage programmé.',
  probabilite = '1 sur 3 250 000 (gros lot)',
  url = 'https://www.fdj.fr/jeux/jeux-de-grattage/cash'
WHERE id = 'cash-fr';

-- Loto Week-end
UPDATE lotteries 
SET 
  draw_days = 'Samedi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot minimum 2M€',
  number_format = '5 numéros de 1-49 + 1 Numéro Chance de 1-10',
  description = 'Tirage du Loto du samedi avec promotions spéciales fréquentes. Même format que le Loto régulier mais souvent avec codes Loto Raffle supplémentaires.'
WHERE id = 'loto-week-end';

-- Quinté+
UPDATE lotteries 
SET 
  draw_days = 'Tous les jours',
  draw_frequency = 'Quotidien',
  prize_value = 'Tirelire ~500k€ jusqu''à 10M€+',
  number_format = '5 chevaux à prédire + Numéro Plus (1-3000)',
  description = 'Pari hippique du PMU où il faut prédire l''ordre d''arrivée des 5 premiers chevaux. Jackpot Tirelire accumulé pour qui a le bon Numéro Plus.',
  probabilite = '1 sur 7 893 600',
  url = 'https://www.pmu.fr/turf/quinte'
WHERE id = 'quinté-plus';

-- Joker+
UPDATE lotteries 
SET 
  draw_days = 'Quotidien (avec Loto et Keno)',
  draw_frequency = '1 fois par jour',
  prize_value = 'Jusqu''à 500.000€',
  number_format = 'Numéro de 7 chiffres',
  description = 'Jeu complémentaire au Loto et Keno. Gains basés sur la correspondance des chiffres finaux. Option +/-1 disponible pour augmenter les chances.',
  url = 'https://www.fdj.fr/jeux/jeux-complementaires/joker'
WHERE id = 'joker-plus';

-- ============================================
-- 3. ATUALIZAR LOTERIAS EUROPEIAS
-- ============================================

-- EuroMillions
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Vendredi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 17M€ à 250M€',
  number_format = '5 numéros de 1-50 + 2 Étoiles de 1-12',
  description = 'Plus grande loterie transnationale d''Europe avec 9 pays participants. Offre certains des plus gros jackpots du monde, dépassant régulièrement 100M€.',
  probabilite = '1 sur 139 838 160',
  url = 'https://www.euro-millions.com'
WHERE id = 'euromillions';

-- Eurojackpot
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Vendredi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 10M€ à 120M€',
  number_format = '5 numéros de 1-50 + 2 Euronuméros de 1-12',
  description = 'Loterie européenne de 18 pays, alternative à EuroMillions avec de meilleures chances de gain et plafond de jackpot à 120M€.',
  probabilite = '1 sur 139 838 160',
  url = 'https://www.eurojackpot.org',
  has_api = true,
  api_url = 'https://www.eurojackpot.org/en/results-winning-numbers/draw-result/[DATE]'
WHERE id = 'eurojackpot';

-- SuperEnalotto
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Jeudi, Samedi',
  draw_frequency = '3 fois par semaine',
  prize_value = 'Sans limite (record 371M€)',
  number_format = '6 numéros de 1-90 (+ Jolly)',
  description = 'Loterie italienne célèbre pour ses jackpots gigantesques dus aux très faibles probabilités. Accumulations pouvant durer des mois.',
  probabilite = '1 sur 622 614 630'
WHERE id = 'superenalotto';

-- El Gordo de la Primitiva
UPDATE lotteries 
SET 
  draw_days = 'Dimanche',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot minimum 5M€',
  number_format = '5 numéros de 1-54 + Numéro Clé de 0-9',
  description = 'Loterie hebdomadaire espagnole avec jackpot minimum généreux. Le numéro clé sert aussi de "reintegro" (remboursement).',
  probabilite = '1 sur 31 625 100',
  url = 'https://www.loteriasyapuestas.es/es/el-gordo'
WHERE id = 'el-gordo';

-- UK National Lottery
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot variable, souvent 2-10M£',
  number_format = '6 numéros de 1-59',
  description = 'Loterie nationale britannique gérée par Camelot. Offre des jackpots réguliers et finance de nombreux projets caritatifs.',
  probabilite = '1 sur 45 057 474',
  has_api = true,
  api_url = 'https://api.lottery.co.uk/results/v1.0/allResults'
WHERE id = 'lotto-uk';

-- UK Thunderball
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Mercredi, Vendredi, Samedi',
  draw_frequency = '4 fois par semaine',
  prize_value = 'Jackpot fixe 500.000£',
  number_format = '5 numéros de 1-39 + 1 Thunderball de 1-14',
  description = 'Loterie britannique à jackpot fixe avec meilleures chances que le Lotto principal. Populaire pour ses tirages fréquents.',
  probabilite = '1 sur 8 060 598',
  has_api = true,
  api_url = 'https://api.lottery.co.uk/results/v1.0/allResults'
WHERE id = 'thunderball-uk';

-- Lotto 6aus49 (Allemagne)
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 1M€ à 45M€ (plafond)',
  number_format = '6 numéros de 1-49 + Superzahl de 0-9',
  description = 'Loterie principale allemande depuis 1955. Plafond de jackpot à 45M€ avec distribution obligatoire si atteint.',
  url = 'https://www.lotto.de',
  api_url = 'https://www.lotto.de/api/results/[DATE]'
WHERE id = 'lotto-allemagne';

-- Swiss Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot CHF 1,5M+ (record CHF 70M)',
  number_format = '6 numéros de 1-42 + 1 Glückszahl de 1-6',
  description = 'Loterie nationale suisse avec bonnes probabilités. Inclut élément RePLAY pour jeu gratuit supplémentaire.',
  probabilite = '1 sur 31 474 716'
WHERE id = 'swiss-lotto';

-- La Primitiva
UPDATE lotteries 
SET 
  draw_days = 'Jeudi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 2M€+ (record 101M€)',
  number_format = '6 numéros de 1-49 + Reintegro de 0-9',
  description = 'Une des plus anciennes loteries d''Espagne. Le Reintegro est requis pour le jackpot et sert aussi de remboursement.',
  probabilite = '1 sur 139 838 160',
  url = 'https://www.loteriasyapuestas.es/es/la-primitiva'
WHERE id = 'la-primitiva';

-- Totoloto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot minimum 1M€',
  number_format = '5 numéros de 1-49 + 1 Numéro de Chance de 1-13',
  description = 'Principale loterie portugaise gérée par Santa Casa. Format rénové pour augmenter les accumulations.',
  probabilite = '1 sur 24 789 492'
WHERE id = 'lotto-portugal';

-- Set For Life UK
UPDATE lotteries 
SET 
  draw_days = 'Lundi, Jeudi',
  draw_frequency = '2 fois par semaine',
  prize_value = '10.000£/mois pendant 30 ans',
  number_format = '5 numéros de 1-47 + 1 Life Ball de 1-10',
  description = 'Loterie britannique offrant une rente mensuelle à vie plutôt qu''un jackpot unique. Attire les joueurs cherchant la stabilité financière.',
  probabilite = '1 sur 15 339 390',
  has_api = true,
  api_url = 'https://api.lottery.co.uk/results/v1.0/allResults'
WHERE id = 'set-for-life-uk';

-- ============================================
-- 4. ATUALIZAR LOTERIAS INTERNACIONAIS
-- ============================================

-- Powerball
UPDATE lotteries 
SET 
  draw_days = 'Lundi, Mercredi, Samedi',
  draw_frequency = '3 fois par semaine',
  prize_value = 'Jackpot 20M$ à 2B$+ (record mondial)',
  number_format = '5 numéros de 1-69 + 1 Powerball de 1-26',
  description = 'Une des plus grandes loteries mondiales, célèbre pour ses jackpots astronomiques dépassant souvent le milliard de dollars.',
  has_api = true,
  api_url = 'https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json'
WHERE id = 'powerball';

-- Mega Millions
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Vendredi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 20M$ à 1,5B$+',
  number_format = '5 numéros de 1-70 + 1 Mega Ball de 1-25',
  description = 'Loterie multi-états américaine rivalisant avec Powerball. Offre régulièrement des jackpots dépassant le milliard de dollars.',
  has_api = true,
  api_url = 'https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData'
WHERE id = 'mega-millions';

-- Mega-Sena
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 3M R$ à 300M R$+',
  number_format = '6 numéros de 1-60',
  description = 'Plus grande loterie du Brésil. Le tirage spécial Mega da Virada du 31 décembre offre les plus gros prix de l''année.',
  has_api = true,
  api_url = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'
WHERE id = 'mega-sena';

-- Oz Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mardi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot 2M$ AU à 100M$ AU',
  number_format = '7 numéros de 1-47 + 2 supplémentaires',
  description = 'Première loterie nationale australienne. Détient le record de jackpot du pays avec 100 millions de dollars australiens.',
  probabilite = '1 sur 62 891 499',
  url = 'https://www.thelott.com/ozlotto'
WHERE id = 'oz-lotto';

-- Lotto Max
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Vendredi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 10M$ CA à 70M$ CA + MaxMillions',
  number_format = '7 numéros de 1-50 (+ bonus)',
  description = 'Principale loterie canadienne avec plafond à 70M$. Crée des MaxMillions (tirages de 1M$ supplémentaires) quand jackpot dépasse 50M$.',
  url = 'https://www.playnow.com/lottery/lotto-max/'
WHERE id = 'lotto-max';

-- Lotto 6/49
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = '5M$ CA fixe + 10-68M$ CA variable (Boule Dorée)',
  number_format = '6 numéros de 1-49 + bonus + rifa Boule Dorée',
  description = 'Loterie canadienne avec deux jackpots: un fixe de 5M$ et un variable via tirage Boule Dorée. Format innovant garantissant toujours un gagnant.',
  url = 'https://www.playnow.com/lottery/lotto-649/'
WHERE id = 'lotto-649';

-- ============================================
-- 5. ADICIONAR LOTERIAS CANADENSES FALTANTES
-- ============================================

INSERT INTO lotteries (id, name, url, region, pays, probabilite, has_api, api_url, draw_days, draw_frequency, prize_value, number_format, description) VALUES
  ('quebec-max', 'Québec Max', 'https://loteries.lotoquebec.com/fr/loteries/quebec-max', 'international', 'Canada (Québec)', '1 sur 33 294 800', false, NULL, 'Mardi, Vendredi', '2 fois par semaine', 'Jackpot fixe 2M$ CA', '7 numéros de 1-50 + 1 bonus', 'Version provinciale du Lotto Max exclusive au Québec. Jackpot fixe de 2 millions divisé si plusieurs gagnants.'),
  ('quebec-49', 'Québec 49', 'https://loteries.lotoquebec.com/fr/loteries/quebec-49', 'international', 'Canada (Québec)', '1 sur 13 983 816', false, NULL, 'Mercredi, Samedi', '2 fois par semaine', 'Jackpot fixe 2M$ CA', '6 numéros de 1-49 + bonus', 'Version québécoise du Lotto 6/49. Coût de seulement 1$ avec jackpot fixe de 2 millions.'),
  ('grande-vie', 'Grande Vie (Daily Grand)', 'https://www.playnow.com/lottery/daily-grand/', 'international', 'Canada', '1 sur 13 348 188', false, NULL, 'Lundi, Jeudi', '2 fois par semaine', '1.000$/jour à vie (ou 7M$ CA)', '5 numéros de 1-49 + 1 Grand Numéro de 1-7', 'Loterie canadienne offrant 1.000$ par jour à vie. Option de paiement unique de 7 millions disponible.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  region = EXCLUDED.region,
  pays = EXCLUDED.pays,
  probabilite = EXCLUDED.probabilite,
  has_api = EXCLUDED.has_api,
  api_url = EXCLUDED.api_url,
  draw_days = EXCLUDED.draw_days,
  draw_frequency = EXCLUDED.draw_frequency,
  prize_value = EXCLUDED.prize_value,
  number_format = EXCLUDED.number_format,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- 6. ATUALIZAR LOTERIAS RESTANTES COM INFORMAÇÕES COMPLETAS
-- ============================================

-- EuroDreams (Europe)
UPDATE lotteries 
SET 
  draw_days = 'Lundi, Jeudi',
  draw_frequency = '2 fois par semaine',
  prize_value = '20.000€/mois pendant 30 ans',
  number_format = '6 numéros de 1-40 + 1 Dream Number de 1-5',
  description = 'Loterie européenne de rente viagère lancée en 2023. Participants de 9 pays pour une rente mensuelle garantie.'
WHERE id = 'eurodreams-eu';

-- Lotto Autriche
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Dimanche',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot ~1,5M€ à 14M€',
  number_format = '6 numéros de 1-45 + 1 Zusatzzahl',
  description = 'Loterie nationale autrichienne très populaire. Inclut jeux additionnels LottoPlus et Joker.'
WHERE id = 'lotto-austria';

-- Viking Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot 3M€ à ~35M€',
  number_format = '6 numéros de 1-48 + 1 Viking de 1-5',
  description = 'Première loterie multinationale d''Europe (pays nordiques et baltes). Jackpot plafonné à 35M€.',
  probabilite = '1 sur 61 357 560'
WHERE id = 'viking-lotto';

-- Irish Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 2M€ à 19M€ (plafond)',
  number_format = '6 numéros de 1-47 + 1 Bonus Ball',
  description = 'Loterie nationale irlandaise avec plafond de jackpot à 19,06M€. Inclut tirages Lotto Plus 1 et 2.',
  has_api = true,
  api_url = 'https://resultsservice.lottery.ie/api/results/v1'
WHERE id = 'irish-lotto';

-- Polish Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mardi, Jeudi, Samedi',
  draw_frequency = '3 fois par semaine',
  prize_value = 'Jackpot 2M PLN+ (record 36,8M PLN)',
  number_format = '6 numéros de 1-49',
  description = 'Loterie traditionnelle polonaise depuis 1957. Offre également Lotto Plus avec jackpot fixe de 1M PLN.'
WHERE id = 'polish-lotto';

-- Dutch Lotto
UPDATE lotteries 
SET 
  draw_days = 'Samedi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot ~1M€ garanti',
  number_format = '6 numéros de 1-45 + 1 bonus',
  description = 'Loterie néerlandaise avec jackpot qui tombe fréquemment. Inclut tirage XL pour prix supplémentaires.'
WHERE id = 'dutch-lotto';

-- Greek Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 300k€+ (record 7M€+)',
  number_format = '6 numéros de 1-49 + 1 bonus',
  description = 'Loterie classique grecque opérée par OPAP depuis 1990.'
WHERE id = 'greek-lotto';

-- Belgian Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot minimum 1M€',
  number_format = '6 numéros de 1-45 + 1 bonus',
  description = 'Loterie nationale belge avec jackpots modestes mais gagnants fréquents. Option Joker+ disponible.'
WHERE id = 'belgian-lotto';

-- Bonoloto
UPDATE lotteries 
SET 
  draw_days = 'Lundi-Samedi',
  draw_frequency = '6 fois par semaine',
  prize_value = 'Jackpot ~400k€ à 7M€',
  number_format = '6 numéros de 1-49 + Reintegro de 0-9',
  description = 'Loterie espagnole quotidienne économique. Prix d''entrée bas avec tirages fréquents.'
WHERE id = 'bonoloto';

-- Swedish Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot 1M SEK+ (record 237M SEK)',
  number_format = '7 numéros de 1-35 + 4 bonus',
  description = 'Loterie suédoise avec deux tirages par concours (Lotto 1 et 2). Bonnes probabilités comparatives.'
WHERE id = 'swedish-lotto';

-- Norway Lotto
UPDATE lotteries 
SET 
  draw_days = 'Samedi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot 14M NOK (fixe)',
  number_format = '7 numéros de 1-34 + 1 additionnel',
  description = 'Loterie norvégienne avec jackpot fixe et 5 prix de 100.000 NOK tirés aléatoirement chaque semaine.'
WHERE id = 'norway-lotto';

-- Denmark Lotto
UPDATE lotteries 
SET 
  draw_days = 'Samedi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot 6M DKK+ (record 52M DKK)',
  number_format = '7 numéros de 1-36 + 1 bonus',
  description = 'Loterie danoise du samedi soir. Inclut jeu complémentaire Joker.'
WHERE id = 'denmark-lotto';

-- Finnish Lotto
UPDATE lotteries 
SET 
  draw_days = 'Samedi',
  draw_frequency = 'Hebdomadaire',
  prize_value = 'Jackpot ~1M€ à 14M€',
  number_format = '7 numéros de 1-40 + 1 extra',
  description = 'Loterie nationale finlandaise depuis 1971. Tirage traditionnel du samedi soir.',
  probabilite = '1 sur 18 643 560'
WHERE id = 'finnish-lotto';

-- Czech Sportka
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Vendredi, Dimanche',
  draw_frequency = '3 fois par semaine',
  prize_value = 'Jackpot 10M CZK+ (record 399,9M CZK)',
  number_format = '6/49 (2 tirages) + Šance',
  description = 'Loterie tchèque avec deux tirages indépendants par concours. Inclut jeu Šance de 6 chiffres.'
WHERE id = 'czech-lotto';

-- Hungarian Hatoslottó
UPDATE lotteries 
SET 
  draw_days = 'Jeudi, Dimanche',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot ~60M HUF initial',
  number_format = '6 numéros de 1-45',
  description = 'Deuxième loterie la plus populaire de Hongrie avec bonnes probabilités.'
WHERE id = 'hungarian-lotto';

-- Croatian Lotto
UPDATE lotteries 
SET 
  draw_days = 'Mercredi, Samedi',
  draw_frequency = '2 fois par semaine',
  prize_value = 'Jackpot ~150k€ à 5M€',
  number_format = '7 numéros de 1-35 + 1 supplémentaire',
  description = 'Loterie croate modernisée en 2018 (anciennement 7/39). Inclut jeu Joker et rifa Šansa.',
  probabilite = '1 sur 15 380 937'
WHERE id = 'croatian-lotto';

-- ============================================
-- 7. ATUALIZAR ÍNDICES PARA NOVAS COLUNAS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_lotteries_draw_frequency ON lotteries(draw_frequency);
CREATE INDEX IF NOT EXISTS idx_lotteries_description ON lotteries USING gin(to_tsvector('french', description));

-- ============================================
-- ✅ ATUALIZAÇÃO COMPLETA DAS LOTERIAS CONCLUÍDA!
-- ============================================

-- APIs verificadas e atualizadas:
-- - FDJ (França): Loto, EuroMillions, Keno
-- - UK National Lottery: Lotto, Thunderball, Set For Life  
-- - Powerball/Mega Millions (EUA)
-- - Mega-Sena (Brasil)
-- - Irish Lottery
-- - Eurojackpot

-- Total: 50 loterias com informações completas em francês