-- ============================================
-- SCRIPT SQL - ATUALIZAÇÃO COM FREQUÊNCIA E PRÓXIMA DATA
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADICIONAR CAMPOS NECESSÁRIOS
-- ============================================

ALTER TABLE lotteries 
ADD COLUMN IF NOT EXISTS draw_days TEXT,
ADD COLUMN IF NOT EXISTS draw_frequency TEXT,
ADD COLUMN IF NOT EXISTS prize_value TEXT,
ADD COLUMN IF NOT EXISTS prize_value_avg NUMERIC(15, 2), -- Valor médio calculado
ADD COLUMN IF NOT EXISTS number_format TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS next_draw_date TIMESTAMP WITH TIME ZONE; -- Próxima data de sorteio

-- ============================================
-- 2. FUNÇÃO PARA CALCULAR VALOR MÉDIO DO PRÊMIO
-- ============================================

CREATE OR REPLACE FUNCTION calculate_prize_average(prize_text TEXT)
RETURNS NUMERIC AS $$
DECLARE
  min_val NUMERIC;
  max_val NUMERIC;
  avg_val NUMERIC;
  min_match TEXT;
  max_match TEXT;
  single_match TEXT;
  multiplier NUMERIC := 1;
  original_text TEXT;
  temp_num TEXT;
  regex_result RECORD;
