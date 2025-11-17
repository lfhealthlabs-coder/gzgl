# 🔒 Sistema de Moderação - Documentação Completa

## 📋 Visão Geral

O sistema de moderação permite que administradores aprovem ou rejeitem posts da comunidade antes que apareçam no feed público. Usuários também podem reportar posts inadequados.

---

## 🗄️ Estrutura do Banco de Dados

### 1. **Tabela `community_posts`**
- **Coluna `status`**: Controla o estado do post
  - `'pending'`: Post aguardando aprovação (padrão para novos posts)
  - `'approved'`: Post aprovado e visível no feed
  - `'rejected'`: Post rejeitado e não visível

### 2. **Tabela `moderation_queue`**
Armazena reportes de posts feitos por usuários.

**Campos principais:**
- `post_id`: ID do post reportado
- `reported_by_email`: Email do usuário que reportou
- `reported_by_name`: Nome do usuário que reportou
- `reason`: Motivo do reporte (opcional)
- `status`: Estado do reporte (`'pending'`, `'reviewed'`, `'resolved'`)

### 3. **Tabela `moderators`**
Lista de emails autorizados a moderar conteúdo.

**Campos:**
- `email`: Email do moderador (PRIMARY KEY)
- `created_at`: Data de criação do registro

**Moderadores cadastrados:**
- ✅ `gab.zanette2007@gmail.com`
- ✅ `guilhermeludovico555@gmail.com`

**Importante:** Apenas estes dois emails podem acessar a página `/admin` e moderar posts.

### 4. **Tabela `fake_user_profiles`**
Armazena perfis fake usados apenas para posts mockados, separados dos perfis reais.

**Campos:**
- `id`: UUID (PRIMARY KEY)
- `email`: Email fake (único, formato: `*@example.com`)
- `name`: Nome do perfil fake
- `photo_url`: URL da foto (opcional)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

**Perfis fake criados automaticamente:**
- `sylvie@example.com` - Sylvie Beaudoin
- `lutgarde@example.com` - Lutgarde JAMAER
- `antoine@example.com` - Antoine Dupont
- `jean@example.com` - Jean Dupont
- `louis@example.com` - Louis Fontaine
- `pierre@example.com` - Pierre Dubois
- `marie@example.com` - Marie
- `sophie@example.com` - Sophie

**Vantagens:**
- ✅ Não polui a tabela `user_profiles` com dados fake
- ✅ Facilita limpeza e manutenção
- ✅ Separação clara entre dados reais e mockados
- ✅ Pode ser deletada completamente sem afetar usuários reais
- ✅ Posts mockados referenciam `fake_user_profiles.id` em vez de `user_profiles.id`

**Nota Técnica:**
- A coluna `user_profile_id` em `community_posts` e `feed_comments` pode referenciar tanto `user_profiles.id` quanto `fake_user_profiles.id`
- A foreign key constraint foi removida para permitir essa flexibilidade
- O código busca fotos de perfil em ambas as tabelas automaticamente

---

## 🔄 Fluxo de Moderação

### **Criação de Post**
1. Usuário cria um post → Status: `'pending'`
2. Post **NÃO aparece** no feed público
3. Usuário recebe mensagem: *"Publication soumise pour modération..."*

### **Aprovação/Rejeição (Admin)**
1. Admin acessa `/admin`
2. Visualiza posts pendentes na aba "Posts en attente"
3. Clica em "Approuver" ou "Rejeter"
4. Se aprovado → Status muda para `'approved'` → Post aparece no feed
5. Se rejeitado → Status muda para `'rejected'` → Post não aparece

### **Reporte de Post**
1. Usuário clica no botão "Reportar" (bandeira) em um post
2. Reporte é adicionado à `moderation_queue`
3. Admin visualiza na aba "Signalements" em `/admin`
4. Admin pode aprovar ou rejeitar o post reportado

---

## 🛡️ Validações e Restrições

### **Comentários e Reações**
- ✅ **Apenas posts `'approved'`** permitem comentários
- ✅ **Apenas posts `'approved'`** permitem reações (likes)
- ❌ Posts `'pending'` ou `'rejected'` bloqueiam interações

