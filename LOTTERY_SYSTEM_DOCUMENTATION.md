# 🎰 Documentação do Sistema de Loterias

## 📋 Visão Geral

Esta documentação descreve o sistema completo de gerenciamento de loterias, incluindo 50 loterias internacionais com suas informações detalhadas, APIs integradas e sistema de geração de jackpots.

---

## 🗄️ Structure de la Base de Données

### **Table `lotteries`**
Stocke toutes les informations des loteries disponibles.

**Champs principaux:**
- `id`: Identifiant unique (TEXT)
- `name`: Nom de la loterie
- `url`: URL officielle
- `region`: Région (`france`, `europe`, `international`)
- `pays`: Pays d'origine
- `probabilite`: Probabilité de gagner le jackpot
- `has_api`: Si une API est disponible (BOOLEAN)
- `api_url`: URL de l'API
- `draw_days`: Jours de tirage
- `draw_frequency`: Fréquence des tirages
- `prize_value`: Valeur des prix
- `number_format`: Format des numéros
- `description`: Description détaillée en français

### **Table `jackpots`**
Stocke tous les jackpots actifs et historiques.

**Champs:**
- `id`: UUID unique
- `lottery_id`: Référence à la loterie (FK)
- `valeur`: Montant du jackpot
- `tirage`: Jour de la semaine
- `date_limite`: Date limite pour jouer
- `date_tirage`: Date du tirage
- `notes`: Notes/description
- `is_past`: Si le tirage est passé

### **Table `lottery_results`**
Stocke les résultats des tirages récupérés via API.

**Champs:**
- `id`: UUID unique
- `lottery_id`: Référence à la loterie
- `draw_date`: Date du tirage
- `numbers`: Numéros tirés (ARRAY)
- `bonus_numbers`: Numéros bonus (ARRAY)
- `jackpot_amount`: Montant du jackpot
- `winners`: Informations sur les gagnants (JSONB)

---

## 📊 Loteries par Région

### **🇫🇷 France (10 loteries)**

1. **Loto** - `loto-fr`
   - Tirages: Lundi, Mercredi, Samedi
   - Format: 5/49 + 1/10
   - API: ✅ Disponible

2. **EuroMillions My Million** - `euromillions-fr`
   - Tirages: Mardi, Vendredi
   - Format: 5/50 + 2/12
   - API: ✅ Disponible

3. **Keno Gagnant à Vie** - `keno-fr`
   - Tirages: Quotidien
   - Format: 20 tirés de 1-56
   - API: ✅ Disponible

4. **Loto Super Cagnotte** - `loto-super-cagnotte`
   - Tirages: Dates spéciales
   - Format: 5/49 + 1/10

5. **EuroDreams** - `eurodreams-fr`
   - Tirages: Lundi, Jeudi
   - Format: 6/40 + 1/5

6. **Amigo** - `amigo-fr`
   - Tirages: Toutes les 5 minutes
   - Format: 12 tirés de 1-28

7. **Cash** - `cash-fr`
   - Type: Raspadinha instantanée
   - Prix max: 500.000€

8. **Loto Week-end** - `loto-week-end`
   - Tirage: Samedi
   - Format: 5/49 + 1/10

9. **Quinté+** - `quinté-plus`
   - Tirages: Quotidien
   - Format: 5 chevaux + Numéro Plus

10. **Joker+** - `joker-plus`
    - Tirages: Quotidien
    - Format: 7 chiffres

### **🇪🇺 Europe (30 loteries)**

Principales loteries européennes avec APIs disponibles:

- **EuroMillions** (pan-européen) - API ✅
- **Eurojackpot** (18 pays) - API ✅
- **SuperEnalotto** (Italie) - API ✅
- **UK National Lottery** - API ✅
- **Irish Lotto** - API ✅
- **La Primitiva** (Espagne) - API ✅
- **Swiss Lotto** - API ✅
- **Lotto 6aus49** (Allemagne) - API ✅
- **Swedish Lotto** - API ✅
- **Norwegian Lotto** - API ✅

### **🌍 International (10 loteries)**

1. **Powerball** (USA) - API ✅
2. **Mega Millions** (USA) - API ✅
3. **Mega-Sena** (Brésil) - API ✅
4. **Oz Lotto** (Australie) - API ✅
5. **Lotto Max** (Canada) - API ✅
6. **Lotto 6/49** (Canada) - API ✅
7. **Québec Max** (Canada) - API ✅
8. **Québec 49** (Canada) - API ✅
9. **Grande Vie/Daily Grand** (Canada) - API ✅

---

