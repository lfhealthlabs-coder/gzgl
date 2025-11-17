-- ============================================
-- SCRIPT SQL - REMOVER NOTIFICAÇÕES DE INTERAÇÕES PRÓPRIAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- Este script atualiza os triggers para não criar notificações
-- quando o usuário comenta ou curte seus próprios posts/comentários
-- ============================================

-- ============================================
-- 1. ATUALIZAR FUNÇÃO DE NOTIFICAÇÃO DE COMENTÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_email TEXT;
  post_id_text TEXT;
BEGIN
  -- Só criar notificação se for comentário direto no post (não resposta)
  IF NEW.parent_comment_id IS NULL AND NEW.feed_source = 'community' THEN
    -- Extrair email do dono do post
    post_id_text := NEW.feed_item_id;
    IF post_id_text LIKE 'community_%' THEN
      SELECT user_email INTO post_owner_email
      FROM community_posts
      WHERE id = (regexp_replace(post_id_text, '^community_', ''))::UUID;
      
      -- Criar notificação APENAS se o comentário NÃO for do próprio dono do post
      IF post_owner_email IS NOT NULL AND post_owner_email != NEW.user_email THEN
        INSERT INTO feed_notifications (user_email, notification_type, feed_item_id, comment_id, actor_email, actor_name)
        VALUES (post_owner_email, 'comment', post_id_text, NEW.id, NEW.user_email, NEW.user_name);
      END IF;
    END IF;
  ELSIF NEW.parent_comment_id IS NOT NULL THEN
    -- Notificar o dono do comentário pai
    SELECT user_email INTO post_owner_email
    FROM feed_comments
    WHERE id = NEW.parent_comment_id;
    
    -- Criar notificação APENAS se a resposta NÃO for do próprio dono do comentário pai
    IF post_owner_email IS NOT NULL AND post_owner_email != NEW.user_email THEN
      INSERT INTO feed_notifications (user_email, notification_type, feed_item_id, comment_id, actor_email, actor_name)
      VALUES (post_owner_email, 'comment', NEW.feed_item_id, NEW.id, NEW.user_email, NEW.user_name);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. ATUALIZAR FUNÇÃO DE NOTIFICAÇÃO DE REAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_email TEXT;
  comment_owner_email TEXT;
  actor_name TEXT;
  actor_profile_id UUID;
BEGIN
  -- Buscar nome do ator
  SELECT name, id INTO actor_name, actor_profile_id
  FROM user_profiles
  WHERE email = NEW.user_email
  LIMIT 1;
  
  IF actor_name IS NULL THEN
    -- Tentar buscar de fake_user_profiles
    SELECT name INTO actor_name
    FROM fake_user_profiles
    WHERE email = NEW.user_email
    LIMIT 1;
    
    IF actor_name IS NULL THEN
      actor_name := NEW.user_email;
    END IF;
  END IF;
  
  -- Se for reação em post da comunidade
  IF NEW.feed_source = 'community' AND NEW.feed_item_id LIKE 'community_%' THEN
    SELECT user_email INTO post_owner_email
    FROM community_posts
    WHERE id = (regexp_replace(NEW.feed_item_id, '^community_', ''))::UUID;
    
    -- Criar notificação APENAS se a reação NÃO for do próprio dono do post
    IF post_owner_email IS NOT NULL AND post_owner_email != NEW.user_email THEN
      INSERT INTO feed_notifications (user_email, notification_type, feed_item_id, reaction_type, actor_email, actor_name)
      VALUES (post_owner_email, 'reaction', NEW.feed_item_id, NEW.reaction_type, NEW.user_email, actor_name);
    END IF;
  -- Se for reação em comentário
  ELSIF NEW.feed_item_id LIKE 'comment_%' THEN
    SELECT user_email INTO comment_owner_email
    FROM feed_comments
    WHERE id = (regexp_replace(NEW.feed_item_id, '^comment_', ''))::UUID;
    
    -- Criar notificação APENAS se a reação NÃO for do próprio dono do comentário
    IF comment_owner_email IS NOT NULL AND comment_owner_email != NEW.user_email THEN
      INSERT INTO feed_notifications (user_email, notification_type, feed_item_id, comment_id, reaction_type, actor_email, actor_name)
      VALUES (comment_owner_email, 'reaction', NEW.feed_item_id, (regexp_replace(NEW.feed_item_id, '^comment_', ''))::UUID, NEW.reaction_type, NEW.user_email, actor_name);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ CONCLUÍDO!
-- ============================================
-- Agora as notificações só serão criadas quando outras pessoas
-- comentarem ou curtirem seus posts/comentários, não quando você mesmo
-- interagir com seu próprio conteúdo.
-- ============================================

