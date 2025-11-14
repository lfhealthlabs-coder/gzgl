import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bolt,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2 as CityIcon,
  ExternalLink,
  Loader2,
  MapPin,
  Moon,
  Sun,
  Save,
  Volume2,
} from "lucide-react";

/** =========================
 *  TIPOS
 *  ========================= */
type CountryCode = "uk" | "fr" | "es" | "it" | "de" | "pt" | "be" | "ca" | "ch";

type Lottery = {
  id: string;
  name: string;
  min: number;
  max: number;
  count: number;
  specialMin: number;
  specialMax: number;
  specialCount: number;
  drawDay: number; // 0=Dom, 1=Seg ... 6=Sáb
  drawHour: number; // 0-23
  logo: string;
  addresses: string[];
  links: { name: string; url: string }[];
};

type CountryConfig = {
  cities: string[];
  lotteries: Lottery[];
};

type LocationData = Record<CountryCode, CountryConfig>;

type SavedCombination = {
  id: string;
  mainNumbers: number[];
  specialNumbers: number[];
  lotteryName: string;
  lotteryId: string;
  timestamp: number;
};

/** =========================
 *  DADOS (portados do B)
 *  ========================= */
const countryNames: Record<CountryCode, string> = {
  uk: "Royaume-Uni",
  fr: "France",
  es: "Espagne",
  it: "Italie",
  de: "Allemagne",
  pt: "Portugal",
  be: "Belgique",
  ca: "Canada",
  ch: "Suisse",
};

const countryFlags: Record<CountryCode, string> = {
  uk: "https://flagcdn.com/w80/gb.png",
  fr: "https://flagcdn.com/w80/fr.png",
  es: "https://flagcdn.com/w80/es.png",
  it: "https://flagcdn.com/w80/it.png",
  de: "https://flagcdn.com/w80/de.png",
  pt: "https://flagcdn.com/w80/pt.png",
  be: "https://flagcdn.com/w80/be.png",
  ca: "https://flagcdn.com/w80/ca.png",
  ch: "https://flagcdn.com/w80/ch.png",
};

const lotteryPrizes: Record<string, string> = {
  "uk-national": "£18,700,000",
  euromillions: "€187,000,000",
  thunderball: "£500,000",
  loto: "€7,500,000",
  keno: "€250,000",
  bonoloto: "€3,200,000",
  primitiva: "€5,800,000",
  superenalotto: "€135,000,000",
  winforlife: "€4,000/mois à vie",
  lotto: "€14,500,000",
  spiel77: "€777,777",
  totoloto: "€4,800,000",
  joker: "€1,500,000",
  eurojackpot: "€110,000,000",
  "lotto-be": "€5,000,000",
  "lotto-max": "CA$70,000,000",
  "swiss-lotto": "CHF8,500,000",
};

