# Integração com Supabase - Guia Completo

## 📋 Visão Geral

Este documento descreve como integrar o sistema de perfil de usuário com o Supabase, substituindo o mock atual baseado em localStorage.

## 🚀 Passo 1: Configurar o Projeto no Supabase

### 1.1 Criar uma conta e projeto
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Nome do projeto**: zanette-app (ou o nome que preferir)
   - **Database Password**: escolha uma senha forte
   - **Region**: escolha a região mais próxima dos seus usuários
5. Aguarde a criação do projeto (leva ~2 minutos)

### 1.2 Obter as credenciais
1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (anon/public)
   - **anon/public key**

## 🗄️ Passo 2: Criar as Tabelas no Banco de Dados

### 2.1 Acessar o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 2.2 Criar a tabela de perfis
```sql
-- Tabela de perfis de usuário
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura (qualquer usuário autenticado)
CREATE POLICY "Allow authenticated read access" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir inserção
CREATE POLICY "Allow authenticated insert access" 
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para permitir atualização (apenas o próprio perfil)
CREATE POLICY "Allow users to update own profile" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (auth.email() = email)
WITH CHECK (auth.email() = email);
```

### 2.3 Criar a tabela de solicitações de reembolso
```sql
-- Tabela de solicitações de reembolso
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Índice para busca por email
CREATE INDEX idx_refund_requests_email ON refund_requests(email);

-- Índice para busca por status
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- Habilitar RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção
CREATE POLICY "Allow authenticated insert refund requests" 
ON refund_requests FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para leitura (apenas próprias solicitações)
CREATE POLICY "Allow users to read own refund requests" 
ON refund_requests FOR SELECT 
TO authenticated 
USING (email = auth.email());
```

### 2.4 Criar função para atualizar updated_at automaticamente
```sql
-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 📦 Passo 3: Configurar Storage para Fotos

### 3.1 Criar bucket para fotos de perfil
1. No menu lateral, clique em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `profile-photos`
   - **Public**: ✅ Marque como público (para facilitar o acesso às imagens)
4. Clique em **Create bucket**

### 3.2 Configurar políticas do bucket
```sql
-- Permitir upload de fotos (apenas autenticados)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Permitir leitura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Permitir atualização (apenas próprias fotos)
CREATE POLICY "Allow users to update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir deleção (apenas próprias fotos)
CREATE POLICY "Allow users to delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔧 Passo 4: Configurar as Variáveis de Ambiente

### 4.1 Criar arquivo .env na raiz do projeto
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4.2 Adicionar .env ao .gitignore
```
# .gitignore
.env
.env.local
```

## 💻 Passo 5: Criar Cliente Supabase

### 5.1 Criar arquivo src/lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 🔄 Passo 6: Atualizar o profileService.ts

### 6.1 Versão com Supabase
Substitua o conteúdo de `src/services/profileService.ts` por:

```typescript
import { supabase } from '../lib/supabase';

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string | null;
}

/**
 * Retorna o perfil do usuário do Supabase
 */
export async function getProfile(): Promise<UserProfile> {
  const email = localStorage.getItem('user_email');
  
  if (!email) {
    return {
      name: 'Utilisateur',
      email: 'user@example.com',
      photoUrl: null
    };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    // Se não encontrar, cria um perfil padrão
    const defaultProfile = {
      name: 'Utilisateur',
      email,
      photo_url: null
    };

    await supabase
      .from('user_profiles')
      .insert(defaultProfile);

    return {
      name: defaultProfile.name,
      email: defaultProfile.email,
      photoUrl: defaultProfile.photo_url
    };
  }

  return {
    name: data.name,
    email: data.email,
    photoUrl: data.photo_url
  };
}

/**
 * Atualiza o perfil do usuário no Supabase
 */
export async function updateProfile(updates: { 
  name?: string; 
  photo?: File | null 
}): Promise<UserProfile> {
  const email = localStorage.getItem('user_email');
  
  if (!email) {
    throw new Error('Email não encontrado');
  }

  let photoUrl: string | null = null;

  // Processa upload da foto se fornecida
  if (updates.photo) {
    // Valida o tamanho (máx 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (updates.photo.size > maxSize) {
      throw new Error('La photo ne doit pas dépasser 2 Mo');
    }

    // Valida o tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(updates.photo.type)) {
      throw new Error('Formats acceptés : .jpg, .jpeg, .png');
    }

    // Gera nome único para o arquivo
    const fileExt = updates.photo.name.split('.').pop();
    const fileName = `${email.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;

    // Upload para o Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, updates.photo, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error('Erreur lors du téléchargement de la photo');
    }

    // Obtém a URL pública
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(uploadData.path);

    photoUrl = urlData.publicUrl;
  }

  // Prepara os dados para atualização
  const updateData: any = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (photoUrl) {
    updateData.photo_url = photoUrl;
  }

  // Atualiza no banco
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('email', email)
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la mise à jour du profil');
  }

  return {
    name: data.name,
    email: data.email,
    photoUrl: data.photo_url
  };
}

