-- ============================================
-- ADICIONAR COLUNA last_login_at
-- ============================================
-- Execute este SQL no Supabase SQL Editor se a tabela user_profiles já existe
-- ============================================

-- Adicionar a coluna last_login_at
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Preencher a coluna para registros existentes (opcional)
-- Isso vai definir o last_login_at como a data de criação dos perfis existentes
UPDATE user_profiles 
SET last_login_at = created_at 
WHERE last_login_at IS NULL;

-- ============================================
-- ✅ PRONTO! 
-- ============================================
-- A coluna foi adicionada e todos os registros existentes foram atualizados