BEGIN
  -- Se o texto for NULL ou vazio, retornar NULL
  IF prize_text IS NULL OR TRIM(prize_text) = '' THEN
    RETURN NULL;
  END IF;
  
  original_text := prize_text;
  prize_text := UPPER(prize_text);
  
  -- Verificar se há bilhões
  IF prize_text LIKE '%B%' OR prize_text LIKE '%BILHÃO%' OR prize_text LIKE '%BILLION%' THEN
    multiplier := 1000;
  ELSIF prize_text LIKE '%K%' OR (prize_text LIKE '%MIL%' AND prize_text NOT LIKE '%MILLION%') THEN
    multiplier := 0.001;
  END IF;
  
  -- Procurar padrão de faixa: "X a Y", "X-Y", "X até Y", "X TO Y"
  -- Exemplo: "€2M a €32M", "17M€ à 250M€", "10M€-120M€"
  BEGIN
    -- Tentar extrair faixa de valores com unidades monetárias
    FOR regex_result IN 
      SELECT * FROM REGEXP_MATCHES(prize_text, '(\d+(?:[.,]\d+)?)\s*(?:M|MILLIONS?|MILHÕES?|B|BILHÕES?|K|MIL)\s*(?:A|À|ATÉ|TO|-)\s*(\d+(?:[.,]\d+)?)\s*(?:M|MILLIONS?|MILHÕES?|B|BILHÕES?|K|MIL)', 'i') LIMIT 1
    LOOP
      IF regex_result IS NOT NULL AND array_length(regex_result, 1) >= 3 THEN
        min_match := regex_result[1];
        max_match := regex_result[2];
        
        -- Validar e converter com tratamento de erro
        BEGIN
          -- Validar min_match
          IF min_match IS NOT NULL AND LENGTH(min_match) > 0 THEN
            temp_num := TRIM(min_match);
            -- Verificar se é apenas números e pontos/vírgulas (sem letras, sem espaços)
            IF temp_num ~ '^\d+(?:[.,]\d+)?$' AND temp_num !~ '[A-Za-z]' AND temp_num !~ '\s' THEN
              BEGIN
                min_val := REPLACE(temp_num, ',', '.')::NUMERIC * multiplier;
              EXCEPTION WHEN OTHERS THEN
                min_val := NULL;
              END;
            END IF;
          END IF;
          
          -- Validar max_match
          IF max_match IS NOT NULL AND LENGTH(max_match) > 0 THEN
            temp_num := TRIM(max_match);
            -- Verificar se é apenas números e pontos/vírgulas (sem letras, sem espaços)
            IF temp_num ~ '^\d+(?:[.,]\d+)?$' AND temp_num !~ '[A-Za-z]' AND temp_num !~ '\s' THEN
              BEGIN
                max_val := REPLACE(temp_num, ',', '.')::NUMERIC * multiplier;
              EXCEPTION WHEN OTHERS THEN
                max_val := NULL;
              END;
            END IF;
          END IF;
          
          -- Calcular média se ambos os valores foram encontrados
          IF min_val IS NOT NULL AND max_val IS NOT NULL AND min_val > 0 AND max_val > 0 THEN
            avg_val := (min_val + max_val) / 2;
            RETURN avg_val;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;
      EXIT; -- Sair após primeira correspondência
    END LOOP;
    
    -- Se não encontrou faixa, tentar extrair valor único com unidade monetária
    -- Procurar padrão: "€2M", "17M€", "500.000€", etc.
    FOR regex_result IN 
      SELECT * FROM REGEXP_MATCHES(prize_text, '(\d+(?:[.,]\d+)?)\s*(?:M|MILLIONS?|MILHÕES?|B|BILHÕES?|K|MIL)', 'i') LIMIT 1
    LOOP
      IF regex_result IS NOT NULL AND array_length(regex_result, 1) >= 2 THEN
        single_match := regex_result[1];
        
        BEGIN
          IF single_match IS NOT NULL AND LENGTH(single_match) > 0 THEN
            temp_num := TRIM(single_match);
            -- Validar que é um número válido (sem letras, sem espaços)
            IF temp_num ~ '^\d+(?:[.,]\d+)?$' AND temp_num !~ '[A-Za-z]' AND temp_num !~ '\s' THEN
              BEGIN
                min_val := REPLACE(temp_num, ',', '.')::NUMERIC * multiplier;
                IF min_val > 0 THEN
                  RETURN min_val;
                END IF;
              EXCEPTION WHEN OTHERS THEN
                NULL;
              END;
            END IF;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;
      EXIT; -- Sair após primeira correspondência
    END LOOP;
    
    -- Tentar extrair valores grandes sem unidade (ex: "500.000")
    -- Mas apenas se não tiver letras ao redor que indiquem que não é valor monetário
    FOR regex_result IN 
      SELECT * FROM REGEXP_MATCHES(prize_text, '(\d{1,3}(?:[.,]\d{3})+)', 'i') LIMIT 1
    LOOP
      IF regex_result IS NOT NULL AND array_length(regex_result, 1) >= 2 THEN
        single_match := regex_result[1];
        BEGIN
          IF single_match IS NOT NULL AND LENGTH(single_match) > 0 THEN
            temp_num := TRIM(single_match);
            -- Validar que não tem letras e é um número válido
            IF temp_num ~ '^\d{1,3}(?:[.,]\d{3})+$' AND temp_num !~ '[A-Za-z]' AND temp_num !~ '\s' THEN
              BEGIN
                -- Remover pontos e vírgulas, depois dividir por 1000000 para converter para milhões
                min_val := REPLACE(REPLACE(temp_num, '.', ''), ',', '')::NUMERIC / 1000000;
                IF min_val > 0 AND min_val < 10000 THEN -- Limitar a valores razoáveis
                  RETURN min_val;
                END IF;
              EXCEPTION WHEN OTHERS THEN
                NULL;
              END;
            END IF;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;
      EXIT; -- Sair após primeira correspondência
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    -- Se houver erro, continuar e retornar NULL
    NULL;
  END;
  
  -- Se nada funcionou, retornar NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. FUNÇÃO PARA CALCULAR PRÓXIMA DATA DE SORTEIO
-- ============================================