### **Acesso à Página Admin**
- ✅ Apenas emails cadastrados em `moderators` podem acessar `/admin`
- ✅ Verificação feita via função `isModerator()` que consulta a tabela `moderators`
- ❌ Usuários não moderadores são redirecionados automaticamente
- ❌ Mensagem de erro exibida: "Vous n'êtes pas autorisé à accéder à cette page"

### **Botão Reportar**
- ✅ Aparece apenas em posts de **outros usuários**
- ❌ Não aparece no próprio post do usuário

---

## 📁 Arquivos do Sistema

### **SQL Scripts**
- `sql/MODERATION_SYSTEM.sql`: Cria estrutura de moderação
  - Adiciona coluna `status` em `community_posts`
  - Cria tabela `moderation_queue`
  - Cria tabela `moderators` com emails autorizados
  - Cria tabela `fake_user_profiles` para perfis mockados
  - Configura RLS policies

### **TypeScript Services**
- `src/services/feedService.ts`:
  - `createCommunityPost()`: Cria posts com status `'pending'`
  - `fetchCommunityPosts()`: Filtra apenas posts `'approved'`, busca fotos de perfil de `user_profiles` e `fake_user_profiles`
  - `reportPost()`: Adiciona reporte à fila
  - `fetchPendingPosts()`: Busca posts pendentes (admin), busca fotos de ambas as tabelas
  - `fetchModerationQueue()`: Busca reportes (admin)
  - `approvePost()`: Aprova post
  - `rejectPost()`: Rejeita post
  - `isModerator()`: Verifica se usuário atual é moderador (consulta tabela `moderators`)
  - `createComment()`: Valida se post está aprovado antes de permitir comentário
  - `saveReactionToDatabase()`: Valida se post está aprovado antes de permitir reação
  - `fetchComments()`: Busca fotos de perfil de ambas as tabelas (`user_profiles` e `fake_user_profiles`)
  - `initializeMockPosts()`: Cria perfis fake em `fake_user_profiles` (não em `user_profiles`)

### **React Components**
- `src/pages/AdminPage.tsx`: Interface de moderação
  - Aba "Posts en attente": Lista posts pendentes
  - Aba "Signalements": Lista posts reportados
  - Botões de aprovação/rejeição

- `src/pages/CommunautePage.tsx`:
  - Botão "Reportar" em posts de outros usuários
  - Mensagem informando que posts estão pendentes

- `src/App.tsx`:
  - Rota `/admin` configurada

---

## 🚀 Como Usar

### **1. Configuração Inicial**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: sql/MODERATION_SYSTEM.sql
```

### **2. Acessar Página Admin**
- URL: `http://localhost:5173/admin` (ou sua URL de produção)
- Apenas moderadores cadastrados podem acessar

### **3. Moderar Posts**
1. Acesse `/admin`
2. Veja posts pendentes na primeira aba
3. Clique em "Approuver" ou "Rejeter"
4. Posts aprovados aparecem automaticamente no feed

### **4. Gerenciar Reportes**
1. Acesse `/admin`
2. Vá para a aba "Signalements"
3. Veja posts reportados com motivo (se fornecido)
4. Aprove ou rejeite conforme necessário

---

## 🔐 Segurança

### **Row Level Security (RLS)**
- ✅ `moderation_queue`: Usuários podem inserir reportes, mas apenas moderadores veem todos
- ✅ `moderators`: Apenas leitura pública (verificação de email)
- ✅ `fake_user_profiles`: Acesso público para leitura (dados mockados)

### **Validação de Moderador**
- Verificação no frontend (`AdminPage.tsx`)
- Verificação no backend via função `isModerator()`
- Em produção, adicionar validação adicional no Supabase RLS

---

## 📊 Perfis Fake

### **Estrutura**
- Tabela separada: `fake_user_profiles`
- Usada apenas para posts mockados iniciais
- Não interfere com perfis reais de usuários

### **Vantagens**
- ✅ Banco de dados limpo
- ✅ Fácil remoção de dados fake
- ✅ Separação clara entre dados reais e mockados
- ✅ Não polui `user_profiles`

