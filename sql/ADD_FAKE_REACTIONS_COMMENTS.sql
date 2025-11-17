-- ============================================
-- SCRIPT PARA ADICIONAR REAÇÕES E COMENTÁRIOS FAKE
-- Execute este script após criar os posts mockados
-- ============================================

-- Primeiro, garantir que os perfis de usuários mockados existem
-- Criar mais usuários fake para ter mais diversidade
INSERT INTO user_profiles (email, name)
VALUES 
  ('marie@example.com', 'Marie'),
  ('jean@example.com', 'Jean'),
  ('sophie@example.com', 'Sophie'),
  ('pierre@example.com', 'Pierre'),
  ('louis@example.com', 'Louis'),
  ('sylvie@example.com', 'Sylvie'),
  ('claire@example.com', 'Claire'),
  ('thomas@example.com', 'Thomas'),
  ('emilie@example.com', 'Emilie'),
  ('lucas@example.com', 'Lucas'),
  ('camille@example.com', 'Camille'),
  ('antoine@example.com', 'Antoine'),
  ('julie@example.com', 'Julie'),
  ('nicolas@example.com', 'Nicolas'),
  ('laura@example.com', 'Laura'),
  ('alexandre@example.com', 'Alexandre'),
  ('marion@example.com', 'Marion'),
  ('maxime@example.com', 'Maxime'),
  ('chloe@example.com', 'Chloe'),
  ('paul@example.com', 'Paul'),
  ('sarah@example.com', 'Sarah'),
  ('david@example.com', 'David'),
  ('lisa@example.com', 'Lisa'),
  ('vincent@example.com', 'Vincent'),
  ('amelie@example.com', 'Amelie'),
  ('benjamin@example.com', 'Benjamin'),
  ('elise@example.com', 'Elise'),
  ('romain@example.com', 'Romain'),
  ('celine@example.com', 'Celine'),
  ('florian@example.com', 'Florian'),
  ('audrey@example.com', 'Audrey'),
  ('guillaume@example.com', 'Guillaume'),
  ('marine@example.com', 'Marine'),
  ('sebastien@example.com', 'Sebastien'),
  ('juliette@example.com', 'Juliette'),
  ('fabien@example.com', 'Fabien'),
  ('caroline@example.com', 'Caroline'),
  ('adrien@example.com', 'Adrien'),
  ('valerie@example.com', 'Valerie'),
  ('quentin@example.com', 'Quentin'),
  ('isabelle@example.com', 'Isabelle'),
  ('olivier@example.com', 'Olivier'),
  ('nathalie@example.com', 'Nathalie'),
  ('jeremy@example.com', 'Jeremy'),
  ('stephanie@example.com', 'Stephanie'),
  ('kevin@example.com', 'Kevin'),
  ('virginie@example.com', 'Virginie'),
  ('morgan@example.com', 'Morgan'),
  ('celine2@example.com', 'Celine D.'),
  ('yann@example.com', 'Yann'),
  ('melanie@example.com', 'Melanie')
ON CONFLICT (email) DO NOTHING;

