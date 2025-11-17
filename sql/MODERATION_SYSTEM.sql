-- ============================================
-- SCRIPT SQL - SISTEMA DE MODERAÇÃO
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CRIAR TABELA DE MODERADORES
-- ============================================

CREATE TABLE IF NOT EXISTS moderators (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir moderadores autorizados
INSERT INTO moderators (email) 
VALUES 
  ('gab.zanette2007@gmail.com'),
  ('guilhermeludovico555@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler (para verificação de email)
DROP POLICY IF EXISTS "Anyone can read moderators" ON moderators;
CREATE POLICY "Anyone can read moderators" ON moderators
  FOR SELECT
  USING (true);

-- ============================================
-- 2. CRIAR TABELA DE PERFIS FAKE
-- ============================================

CREATE TABLE IF NOT EXISTS fake_user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_fake_user_profiles_email ON fake_user_profiles(email);

-- Habilitar RLS
ALTER TABLE fake_user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler perfis fake (dados mockados)
DROP POLICY IF EXISTS "Anyone can read fake profiles" ON fake_user_profiles;
CREATE POLICY "Anyone can read fake profiles" ON fake_user_profiles
  FOR SELECT
  USING (true);

-- Política: Apenas sistema pode inserir (via código)
DROP POLICY IF EXISTS "System can insert fake profiles" ON fake_user_profiles;
CREATE POLICY "System can insert fake profiles" ON fake_user_profiles
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. ADICIONAR COLUNA STATUS EM community_posts
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    
    -- Atualizar posts existentes para 'approved' (para não quebrar o feed atual)
    UPDATE community_posts SET status = 'approved' WHERE status IS NULL OR status = 'pending';
  END IF;
END $$;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON community_posts(status, created_at DESC);

-- ============================================
-- 4. CRIAR TABELA moderation_queue
-- ============================================

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reported_by_email TEXT NOT NULL,
  reported_by_name TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_email TEXT
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_post_id ON moderation_queue(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created ON moderation_queue(created_at DESC);

-- ============================================
-- 5. RLS POLICIES PARA moderation_queue
-- ============================================

-- Habilitar RLS
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem inserir reportes
DROP POLICY IF EXISTS "Users can insert reports" ON moderation_queue;
CREATE POLICY "Users can insert reports" ON moderation_queue
  FOR INSERT
  WITH CHECK (true);

-- Política: Usuários podem ver seus próprios reportes
DROP POLICY IF EXISTS "Users can view their own reports" ON moderation_queue;
CREATE POLICY "Users can view their own reports" ON moderation_queue
  FOR SELECT
  USING (reported_by_email = (SELECT current_setting('request.jwt.claims', true)::json->>'email') OR true);

-- Política: Admin pode ver todos os reportes (será verificado no código)
DROP POLICY IF EXISTS "Admin can view all reports" ON moderation_queue;
CREATE POLICY "Admin can view all reports" ON moderation_queue
  FOR SELECT
  USING (true);

-- Política: Admin pode atualizar reportes
DROP POLICY IF EXISTS "Admin can update reports" ON moderation_queue;
CREATE POLICY "Admin can update reports" ON moderation_queue
  FOR UPDATE
  USING (true);

-- ============================================
-- 6. FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_moderation_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reviewed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar reviewed_at
DROP TRIGGER IF EXISTS trigger_update_moderation_queue_updated_at ON moderation_queue;
CREATE TRIGGER trigger_update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_moderation_queue_updated_at();

-- ============================================
-- 7. REMOVER FOREIGN KEY CONSTRAINT PRIMEIRO
-- ============================================

-- IMPORTANTE: Remover constraints ANTES de migrar para evitar erros
DO $$
BEGIN
  -- Remover constraint de community_posts se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'community_posts_user_profile_id_fkey'
  ) THEN
    ALTER TABLE community_posts 
    DROP CONSTRAINT community_posts_user_profile_id_fkey;
  END IF;
  
  -- Remover constraint de feed_comments se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feed_comments_user_profile_id_fkey'
  ) THEN
    ALTER TABLE feed_comments 
    DROP CONSTRAINT feed_comments_user_profile_id_fkey;
  END IF;
END $$;

-- ============================================
-- 8. MIGRAR PERFIS FAKE DE user_profiles PARA fake_user_profiles
-- ============================================

-- Migrar perfis fake existentes de user_profiles para fake_user_profiles
DO $$
DECLARE
  fake_profile RECORD;
  new_fake_id UUID;
BEGIN
  -- Para cada perfil fake em user_profiles
  FOR fake_profile IN 
    SELECT id, email, name, photo_url 
    FROM user_profiles 
    WHERE email LIKE '%@example.com'
  LOOP
    -- Verificar se já existe em fake_user_profiles
    SELECT id INTO new_fake_id
    FROM fake_user_profiles
    WHERE email = fake_profile.email;
    
    -- Se não existir, criar em fake_user_profiles
    IF new_fake_id IS NULL THEN
      INSERT INTO fake_user_profiles (email, name, photo_url)
      VALUES (fake_profile.email, fake_profile.name, fake_profile.photo_url)
      RETURNING id INTO new_fake_id;
    END IF;
    
    -- Atualizar posts e comentários que referenciam o perfil antigo
    UPDATE community_posts
    SET user_profile_id = new_fake_id
    WHERE user_profile_id = fake_profile.id;
    
    UPDATE feed_comments
    SET user_profile_id = new_fake_id
    WHERE user_profile_id = fake_profile.id;
  END LOOP;
END $$;

-- ============================================
-- 9. LIMPAR PERFIS FAKE DE user_profiles
-- ============================================

-- Remover todos os perfis fake de user_profiles (limpeza do banco)
DELETE FROM user_profiles 
WHERE email LIKE '%@example.com';

-- ============================================
-- 10. ADICIONAR TIPOS DE NOTIFICAÇÃO DE MODERAÇÃO
-- ============================================

-- Atualizar constraint de notification_type para incluir moderação
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feed_notifications_notification_type_check'
  ) THEN
    ALTER TABLE feed_notifications 
    DROP CONSTRAINT feed_notifications_notification_type_check;
  END IF;
  
  -- Adicionar nova constraint com tipos de moderação
  ALTER TABLE feed_notifications 
  ADD CONSTRAINT feed_notifications_notification_type_check 
  CHECK (notification_type IN ('comment', 'reaction', 'moderation_approved', 'moderation_rejected'));
END $$;

-- ============================================
-- 11. TRIGGER PARA NOTIFICAÇÕES DE MODERAÇÃO
-- ============================================

-- Função para criar notificação quando post é aprovado/rejeitado
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
      actor_name
    )
    VALUES (
      NEW.user_email,
      notification_type,
      'community_' || NEW.id::TEXT,
      COALESCE((SELECT email FROM moderators LIMIT 1), 'admin@system.com'),
      actor_name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificação quando status muda
DROP TRIGGER IF EXISTS trigger_create_moderation_notification ON community_posts;
CREATE TRIGGER trigger_create_moderation_notification
AFTER UPDATE OF status ON community_posts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION create_moderation_notification();

-- ============================================
-- ✅ SISTEMA DE MODERAÇÃO CRIADO!
-- ============================================

