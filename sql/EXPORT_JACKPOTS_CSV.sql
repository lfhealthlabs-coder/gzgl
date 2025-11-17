-- ============================================
-- SCRIPT PARA EXPORTAR JACKPOTS PARA CSV
-- Execute este script e copie o resultado para um arquivo CSV
-- ============================================

-- Exportar todos os jackpots com informações completas
SELECT 
  j.id,
  l.name AS loterie,
  l.region,
  l.pays,
  j.valeur,
  j.tirage AS jour_semaine,
  j.date_limite,
  j.date_tirage,
  j.notes,
  j.is_past AS deja_tire,
  (SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = 'jackpot_' || j.id::TEXT) AS nombre_likes,
  j.created_at AS date_creation,
  j.updated_at AS date_mise_a_jour
FROM jackpots j
INNER JOIN lotteries l ON j.lottery_id = l.id
ORDER BY 
  j.is_past ASC, -- Futuros primeiro
  j.valeur DESC, -- Maior valor primeiro
  j.date_tirage ASC; -- Data mais próxima primeiro

-- ============================================
-- INSTRUÇÕES PARA EXPORTAR:
-- ============================================
-- 1. Execute a query acima no Supabase SQL Editor
-- 2. Clique no botão "Download CSV" ou copie os resultados
-- 3. Salve como "jackpots_export.csv"
-- ============================================