/**
 * Registra solicitação de reembolso no Supabase
 */
export interface RefundRequest {
  reason: string;
  email: string;
}

export async function requestRefund(data: RefundRequest): Promise<{ 
  success: boolean; 
  message: string 
}> {
  const { error } = await supabase
    .from('refund_requests')
    .insert({
      email: data.email,
      reason: data.reason,
      status: 'pending'
    });

  if (error) {
    throw new Error('Erreur lors de l\'envoi de la demande');
  }

  return {
    success: true,
    message: 'Demande envoyée !'
  };
}
```

## ✅ Passo 7: Testar a Integração

### 7.1 Verificar conexão
```typescript
// Adicione este código temporário em App.tsx para testar
import { supabase } from './lib/supabase';

// No useEffect:
useEffect(() => {
  supabase.from('user_profiles').select('count').then(({ data, error }) => {
    console.log('Conexão com Supabase:', error ? 'ERRO' : 'SUCESSO', data);
  });
}, []);
```

### 7.2 Testar funcionalidades
1. **Login**: Faça login com um email válido
2. **Perfil**: Edite o nome e verifique no Supabase
3. **Foto**: Faça upload de uma foto e verifique no Storage
4. **Reembolso**: Envie uma solicitação e verifique na tabela

## 🔒 Passo 8: Segurança e Boas Práticas

### 8.1 Habilitar autenticação real
Para produção, implemente autenticação real com:
```typescript
// Exemplo de login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Exemplo de registro
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### 8.2 Atualizar políticas RLS
Substitua as políticas genéricas por políticas baseadas em `auth.uid()`:
```sql
-- Exemplo: permitir atualização apenas do próprio perfil
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 8.3 Validação no backend
Para máxima segurança, crie Postgres Functions para validar dados:
```sql
CREATE OR REPLACE FUNCTION validate_refund_request()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.reason) < 10 THEN
    RAISE EXCEPTION 'Reason must be at least 10 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_refund_before_insert
BEFORE INSERT ON refund_requests
FOR EACH ROW
EXECUTE FUNCTION validate_refund_request();
```

## 📊 Monitoramento e Manutenção

### Verificar uso do Supabase
- **Database**: Menu lateral > Database > Usage
- **Storage**: Menu lateral > Storage > Usage
- **API Requests**: Menu lateral > Settings > API

### Limites do plano gratuito
- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB
- **API Requests**: Ilimitadas (rate limit: 500/min)

## 🆘 Solução de Problemas

### Erro: "Failed to fetch"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo

### Erro: "Row level security policy violation"
- Verifique as políticas RLS nas tabelas
- Confirme que o usuário está autenticado

### Upload de foto falha
- Verifique as políticas do bucket
- Confirme que o bucket é público
- Verifique o tamanho do arquivo (máx 2MB)

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
- [Postgres Functions](https://supabase.com/docs/guides/database/functions)

---

**Nota**: O sistema atual usa localStorage como mock e funciona perfeitamente para desenvolvimento e testes. A integração com Supabase é opcional e recomendada apenas para produção.


