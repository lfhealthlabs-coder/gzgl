-- ============================================
-- ATUALIZAR CONSTRAINT DE REACTION_TYPE
-- Remove 'insight' e 'celebrate', deixa apenas 'like'
-- ============================================

-- PRIMEIRO: Deletar todas as reações que não são 'like' (necessário antes de atualizar constraint)
DELETE FROM feed_reactions WHERE reaction_type != 'like';

-- Remover constraint antiga
ALTER TABLE feed_reactions DROP CONSTRAINT IF EXISTS feed_reactions_reaction_type_check;

-- Adicionar nova constraint apenas com 'like'
ALTER TABLE feed_reactions 
ADD CONSTRAINT feed_reactions_reaction_type_check 
CHECK (reaction_type = 'like');

-- ============================================
-- ✅ CONSTRAINT ATUALIZADA!
-- ============================================