CREATE OR REPLACE FUNCTION calculate_next_draw_date(
  draw_days_text TEXT,
  draw_frequency_text TEXT
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  current_dow INTEGER := EXTRACT(DOW FROM current_date); -- 0=Domingo, 6=Sábado
  next_date DATE;
  days_to_add INTEGER;
  target_dows INTEGER[]; -- Dias da semana alvo
  day_names TEXT[] := ARRAY['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  day_name TEXT;
  found BOOLEAN := false;
BEGIN
  -- Se for diário ou instantâneo
  IF draw_frequency_text ILIKE '%diária%' OR draw_frequency_text ILIKE '%diário%' OR 
     draw_frequency_text ILIKE '%quotidien%' OR draw_frequency_text ILIKE '%daily%' OR
     draw_frequency_text ILIKE '%instant%' THEN
    RETURN current_date + INTERVAL '1 day';
  END IF;
  
  -- Se for ocasional ou sem frequência definida
  IF draw_frequency_text ILIKE '%ocasional%' OR draw_frequency_text ILIKE '%especial%' OR
     draw_days_text IS NULL OR draw_days_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Parsear dias da semana
  -- Exemplos: "Segunda, Quarta, Sábado" ou "Terça, Sexta" ou "Seg–Sáb"
  draw_days_text := REPLACE(REPLACE(draw_days_text, '–', '-'), ' a ', '-');
  
  -- Mapear nomes para números (0=Domingo, 1=Segunda, ..., 6=Sábado)
  IF draw_days_text ILIKE '%Segunda%' OR draw_days_text ILIKE '%Lundi%' OR draw_days_text ILIKE '%Monday%' THEN
    target_dows := array_append(target_dows, 1);
  END IF;
  IF draw_days_text ILIKE '%Terça%' OR draw_days_text ILIKE '%Mardi%' OR draw_days_text ILIKE '%Tuesday%' THEN
    target_dows := array_append(target_dows, 2);
  END IF;
  IF draw_days_text ILIKE '%Quarta%' OR draw_days_text ILIKE '%Mercredi%' OR draw_days_text ILIKE '%Wednesday%' THEN
    target_dows := array_append(target_dows, 3);
  END IF;
  IF draw_days_text ILIKE '%Quinta%' OR draw_days_text ILIKE '%Jeudi%' OR draw_days_text ILIKE '%Thursday%' THEN
    target_dows := array_append(target_dows, 4);
  END IF;
  IF draw_days_text ILIKE '%Sexta%' OR draw_days_text ILIKE '%Vendredi%' OR draw_days_text ILIKE '%Friday%' THEN
    target_dows := array_append(target_dows, 5);
  END IF;
  IF draw_days_text ILIKE '%Sábado%' OR draw_days_text ILIKE '%Samedi%' OR draw_days_text ILIKE '%Saturday%' THEN
    target_dows := array_append(target_dows, 6);
  END IF;
  IF draw_days_text ILIKE '%Domingo%' OR draw_days_text ILIKE '%Dimanche%' OR draw_days_text ILIKE '%Sunday%' THEN
    target_dows := array_append(target_dows, 0);
  END IF;
  
  -- Se não encontrou dias específicos, retornar NULL
  IF array_length(target_dows, 1) IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Encontrar próximo dia de sorteio
  -- Começar de hoje (0) para pegar hoje se for um dia de sorteio
  FOR days_to_add IN 0..13 LOOP
    next_date := current_date + (days_to_add || ' days')::INTERVAL;
    IF EXTRACT(DOW FROM next_date) = ANY(target_dows) THEN
      -- Se for hoje e ainda não passou das 20h, considerar hoje
      -- Caso contrário, pegar o próximo dia
      IF days_to_add = 0 AND EXTRACT(HOUR FROM NOW()) < 20 THEN
        RETURN next_date::TIMESTAMP WITH TIME ZONE;
      ELSIF days_to_add > 0 THEN
        RETURN next_date::TIMESTAMP WITH TIME ZONE;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. ATUALIZAR LOTERIAS COM DADOS DO CSV
-- ============================================

-- Função auxiliar para atualizar uma loteria
CREATE OR REPLACE FUNCTION update_lottery_from_csv(
  p_id TEXT,
  p_draw_days TEXT,
  p_draw_frequency TEXT,
  p_prize_value TEXT,
  p_number_format TEXT,
  p_description TEXT
)
RETURNS void AS $$
DECLARE
  v_prize_avg NUMERIC;
  v_next_draw TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular valor médio
  v_prize_avg := calculate_prize_average(p_prize_value);
  
  -- Calcular próxima data
  v_next_draw := calculate_next_draw_date(p_draw_days, p_draw_frequency);
  
  -- Atualizar loteria
  UPDATE lotteries
  SET 
    draw_days = p_draw_days,
    draw_frequency = p_draw_frequency,
    prize_value = p_prize_value,
    prize_value_avg = v_prize_avg,
    number_format = p_number_format,
    description = p_description,
    next_draw_date = v_next_draw,
    updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ATUALIZAR TODAS AS LOTERIAS
-- ============================================

-- França
SELECT update_lottery_from_csv('loto-fr', 'Lundi, Mercredi, Samedi', '3 fois par semaine', 
  'Jackpot minimum 2 millions €; accumule +1M€ par tirage', '5/49 + 1/10',
  'Loterie nationale française avec trois tirages hebdomadaires; jackpot commence à 2 millions € et accumule.');
  
SELECT update_lottery_from_csv('euromillions-fr', 'Mardi, Vendredi', '2 fois par semaine',
  'Jackpot initial 17M€; plafond ~250M€; My Million 1M€', '5/50 + 2/12',
  'Version française d''EuroMillions avec tirage My Million exclusif offrant 1 million € garanti à chaque tirage.');
  
SELECT update_lottery_from_csv('keno-fr', 'Tous les jours', 'Quotidien',
  'Jusqu''à 100.000€/an à vie ou 2M€', '20 sorteados de 1–56 (jogador escolhe até 10)',
  'Loterie quotidienne de type keno offrant la possibilité de gagner une rente viagère.');
  
SELECT update_lottery_from_csv('loto-super-cagnotte', 'Dates spéciales', 'Occasionnel',
  'Jackpot spécial ~10–13M€', '5/49 + 1/10',
  'Tirages spéciaux du Loto avec jackpot garanti exceptionnellement élevé.');
  
SELECT update_lottery_from_csv('eurodreams-fr', 'Lundi, Jeudi', '2 fois par semaine',
  '20.000€/mois pendant 30 ans', '6/40 + 1/5',
  'Nouvelle loterie européenne de rente viagère lancée en 2023.');
  
SELECT update_lottery_from_csv('amigo-fr', 'Tous les jours (toutes les 5 min)', '~250 par jour',
  'Jusqu''à ~100.000€', '12 sorteados de 1–28',
  'Jeu de loterie rapide type keno instantané disponible en points de vente.');
  
SELECT update_lottery_from_csv('cash-fr', 'Sans objet', 'Instantané',
  '500.000€', 'Bilhete raspadinha',
  'Jeu de grattage instantané de la gamme Illiko.');
  
SELECT update_lottery_from_csv('loto-week-end', 'Samedi', 'Hebdomadaire',
  'Jackpot 2M€ (même que Loto)', '5/49 + 1/10',
  'Tirage du Loto du samedi avec promotions spéciales fréquentes.');
  
SELECT update_lottery_from_csv('quinté-plus', 'Tous les jours', 'Quotidien',
  'Tirelire ~500k€ jusqu''à plusieurs millions', 'Previsão 5 cavalos + Numéro Plus',
  'Pari hippique du PMU où il faut prédire l''ordre d''arrivée des 5 premiers chevaux.');
  
SELECT update_lottery_from_csv('joker-plus', 'Quotidien', '1–2 fois par jour',
  'Jusqu''à 500.000€', 'Numéro de 7 chiffres',
  'Jeu complémentaire au Loto et Keno basé sur l''acquisition de chiffres finaux.');

-- Europa (principais)
SELECT update_lottery_from_csv('euromillions', 'Mardi, Vendredi', '2 fois par semaine',
  '17M€ à 250M€', '5/50 + 2/12',
  'Plus grande loterie transnationale d''Europe avec 9 pays participants.');
  
SELECT update_lottery_from_csv('eurojackpot', 'Mardi, Vendredi', '2 fois par semaine',
  '10M€ à 120M€', '5/50 + 2/12',
  'Loterie européenne de 18 pays avec plafond de jackpot à 120M€.');
  
SELECT update_lottery_from_csv('superenalotto', 'Mardi, Jeudi, Samedi', '3 fois par semaine',
  'Sans limite (record 371M€)', '6/90 (+ Jolly)',
  'Loterie italienne célèbre pour ses jackpots gigantesques.');
  
SELECT update_lottery_from_csv('el-gordo', 'Dimanche', 'Hebdomadaire',
  'Jackpot minimum 5M€', '5/54 + Reintegro(0–9)',
  'Loterie hebdomadaire espagnole avec jackpot minimum généreux.');
  
SELECT update_lottery_from_csv('lotto-allemagne', 'Mercredi, Samedi', '2 fois par semaine',
  '1M€ à 45M€', '6/49 + Superzahl(0–9)',
  'Loterie principale allemande depuis 1955.');
  
SELECT update_lottery_from_csv('swiss-lotto', 'Mercredi, Samedi', '2 fois par semaine',
  'CHF 1,5M à ~CHF 70M', '6/42 + 1/6',
  'Loterie nationale suisse avec bonnes probabilités.');
  
SELECT update_lottery_from_csv('la-primitiva', 'Jeudi, Samedi', '2 fois par semaine',
  '2M€ à 101M€', '6/49 + Reintegro(0–9)',
  'Une des plus anciennes loteries d''Espagne.');
  
SELECT update_lottery_from_csv('lotto-portugal', 'Mercredi, Samedi', '2 fois par semaine',
  'Jackpot minimum 1M€', '5/49 + 1/13',
  'Principale loterie portugaise gérée par Santa Casa.');
  
SELECT update_lottery_from_csv('set-for-life-uk', 'Lundi, Jeudi', '2 fois par semaine',
  '10.000£/mois pendant 30 ans', '5/47 + 1/10',
  'Loterie britannique offrant une rente mensuelle à vie.');

-- Internacional
SELECT update_lottery_from_csv('powerball', 'Lundi, Mercredi, Samedi', '3 fois par semaine',
  '20M$ à 2B$+', '5/69 + 1/26',
  'Une des plus grandes loteries mondiales avec jackpots astronomiques.');
  
SELECT update_lottery_from_csv('mega-millions', 'Mardi, Vendredi', '2 fois par semaine',
  '20M$ à 1,5B$+', '5/70 + 1/25',
  'Loterie multi-états américaine rivalisant avec Powerball.');
  
SELECT update_lottery_from_csv('mega-sena', 'Mercredi, Samedi', '2 fois par semaine',
  '3M R$ à 300M R$+', '6/60',
  'Plus grande loterie du Brésil avec prêmios massivos.');
  
SELECT update_lottery_from_csv('oz-lotto', 'Mardi', 'Hebdomadaire',
  '2M$ AU à 100M$ AU', '7/47 + 2 extras',
  'Première loterie nationale australienne.');
  
SELECT update_lottery_from_csv('lotto-max', 'Mardi, Vendredi', '2 fois par semaine',
  '10M$ CA à 70M$ CA + MaxMillions', '7/50 (+ bônus)',
  'Principale loterie canadienne avec plafond à 70M$.');
  
SELECT update_lottery_from_csv('lotto-649', 'Mercredi, Samedi', '2 fois par semaine',
  '5M$ CA fixe + 10–68M$ CA variable', '6/49 + bônus + rifa',
  'Loterie canadienne avec deux jackpots simultanés.');

-- ============================================
-- 6. TRIGGER PARA ATUALIZAR PRÓXIMA DATA AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION update_next_draw_date_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular próxima data quando draw_days ou draw_frequency mudarem
  IF TG_OP = 'UPDATE' AND (
    OLD.draw_days IS DISTINCT FROM NEW.draw_days OR
    OLD.draw_frequency IS DISTINCT FROM NEW.draw_frequency
  ) THEN
    NEW.next_draw_date := calculate_next_draw_date(NEW.draw_days, NEW.draw_frequency);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_next_draw_date ON lotteries;
CREATE TRIGGER trigger_update_next_draw_date
  BEFORE INSERT OR UPDATE ON lotteries
  FOR EACH ROW
  EXECUTE FUNCTION update_next_draw_date_trigger();

-- ============================================
-- 7. FUNÇÃO PARA ATUALIZAR PRÓXIMAS DATAS PERIODICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION refresh_next_draw_dates()
RETURNS void AS $$
DECLARE
  lottery_record RECORD;
BEGIN
  FOR lottery_record IN SELECT id, draw_days, draw_frequency FROM lotteries LOOP
    UPDATE lotteries
    SET next_draw_date = calculate_next_draw_date(lottery_record.draw_days, lottery_record.draw_frequency)
    WHERE id = lottery_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ ATUALIZAÇÃO CONCLUÍDA!
-- ============================================

-- Executar atualização inicial
SELECT refresh_next_draw_dates();

