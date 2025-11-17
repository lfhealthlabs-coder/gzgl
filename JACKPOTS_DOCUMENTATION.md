# 🎰 Documentação Completa dos Jackpots

## 📋 Visão Geral

Este documento descreve todos os jackpots disponíveis no sistema, incluindo informações sobre loterias, valores, datas de sorteio, frequência, próxima data de sorteio e engajamento.

---

## 🗄️ Estrutura do Banco de Dados

### **Tabela `lotteries`**
Armazena todas as loterias disponíveis no sistema.

**Campos:**
- `id`: Identificador único da loteria (TEXT)
- `name`: Nome da loteria
- `url`: URL oficial da loteria
- `region`: Região (`europe`, `france`, `international`)
- `pays`: País de origem
- `probabilite`: Probabilidade de ganhar
- `has_api`: Se a loteria possui API disponível
- `api_url`: URL da API (se disponível)

### **Tabela `jackpots`**
Armazena todos os jackpots ativos e históricos.

**Campos:**
- `id`: UUID único do jackpot
- `lottery_id`: Referência à loteria (FK)
- `valeur`: Valor do jackpot (NUMERIC)
- `tirage`: Dia da semana do sorteio
- `date_limite`: Data limite para apostas
- `date_tirage`: Data do sorteio
- `notes`: Notas/descrição do jackpot
- `is_past`: Se o sorteio já aconteceu (BOOLEAN)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### **Tabela `feed_reactions`**
Armazena reações (likes) nos jackpots.

**Formato do `feed_item_id` para jackpots:**
- `jackpot_{uuid}` - Exemplo: `jackpot_123e4567-e89b-12d3-a456-426614174000`

---

## 📊 Loterias Cadastradas

### **França (10 loterias)**
1. **Loto** - `loto-fr`
   - Probabilidade: 1 sur 19 068 840
   - API: ✅ Disponível

2. **EuroMillions My Million** - `euromillions-fr`
   - Probabilidade: 1 sur 139 838 160
   - API: ✅ Disponível

3. **Keno** - `keno-fr`
   - Probabilidade: 1 sur 2 147 181
   - API: ✅ Disponível

4. **Loto Super Cagnotte** - `loto-super-cagnotte`
   - Probabilidade: 1 sur 19 068 840
   - API: ❌ Não disponível

5. **EuroDreams** - `eurodreams-fr`
   - Probabilidade: 1 sur 19 191 900
   - API: ❌ Não disponível

6. **Amigo** - `amigo-fr`
   - Probabilidade: 1 sur 1 906 884
   - API: ❌ Não disponível

7. **Cash** - `cash-fr`
   - Probabilidade: 1 sur 324 632
   - API: ❌ Não disponível

8. **Loto Week-end** - `loto-week-end`
   - Probabilidade: 1 sur 19 068 840
   - API: ❌ Não disponível

9. **Quinté+** - `quinté-plus`
   - Probabilidade: 1 sur 7 893 600
   - API: ❌ Não disponível

10. **Joker+** - `joker-plus`
    - Probabilidade: 1 sur 1 000 000
    - API: ❌ Não disponível

### **Europa (27 loterias)**
1. **EuroMillions** - `euromillions`
2. **Eurojackpot** - `eurojackpot`
3. **SuperEnalotto** - `superenalotto`
4. **El Gordo** - `el-gordo`
5. **UK National Lottery** - `lotto-uk`
6. **UK Thunderball** - `thunderball-uk`
7. **EuroDreams** - `eurodreams-eu`
8. **Lotto 6aus49** - `lotto-allemagne`
9. **Lotto Autriche** - `lotto-austria`
10. **Viking Lotto** - `viking-lotto`
11. **Irish Lotto** - `irish-lotto`
12. **Swiss Lotto** - `swiss-lotto`
13. **Lotto Pologne** - `polish-lotto`
14. **Lotto Pays-Bas** - `dutch-lotto`
15. **Greek Lotto** - `greek-lotto`
16. **Lotto Belgique** - `belgian-lotto`
17. **Set For Life** - `set-for-life-uk`
18. **La Primitiva** - `la-primitiva`
19. **Bonoloto** - `bonoloto`
20. **Totoloto** - `lotto-portugal`
21. **Swedish Lotto** - `swedish-lotto`
22. **Norway Lotto** - `norway-lotto`
23. **Denmark Lotto** - `denmark-lotto`
24. **Veikkaus Lotto** - `finnish-lotto`
25. **Sportka** - `czech-lotto`
26. **Hatoslottó** - `hungarian-lotto`
27. **Lotto Croatia** - `croatian-lotto`

