# 📡 Guia de Integração das APIs de Loterias

## 🎯 Objetivo

Este guia detalha a integração das APIs de loterias no sistema, permitindo a recuperação automática dos resultados e a atualização dos jackpots em tempo real.

---

## 🔌 APIs Disponibles

### **APIs Officielles Vérifiées**

#### 🇫🇷 France (FDJ)
```javascript
// Loto
GET https://www.fdj.fr/api/service-rest/tirages/type/loto/annee/2025

// EuroMillions  
GET https://www.fdj.fr/api/service-rest/tirages/type/euromillions/annee/2025

// Keno
GET https://www.fdj.fr/api/service-rest/tirages/type/keno/annee/2025
```

#### 🇺🇸 États-Unis
```javascript
// Powerball
GET https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json

// Mega Millions
GET https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData
```

#### 🇧🇷 Brésil
```javascript
// Mega-Sena
GET https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena
```

#### 🇬🇧 Royaume-Uni
```javascript
// UK Lotto, Thunderball, Set For Life
GET https://api.lottery.co.uk/results/v1.0/allResults
```

---

## 📦 Structure des Données

### **Format Standard de Réponse**

```typescript
interface LotteryResult {
  lotteryId: string;
  drawDate: Date;
  numbers: number[];
  bonusNumbers?: number[];
  jackpot?: number;
  winners?: {
    category: string;
    count: number;
    prize: number;
  }[];
}
```

### **Exemples de Réponses API**

#### FDJ (France)
```json
[
  {
    "date_tirage": "2025-11-16",
    "boules": [5, 12, 23, 34, 45],
    "numero_chance": 7,
    "rapport": {
      "rang1": {
        "nombre": 0,
        "montant": 3000000
      }
    }
  }
]
```

#### Powerball (USA)
```json
[
  {
    "field_draw_date": "2025-11-16",
    "field_winning_numbers": "5, 12, 23, 34, 45",
    "field_powerball": "7",
    "field_jackpot_amount": "$150,000,000"
  }
]
```

---

## 🛠️ Implémentation

### **1. Service Principal**

```typescript
// src/services/lotteryApiService.ts

import { supabase } from '@/lib/supabase';

// Récupérer les derniers résultats
export async function fetchLatestResults(lotteryId: string): Promise<LotteryResult | null> {
  const config = API_CONFIG[lotteryId];
  if (!config) return null;

  const response = await fetch(config.url);
  const data = await response.json();
  
  return config.parser(lotteryId, data);
}
```

### **2. Parsers Spécifiques**

Chaque API a son propre parser pour normaliser les données:

```typescript
// Parser FDJ
function parseFDJResult(lotteryId: string, data: any): LotteryResult {
  const latestDraw = data[0];
  
  return {
    lotteryId,
    drawDate: new Date(latestDraw.date_tirage),
    numbers: latestDraw.boules,
    bonusNumbers: [latestDraw.numero_chance],
    jackpot: latestDraw.rapport?.rang1?.montant
  };
}
```

### **3. Mise à Jour Automatique**

```typescript
// Mettre à jour tous les jackpots
export async function updateJackpotsFromAPIs(): Promise<void> {
  const lotteries = await getLotteriesWithAPI();
  
  for (const lottery of lotteries) {
    const result = await fetchLatestResults(lottery.id);
    if (result) {
      await saveResultToDatabase(result);
    }
  }
}
```

---

## 📅 Configuration du Cron Job

### **Option 1: Cron Job Supabase**

```sql
-- Créer une fonction pour mise à jour
CREATE OR REPLACE FUNCTION update_lottery_results_cron()
RETURNS void AS $$
BEGIN
  -- Appeler le service externe via Edge Function
  PERFORM http_post(
    'https://[project].supabase.co/functions/v1/update-lottery-results',
    '{}',
    'application/json'
  );
END;
$$ LANGUAGE plpgsql;

-- Programmer toutes les 6 heures
SELECT cron.schedule(
  'update-lottery-results',
  '0 */6 * * *',
  'SELECT update_lottery_results_cron()'
);
```

### **Option 2: Node.js avec node-cron**

```typescript
import cron from 'node-cron';
import { updateJackpotsFromAPIs } from './services/lotteryApiService';

// Exécuter toutes les 6 heures
cron.schedule('0 */6 * * *', async () => {
  console.log('Mise à jour des résultats de loterie...');
  await updateJackpotsFromAPIs();
});
```

---

## 🔍 Utilisation dans l'Application

### **1. Page de Résultats**

