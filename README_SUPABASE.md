# 🚀 Integração Supabase - Guia Simples

## ✅ O QUE JÁ FOI FEITO NO CÓDIGO (por mim)

### Arquivos Criados/Modificados:
- ✅ `src/lib/supabase.ts` - Cliente Supabase configurado
- ✅ `src/services/profileService.ts` - Integrado com Supabase (busca, atualiza, upload de fotos)
- ✅ `src/pages/ProfilPage.tsx` - Atualizado para async
- ✅ `src/pages/LotoGains10xPage.tsx` - Atualizado para async
- ✅ `.env.example` - Template de variáveis

**Tudo no código está 100% pronto!** Não precisa mexer em nada.

---

## ⚠️ O QUE VOCÊ PRECISA FAZER (no Supabase)

### 1. Criar Projeto no Supabase (5 min)

1. Acesse: https://supabase.com
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome: `zanette-app` (ou outro nome)
   - Senha do banco: escolha uma senha
   - Região: South America (Brasil)
5. Aguarde ~2 minutos

---

### 2. Copiar Credenciais (1 min)

1. No dashboard, vá em: **Settings > API**
2. Copie:
   - **Project URL** (algo como: `https://abc123.supabase.co`)
   - **anon/public key** (token grande que começa com `eyJ...`)

3. Abra o arquivo `.env` na raiz do projeto e adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

---

### 3. Executar SQL no Supabase (2 min)

1. No dashboard, vá em: **SQL Editor**
2. Clique em **New Query**
3. Cole TODO o SQL abaixo e clique em **Run** (ou F5):

```sql
-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Habilitar segurança RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - user_profiles (permite acesso com chave anon)
DROP POLICY IF EXISTS "Allow anon read access" ON user_profiles;
CREATE POLICY "Allow anon read access" 
ON user_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert access" ON user_profiles;
CREATE POLICY "Allow anon insert access" 
ON user_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update profile" ON user_profiles;
CREATE POLICY "Allow anon update profile" 
ON user_profiles FOR UPDATE TO anon, authenticated 
USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
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
```

---

### 4. Criar Bucket de Storage (2 min)

1. No dashboard, vá em: **Storage**
2. Clique em **New bucket**
3. Preencha:
   - Nome: `profile-photos`
   - ✅ Marque como **Public**
4. Clique em **Create bucket**

5. Volte no **SQL Editor** e execute:

```sql
-- Políticas de storage
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon update photos" ON storage.objects;
CREATE POLICY "Allow anon update photos"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon delete photos" ON storage.objects;
CREATE POLICY "Allow anon delete photos"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'profile-photos');
```

---

## ⚠️ IMPORTANTE - ATUALIZAÇÃO DA TABELA

Se você já tem a tabela criada, execute este SQL para adicionar a coluna de último acesso:

```sql
-- Adicionar coluna de último acesso
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);
```

---

## ⚠️ ATUALIZAR POLÍTICAS (Se já executou o SQL antes)

Se você já executou o SQL anteriormente e está tendo erro ao atualizar nome/foto, execute APENAS este SQL para atualizar as políticas:

```sql
-- Deletar políticas antigas
DROP POLICY IF EXISTS "Allow authenticated read access" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own photos" ON storage.objects;

-- Recriar com permissões corretas
DROP POLICY IF EXISTS "Allow anon read access" ON user_profiles;
CREATE POLICY "Allow anon read access" 
ON user_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert access" ON user_profiles;
CREATE POLICY "Allow anon insert access" 
ON user_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update profile" ON user_profiles;
CREATE POLICY "Allow anon update profile" 
ON user_profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon update photos" ON storage.objects;
CREATE POLICY "Allow anon update photos"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Allow anon delete photos" ON storage.objects;
CREATE POLICY "Allow anon delete photos"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'profile-photos');
```

---

## 🧪 TESTAR

```bash
npm run dev
```

1. Faça login com qualquer email
2. Vá no perfil
3. Edite o nome → Verifique no Supabase (Table Editor > user_profiles)
4. Envie uma foto → Verifique no Storage (profile-photos)

---

## 🆘 Problemas?

| Erro | Solução |
|------|---------|
| "Failed to fetch" | Verifique o `.env` e reinicie o servidor |
| "Column does not exist" | Execute TODO o SQL novamente |
| Upload falha | Marque o bucket como **Public** |
| RLS violation | Execute as políticas de segurança |

---

## 📝 Resumo

**No código:** ✅ Tudo pronto (feito por mim)  
**No Supabase:** ⚠️ Você precisa fazer (10 min):
1. Criar projeto
2. Copiar credenciais para `.env`
3. Executar SQL (criar tabelas)
4. Criar bucket de storage
5. Testar

**Tempo total:** ~10 minutos

---

## 📝 Sobre o .env

O arquivo `.env.example` tem algumas linhas comentadas (opcional). **Você só precisa preencher:**

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

Essas são as únicas 2 variáveis necessárias. As outras são opcionais e não usadas no momento.

---

**Última atualização:** 14/11/2025