### **Uso**
- Posts mockados referenciam `fake_user_profiles.id`
- Feed busca fotos de perfil de ambas as tabelas (real + fake)
- Quando necessário, pode-se deletar todos os perfis fake sem afetar usuários reais

---

## ⚠️ Importante

1. **Posts existentes**: Ao executar o script, posts existentes são marcados como `'approved'` para não quebrar o feed atual.

2. **Moderadores**: 
   - Apenas os emails especificados (`gab.zanette2007@gmail.com` e `guilhermeludovico555@gmail.com`) podem acessar `/admin`
   - Para adicionar novos moderadores, insira na tabela `moderators`
   - A verificação é feita automaticamente ao acessar a página admin

3. **Perfis Fake**: 
   - Os perfis fake são criados automaticamente em `fake_user_profiles` (não em `user_profiles`)
   - O script migra perfis fake existentes de `user_profiles` para `fake_user_profiles`
   - A foreign key constraint foi removida para permitir referências a ambas as tabelas
   - O código busca fotos de perfil em ambas as tabelas automaticamente

4. **Performance**: Índices foram criados em `status` e `created_at` para otimizar consultas.

5. **Limpeza do Banco**: 
   - Perfis fake podem ser deletados de `fake_user_profiles` sem afetar usuários reais
   - A tabela `user_profiles` permanece limpa, contendo apenas usuários reais
   - Posts mockados continuam funcionando mesmo após deletar perfis fake (apenas sem foto)

---

## 🔧 Manutenção

### **Adicionar Novo Moderador**
```sql
INSERT INTO moderators (email) 
VALUES ('novo-moderador@email.com')
ON CONFLICT (email) DO NOTHING;
```

### **Remover Moderador**
```sql
DELETE FROM moderators 
WHERE email = 'email-para-remover@email.com';
```

### **Limpar Perfis Fake**
```sql
-- CUIDADO: Isso deletará todos os perfis fake
-- Os posts mockados continuarão existindo, mas sem foto de perfil
DELETE FROM fake_user_profiles;

-- Para deletar também os posts mockados:
DELETE FROM community_posts 
WHERE user_email LIKE '%@example.com';
```

### **Migrar Perfis Fake Existentes**
O script `sql/MODERATION_SYSTEM.sql` já faz isso automaticamente:
- Busca perfis fake em `user_profiles` (emails `*@example.com`)
- Cria equivalentes em `fake_user_profiles`
- Atualiza referências em `community_posts` e `feed_comments`
- Permite limpeza posterior de `user_profiles`

### **Ver Posts Rejeitados**
```sql
SELECT * FROM community_posts 
WHERE status = 'rejected' 
ORDER BY created_at DESC;
```

---

## 📝 Notas Técnicas

- **Status padrão**: Novos posts sempre começam como `'pending'`
- **Validação de comentários**: Verifica status antes de permitir comentário
- **Validação de reações**: Verifica status antes de permitir like
- **Reportes**: Um post pode ter múltiplos reportes
- **Cascata**: Ao aprovar/rejeitar, reportes relacionados são marcados como resolvidos
- **user_profile_id**: 
  - Pode referenciar `user_profiles.id` (usuários reais) ou `fake_user_profiles.id` (perfis fake)
  - Foreign key constraint removida para permitir flexibilidade
  - Código busca fotos de perfil em ambas as tabelas automaticamente
  - Posts mockados usam `fake_user_profiles`, posts reais usam `user_profiles`

---

## ✅ Checklist de Implementação

- [x] Script SQL criado e testado
- [x] Coluna `status` adicionada em `community_posts`
- [x] Tabela `moderation_queue` criada
- [x] Tabela `moderators` criada com emails especificados
- [x] Tabela `fake_user_profiles` criada
- [x] RLS policies configuradas
- [x] Funções de moderação implementadas
- [x] Página Admin criada
- [x] Validações de comentários/reações implementadas
- [x] Botão de reportar adicionado
- [x] Perfis fake movidos para tabela separada
- [x] Documentação completa

---

**Última atualização**: Sistema completo e funcional ✅