### **Internacional (6 loterias)**
1. **Powerball** - `powerball`
   - País: USA
   - Probabilidade: 1 sur 292 201 338
   - API: ✅ Disponível

2. **Mega Millions** - `mega-millions`
   - País: USA
   - Probabilidade: 1 sur 302 575 350
   - API: ✅ Disponível

3. **Mega-Sena** - `mega-sena`
   - País: Brésil
   - Probabilidade: 1 sur 50 063 860
   - API: ✅ Disponível

4. **Oz Lotto** - `oz-lotto`
   - País: Australie
   - Probabilidade: 1 sur 45 379 620
   - API: ❌ Não disponível

5. **Lotto Max** - `lotto-max`
   - País: Canada
   - Probabilidade: 1 sur 33 294 800
   - API: ❌ Não disponível

6. **Lotto 6/49** - `lotto-649`
   - País: Canada
   - Probabilidade: 1 sur 13 983 816
   - API: ❌ Não disponível

---

## 🔄 Geração Automática de Jackpots

### **Função `generate_jackpots()`**

A função SQL `generate_jackpots()` é responsável por:

1. **Limpar jackpots antigos**: Remove jackpots passados com mais de 30 dias
2. **Gerar jackpots futuros**: Cria um jackpot futuro (1 a 30 dias) para cada loteria
3. **Gerar jackpots passados**: Para loterias com API, cria 2 sorteios passados (7 e 14 dias atrás)

### **Valores Base por Região:**
- **França**: 2M a 32M EUR
- **Europa**: 10M a 160M EUR
- **Internacional**: 50M a 350M EUR

### **Atualização Automática:**
- Os jackpots são regenerados automaticamente às 4h da manhã
- A função pode ser chamada manualmente via `SELECT generate_jackpots();`

---

## ❤️ Engajamento Fake (Likes)

### **Sistema de Reações**

Os jackpots recebem reações fake (likes) baseadas no valor:

- **≥ 200M**: 30 a 60 likes
- **≥ 100M**: 20 a 40 likes
- **≥ 50M**: 15 a 30 likes
- **< 50M**: 10 a 30 likes

### **Script de Adição:**
Execute `sql/ADD_FAKE_JACKPOT_REACTIONS.sql` para adicionar reações fake aos jackpots.

**Características:**
- Usa perfis fake de `fake_user_profiles`
- Distribui reações aleatoriamente entre usuários
- Evita duplicatas (um usuário = um like por jackpot)
- Apenas jackpots futuros recebem reações

---

## 📤 Exportação para CSV

### **Script SQL:**
Execute `sql/EXPORT_JACKPOTS_CSV.sql` para gerar um CSV com todos os jackpots.

### **Colunas do CSV:**
1. `id` - UUID do jackpot
2. `loterie` - Nome da loteria
3. `region` - Região (europe/france/international)
4. `pays` - País
5. `valeur` - Valor do jackpot
6. `jour_semaine` - Dia da semana do sorteio
7. `date_limite` - Data limite para apostas
8. `date_tirage` - Data do sorteio
9. `notes` - Notas/descrição
10. `deja_tire` - Se já foi sorteado (true/false)
11. `nombre_likes` - Número de likes (contado dinamicamente)
12. `date_creation` - Data de criação
13. `date_mise_a_jour` - Data de atualização

