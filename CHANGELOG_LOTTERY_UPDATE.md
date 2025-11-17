# 📝 Changelog - Atualização do Sistema de Loterias

## 🎯 Objetivo
Integrar todas as informações do arquivo CSV e MD no banco de dados, adicionar frequência, próxima data de sorteio (auto-atualizável), calcular valor médio de prêmios e exibir informações completas no feed da comunidade.

---

## ✅ Alterações Realizadas

### 1. **Banco de Dados** (`sql/UPDATE_LOTTERIES_WITH_FREQUENCY.sql`)

#### Novos Campos na Tabela `lotteries`:
- `draw_days`: Dias da semana dos sorteios (ex: "Lundi, Mercredi, Samedi")
- `draw_frequency`: Frequência dos sorteios (ex: "3 fois par semaine")
- `prize_value`: Valor do prêmio em texto (ex: "Jackpot minimum 2 millions €")
- `prize_value_avg`: Valor médio calculado automaticamente (NUMERIC)
- `number_format`: Formato dos números (ex: "5/49 + 1/10")
- `description`: Descrição detalhada em francês
- `next_draw_date`: Próxima data de sorteio calculada automaticamente (TIMESTAMP)

#### Funções SQL Criadas:
1. **`calculate_prize_average(prize_text TEXT)`**
   - Calcula o valor médio de prêmios quando há faixa de valores
   - Suporta formatos: "€2M a €32M", "US$20M a US$2B", etc.
   - Converte bilhões, milhões e milhares corretamente

2. **`calculate_next_draw_date(draw_days_text TEXT, draw_frequency_text TEXT)`**
   - Calcula automaticamente a próxima data de sorteio
   - Suporta:
     - Dias específicos da semana (ex: "Segunda, Quarta, Sábado")
     - Frequências diárias
     - Frequências semanais
     - Frequências ocasionais (retorna NULL)

3. **`update_lottery_from_csv(...)`**
   - Função auxiliar para atualizar loterias com dados do CSV
   - Calcula automaticamente valor médio e próxima data

4. **`refresh_next_draw_dates()`**
   - Atualiza todas as próximas datas de sorteio
   - Pode ser executada periodicamente para manter datas atualizadas

#### Trigger Automático:
- `trigger_update_next_draw_date`: Recalcula próxima data quando `draw_days` ou `draw_frequency` são alterados

---

### 2. **Serviço de Feed** (`src/services/feedService.ts`)

#### Interface `FeedItem` Atualizada:
```typescript
// Novos campos para jackpots
next_draw_date?: Date;
draw_frequency?: string;
draw_days?: string;
prize_value?: string;
number_format?: string;
description?: string;
region?: string;
pays?: string;
```

#### Função `fetchJackpots()` Atualizada:
- Agora busca todas as informações da loteria relacionada
- Inclui: frequência, dias, formato, descrição, próxima data, etc.

---

### 3. **Componente da Comunidade** (`src/pages/CommunautePage.tsx`)

#### Exibição de Jackpots Melhorada:
- **Valor do Jackpot**: Exibido em destaque com formatação de moeda
- **Próxima Data de Sorteio**: Exibida em formato completo (ex: "lundi 20 novembre 2025")
- **Frequência e Dias**: Mostra frequência e dias da semana
- **Formato dos Números**: Exibe o formato do jogo (ex: "5/49 + 1/10")
- **Valor do Prêmio**: Mostra a faixa de valores do prêmio
- **Descrição**: Exibe descrição completa da loteria
- **País**: Mostra o país de origem da loteria

#### Traduções em Francês:
- Todos os textos do componente estão em francês
- Formatação de datas em francês
- Formatação de moeda em EUR

---

### 4. **Documentações Traduzidas**

#### Arquivos Atualizados:
- `LOTTERY_SYSTEM_DOCUMENTATION.md`: Traduzido para português
- `JACKPOTS_DOCUMENTATION.md`: Atualizado com novas informações
- `README_LOTTERY_APIS.md`: Traduzido para português

---

## 📊 Dados Integrados do CSV

### Informações Incluídas:
- ✅ Nome da loteria
- ✅ Região (france, europe, international)
- ✅ País de origem
- ✅ Dias de sorteio
- ✅ Frequência de sorteios
- ✅ Valor do prêmio (texto)
- ✅ Valor médio calculado (quando há faixa)
- ✅ Formato dos números
- ✅ Descrição detalhada
- ✅ Próxima data de sorteio (calculada automaticamente)

### Total de Loterias:
- **50 loterias** de 30+ países
- **10 loterias francesas**
- **30 loterias europeias**
- **10 loterias internacionais**

---

## 🔄 Atualização Automática

### Próxima Data de Sorteio:
- Calculada automaticamente quando a loteria é criada/atualizada
- Recalculada quando `draw_days` ou `draw_frequency` mudam
- Pode ser atualizada periodicamente executando `refresh_next_draw_dates()`

### Valor Médio do Prêmio:
- Calculado automaticamente quando há faixa de valores
- Armazenado em `prize_value_avg` para consultas rápidas

---

## 🚀 Como Usar

### 1. Executar Script SQL:
```sql
-- Execute no Supabase SQL Editor
sql/UPDATE_LOTTERIES_WITH_FREQUENCY.sql
```

### 2. Verificar Dados:
```sql
-- Verificar loterias com próxima data
SELECT name, draw_days, draw_frequency, next_draw_date, prize_value_avg
FROM lotteries
ORDER BY next_draw_date;
```

### 3. Atualizar Próximas Datas (se necessário):
```sql
-- Atualizar todas as próximas datas
SELECT refresh_next_draw_dates();
```

---

## 📱 Interface do Usuário

### Feed da Comunidade:
Os jackpots agora exibem:
- 🏆 Nome da loteria e país
- 💰 Valor do jackpot em destaque
- 📅 Próxima data de sorteio formatada
- 📊 Frequência e dias de sorteio
- 🎲 Formato dos números
- 💵 Faixa de valores do prêmio
- 📝 Descrição completa

### Exemplo Visual:
```
🏆 Loto (França)
💰 15.000.000 €

🗓️ Prochain tirage: lundi 20 novembre 2025
📅 3 fois par semaine - Lundi, Mercredi, Samedi
🎲 Format: 5/49 + 1/10
💰 Jackpot minimum 2 millions €; accumule +1M€ par tirage
📝 Loterie nationale française avec trois tirages hebdomadaires...
```

---

## ⚠️ Notas Importantes

1. **Próxima Data**: Atualizada automaticamente, mas pode ser recalculada manualmente se necessário
2. **Valor Médio**: Calculado apenas quando há faixa de valores (ex: "€2M a €32M")
3. **Frequência Diária**: Para loterias diárias, a próxima data é sempre "amanhã"
4. **Frequência Ocasional**: Para sorteios especiais, a próxima data pode ser NULL

---

## 🔧 Manutenção

### Atualizar Próximas Datas:
Execute periodicamente (ex: diariamente às 00:00):
```sql
SELECT refresh_next_draw_dates();
```

### Verificar Loterias sem Próxima Data:
```sql
SELECT name, draw_days, draw_frequency
FROM lotteries
WHERE next_draw_date IS NULL
AND draw_frequency NOT ILIKE '%ocasional%';
```

---

**Data da Atualização**: Novembro 2025
**Versão**: 2.0.0