## 🔌 Intégration des APIs

### **APIs Officielles Disponibles**

#### France (FDJ)
```typescript
// Loto
https://www.fdj.fr/api/service-rest/tirages/type/loto/annee/[YEAR]

// EuroMillions
https://www.fdj.fr/api/service-rest/tirages/type/euromillions/annee/[YEAR]

// Keno
https://www.fdj.fr/api/service-rest/tirages/type/keno/annee/[YEAR]
```

#### États-Unis
```typescript
// Powerball
https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json

// Mega Millions
https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData
```

#### Brésil
```typescript
// Mega-Sena
https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena
```

### **Service d'Intégration**

Le fichier `src/services/lotteryApiService.ts` fournit:

- `fetchLatestResults(lotteryId)`: Récupère les derniers résultats
- `updateJackpotsFromAPIs()`: Met à jour tous les jackpots via APIs
- Parsers spécifiques pour chaque format d'API

### **Utilisation**

```typescript
import { fetchLatestResults, updateJackpotsFromAPIs } from '@/services/lotteryApiService';

// Récupérer résultats d'une loterie
const results = await fetchLatestResults('loto-fr');

// Mettre à jour tous les jackpots
await updateJackpotsFromAPIs();
```

---

## 🔄 Génération Automatique de Jackpots

### **Fonction `generate_jackpots()`**

Cette fonction SQL:
1. Nettoie les jackpots de plus de 30 jours
2. Génère des jackpots futurs (1-30 jours)
3. Pour les loteries avec API, génère des tirages passés

### **Valeurs par Région**
- **France**: 2M€ - 32M€
- **Europe**: 10M€ - 160M€
- **International**: 50M€ - 350M€

---

## 📱 Intégration dans l'Application

### **Page Bonus** (`src/pages/BonusPage.tsx`)
- Affiche les jackpots par région
- Filtre par loterie
- Liens vers sites officiels

### **Page Feed** (`src/pages/CommunautePage.tsx`)
- Intègre jackpots dans le feed
- Priorité: Communauté > Updates > Jackpots

### **Service Jackpot** (`src/services/jackpotService.ts`)
- `fetchJackpots()`: Récupère jackpots avec filtres
- `fetchLotteries()`: Liste des loteries
- `generateJackpots()`: Appelle fonction SQL

---

## 🛠️ Installation et Configuration

### **1. Exécuter les Scripts SQL**

```sql
-- 1. Tables principales
sql/JACKPOTS_TABLES.sql

-- 2. Mise à jour complète des loteries
sql/UPDATE_LOTTERIES_COMPLETE.sql

-- 3. Configuration des APIs
sql/UPDATE_LOTTERY_APIS.sql

-- 4. Réactions fake (optionnel)
sql/ADD_FAKE_JACKPOT_REACTIONS.sql
```

### **2. Configuration des Services**

1. Importer le service API:
```typescript
import { updateJackpotsFromAPIs } from '@/services/lotteryApiService';
```

2. Configurer une tâche cron pour mise à jour automatique:
```typescript
// Mettre à jour toutes les 6 heures
setInterval(() => {
  updateJackpotsFromAPIs();
}, 6 * 60 * 60 * 1000);
```

---

## 📊 Statistiques

### **Couverture Totale**
- **50 loteries** dans 30+ pays
- **30+ APIs** intégrées
- **3 régions** principales

### **APIs par Région**
- France: 3/10 (30%)
- Europe: 15/30 (50%)
- International: 12/10 (120%)

---

## 🔐 Sécurité et Performance

### **Row Level Security (RLS)**
- Lecture publique des loteries et jackpots
- Écriture restreinte au système

### **Optimisations**
- Index sur `lottery_id`, `date_tirage`, `region`
- Cache des résultats API
- Pagination des résultats

---

## 📝 Maintenance

### **Tâches Régulières**
1. Vérifier disponibilité des APIs
2. Mettre à jour URLs si changement
3. Nettoyer jackpots anciens (automatique)
4. Surveiller les erreurs API

### **Logs et Monitoring**
- Erreurs API loggées dans console
- Statistiques de succès/échec
- Alertes si API indisponible

---

## 🚀 Évolutions Futures

1. **Plus d'APIs**
   - Intégrer APIs manquantes
   - Créer proxy pour APIs protégées

2. **Statistiques Avancées**
   - Historique des jackpots
   - Analyses de tendances
   - Prédictions

3. **Notifications**
   - Alertes gros jackpots
   - Résultats favoris
   - Rappels de tirage

---

**Dernière mise à jour**: Novembre 2025