### **Como Exportar:**
1. Abra o Supabase SQL Editor
2. Execute a query em `sql/EXPORT_JACKPOTS_CSV.sql`
3. Clique no botão "Download CSV" (ícone de download) ou copie os resultados
4. Salve como `jackpots_export.csv`

### **Exportar por Data Específica:**
Para exportar apenas jackpots de uma data específica, modifique a query:

```sql
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
WHERE DATE(j.date_tirage) = '2025-11-20' -- Substitua pela data desejada
ORDER BY j.valeur DESC;
```

---

## 🔍 Pesquisa por Data

### **Buscar Jackpots por Data de Sorteio:**
```sql
SELECT 
  j.*,
  l.name AS loterie,
  l.region,
  l.pays
FROM jackpots j
INNER JOIN lotteries l ON j.lottery_id = l.id
WHERE DATE(j.date_tirage) = '2025-11-20' -- Substitua pela data desejada
ORDER BY j.valeur DESC;
```

### **Buscar Jackpots Futuros:**
```sql
SELECT 
  j.*,
  l.name AS loterie
FROM jackpots j
INNER JOIN lotteries l ON j.lottery_id = l.id
WHERE j.is_past = false
  AND j.date_tirage >= NOW()
ORDER BY j.date_tirage ASC, j.valeur DESC;
```

### **Buscar Jackpots Passados:**
```sql
SELECT 
  j.*,
  l.name AS loterie
FROM jackpots j
INNER JOIN lotteries l ON j.lottery_id = l.id
WHERE j.is_past = true
ORDER BY j.date_tirage DESC, j.valeur DESC;
```

---

## 📁 Arquivos Relacionados

### **SQL Scripts:**
- `sql/JACKPOTS_TABLES.sql` - Criação das tabelas e função de geração
- `sql/ADD_FAKE_JACKPOT_REACTIONS.sql` - Adiciona reações fake
- `sql/EXPORT_JACKPOTS_CSV.sql` - Exporta para CSV

### **TypeScript Services:**
- `src/services/jackpotService.ts` - Serviço de gerenciamento de jackpots
- `src/services/feedService.ts` - Integração com o feed

### **Páginas:**
- `src/pages/BonusPage.tsx` - Página de jackpots e resultados
- `src/pages/CommunautePage.tsx` - Feed com jackpots integrados

---

## 🚀 Como Usar

### **1. Configuração Inicial**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: sql/JACKPOTS_TABLES.sql
```

### **2. Adicionar Reações Fake**
```sql
-- Execute após gerar os jackpots
-- Arquivo: sql/ADD_FAKE_JACKPOT_REACTIONS.sql
```

### **3. Exportar para CSV**
```sql
-- Execute para exportar todos os jackpots
-- Arquivo: sql/EXPORT_JACKPOTS_CSV.sql
```

---

## 📊 Estatísticas

### **Total de Loterias:**
- **França**: 10 loterias
- **Europa**: 27 loterias
- **Internacional**: 6 loterias
- **Total**: 43 loterias

### **Geração de Jackpots:**
- Cada loteria recebe 1 jackpot futuro
- Loterias com API recebem 2 jackpots passados adicionais
- Total estimado: ~60-80 jackpots ativos

---

## ⚠️ Notas Importantes

1. **Atualização Automática**: Os jackpots são regenerados automaticamente às 4h da manhã
2. **Limpeza Automática**: Jackpots passados com mais de 30 dias são removidos automaticamente
3. **Reações Fake**: Apenas jackpots futuros recebem reações fake
4. **Valores**: Os valores são gerados aleatoriamente dentro das faixas por região
5. **Datas**: As datas de sorteio são geradas aleatoriamente (1 a 30 dias no futuro)

---

## 🔗 Referências

- **Supabase Dashboard**: Acesse para visualizar e gerenciar os dados
- **SQL Editor**: Use para executar queries personalizadas
- **Table Editor**: Visualize e edite dados diretamente

---

**Última atualização**: Novembro 2025

