-- ============================================
-- SCRIPT SQL - ADICIONAR CAMPO DE MOTIVO DE REJEIÇÃO
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNA rejection_reason EM community_posts
-- ============================================

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- 2. ADICIONAR COLUNA rejection_reason EM feed_notifications
-- ============================================

ALTER TABLE feed_notifications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- 3. ATUALIZAR FUNÇÃO DE NOTIFICAÇÃO DE MODERAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION create_moderation_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  actor_name TEXT;
BEGIN
  -- Só criar notificação se o status mudou para 'approved' ou 'rejected'
  IF (OLD.status IS DISTINCT FROM NEW.status) AND 
     (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    
    -- Determinar tipo de notificação
    IF NEW.status = 'approved' THEN
      notification_type := 'moderation_approved';
    ELSE
      notification_type := 'moderation_rejected';
    END IF;
    
    -- Buscar nome do moderador (se disponível)
    actor_name := 'Administrateur';
    
    -- Criar notificação para o dono do post
    INSERT INTO feed_notifications (
      user_email, 
      notification_type, 
      feed_item_id, 
      actor_email, 
      actor_name,
      rejection_reason
    )
    VALUES (
      NEW.user_email,
      notification_type,
      'community_' || NEW.id::TEXT,
      COALESCE((SELECT email FROM moderators LIMIT 1), 'admin@system.com'),
      actor_name,
      NEW.rejection_reason
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ CONCLUÍDO!
-- ============================================

