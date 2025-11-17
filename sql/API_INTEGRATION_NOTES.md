# 🔌 Notas de Integração de APIs das Loterias

## 📡 APIs Disponíveis (6 loterias)

### **França (3 APIs)**

#### 1. **Loto** ✅
- **URL Base**: `https://www.fdj.fr`
- **Endpoint**: `/api/loto` (não documentado publicamente)
- **Método**: GET
- **Frequência**: 3x/semana (Segunda, Quarta, Sábado)
- **Formato**: 5/49 + 1/10
- **Notas**: A FDJ não oferece API pública oficial. Dados podem ser obtidos via scraping do site oficial ou fontes agregadoras.

#### 2. **EuroMillions My Million** ✅
- **URL Base**: `https://www.fdj.fr`
- **Endpoint**: `/api/euromillions` (não documentado publicamente)
- **Método**: GET
- **Frequência**: 2x/semana (Terça, Sexta)
- **Formato**: 5/50 + 2/12
- **Notas**: Mesma situação do Loto - sem API pública oficial da FDJ.

#### 3. **Keno Gagnant à Vie** ✅
- **URL Base**: `https://www.fdj.fr`
- **Endpoint**: `/jeux-de-tirage/keno` (página de resultados)
- **Método**: GET (scraping)
- **Frequência**: Diária (1x/dia)
- **Formato**: 20 números sorteados de 1-56
- **Notas**: Resultados disponíveis na página oficial, mas sem API REST pública.

---

### **Internacional (3 APIs)**

#### 4. **Powerball (EUA)** ✅
- **URL Base**: `https://www.powerball.com`
- **Endpoint**: `/api/v1/numbers/powerball/recent10?_format=json`
- **Método**: GET
- **Frequência**: 3x/semana (Segunda, Quarta, Sábado)
- **Formato**: 5/69 + 1/26
- **Exemplo de Request**:
  ```bash
  curl "https://www.powerball.com/api/v1/numbers/powerball/recent10?_format=json"
  ```
- **Exemplo de Response**:
  ```json
  {
    "draw_date": "2025-11-16",
    "winning_numbers": "12 23 34 45 56",
    "multiplier": "2",
    "jackpot": "$100,000,000"
  }
  ```
- **Notas**: API oficial disponível para os últimos 10 sorteios.

#### 5. **Mega Millions (EUA)** ✅
- **URL Base**: `https://www.megamillions.com`
- **Endpoint**: `/api/numbers` (endpoint aproximado, não documentado oficialmente)
- **Método**: GET
- **Frequência**: 2x/semana (Terça, Sexta)
- **Formato**: 5/70 + 1/25
- **Notas**: Mega Millions não possui API REST pública bem documentada. Resultados são divulgados via feed RSS ou scraping do site oficial.

#### 6. **Mega-Sena (Brasil)** ✅
- **URL Base**: `https://servicebus2.caixa.gov.br`
- **Endpoint**: `/portaldeloterias/api/megasena`
- **Método**: GET
- **Frequência**: 2x/semana (Quarta, Sábado)
- **Formato**: 6/60
- **Exemplo de Request**:
  ```bash
  curl "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena"
  ```
- **Exemplo de Response**:
  ```json
  {
    "numero": 2645,
    "dataApuracao": "16/11/2025",
    "listaDezenas": ["05", "12", "23", "34", "45", "56"],
    "valorEstimadoProximoConcurso": 3000000.00
  }
  ```
- **Notas**: API oficial da Caixa Econômica Federal. Retorna JSON com resultados e próximo prêmio estimado.

---

## 🚧 Limitações e Alternativas

### **Loterias sem API Pública**

A maioria das loterias europeias (41 de 47) **não possui APIs públicas oficiais**. As alternativas são:

1. **Web Scraping**: Extrair dados diretamente das páginas de resultados
   - Exemplo: BeautifulSoup (Python), Puppeteer (Node.js)
   - Risco: Mudanças no HTML quebram o scraper

2. **APIs de Terceiros**:
   - **Lottery Data API**: `https://api.lotterydata.com` (pago)
   - **The Odds API**: `https://the-odds-api.com` (pago)
   - **RapidAPI**: Várias APIs de loterias disponíveis

3. **Feeds RSS/XML**:
   - Algumas loterias oferecem feeds RSS (ex.: UK National Lottery)
   - Pode ser parseado e convertido para JSON

4. **Inserção Manual**:
   - Para jackpots menos frequentes, inserção manual via admin
   - Adequado para loterias semanais ou menos frequentes