// dataset resumido para exemplos principais
const locationData: LocationData = {
  uk: {
    cities: ["Londres", "Manchester", "Birmingham", "Liverpool", "Édimbourg", "Leeds", "Glasgow", "Bristol"],
    lotteries: [
      {
        id: "uk-national",
        name: "UK National Lottery",
        min: 1, max: 59, count: 6,
        specialMin: 1, specialMax: 59, specialCount: 1,
        drawDay: 3, drawHour: 20,
        logo: "https://i.ibb.co/4WQ7bY7/uk-lottery.png",
        addresses: [
          "Bureau de tabac 'Golden Chance', 123 Oxford Street, Londres",
          "Supérette 'Lucky Star', 45 Market Street, Manchester",
          "Magasin 'Fortune', 78 High Street, Birmingham",
          "Kiosque 'Jackpot', 22 Buchanan Street, Glasgow",
        ],
        links: [
          { name: "National Lottery", url: "https://www.national-lottery.co.uk" },
          { name: "Lotto UK", url: "https://www.lotto.uk.com" },
        ],
      },
      {
        id: "euromillions",
        name: "EuroMillions",
        min: 1, max: 50, count: 5,
        specialMin: 1, specialMax: 12, specialCount: 2,
        drawDay: 2, drawHour: 20,
        logo: "https://i.ibb.co/NdYxJngT/Euromillions-2015.webp",
        addresses: [
          "Bureau de tabac 'Euro Dreams', 56 Victoria Road, Londres",
          "Supérette 'Millionaire', 22 King Street, Édimbourg",
          "Centre commercial 'Chance Tower', Liverpool One, Liverpool",
          "Boutique 'Lucky Dip', 33 Park Row, Leeds",
        ],
        links: [
          { name: "EuroMillions UK", url: "https://www.euro-millions.com" },
          { name: "LottoGo", url: "https://www.lottogo.com/euromillions" },
        ],
      },
    ],
  },
  fr: {
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
    lotteries: [
      {
        id: "loto",
        name: "Loto",
        min: 1, max: 49, count: 5,
        specialMin: 1, specialMax: 10, specialCount: 1,
        drawDay: 1, drawHour: 20,
        logo: "https://i.ibb.co/BmVpNdq/dm.png",
        addresses: [
          "Tabac 'La Chance', 15 Rue de Rivoli, Paris",
          "Bureau de tabac 'Le Jackpot', 32 La Canebière, Marseille",
          "Magasin 'Fortune', 5 Place Bellecour, Lyon",
          "Kiosque 'Gagnant', 22 Allée Jean Jaurès, Toulouse",
        ],
        links: [
          { name: "FDJ Loto", url: "https://www.fdj.fr/jeux/jeux-de-tirage/loto" },
          { name: "Loto Français", url: "https://www.loto.fr" },
        ],
      },
      {
        id: "euromillions",
        name: "EuroMillions",
        min: 1, max: 50, count: 5,
        specialMin: 1, specialMax: 12, specialCount: 2,
        drawDay: 2, drawHour: 20,
        logo: "https://i.ibb.co/NdYxJngT/Euromillions-2015.webp",
        addresses: [
          "Tabac 'Euro Dreams', 78 Avenue des Champs-Élysées, Paris",
          "Bureau de tabac 'Millionaire', 45 Rue Saint-Ferréol, Marseille",
          "Centre commercial 'Partouche', 112 Rue du Faubourg Saint-Antoine, Lyon",
          "Boutique 'La Fortune', 33 Rue Sainte-Catherine, Bordeaux",
        ],
        links: [
          { name: "FDJ EuroMillions", url: "https://www.fdj.fr/jeux/jeux-de-tirage/euromillions-my-million" },
          { name: "EuroMillions France", url: "https://www.euromillions.com/fr" },
        ],
      },
    ],
  },
  es: {
    cities: ["Madrid", "Barcelone", "Valence", "Séville", "Bilbao", "Malaga", "Saragosse", "Palma"],
    lotteries: [
      {
        id: "bonoloto",
        name: "BonoLoto",
        min: 1, max: 49, count: 6,
        specialMin: 0, specialMax: 0, specialCount: 0,
        drawDay: 0, drawHour: 21,
        logo: "https://i.ibb.co/0qJXQ3H/bonoloto.png",
        addresses: [
          "Estanco 'La Suerte', 78 Paseo de Gracia, Barcelone",
          "Quiosco 'El Gordo', 33 Calle Sierpes, Séville",
          "Centro 'Loteria', Calle Luchana, Bilbao",
        ],
        links: [
          { name: "BonoLoto Oficial", url: "https://www.loteriasyapuestas.es/es/bonoloto" },
          { name: "Jugar BonoLoto", url: "https://www.bonoloto.com" },
        ],
      },
      {
        id: "euromillions",
        name: "EuroMillions",
        min: 1, max: 50, count: 5,
        specialMin: 1, specialMax: 12, specialCount: 2,
        drawDay: 2, drawHour: 21,
        logo: "https://i.ibb.co/NdYxJngT/Euromillions-2015.webp",
        addresses: [
          "Estanco 'Suerte', 45 Gran Vía, Madrid",
          "Quiosco 'Millonario', 22 Rambla, Barcelone",
        ],
        links: [
          { name: "EuroMillions España", url: "https://www.loteriasyapuestas.es/es/euromillones" },
          { name: "Jugar EuroMillions", url: "https://www.euromillones.com" },
        ],
      },
    ],
  },
  it: {
    cities: ["Rome", "Milan", "Naples", "Turin", "Palerme", "Gênes", "Bologne", "Florence"],
    lotteries: [
      {
        id: "superenalotto",
        name: "SuperEnalotto",
        min: 1, max: 90, count: 6,
        specialMin: 0, specialMax: 0, specialCount: 0,
        drawDay: 3, drawHour: 20,
        logo: "https://i.ibb.co/0qJXQ3H/superenalotto.png",
        addresses: [
          "Tabaccheria 'Fortuna', 45 Via del Corso, Rome",
          "Edicola 'SuperVincita', 22 Galleria Vittorio Emanuele II, Milan",
        ],
        links: [
          { name: "SuperEnalotto Ufficiale", url: "https://www.superenalotto.it" },
          { name: "Gioca SuperEnalotto", url: "https://www.giocosuperenalotto.com" },
        ],
      },
    ],
  },
  de: {
    cities: ["Berlin", "Munich", "Francfort", "Hambourg", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund"],
    lotteries: [
      {
        id: "lotto",
        name: "Lotto 6aus49",
        min: 1, max: 49, count: 6,
        specialMin: 0, specialMax: 0, specialCount: 0,
        drawDay: 4, drawHour: 18,
        logo: "https://i.ibb.co/0qJXQ3H/lotto-de.png",
        addresses: [
          "Kiosk 'Glückspilz', 45 Kurfürstendamm, Berlin",
          "Tabakladen 'LottoKönig', 22 Marienplatz, Munich",
        ],
        links: [
          { name: "Lotto Deutschland", url: "https://www.lotto.de" },
          { name: "Lotto 6aus49", url: "https://www.lotto6aus49.de" },
        ],
      },
    ],
  },
  pt: {
    cities: ["Lisbonne", "Porto", "Braga", "Setúbal", "Coimbra", "Faro", "Aveiro", "Viseu"],
    lotteries: [
      {
        id: "totoloto",
        name: "Totoloto",
        min: 1, max: 49, count: 5,
        specialMin: 1, specialMax: 13, specialCount: 1,
        drawDay: 4, drawHour: 21,
        logo: "https://i.ibb.co/0qJXQ3H/totoloto.png",
        addresses: [
          "Quiosque 'Totoloto', 56 Rua Augusta, Lisbonne",
          "Tabacaria 'O Vencedor', 22 Rua de Cedofeita, Porto",
        ],
        links: [
          { name: "Totoloto Santa Casa", url: "https://www.jogossantacasa.pt/web/totoloto" },
          { name: "Jogar Totoloto", url: "https://www.totoloto.pt" },
        ],
      },
      {
        id: "euromillions",
        name: "EuroMillions",
        min: 1, max: 50, count: 5,
        specialMin: 1, specialMax: 12, specialCount: 2,
        drawDay: 2, drawHour: 21,
        logo: "https://i.ibb.co/NdYxJngT/Euromillions-2015.webp",
        addresses: [
          "Quiosque 'Sorte', 45 Avenida da Liberdade, Lisbonne",
          "Tabacaria 'Milionário', 22 Rua de Santa Catarina, Porto",
        ],
        links: [
          { name: "EuroMillions Portugal", url: "https://www.jogossantacasa.pt/web/euromillions" },
          { name: "Jogar EuroMillions", url: "https://www.euromilhoes.pt" },
        ],
      },
    ],
  },
  be: {
    cities: ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", "Louvain"],
    lotteries: [
      {
        id: "lotto-be",
        name: "Lotto Belgique",
        min: 1, max: 45, count: 6,
        specialMin: 0, specialMax: 0, specialCount: 0,
        drawDay: 4, drawHour: 20,
        logo: "https://i.ibb.co/4WQ7bY7/uk-lottery.png",
        addresses: [
          "Tabac 'Lotto King', 78 Avenue Louise, Bruxelles",
          "Bureau de tabac 'Gagnant', 45 De Keyserlei, Anvers",
        ],
        links: [
          { name: "Lotto Belgique", url: "https://www.lotto.be" },
          { name: "Jouer Lotto", url: "https://www.lotto-nationale.be" },
        ],
      },
    ],
  },
  ca: {
    cities: ["Toronto", "Montréal", "Vancouver", "Calgary", "Ottawa", "Edmonton", "Québec", "Winnipeg"],
    lotteries: [
      {
        id: "lotto-max",
        name: "Lotto Max",
        min: 1, max: 50, count: 7,
        specialMin: 0, specialMax: 0, specialCount: 0,
        drawDay: 3, drawHour: 22,
        logo: "https://i.ibb.co/4WQ7bY7/uk-lottery.png",
        addresses: [
          "Dépanneur 'Lucky Leaf', 45 Yonge Street, Toronto",
          "Tabac 'Maple Chance', 22 Rue Sainte-Catherine, Montréal",
        ],
        links: [
          { name: "Lotto Max Officiel", url: "https://www.olg.ca/en/lottery/play-lotto-max.html" },
          { name: "Lotto Max Canada", url: "https://www.lottomax.ca" },
        ],
      },
    ],
  },
  ch: {
    cities: ["Zurich", "Genève", "Bâle", "Lausanne", "Berne", "Winterthour", "Lucerne", "Saint-Gall"],
    lotteries: [
      {
        id: "swiss-lotto",
        name: "Swiss Lotto",
        min: 1, max: 42, count: 6,
        specialMin: 1, specialMax: 6, specialCount: 1,
        drawDay: 4, drawHour: 20,
        logo: "https://i.ibb.co/4WQ7bY7/uk-lottery.png",
        addresses: [
          "Tabac 'Lotto Suisse', 78 Bahnhofstrasse, Zurich",
          "Kiosque 'Genève Lotto', 45 Rue du Marché, Genève",
        ],
        links: [
          { name: "Swiss Lotto", url: "https://www.swisslos.ch/en/swisslotto.html" },
          { name: "Jouer Swiss Lotto", url: "https://www.swisslotto.ch" },
        ],
      },
    ],
  },
};

/** =========================
 *  UTILIDADES
 *  ========================= */
function generateRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

function formatNextDraw(l: Lottery): string {
  const now = new Date();
  const today = now.getDay();
  let days = l.drawDay - today;
  const currentHour = now.getHours();
  if (days < 0 || (days === 0 && currentHour >= l.drawHour)) days += 7;
  const target = new Date(now);
  target.setDate(now.getDate() + days);
  target.setHours(l.drawHour, 0, 0, 0);

  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return `Prochain tirage : ${target.toLocaleDateString("fr-FR", opts)}`;
}

function getDrawProgress(l: Lottery): number {
  const now = new Date();
  const today = now.getDay();
  let days = l.drawDay - today;
  const currentHour = now.getHours();
  if (days < 0 || (days === 0 && currentHour >= l.drawHour)) days += 7;
  
  const lastDraw = new Date(now);
  lastDraw.setDate(now.getDate() - (7 - days));
  lastDraw.setHours(l.drawHour, 0, 0, 0);
  
  const nextDraw = new Date(now);
  nextDraw.setDate(now.getDate() + days);
  nextDraw.setHours(l.drawHour, 0, 0, 0);
  
  const total = nextDraw.getTime() - lastDraw.getTime();
  const elapsed = now.getTime() - lastDraw.getTime();
  
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/** =========================
 *  COMPONENTE PRINCIPAL
 *  ========================= */
export default function IAPage({ onBack }: { onBack: () => void }) {
  // Estado principal

  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "">(
    (localStorage.getItem("selectedCountry") as CountryCode) || ""
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    localStorage.getItem("selectedCity") || ""
  );
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>(
    localStorage.getItem("selectedLottery") || ""
  );

  const [loading, setLoading] = useState(false);
  const [luckOverlay, setLuckOverlay] = useState(false);

  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(300); // 5 minutos
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const cooldownRef = useRef<number | null>(null);
  
  // Histórico de combinações
  const [savedCombinations, setSavedCombinations] = useState<SavedCombination[]>(() => {
    const saved = localStorage.getItem("savedCombinations");
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Audio para efeitos
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [turboCode, setTurboCode] = useState("");
  const [turboActive, setTurboActive] = useState<boolean>(() => {
    return localStorage.getItem("turboMode") === "active";
  });
  const [turboMsg, setTurboMsg] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  // Partículas
  const particlesRef = useRef<HTMLDivElement>(null);

  // Seleção atual de loteria
  const currentLottery = useMemo<Lottery | null>(() => {
    if (!selectedCountry || !selectedLotteryId) return null;
    return (
      locationData[selectedCountry as CountryCode].lotteries.find((l) => l.id === selectedLotteryId) || null
    );
  }, [selectedCountry, selectedLotteryId]);

  // Progresso (1,2,3
  const step = useMemo<number>(() => {
    if (!selectedCountry) return 1;
    if (!!selectedCountry && !selectedCity) return 2;
    if (!!selectedCountry && !!selectedCity && !selectedLotteryId) return 3;
    return 3;
  }, [selectedCountry, selectedCity, selectedLotteryId]);


  // Persistência de seleções
  useEffect(() => {
    if (selectedCountry) localStorage.setItem("selectedCountry", selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity) localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (selectedLotteryId) localStorage.setItem("selectedLottery", selectedLotteryId);
  }, [selectedLotteryId]);

  // Timer de cooldown
  useEffect(() => {
    if (turboActive) return; // sem cooldown
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          cooldownRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft, turboActive]);

  // Criar partículas douradas no fundo
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    container.innerHTML = "";
    const colors = ["#FFD700", "#00C853", "#FFFFFF", "#FFC400", "#009624"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      el.className = "absolute rounded-full opacity-30";
      const size = Math.random() * 5 + 3;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      el.style.animation = `floatUp ${duration}s linear ${delay}s infinite`;
      container.appendChild(el);
    }
  }, []);

  /** ====== Ações ====== */
  function handleSelectCountry(code: CountryCode) {
    setSelectedCountry(code);
    setSelectedCity("");
    setSelectedLotteryId("");
  }

  function handleSelectCity(city: string) {
    setSelectedCity(city);
    setSelectedLotteryId("");
  }

  function handleSelectLottery(id: string) {
    setSelectedLotteryId(id);
  }

  function startCooldown() {
    if (turboActive) return;
    setSecondsLeft(cooldownSeconds);
  }

  function activateTurbo() {
    if (turboCode.trim() === "71777") {
      setTurboActive(true);
      setTurboMsg({ type: "success", text: "Mode Turbo activé avec succès!" });
      localStorage.setItem("turboMode", "active");
      setCooldownSeconds(0);
      setTimeout(() => setTurboMsg({ type: "", text: "" }), 3000);
    } else {
      setTurboMsg({ type: "error", text: "Code incorrect. Veuillez réessayer." });
      setTimeout(() => setTurboMsg({ type: "", text: "" }), 3000);
    }
  }

  function generate() {
    if (!currentLottery) return;
    // inicia overlay + loader
    setLuckOverlay(true);
    setLoading(true);
    // inicia cooldown
    startCooldown();

    setTimeout(() => {
      // sorteio
      const mains = generateRandomNumbers(
        currentLottery.min,
        currentLottery.max,
        currentLottery.count
      ).sort((a, b) => a - b);

      const specials =
        currentLottery.specialCount > 0
          ? generateRandomNumbers(
              currentLottery.specialMin,
              currentLottery.specialMax,
              currentLottery.specialCount
            ).sort((a, b) => a - b)
          : [];

      setMainNumbers(mains);
      setSpecialNumbers(specials);

      // fecha overlay + loader
      setLuckOverlay(false);
      setLoading(false);
      // confetes simples
      fireConfetti();
    }, 2500);
  }

  function fireConfetti() {
    const colors = ["#00C853", "#FFD700", "#FFFFFF", "#009624", "#FFC400"];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.width = Math.random() * 8 + 6 + "px";
      el.style.height = Math.random() * 8 + 6 + "px";
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = "50%";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = "-10px";
      el.style.opacity = "0.9";
      el.style.zIndex = "1000";
      el.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  function playSaveSound() {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSR");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  function saveCombination() {
    if (!currentLottery || mainNumbers.length === 0) return;
    
    const newCombination: SavedCombination = {
      id: Date.now().toString(),
      mainNumbers: [...mainNumbers],
      specialNumbers: [...specialNumbers],
      lotteryName: currentLottery.name,
      lotteryId: currentLottery.id,
      timestamp: Date.now(),
    };

    const updated = [newCombination, ...savedCombinations].slice(0, 10); // Máximo 10 combinações
    setSavedCombinations(updated);
    localStorage.setItem("savedCombinations", JSON.stringify(updated));
    
    // Mostrar feedback
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
    
    // Efeitos
    fireConfetti();
    playSaveSound();
  }

  function deleteCombination(id: string) {
    const updated = savedCombinations.filter(c => c.id !== id);
    setSavedCombinations(updated);
    localStorage.setItem("savedCombinations", JSON.stringify(updated));
  }

  const canGenerate = !!currentLottery && !!selectedCountry && !!selectedCity && !!selectedLotteryId;
  const canGenerateMore = turboActive || secondsLeft === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-gray-800 relative overflow-hidden pb-20">
      {/* keyframes locais */}
      <style>{`
        @keyframes floatUp { 
          0%{transform: translateY(0) rotate(0deg);} 
          100%{transform: translateY(-100vh) rotate(360deg);} 
        }
        @keyframes confettiFall { 
          0%{transform: translateY(0) rotate(0deg);} 
          100%{transform: translateY(100vh) rotate(720deg);} 
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.4; }
        }
        @keyframes goldenPulse {
          0%, 100% { 
            box-shadow: 0 4px 20px rgba(234, 179, 8, 0.4),
                        0 8px 40px rgba(250, 204, 21, 0.3);
          }
          50% { 
            box-shadow: 0 4px 30px rgba(234, 179, 8, 0.6),
                        0 8px 60px rgba(250, 204, 21, 0.5);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.4s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }
        .particle-light {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent);
          border-radius: 50%;
          animation: particleFloat 4s ease-in-out infinite;
        }
        .golden-glow {
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.6),
                       0 0 40px rgba(245, 158, 11, 0.4),
                       0 0 60px rgba(217, 119, 6, 0.3);
        }
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(251, 191, 36, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #F59E0B, #FBBF24);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #D97706, #F59E0B);
        }
      `}</style>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle-light"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Partículas douradas */}
      <div ref={particlesRef} className="pointer-events-none fixed inset-0 -z-10" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-yellow-200 bg-white/50 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg transition-all font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Bolt className="w-6 h-6 text-yellow-600" />
            <div className="text-2xl font-bold text-gray-900">LOTO</div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
            GAINS AI
          </div>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>

      {/* Conteúdo */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* PASSOS */}
        <Steps step={step} />

        {/* TURBO */}
        <div className="rounded-3xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 via-amber-100 to-yellow-200 p-6 shadow-xl relative overflow-hidden animate-fadeInUp hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-pulse" />
          
          {/* Partículas de fundo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-amber-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bolt className="w-6 h-6 text-yellow-600 animate-pulse" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Mode Turbo {turboActive && "✓"}
              </span>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Précision 10X supérieure, 78% de chances en plus, nouveaux numéros sans attendre.
            </p>
            <div className="flex gap-3 max-sm:flex-col">
              <input
                value={turboCode}
                onChange={(e) => setTurboCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && activateTurbo()}
                placeholder="Entrez le code d'activation"
                maxLength={5}
                disabled={turboActive}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 bg-white transition-all disabled:opacity-60 text-center font-mono text-lg"
              />
              <button
                onClick={activateTurbo}
                disabled={turboActive}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-bold shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 transition-all duration-300"
                style={{ animation: turboActive ? 'none' : 'goldenPulse 2s ease-in-out infinite' }}
              >
                {turboActive ? "✓ Activé" : "Activer"}
              </button>
            </div>
            {turboMsg.type && (
              <div
                className={`mt-3 text-sm font-semibold px-4 py-3 rounded-xl animate-fadeInUp ${
                  turboMsg.type === "success"
                    ? "bg-green-100 text-green-700 border-2 border-green-400"
                    : "bg-red-100 text-red-700 border-2 border-red-400"
                }`}
              >
                {turboMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* ETAPA 1 — PAÍS */}
        <div className="animate-fadeInUp">
          <Card title="1. Choisissez votre pays">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Les pays sont filtrés pour jouer en présentiel, mais vous pouvez jouer en ligne quel que soit votre pays.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(locationData) as CountryCode[]).map((code, index) => (
                <button
                  key={code}
                  onClick={() => handleSelectCountry(code)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 group transform hover:scale-105 ${
                    selectedCountry === code
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 shadow-lg"
                      : "bg-white hover:bg-yellow-50/50 border-yellow-200 hover:border-yellow-400 hover:shadow-md"
                  } animate-fadeInScale`}
                >
                  <img
                    src={countryFlags[code]}
                    alt={countryNames[code]}
                    className="w-12 h-12 rounded-lg bg-white p-1 shadow-md"
                  />
                  <span className="font-bold text-left flex-1 text-gray-800">{countryNames[code]}</span>
                  <ChevronRight className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ETAPA 2 — CIDADE */}
        {selectedCountry && (
          <div className="animate-fadeInUp">
            <Card title="2. Choisissez votre ville" onBack={() => setSelectedCountry("")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locationData[selectedCountry as CountryCode].cities.map((city, index) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 group transform hover:scale-105 ${
                      selectedCity === city
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 shadow-lg"
                        : "bg-white hover:bg-yellow-50/50 border-yellow-200 hover:border-yellow-400 hover:shadow-md"
                    } animate-fadeInScale`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white grid place-items-center shadow-md">
                      <CityIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-left flex-1 text-gray-800">{city}</span>
                    <ChevronRight className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ETAPA 3 — LOTERIA */}
        {selectedCity && (
          <div className="animate-fadeInUp">
            <Card title="3. Choisissez votre loterie" onBack={() => setSelectedCity("")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locationData[selectedCountry as CountryCode].lotteries.map((lot, index) => (
                  <button
                    key={lot.id}
                    onClick={() => handleSelectLottery(lot.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 group transform hover:scale-105 ${
                      selectedLotteryId === lot.id
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 shadow-lg"
                        : "bg-white hover:bg-yellow-50/50 border-yellow-200 hover:border-yellow-400 hover:shadow-md"
                    } animate-fadeInScale`}
                  >
                    <img src={lot.logo} alt={lot.name} className="w-12 h-12 rounded-lg bg-white p-1.5 shadow-md" />
                    <span className="font-bold text-left flex-1 text-gray-800">{lot.name}</span>
                    <ChevronRight className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* BOTÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={generate}
            disabled={!canGenerate || loading}
            className="relative w-full px-6 py-5 rounded-xl font-bold text-xl tracking-wide shadow-xl
              bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600
              text-gray-900 transform hover:scale-105 active:scale-95 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{ animation: loading ? 'none' : 'goldenPulse 2s ease-in-out infinite' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>GÉNÉRATION...</span>
              </span>
            ) : (
              "GÉNÉRER MES NUMÉROS"
            )}
          </button>

          <button
            onClick={generate}
            disabled={!canGenerate || loading || !canGenerateMore}
            className="relative w-full px-6 py-5 rounded-xl font-bold text-xl tracking-wide shadow-xl
              bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:via-amber-600 hover:to-orange-600
              text-gray-900 transform hover:scale-105 active:scale-95 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canGenerateMore
              ? "GÉNÉRER PLUS"
              : `Attendez ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
          </button>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full border-4 border-yellow-200 border-t-yellow-500 animate-spin shadow-lg" />
            <p className="mt-4 text-yellow-700 font-bold text-lg">Génération de vos numéros porte-bonheur...</p>
          </div>
        )}

        {/* RESULTADOS */}
        {currentLottery && !loading && (mainNumbers.length > 0 || specialNumbers.length > 0) && (
          <div className="rounded-3xl border-2 border-yellow-400 bg-white p-8 shadow-2xl relative overflow-hidden animate-fadeInUp">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-pulse" />
            
            {/* Partículas de fundo */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="particle-light"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
            
            <div className="text-center pb-6 mb-6 border-b-2 border-dashed border-yellow-300 relative">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent inline-block golden-glow">
                🎉 Vos Numéros Porte-Bonheur !
              </h2>
            </div>

            <div className="text-center space-y-3 mb-6">
              <p className="font-bold text-lg text-gray-700">{formatNextDraw(currentLottery)}</p>
              <p className="font-bold text-xl">
                Jackpot actuel :{" "}
                <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent text-3xl font-extrabold golden-glow">
                  {lotteryPrizes[currentLottery.id] || "€0"}
                </span>
              </p>
              
              {/* Barra de progresso */}
              <div className="max-w-md mx-auto mt-4">
                <div className="flex justify-between text-xs text-gray-600 font-semibold mb-2">
                  <span>Dernier tirage</span>
                  <span className="text-yellow-600 font-bold">{Math.round(getDrawProgress(currentLottery))}%</span>
                  <span>Prochain tirage</span>
                </div>
                <div className="h-3 bg-yellow-100 rounded-full overflow-hidden border-2 border-yellow-300">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full transition-all duration-1000 shadow-inner"
                    style={{ width: `${getDrawProgress(currentLottery)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 my-6 relative">
              {mainNumbers.map((n, i) => (
                <Ball key={`m-${i}`} value={n} variant="gold" delay={i * 0.1} />
              ))}
              {specialNumbers.map((n, i) => (
                <Ball key={`s-${i}`} value={n} variant="green" delay={(mainNumbers.length + i) * 0.1} />
              ))}
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-center mb-6">
              <button
                onClick={saveCombination}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-bold text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 group"
                style={{ animation: 'goldenPulse 2s ease-in-out infinite' }}
              >
                <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>SAUVEGARDER CETTE COMBINAISON</span>
                <Volume2 className="w-5 h-5 opacity-80" />
              </button>
            </div>
            
            {/* Feedback de salvamento */}
            {showSaveSuccess && (
              <div className="text-center mb-6 animate-fadeInUp">
                <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 font-bold text-lg border-2 border-green-400 shadow-lg">
                  ✓ Combinaison sauvegardée avec succès!
                </div>
              </div>
            )}

            {/* Links de aposta */}
            {currentLottery.links?.length > 0 && (
              <div className="rounded-2xl p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 mb-6">
                <h3 className="text-center font-bold text-lg bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent mb-4">
                  Faites vos jeux en ligne :
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentLottery.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      {l.name}
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Endereços dobráveis */}
            <details className="group">
              <summary className="list-none">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-gray-800 font-bold border-2 border-yellow-300 transition-all duration-300"
                >
                  <span>Adresses de points de vente</span>
                  <ChevronDown className="w-5 h-5 text-yellow-600 transition-transform group-open:rotate-180" />
                </button>
              </summary>
              <div className="mt-3 rounded-xl border-2 border-yellow-200 bg-yellow-50/50 overflow-hidden">
                {currentLottery.addresses.map((a, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-3 border-b last:border-b-0 border-yellow-200 hover:bg-yellow-100/50 transition-colors">
                    <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{a}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* HISTÓRICO DE COMBINAÇÕES */}
        {savedCombinations.length > 0 && (
          <div className="rounded-3xl border-2 border-yellow-400 bg-white p-6 shadow-2xl relative overflow-hidden animate-fadeInUp">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-pulse" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                <Save className="w-6 h-6 text-yellow-600" />
                Mes Combinaisons Sauvegardées
              </h2>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 font-bold text-sm border-2 border-yellow-300">
                {savedCombinations.length} / 10
              </span>
            </div>

            {/* Carrossel horizontal */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                {savedCombinations.map((combo, index) => (
                  <div
                    key={combo.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className="flex-shrink-0 w-80 snap-start rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-slideInRight"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-yellow-700 text-base">{combo.lotteryName}</h3>
                        <p className="text-xs text-gray-600 font-medium">
                          {new Date(combo.timestamp).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCombination(combo.id)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-all hover:scale-110"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Números */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {combo.mainNumbers.map((n, i) => (
                        <div
                          key={`main-${i}`}
                          className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-600 text-white font-bold text-base grid place-items-center shadow-md"
                        >
                          {n}
                        </div>
                      ))}
                      {combo.specialNumbers.map((n, i) => (
                        <div
                          key={`special-${i}`}
                          className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-700 text-white font-bold text-base grid place-items-center shadow-md"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicador de scroll */}
            {savedCombinations.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {savedCombinations.map((_, index) => (
                  <div
                    key={index}
                    className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* OVERLAY DE SORTE */}
      {luckOverlay && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center">
          <div className="flex flex-col items-center bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl p-12 shadow-2xl border-4 border-white transform scale-in">
            <div className="text-7xl mb-6 animate-bounce">🍀</div>
            <div className="text-gray-900 text-3xl font-extrabold mb-4 drop-shadow-lg">Chargement de votre chance...</div>
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin drop-shadow-lg" />
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

/** =========================
 *  SUBCOMPONENTES
 *  ========================= */

function Card({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white border-2 border-yellow-200 shadow-xl p-6 hover:shadow-2xl hover:border-yellow-400 transition-all duration-300 relative overflow-hidden">
      {/* Borda superior decorativa */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
      
      <div className="flex items-center gap-3 mb-5 relative z-10">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-yellow-100 transition-all hover:scale-110 active:scale-95"
            aria-label="Retour"
          >
            <ChevronLeft className="w-6 h-6 text-yellow-600" />
          </button>
        )}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Steps({ step }: { step: number }) {
  // 1..3 e barra preenchendo 0/50/100%
  const width = step === 1 ? "0%" : step === 2 ? "50%" : "100%";
  return (
    <div className="relative max-w-4xl mx-auto animate-fadeInUp">
      {/* Fundo da barra */}
      <div className="h-2 bg-yellow-100 rounded-full border border-yellow-200" />
      
      {/* Barra de progresso */}
      <div
        className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full absolute top-0 left-0 transition-all duration-500 ease-out shadow-md border border-yellow-300"
        style={{ width }}
      />
      
      {/* Círculos dos passos */}
      <div className="flex justify-between -mt-4">
        {[1, 2, 3].map((i) => {
          const state = i < step ? "completed" : i === step ? "active" : "idle";
          return (
            <div
              key={i}
              className={`w-14 h-14 grid place-items-center rounded-full border-4 font-bold text-lg z-10 relative transition-all duration-300 shadow-xl
                ${state === "completed" ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-600 scale-110" : ""}
                ${state === "active" ? "bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700 border-yellow-500 scale-110 ring-4 ring-yellow-300 animate-pulse" : ""}
                ${state === "idle" ? "bg-white text-gray-400 border-gray-300 scale-100" : ""}`}
            >
              {state === "completed" ? "✓" : i}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Ball({
  value,
  variant,
  delay = 0,
}: {
  value: number;
  variant: "gold" | "green";
  delay?: number;
}) {
  const base =
    "w-16 h-16 rounded-full grid place-items-center font-extrabold text-white shadow-2xl relative cursor-pointer transform transition-all duration-300 hover:scale-125";
  const theme =
    variant === "gold"
      ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 border-4 border-yellow-600"
      : "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 border-4 border-amber-700";

  // classe do brilho/halo
  const glowClass =
    variant === "gold"
      ? "bg-gradient-to-br from-yellow-400 to-amber-500"
      : "bg-gradient-to-br from-amber-500 to-orange-500";

  return (
    <div
      className={`${base} ${theme} group`}
      style={{
        animation: `popIn .6s cubic-bezier(.175,.885,.32,1.275) ${delay}s both, float 3s ease-in-out ${delay + 0.6}s infinite`,
      }}
    >
      <style>{`
        @keyframes popIn {
          0% { opacity:0; transform: scale(.3) rotate(-180deg) }
          60% { opacity:1; transform: scale(1.15) rotate(10deg) }
          80% { opacity:1; transform: scale(0.95) rotate(-5deg) }
          100% { opacity:1; transform: scale(1) rotate(0deg) }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-8px) }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
      
      {/* Número */}
      <span className="text-2xl z-10 relative drop-shadow-lg">{value}</span>
      
      {/* Brilho animado */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            animation: 'shine 3s ease-in-out infinite',
            left: '-100%'
          }}
        />
      </div>
      
      {/* Halo ao hover */}
      <div
        className={`absolute -inset-3 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${glowClass}`}
        style={{ boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)' }}
      />
      
      {/* Reflexo */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-white/50 rounded-full blur-sm" />
    </div>
  );
}
