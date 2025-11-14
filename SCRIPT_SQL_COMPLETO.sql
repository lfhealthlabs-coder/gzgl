-- ============================================
-- SCRIPT SQL - INTEGRAÇÃO SUPABASE
-- ============================================
-- Copie TUDO e execute no Supabase SQL Editor
-- ============================================

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Habilitar segurança RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - user_profiles (permite acesso com chave anon)
DROP POLICY IF EXISTS "Allow anon read access" ON user_profiles;
CREATE POLICY "Allow anon read access" 
ON user_profiles FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow anon insert access" ON user_profiles;
CREATE POLICY "Allow anon insert access" 
ON user_profiles FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update profile" ON user_profiles;
CREATE POLICY "Allow anon update profile" 
ON user_profiles FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS DE STORAGE
-- Execute DEPOIS de criar o bucket 'profile-photos'
-- ============================================
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon update photos" ON storage.objects;
CREATE POLICY "Allow anon update photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon delete photos" ON storage.objects;
CREATE POLICY "Allow anon delete photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'profile-photos');

-- ============================================
-- ✅ PRONTO! Execute: npm run dev
-- ============================================