---

## 🔧 Estratégia de Implementação

### **Fase 1: APIs Oficiais** ✅
1. Implementar integração com **Mega-Sena** (API oficial funcional)
2. Implementar integração com **Powerball** (API oficial funcional)
3. Testar e validar dados

### **Fase 2: Scraping Seletivo** 🔄
1. Implementar scraping para **EuroMillions** (alta demanda)
2. Implementar scraping para **Eurojackpot** (alta demanda)
3. Implementar scraping para **Loto** e **Keno** (FDJ)

### **Fase 3: Geração Mockada** 📊
1. Manter geração automática de jackpots para loterias sem API
2. Atualizar valores manualmente para grandes eventos (ex.: El Gordo de Navidad)
3. Criar sistema de notificação para jackpots recordes

---

## 📝 Exemplo de Serviço de API

```typescript
// src/services/lotteryApiService.ts

interface LotteryResult {
  lotteryId: string;
  drawDate: Date;
  winningNumbers: string[];
  jackpot: number;
  nextJackpot?: number;
}

/**
 * Busca resultados da Mega-Sena via API oficial
 */
export async function fetchMegaSenaResults(): Promise<LotteryResult | null> {
  try {
    const response = await fetch(
      'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'
    );
    
    if (!response.ok) throw new Error('Erro na API da Mega-Sena');
    
    const data = await response.json();
    
    return {
      lotteryId: 'mega-sena',
      drawDate: new Date(data.dataApuracao),
      winningNumbers: data.listaDezenas,
      jackpot: data.valorArrecadado || 0,
      nextJackpot: data.valorEstimadoProximoConcurso,
    };
  } catch (error) {
    console.error('Erro ao buscar Mega-Sena:', error);
    return null;
  }
}

/**
 * Busca resultados do Powerball via API oficial
 */
export async function fetchPowerballResults(): Promise<LotteryResult | null> {
  try {
    const response = await fetch(
      'https://www.powerball.com/api/v1/numbers/powerball/recent10?_format=json'
    );
    
    if (!response.ok) throw new Error('Erro na API do Powerball');
    
    const data = await response.json();
    const latest = data[0]; // Pegar o mais recente
    
    return {
      lotteryId: 'powerball',
      drawDate: new Date(latest.draw_date),
      winningNumbers: latest.winning_numbers.split(' '),
      jackpot: parseFloat(latest.jackpot.replace(/[^0-9.]/g, '')),
    };
  } catch (error) {
    console.error('Erro ao buscar Powerball:', error);
    return null;
  }
}
```

---

## 🔐 Segurança e Rate Limiting

### **Boas Práticas**:
1. **Caching**: Cache resultados por 1-24 horas (dependendo da frequência)
2. **Rate Limiting**: Não fazer mais de 1 request por minuto por API
3. **Error Handling**: Sempre ter fallback para dados mockados
4. **User-Agent**: Usar User-Agent adequado para evitar bloqueios
5. **Retry Logic**: Implementar retry com backoff exponencial

### **Exemplo de Cache**:
```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

async function getCachedOrFetch(key: string, fetchFn: () => Promise<any>) {
  const cached = localStorage.getItem(key);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const freshData = await fetchFn();
  localStorage.setItem(key, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));
  
  return freshData;
}
```

---

## 📊 Status de Implementação

| Loteria | API Oficial | Status | Prioridade |
|---------|-------------|--------|-----------|
| Mega-Sena | ✅ | Pronta para implementar | Alta |
| Powerball | ✅ | Pronta para implementar | Alta |
| Mega Millions | ⚠️ | Scraping necessário | Média |
| Loto (FR) | ❌ | Scraping necessário | Alta |
| EuroMillions | ❌ | Scraping necessário | Alta |
| Keno | ❌ | Scraping necessário | Média |
| Outras (41) | ❌ | Geração mockada | Baixa |

**Legenda**:
- ✅ API oficial funcional e documentada
- ⚠️ API não documentada ou instável
- ❌ Sem API pública

---

## 🎯 Próximos Passos

1. ✅ Atualizar dados das loterias no banco
2. ⏳ Implementar serviço de API para Mega-Sena
3. ⏳ Implementar serviço de API para Powerball
4. ⏳ Criar sistema de cache para resultados
5. ⏳ Implementar scraping para FDJ (Loto, EuroMillions, Keno)
6. ⏳ Adicionar notificações para jackpots recordes
7. ⏳ Criar painel admin para atualização manual

---

**Última atualização**: Novembro 2025

