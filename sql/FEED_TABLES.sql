-- ============================================
-- SCRIPT SQL - TABELAS DO FEED (REFATORADO)
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- ⚠️ ATENÇÃO: Este script adiciona novas colunas e refatora a estrutura
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNAS DE FOREIGN KEY
-- ============================================

-- Adicionar user_profile_id em community_posts se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'user_profile_id'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN user_profile_id UUID;
  END IF;
  
  -- Preencher user_profile_id com base no email (user_profiles primeiro)
  UPDATE community_posts cp
  SET user_profile_id = up.id
  FROM user_profiles up
  WHERE cp.user_email = up.email AND cp.user_profile_id IS NULL;
  
  -- Preencher user_profile_id com base no email (fake_user_profiles depois)
  UPDATE community_posts cp
  SET user_profile_id = fup.id
  FROM fake_user_profiles fup
  WHERE cp.user_email = fup.email AND cp.user_profile_id IS NULL;
  
  -- Limpar user_profile_id que não existem em nenhuma das tabelas
  UPDATE community_posts cp
  SET user_profile_id = NULL
  WHERE cp.user_profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = cp.user_profile_id)
    AND NOT EXISTS (SELECT 1 FROM fake_user_profiles fup WHERE fup.id = cp.user_profile_id);
END $$;

-- Adicionar user_profile_id em feed_comments se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_comments' AND column_name = 'user_profile_id'
  ) THEN
    ALTER TABLE feed_comments ADD COLUMN user_profile_id UUID;
  END IF;
  
  -- Preencher user_profile_id com base no email (user_profiles primeiro)
  UPDATE feed_comments fc
  SET user_profile_id = up.id
  FROM user_profiles up
  WHERE fc.user_email = up.email AND fc.user_profile_id IS NULL;
  
  -- Preencher user_profile_id com base no email (fake_user_profiles depois)
  UPDATE feed_comments fc
  SET user_profile_id = fup.id
  FROM fake_user_profiles fup
  WHERE fc.user_email = fup.email AND fc.user_profile_id IS NULL;
  
  -- Limpar user_profile_id que não existem em nenhuma das tabelas
  UPDATE feed_comments fc
  SET user_profile_id = NULL
  WHERE fc.user_profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = fc.user_profile_id)
    AND NOT EXISTS (SELECT 1 FROM fake_user_profiles fup WHERE fup.id = fc.user_profile_id);
END $$;

-- ============================================
-- 2. CRIAR FOREIGN KEYS
-- ============================================

-- NOTA: Não criamos foreign key para community_posts.user_profile_id
-- porque pode referenciar tanto user_profiles quanto fake_user_profiles
-- A validação é feita via código/triggers

-- NOTA: Não criamos foreign key para feed_comments.user_profile_id
-- porque pode referenciar tanto user_profiles quanto fake_user_profiles
-- A validação é feita via código/triggers

-- ============================================
-- 3. CRIAR/ATUALIZAR TABELAS
-- ============================================

-- Tabela de posts da comunidade
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_profile_id UUID,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atualizações diárias
CREATE TABLE IF NOT EXISTS daily_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  icon TEXT,
  image_url TEXT,
  lottery_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de reações do feed
CREATE TABLE IF NOT EXISTS feed_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id TEXT NOT NULL,
  feed_source TEXT NOT NULL,
  user_email TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'insight', 'celebrate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feed_item_id, user_email, reaction_type)
);