```typescript
// src/pages/ResultatsPage.tsx
import { fetchLatestResults } from '@/services/lotteryApiService';

const ResultatsPage = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);

  useEffect(() => {
    const loadResults = async () => {
      const lotoResults = await fetchLatestResults('loto-fr');
      const euroResults = await fetchLatestResults('euromillions-fr');
      
      setResults([lotoResults, euroResults].filter(Boolean));
    };
    
    loadResults();
  }, []);

  return (
    <div>
      {results.map(result => (
        <div key={result.lotteryId}>
          <h3>{result.lotteryId}</h3>
          <p>Numéros: {result.numbers.join(', ')}</p>
          <p>Jackpot: {result.jackpot}€</p>
        </div>
      ))}
    </div>
  );
};
```

### **2. Widget de Jackpot**

```typescript
// src/components/JackpotWidget.tsx
const JackpotWidget = ({ lotteryId }: { lotteryId: string }) => {
  const [jackpot, setJackpot] = useState<number | null>(null);

  useEffect(() => {
    fetchLatestResults(lotteryId).then(result => {
      if (result?.jackpot) {
        setJackpot(result.jackpot);
      }
    });
  }, [lotteryId]);

  return (
    <div className="jackpot-widget">
      <h4>Jackpot actuel</h4>
      <p className="jackpot-amount">
        {jackpot ? `${jackpot.toLocaleString('fr-FR')}€` : 'Chargement...'}
      </p>
    </div>
  );
};
```

---

## 🚨 Gestion des Erreurs

### **Retry Logic**

```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### **Fallback sur Données Locales**

```typescript
export async function getLatestJackpot(lotteryId: string): Promise<number> {
  try {
    // Tenter de récupérer via API
    const result = await fetchLatestResults(lotteryId);
    if (result?.jackpot) return result.jackpot;
  } catch (error) {
    console.error('Erreur API:', error);
  }

  // Fallback sur base de données
  const { data } = await supabase
    .from('jackpots')
    .select('valeur')
    .eq('lottery_id', lotteryId)
    .eq('is_past', false)
    .order('date_tirage', { ascending: true })
    .limit(1)
    .single();

  return data?.valeur || 0;
}
```

---

## 📊 Monitoring et Analytics

### **Logs des Appels API**

```typescript
interface ApiLog {
  lotteryId: string;
  timestamp: Date;
  success: boolean;
  responseTime: number;
  error?: string;
}

async function logApiCall(log: ApiLog): Promise<void> {
  await supabase.from('api_logs').insert(log);
}
```

### **Dashboard de Monitoring**

```typescript
// Statistiques des APIs
export async function getApiStats(): Promise<ApiStats> {
  const { data } = await supabase
    .from('api_logs')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000));

  return {
    totalCalls: data.length,
    successRate: data.filter(d => d.success).length / data.length,
    averageResponseTime: data.reduce((sum, d) => sum + d.responseTime, 0) / data.length
  };
}
```

---

## 🔒 Sécurité

### **Validation des Données**

```typescript
function validateLotteryResult(data: any): boolean {
  if (!data.numbers || !Array.isArray(data.numbers)) return false;
  if (!data.drawDate || isNaN(new Date(data.drawDate).getTime())) return false;
  if (data.numbers.some(n => typeof n !== 'number' || n < 1)) return false;
  
  return true;
}
```

### **Rate Limiting**

```typescript
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(apiKey: string, maxCalls = 100): boolean {
  const now = Date.now();
  const calls = rateLimiter.get(apiKey) || [];
  
  // Garder seulement les appels de la dernière heure
  const recentCalls = calls.filter(time => now - time < 3600000);
  
  if (recentCalls.length >= maxCalls) return false;
  
  recentCalls.push(now);
  rateLimiter.set(apiKey, recentCalls);
  
  return true;
}
```

---

## 📚 APIs Non-Officielles

Pour les loteries sans API officielle, considérez:

1. **Web Scraping** (avec permission)
2. **Services Tiers** (RapidAPI, etc.)
3. **Partenariats Directs**

### **Exemple avec Puppeteer**

```typescript
import puppeteer from 'puppeteer';

async function scrapeLotteryResult(url: string): Promise<LotteryResult> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  // Extraire les données
  const numbers = await page.$$eval('.lottery-number', 
    elements => elements.map(el => parseInt(el.textContent))
  );
  
  await browser.close();
  
  return {
    lotteryId: 'scraped-lottery',
    drawDate: new Date(),
    numbers
  };
}
```

---

## 🚀 Prochaines Étapes

1. **Ajouter plus d'APIs**
   - APIs régionales
   - Loteries locales

2. **Optimisations**
   - Cache Redis
   - CDN pour résultats

3. **Fonctionnalités**
   - Webhooks pour résultats
   - GraphQL API
   - WebSocket pour temps réel

---

**Support**: Pour toute question sur l'intégration des APIs, consultez la documentation technique ou contactez l'équipe de développement.

**Dernière mise à jour**: Novembre 2025
