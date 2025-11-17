-- ============================================
-- SCRIPT SQL - RASTREAMENTO DE EXCLUSÃO DE POSTS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNAS DE RASTREAMENTO
-- ============================================

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by_email TEXT,
ADD COLUMN IF NOT EXISTS deleted_by_type TEXT CHECK (deleted_by_type IN ('user', 'admin'));

-- Criar índice para consultas de posts deletados
CREATE INDEX IF NOT EXISTS idx_community_posts_deleted_at ON community_posts(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- 2. ATUALIZAR FUNÇÃO DE DELETE PARA SOFT DELETE
-- ============================================

-- Nota: A função de delete será atualizada no código TypeScript
-- para fazer UPDATE em vez de DELETE quando deleted_by_type = 'admin'

-- ============================================
-- 3. ATUALIZAR RLS PARA INCLUIR POSTS DELETADOS (apenas para admins)
-- ============================================

-- Os admins precisam ver posts deletados para rastreamento
-- A política RLS existente já permite leitura para admins

-- ============================================
-- ✅ CONCLUÍDO!
-- ============================================