-- Buscar IDs dos posts existentes e criar reações/comentários fake
DO $$
DECLARE
  post1_id UUID; -- Sylvie
  post2_id UUID; -- Lutgarde
  post3_id UUID; -- Antoine
  post4_id UUID; -- Jean
  post5_id UUID; -- Louis
  post6_id UUID; -- Pierre
  user_emails TEXT[] := ARRAY[
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
  user_names TEXT[] := ARRAY[
    'Marie', 'Jean', 'Sophie', 'Pierre', 'Louis', 'Sylvie', 'Claire', 'Thomas',
    'Emilie', 'Lucas', 'Camille', 'Antoine', 'Julie', 'Nicolas', 'Laura', 'Alexandre',
    'Marion', 'Maxime', 'Chloe', 'Paul', 'Sarah', 'David', 'Lisa', 'Vincent',
    'Amelie', 'Benjamin', 'Elise', 'Romain', 'Celine', 'Florian', 'Audrey', 'Guillaume',
    'Marine', 'Sebastien', 'Juliette', 'Fabien', 'Caroline', 'Adrien', 'Valerie', 'Quentin',
    'Isabelle', 'Olivier', 'Nathalie', 'Jeremy', 'Stephanie', 'Kevin', 'Virginie', 'Morgan',
    'Celine D.', 'Yann', 'Melanie'
  ];
  i INT;
  selected_users TEXT[];
  comment_texts TEXT[];
BEGIN
  -- Buscar IDs dos posts
  SELECT id INTO post1_id FROM community_posts WHERE user_email = 'sylvie@example.com' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO post2_id FROM community_posts WHERE user_email = 'lutgarde@example.com' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO post3_id FROM community_posts WHERE user_email = 'antoine@example.com' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO post4_id FROM community_posts WHERE user_email = 'jean@example.com' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO post5_id FROM community_posts WHERE user_email = 'louis@example.com' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO post6_id FROM community_posts WHERE user_email = 'pierre@example.com' ORDER BY created_at DESC LIMIT 1;

  -- Buscar IDs dos perfis (criar um mapa email -> id)
  -- Vamos buscar individualmente quando necessário

  -- Comentários fake variados
  comment_texts := ARRAY[
    'Excellente question ! Je me demande aussi.',
    'Félicitations ! C''est incroyable ! 🎉',
    'J''espère avoir la même chance !',
    'Bonne chance ! 🍀',
    'Félicitations ! Votre fille va être ravie ! 🎁',
    'C''est vraiment inspirant !',
    'Merci pour le partage !',
    'Je suis d''accord avec vous !',
    'Très intéressant !',
    'Bravo pour cette réussite ! 👏',
    'Cela me donne de l''espoir !',
    'Superbe ! Continuez comme ça !',
    'Je vais essayer aussi !',
    'Excellent conseil !',
    'C''est génial ! 🎊',
    'Félicitations encore une fois !',
    'Je suis impressionné !',
    'Merci pour cette motivation !',
    'C''est fantastique !',
    'Je suis heureux pour vous ! 😊'
  ];

  -- ============================================
  -- POST 1 (Sylvie) - 45 reações, 5 comentários
  -- ============================================
  IF post1_id IS NOT NULL THEN
    -- Deletar reações existentes para garantir quantidade exata
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post1_id::TEXT;
    
    -- Selecionar 45 usuários aleatórios únicos (sem duplicatas)
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT 45
    );
    
    -- Garantir que temos exatamente 45 usuários únicos
    WHILE array_length(selected_users, 1) < 45 LOOP
      DECLARE
        new_user TEXT;
      BEGIN
        new_user := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
        -- Só adicionar se não estiver no array
        IF NOT (new_user = ANY(selected_users)) THEN
          selected_users := array_append(selected_users, new_user);
        END IF;
      END;
    END LOOP;
    
    -- Inserir exatamente 45 reações 'like'
    FOR i IN 1..array_length(selected_users, 1) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post1_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    -- Deletar comentários existentes para garantir quantidade exata
    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post1_id::TEXT;
    
    -- Inserir exatamente 5 comentários
    FOR i IN 1..5 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i - 1) * 9) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i - 1) * 9) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i - 1) * 3) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post1_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- ============================================
  -- POST 2 (Lutgarde) - 42 reações, 4 comentários
  -- ============================================
  IF post2_id IS NOT NULL THEN
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post2_id::TEXT;
    
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT 42
    );
    
    WHILE array_length(selected_users, 1) < 42 LOOP
      DECLARE
        new_user TEXT;
      BEGIN
        new_user := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
        IF NOT (new_user = ANY(selected_users)) THEN
          selected_users := array_append(selected_users, new_user);
        END IF;
      END;
    END LOOP;
    
    FOR i IN 1..array_length(selected_users, 1) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post2_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post2_id::TEXT;
    
    FOR i IN 1..4 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i + 5) * 7) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i + 5) * 7) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i + 5) * 2) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post2_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- ============================================
  -- POST 3 (Antoine - Mercedes) - 50 reações (máximo possível com 50 usuários), 6 comentários
  -- ============================================
  IF post3_id IS NOT NULL THEN
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post3_id::TEXT;
    
    -- Selecionar todos os 50 usuários únicos (máximo possível)
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
    );
    
    -- Inserir reações de todos os usuários disponíveis (máximo 50)
    FOR i IN 1..array_length(selected_users, 1) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post3_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post3_id::TEXT;
    
    FOR i IN 1..6 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i + 9) * 5) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i + 9) * 5) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i + 9) * 4) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post3_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- ============================================
  -- POST 4 (Jean) - 38 reações, 4 comentários
  -- ============================================
  IF post4_id IS NOT NULL THEN
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post4_id::TEXT;
    
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT 38
    );
    
    WHILE array_length(selected_users, 1) < 38 LOOP
      DECLARE
        new_user TEXT;
      BEGIN
        new_user := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
        IF NOT (new_user = ANY(selected_users)) THEN
          selected_users := array_append(selected_users, new_user);
        END IF;
      END;
    END LOOP;
    
    FOR i IN 1..array_length(selected_users, 1) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post4_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post4_id::TEXT;
    
    FOR i IN 1..4 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i + 16) * 6) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i + 16) * 6) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i + 16) * 3) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post4_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- ============================================
  -- POST 5 (Louis) - 33 reações, 3 comentários
  -- ============================================
  IF post5_id IS NOT NULL THEN
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post5_id::TEXT;
    
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT 33
    );
    
    WHILE array_length(selected_users, 1) < 33 LOOP
      DECLARE
        new_user TEXT;
      BEGIN
        new_user := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
        IF NOT (new_user = ANY(selected_users)) THEN
          selected_users := array_append(selected_users, new_user);
        END IF;
      END;
    END LOOP;
    
    FOR i IN 1..array_length(selected_users, 1) LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post5_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post5_id::TEXT;
    
    FOR i IN 1..3 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i + 21) * 8) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i + 21) * 8) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i + 21) * 5) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post5_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- ============================================
  -- POST 6 (Pierre) - 47 reações, 5 comentários
  -- ============================================
  IF post6_id IS NOT NULL THEN
    DELETE FROM feed_reactions WHERE feed_item_id = 'community_' || post6_id::TEXT;
    
    selected_users := ARRAY(
      SELECT DISTINCT email FROM (
        SELECT unnest(user_emails) as email ORDER BY random()
      ) sub
      LIMIT 47
    );
    
    -- Como temos apenas 50 usuários, para 47 reações podemos usar quase todos
    WHILE array_length(selected_users, 1) < 47 AND array_length(selected_users, 1) < array_length(user_emails, 1) LOOP
      DECLARE
        new_user TEXT;
      BEGIN
        new_user := user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT];
        IF NOT (new_user = ANY(selected_users)) THEN
          selected_users := array_append(selected_users, new_user);
        END IF;
      END;
    END LOOP;
    
    -- Se ainda não temos 47, adicionar usuários aleatórios (podem ser repetidos)
    WHILE array_length(selected_users, 1) < 47 LOOP
      selected_users := array_append(selected_users, user_emails[1 + (random() * (array_length(user_emails, 1) - 1))::INT]);
    END LOOP;
    
    -- Inserir reações, ignorando duplicatas
    FOR i IN 1..47 LOOP
      INSERT INTO feed_reactions (feed_item_id, feed_source, user_email, reaction_type)
      VALUES ('community_' || post6_id::TEXT, 'community', selected_users[i], 'like')
      ON CONFLICT DO NOTHING;
    END LOOP;

    DELETE FROM feed_comments WHERE feed_item_id = 'community_' || post6_id::TEXT;
    
    FOR i IN 1..5 LOOP
      DECLARE
        comment_user_email TEXT;
        comment_user_name TEXT;
        comment_user_profile_id UUID;
        comment_content TEXT;
      BEGIN
        comment_user_email := user_emails[1 + ((i + 24) * 7) % array_length(user_emails, 1)];
        comment_user_name := user_names[1 + ((i + 24) * 7) % array_length(user_names, 1)];
        comment_content := comment_texts[1 + ((i + 24) * 6) % array_length(comment_texts, 1)];
        
        SELECT id INTO comment_user_profile_id FROM user_profiles WHERE email = comment_user_email;
        
        INSERT INTO feed_comments (feed_item_id, feed_source, user_email, user_name, user_profile_id, content, parent_comment_id)
        VALUES ('community_' || post6_id::TEXT, 'community', comment_user_email, comment_user_name, comment_user_profile_id, comment_content, NULL);
      END;
    END LOOP;
  END IF;

  -- Atualizar contadores de likes e comentários nos posts
  IF post1_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post1_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post1_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post1_id;
  END IF;

  IF post2_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post2_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post2_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post2_id;
  END IF;

  IF post3_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post3_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post3_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post3_id;
  END IF;

  IF post4_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post4_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post4_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post4_id;
  END IF;

  IF post5_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post5_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post5_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post5_id;
  END IF;

  IF post6_id IS NOT NULL THEN
    UPDATE community_posts
    SET 
      likes_count = (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'community_' || post6_id::TEXT),
      comments_count = (SELECT COUNT(*) FROM feed_comments WHERE feed_item_id = 'community_' || post6_id::TEXT AND parent_comment_id IS NULL)
    WHERE id = post6_id;
  END IF;

END $$;

-- ============================================
-- ✅ REAÇÕES E COMENTÁRIOS FAKE ADICIONADOS!
-- ============================================