-- Tabela de comentários nos posts
CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id TEXT NOT NULL,
  feed_source TEXT NOT NULL,
  parent_comment_id UUID,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_profile_id UUID,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE feed_comments ADD COLUMN parent_comment_id UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_comments' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE feed_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Foreign key para parent_comment_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feed_comments_parent_comment_id_fkey'
  ) THEN
    ALTER TABLE feed_comments 
    ADD CONSTRAINT feed_comments_parent_comment_id_fkey 
    FOREIGN KEY (parent_comment_id) REFERENCES feed_comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- 4. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_email ON community_posts(user_email);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_profile_id ON community_posts(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_daily_updates_created_at ON daily_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_item_id ON feed_reactions(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_user_email ON feed_reactions(user_email);
CREATE INDEX IF NOT EXISTS idx_feed_comments_item_id ON feed_comments(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_created_at ON feed_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_comments_parent_id ON feed_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user_profile_id ON feed_comments(user_profile_id);

-- ============================================
-- 5. RLS E POLÍTICAS
-- ============================================

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

-- Políticas - community_posts
DROP POLICY IF EXISTS "Allow public read community posts" ON community_posts;
CREATE POLICY "Allow public read community posts" 
ON community_posts FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert community posts" ON community_posts;
CREATE POLICY "Allow authenticated insert community posts" 
ON community_posts FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own posts" ON community_posts;
CREATE POLICY "Allow users update own posts" 
ON community_posts FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users delete own posts" ON community_posts;
CREATE POLICY "Allow users delete own posts" 
ON community_posts FOR DELETE 
TO anon, authenticated
USING (true);

-- Políticas - daily_updates
DROP POLICY IF EXISTS "Allow public read daily updates" ON daily_updates;
CREATE POLICY "Allow public read daily updates" 
ON daily_updates FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert daily updates" ON daily_updates;
CREATE POLICY "Allow authenticated insert daily updates" 
ON daily_updates FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Políticas - feed_reactions
DROP POLICY IF EXISTS "Allow public read reactions" ON feed_reactions;
CREATE POLICY "Allow public read reactions" 
ON feed_reactions FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert reactions" ON feed_reactions;
CREATE POLICY "Allow authenticated insert reactions" 
ON feed_reactions FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete own reactions" ON feed_reactions;
CREATE POLICY "Allow authenticated delete own reactions" 
ON feed_reactions FOR DELETE 
TO anon, authenticated
USING (true);

-- Políticas - feed_comments
DROP POLICY IF EXISTS "Allow public read comments" ON feed_comments;
CREATE POLICY "Allow public read comments" 
ON feed_comments FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert comments" ON feed_comments;
CREATE POLICY "Allow authenticated insert comments" 
ON feed_comments FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own comments" ON feed_comments;
CREATE POLICY "Allow users update own comments" 
ON feed_comments FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users delete own comments" ON feed_comments;
CREATE POLICY "Allow users delete own comments" 
ON feed_comments FOR DELETE 
TO anon, authenticated
USING (true);

-- ============================================
-- 6. TRIGGERS E FUNÇÕES
-- ============================================

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
DECLARE
  post_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.feed_source = 'community' AND NEW.feed_item_id LIKE 'community_%' AND NEW.parent_comment_id IS NULL THEN
      post_id := (regexp_replace(NEW.feed_item_id, '^community_', ''))::UUID;
      UPDATE community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.feed_source = 'community' AND OLD.feed_item_id LIKE 'community_%' AND OLD.parent_comment_id IS NULL THEN
      post_id := (regexp_replace(OLD.feed_item_id, '^community_', ''))::UUID;
      UPDATE community_posts 
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_count ON feed_comments;
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON feed_comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_feed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_feed_updated_at();

DROP TRIGGER IF EXISTS update_daily_updates_updated_at ON daily_updates;
CREATE TRIGGER update_daily_updates_updated_at
BEFORE UPDATE ON daily_updates
FOR EACH ROW
EXECUTE FUNCTION update_feed_updated_at();

DROP TRIGGER IF EXISTS update_feed_comments_updated_at ON feed_comments;
CREATE TRIGGER update_feed_comments_updated_at
BEFORE UPDATE ON feed_comments
FOR EACH ROW
EXECUTE FUNCTION update_feed_updated_at();

-- ============================================
-- 7. TRIGGER PARA ATUALIZAR NOMES AUTOMATICAMENTE
-- ============================================

-- Função para atualizar user_name e user_profile_id automaticamente
-- NOTA: A foto de perfil é buscada via JOIN no código, não precisa atualizar na tabela
CREATE OR REPLACE FUNCTION update_community_posts_user_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o nome foi alterado, atualizar todos os posts e comentários
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Atualizar posts
    UPDATE community_posts
    SET 
      user_name = NEW.name,
      user_profile_id = NEW.id
    WHERE user_email = NEW.email;
    
    -- Atualizar comentários
    UPDATE feed_comments
    SET 
      user_name = NEW.name,
      user_profile_id = NEW.id
    WHERE user_email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_community_posts_user_name ON user_profiles;
CREATE TRIGGER trigger_update_community_posts_user_name
AFTER UPDATE ON user_profiles
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION update_community_posts_user_name();

-- ============================================
-- 8. FUNÇÃO PARA SINCRONIZAR user_profile_id
-- ============================================

-- Função para garantir que user_profile_id está sempre sincronizado
CREATE OR REPLACE FUNCTION sync_user_profile_ids()
RETURNS void AS $$
BEGIN
  -- Sincronizar community_posts (user_profiles primeiro)
  UPDATE community_posts cp
  SET user_profile_id = up.id
  FROM user_profiles up
  WHERE cp.user_email = up.email 
    AND (cp.user_profile_id IS NULL OR cp.user_profile_id != up.id);
  
  -- Sincronizar community_posts (fake_user_profiles depois)
  UPDATE community_posts cp
  SET user_profile_id = fup.id
  FROM fake_user_profiles fup
  WHERE cp.user_email = fup.email 
    AND (cp.user_profile_id IS NULL OR cp.user_profile_id != fup.id);
  
  -- Sincronizar feed_comments (user_profiles primeiro)
  UPDATE feed_comments fc
  SET user_profile_id = up.id
  FROM user_profiles up
  WHERE fc.user_email = up.email 
    AND (fc.user_profile_id IS NULL OR fc.user_profile_id != up.id);
  
  -- Sincronizar feed_comments (fake_user_profiles depois)
  UPDATE feed_comments fc
  SET user_profile_id = fup.id
  FROM fake_user_profiles fup
  WHERE fc.user_email = fup.email 
    AND (fc.user_profile_id IS NULL OR fc.user_profile_id != fup.id);
  
  -- Limpar user_profile_id inválidos em community_posts
  UPDATE community_posts cp
  SET user_profile_id = NULL
  WHERE cp.user_profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = cp.user_profile_id)
    AND NOT EXISTS (SELECT 1 FROM fake_user_profiles fup WHERE fup.id = cp.user_profile_id);
  
  -- Limpar user_profile_id inválidos em feed_comments
  UPDATE feed_comments fc
  SET user_profile_id = NULL
  WHERE fc.user_profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = fc.user_profile_id)
    AND NOT EXISTS (SELECT 1 FROM fake_user_profiles fup WHERE fup.id = fc.user_profile_id);
END;
$$ LANGUAGE plpgsql;

-- Executar sincronização inicial
SELECT sync_user_profile_ids();

-- ============================================
-- 9. TABELA DE NOTIFICAÇÕES
-- ============================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS feed_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('comment', 'reaction')),
  feed_item_id TEXT,
  comment_id UUID,
  reaction_type TEXT,
  actor_email TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_feed_notifications_user_email ON feed_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_feed_notifications_created_at ON feed_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_notifications_is_read ON feed_notifications(is_read);

