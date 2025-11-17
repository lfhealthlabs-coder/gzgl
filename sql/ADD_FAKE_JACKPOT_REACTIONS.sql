-- ============================================
-- SCRIPT PARA ADICIONAR REAÇÕES FAKE AOS JACKPOTS
-- Execute este script após gerar os jackpots
-- ============================================

-- Buscar emails de perfis fake existentes (de fake_user_profiles)
DO $$
DECLARE
  jackpot_record RECORD;
  user_emails TEXT[];
  selected_users TEXT[];
  num_reactions INTEGER;
  i INTEGER;
  user_email TEXT;
BEGIN
  -- Buscar emails de perfis fake
  SELECT ARRAY_AGG(email) INTO user_emails
  FROM fake_user_profiles;
  
  -- Se não houver perfis fake, usar emails de exemplo
  IF user_emails IS NULL OR array_length(user_emails, 1) = 0 THEN
    user_emails := ARRAY[
      'marie@example.com', 'jean@example.com', 'sophie@example.com', 'pierre@example.com',
      'louis@example.com', 'sylvie@example.com', 'claire@example.com', 'thomas@example.com',
      'emilie@example.com', 'lucas@example.com', 'camille@example.com', 'antoine@example.com',
      'julie@example.com', 'nicolas@example.com', 'laura@example.com', 'alexandre@example.com',
      'marion@example.com', 'maxime@example.com', 'chloe@example.com', 'paul@example.com',
      'sarah@example.com', 'david@example.com', 'lisa@example.com', 'vincent@example.com',
      'amelie@example.com', 'benjamin@example.com', 'elise@example.com', 'romain@example.com',
      'celine@example.com', 'florian@example.com', 'audrey@example.com', 'guillaume@example.com',
      'marine@example.com', 'sebastien@example.com', 'juliette@example.com', 'fabien@example.com',
      'caroline@example.com', 'adrien@example.com', 'valerie@example.com', 'quentin@example.com',
      'isabelle@example.com', 'olivier@example.com', 'nathalie@example.com', 'jeremy@example.com',
      'stephanie@example.com', 'kevin@example.com', 'virginie@example.com', 'morgan@example.com',
      'celine2@example.com', 'yann@example.com', 'melanie@example.com'
    ];
  END IF;
  
  -- Para cada jackpot (apenas futuros, não passados)
  FOR jackpot_record IN 
    SELECT id, lottery_id, valeur, date_tirage
    FROM jackpots
    WHERE is_past = false
    ORDER BY valeur DESC
  LOOP
    -- Determinar número de reações baseado no valor do jackpot
    -- Jackpots maiores = mais reações
    IF jackpot_record.valeur >= 200000000 THEN
      num_reactions := 30 + FLOOR(RANDOM() * 31)::INTEGER; -- 30 a 60
    ELSIF jackpot_record.valeur >= 100000000 THEN
      num_reactions := 20 + FLOOR(RANDOM() * 21)::INTEGER; -- 20 a 40
    ELSIF jackpot_record.valeur >= 50000000 THEN
      num_reactions := 15 + FLOOR(RANDOM() * 16)::INTEGER; -- 15 a 30
    ELSE
      num_reactions := 10 + FLOOR(RANDOM() * 21)::INTEGER; -- 10 a 30
    END IF;
    
    -- Limpar reações existentes para este jackpot
    DELETE FROM feed_reactions WHERE feed_item_id = 'jackpot_' || jackpot_record.id::TEXT;
    
    -- Selecionar usuários aleatórios únicos
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT LEAST(num_reactions, array_length(user_emails, 1))
    );
    
    -- Se precisar de mais reações do que usuários únicos, adicionar duplicatas aleatórias
    WHILE array_length(selected_users, 1) < num_reactions LOOP
      user_email := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
      selected_users := array_append(selected_users, user_email);
    END LOOP;
    
    -- Inserir reações
    FOR i IN 1..LEAST(num_reactions, array_length(selected_users, 1)) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('jackpot_' || jackpot_record.id::TEXT, 'jackpot', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Adicionadas % reações ao jackpot % (valor: %)', 
      num_reactions, jackpot_record.id, jackpot_record.valeur;
  END LOOP;
  
  RAISE NOTICE 'Reações fake adicionadas aos jackpots com sucesso!';
END $$;

-- ============================================
-- ✅ REAÇÕES FAKE ADICIONADAS AOS JACKPOTS!
-- ============================================

