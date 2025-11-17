-- ============================================
-- POSTS MOCKADOS INICIAIS PARA ENGAJAMENTO
-- ============================================
-- Execute este SQL após criar as tabelas do feed
-- Isso adiciona posts iniciais para ter conteúdo no feed
-- ============================================

-- Inserir posts mockados (apenas se a tabela estiver vazia)
INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'sylvie@example.com',
  'Sylvie Beaudoin',
  'Est-ce que ce programme n''est que pour les européens ou du Canada on peut y avoir accès',
  NULL,
  3,
  1,
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'sylvie@example.com' AND content LIKE '%européens%');

INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'lutgarde@example.com',
  'Lutgarde JAMAER',
  'Belgique',
  NULL,
  0,
  0,
  NOW() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'lutgarde@example.com' AND content = 'Belgique');

INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'antoine@example.com',
  'Antoine Dupont',
  'Je me suis inscrit sur LotoGains sans imaginer ce qui allait se passer… Quelques semaines plus tard, mes gains ont été si élevés que j''ai réalisé un rêve de longue date : conduire ma propre Mercedes-Benz Classe S. Si j''ai pu le faire, vous le pouvez aussi !',
  '/image13.jpg',
  6,
  0,
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'antoine@example.com' AND content LIKE '%Mercedes-Benz%');

INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'jean@example.com',
  'Jean Dupont',
  'Je viens juste d''entrer sur LotoGains. Je fais mes paris en ce moment même, souhaitez-moi bonne chance !',
  NULL,
  1,
  0,
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'jean@example.com' AND content LIKE '%bonne chance%');

INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'louis@example.com',
  'Louis Fontaine',
  'Me mes premiers 7000 euros sont déjà partis. J''ai acheté l''accès à LotoGains il y a seulement 7 jours.',
  '/image14.jpg',
  1,
  0,
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'louis@example.com' AND content LIKE '%7000 euros%');

INSERT INTO community_posts (user_email, user_name, content, image_url, likes_count, comments_count, created_at)
SELECT 
  'pierre@example.com',
  'Pierre Dubois',
  'ENFIN!

Après 5 jours d''essai, j''ai réussi. Mon premier prix à la loterie. J''ai hâte d''offrir un nouveau téléphone portable à ma fille.',
  '/image14.jpg',
  3,
  0,
  NOW() - INTERVAL '12 hours'
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE user_email = 'pierre@example.com' AND content LIKE '%ENFIN%');

-- ============================================
-- ✅ Posts mockados inseridos!
-- ============================================

