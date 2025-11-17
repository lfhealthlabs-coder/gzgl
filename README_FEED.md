# 📱 Sistema de Feed - Integração com Banco de Dados

## ✅ O QUE FOI IMPLEMENTADO

O feed da comunidade agora está totalmente integrado com o banco de dados Supabase, permitindo que qualquer usuário publique posts, reaja e comente, com todas as informações sendo salvas e sincronizadas automaticamente.

### Funcionalidades:
- ✅ Posts da comunidade salvos no banco de dados
- ✅ Reações (like, insight, celebrate) persistidas no banco
- ✅ Comentários salvos no banco de dados
- ✅ Atualizações diárias (Mises à jour quotidiennes) integradas
- ✅ Jackpots exibidos no feed
- ✅ Paginação com cursor de 20 itens
- ✅ Filtros por fonte (community, daily, jackpot)
- ✅ Ordenação por data decrescente

---

## 🗄️ TABELAS DO BANCO DE DADOS

### 1. Executar Script SQL

Execute o arquivo `sql/FEED_TABLES.sql` no Supabase SQL Editor para criar todas as tabelas necessárias:

```sql
-- Tabelas criadas:
- community_posts      (posts da comunidade)
- daily_updates        (atualizações diárias)
- feed_reactions       (reações dos usuários)
- feed_comments        (comentários nos posts)
```

### 2. Estrutura das Tabelas

#### `community_posts`
Armazena os posts publicados pelos usuários na comunidade.

```sql
- id (UUID)
- user_email (TEXT)
- user_name (TEXT)
- content (TEXT)
- image_url (TEXT, opcional)
- likes_count (INTEGER)
- comments_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `daily_updates`
Armazena as atualizações diárias (Mises à jour quotidiennes).

```sql
- id (UUID)
- title (TEXT)
- content (TEXT)
- excerpt (TEXT, opcional)
- icon (TEXT, opcional)
- image_url (TEXT, opcional)
- lottery_id (TEXT, opcional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `feed_reactions`
Armazena as reações dos usuários nos itens do feed.

```sql
- id (UUID)
- feed_item_id (TEXT)      -- ID do item (community_X, daily_X, jackpot_X)
- feed_source (TEXT)       -- 'community', 'daily', 'jackpot'
- user_email (TEXT)
- reaction_type (TEXT)     -- 'like', 'insight', 'celebrate'
- created_at (TIMESTAMP)
```

#### `feed_comments`
Armazena os comentários nos posts da comunidade.

```sql
- id (UUID)
- feed_item_id (TEXT)
- feed_source (TEXT)
- user_email (TEXT)
- user_name (TEXT)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🚀 COMO USAR

### 1. Criar Post na Comunidade

Quando um usuário publica um post através do composer:
- O post é salvo automaticamente no Supabase
- O feed é recarregado para exibir o novo post
- O post aparece no topo do feed (mais recente primeiro)

### 2. Reagir a um Item

Os usuários podem reagir com:
- **Like** ❤️ (verde)
- **Insight** 💡 (azul)
- **Celebrate** 🎉 (amarelo)

As reações são:
- Salvas no banco de dados
- Sincronizadas entre todos os usuários
- Persistidas mesmo após recarregar a página

### 3. Comentar em um Post

- Apenas posts da comunidade podem receber comentários
- Os comentários são salvos no banco de dados
- O contador de comentários é atualizado automaticamente

### 4. Filtros

Os usuários podem filtrar o feed por:
- **Tous** - Todos os itens
- **Communauté** - Apenas posts da comunidade
- **Mises à jour** - Apenas atualizações diárias
- **Jackpots** - Apenas jackpots

---

## 📝 ADICIONAR ATUALIZAÇÕES DIÁRIAS

Para adicionar uma nova atualização diária, você pode:

### Opção 1: Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** > `daily_updates`
3. Clique em **Insert** > **Insert row**
4. Preencha os campos:
   - `title`: Título da atualização
   - `content`: Conteúdo completo
   - `excerpt`: Resumo (opcional)
   - `icon`: Nome do ícone (opcional)
   - `image_url`: URL da imagem (opcional)
   - `lottery_id`: ID da loteria relacionada (opcional)

### Opção 2: Via SQL
```sql
INSERT INTO daily_updates (title, content, excerpt, icon)
VALUES (
  'Título da atualização',
  'Conteúdo completo da atualização...',
  'Resumo da atualização',
  'newspaper'
);
```

---

## 🔄 SINCRONIZAÇÃO

- **Posts**: Salvos imediatamente no banco ao publicar
- **Reações**: Sincronizadas em tempo real
- **Comentários**: Salvos e contados automaticamente
- **Feed**: Recarrega automaticamente após publicar/comentar

---

## ⚠️ IMPORTANTE

1. **Execute o SQL**: Certifique-se de executar `sql/FEED_TABLES.sql` no Supabase antes de usar
2. **Variáveis de Ambiente**: Verifique se `.env` tem as credenciais do Supabase
3. **RLS (Row Level Security)**: As políticas estão configuradas para permitir acesso anônimo (para desenvolvimento)

---

## 🐛 TROUBLESHOOTING

### Erro ao publicar post
- Verifique se o usuário está logado (email no localStorage)
- Verifique se a tabela `community_posts` existe no Supabase
- Verifique as políticas RLS no Supabase

### Reações não aparecem
- Verifique se a tabela `feed_reactions` existe
- Verifique se o `feed_item_id` está correto (formato: `community_UUID`)

### Comentários não salvam
- Verifique se a tabela `feed_comments` existe
- Verifique se o trigger de atualização de contador está ativo

---

## 📊 PRÓXIMOS PASSOS (Opcional)

- [ ] Adicionar upload de imagens para posts (Storage do Supabase)
- [ ] Implementar edição/exclusão de posts próprios
- [ ] Adicionar notificações quando alguém reage/comenta
- [ ] Implementar busca no feed
- [ ] Adicionar sistema de hashtags

---

**Última atualização:** 2025-01-XX