-- Habilitar RLS
ALTER TABLE feed_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - feed_notifications
DROP POLICY IF EXISTS "Allow users read own notifications" ON feed_notifications;
CREATE POLICY "Allow users read own notifications" 
ON feed_notifications FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON feed_notifications;
CREATE POLICY "Allow authenticated insert notifications" 
ON feed_notifications FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own notifications" ON feed_notifications;
CREATE POLICY "Allow users update own notifications" 
ON feed_notifications FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 10. TRIGGERS PARA NOTIFICAÇÕES
-- ============================================

-- Função para criar notificação de comentário
-- NOTA: Não cria notificações quando o usuário comenta em seus próprios posts/comentários
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

DROP TRIGGER IF EXISTS trigger_create_comment_notification ON feed_comments;
CREATE TRIGGER trigger_create_comment_notification
AFTER INSERT ON feed_comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_notification();

-- Função para criar notificação de reação
-- NOTA: Não cria notificações quando o usuário curte seus próprios posts/comentários
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

DROP TRIGGER IF EXISTS trigger_create_reaction_notification ON feed_reactions;
CREATE TRIGGER trigger_create_reaction_notification
AFTER INSERT ON feed_reactions
FOR EACH ROW
EXECUTE FUNCTION create_reaction_notification();

-- ============================================
-- ✅ PRONTO! As tabelas do feed foram criadas/atualizadas
-- ============================================
