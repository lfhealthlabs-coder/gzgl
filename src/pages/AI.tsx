import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bolt,
  ChevronDown,
  ChevronRight,
  Building2 as CityIcon,
  ExternalLink,
  Loader2,
  MapPin,
  Moon,
  Sun,
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
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.width = "10px";
      el.style.height = "10px";
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

  const canGenerate = !!currentLottery && !!selectedCountry && !!selectedCity && !!selectedLotteryId;
  const canGenerateMore = turboActive || secondsLeft === 0;

  return (
    <div className="min-h-screen bg-white text-[#121212] relative">
      {/* keyframes locais */}
      <style>{`
        @keyframes floatUp { 0%{transform: translateY(0) rotate(0deg);} 100%{transform: translateY(-100vh) rotate(360deg);} }
        @keyframes confettiFall { 0%{transform: translateY(0) rotate(0deg);} 100%{transform: translateY(100vh) rotate(720deg);} }
      `}</style>

      {/* Partículas */}
      <div ref={particlesRef} className="pointer-events-none fixed inset-0 -z-10" />

      {/* Top bar com botão de voltar (full screen) */}
      <div className="px-4 py-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#00C853] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bolt className="w-5 h-5 text-[#00C853]" />
            <h1 className="font-bold text-lg bg-gradient-to-r from-[#FFD700] to-[#FFC400] bg-clip-text text-transparent">
              Loto Gains AI
            </h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* PASSOS */}
        <Steps step={step} />

        {/* TURBO */}
        <div className="rounded-3xl border border-[#FFD700]/30 bg-gradient-to-br from-[#FFF8E1] to-[#E8F5E9] p-4 shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#FFD700] to-[#FFC400]" />
          <div className="flex items-center gap-2 text-[#FFC400] font-bold mb-2">
            <Bolt className="w-5 h-5" />
            Mode Turbo
          </div>
          <p className="text-sm text-[#121212]/80 mb-3">
            Précision 10X supérieure, 78% de chances en plus, nouveaux numéros sans attendre.
          </p>
          <div className="flex gap-2 max-sm:flex-col">
            <input
              value={turboCode}
              onChange={(e) => setTurboCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && activateTurbo()}
              placeholder="Entrez le code d'activation"
              maxLength={5}
              className="flex-1 px-3 py-2 rounded-2xl border border-[#FFD700]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40 bg-white dark:bg-[#1a1a1a]"
            />
            <button
              onClick={activateTurbo}
              disabled={turboActive}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFC400] text-white font-semibold shadow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              Activer
            </button>
          </div>
          {turboMsg.type && (
            <div
              className={`mt-2 text-sm font-semibold px-3 py-2 rounded-2xl ${
                turboMsg.type === "success"
                  ? "bg-[#E8F5E9] text-[#009624] border border-[#00C853]/20"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {turboMsg.text}
            </div>
          )}
        </div>

        {/* ETAPA 1 — PAÍS */}
        <Card title="1. Choisissez votre pays">
          <p className="text-sm text-[#FFFFFF]/70 mb-3">
            Les pays sont filtrés pour jouer en présentiel, mais vous pouvez jouer en ligne quel que soit votre pays.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(locationData) as CountryCode[]).map((code) => (
              <button
                key={code}
                onClick={() => handleSelectCountry(code)}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition group ${
                  selectedCountry === code
                    ? "bg-[#E8F5E9] border-[#00C853]/40"
                    : "bg-white  hover:bg-[#F1F8E9] border-[#00C853]/10"
                }`}
              >
                <img
                  src={countryFlags[code]}
                  alt={countryNames[code]}
                  className="w-10 h-10 rounded-lg bg-white p-1 shadow"
                />
                <span className="font-semibold text-left flex-1">{countryNames[code]}</span>
                <ChevronRight className="w-4 h-4 text-[#00C853] opacity-70 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </Card>

        {/* ETAPA 2 — CIDADE */}
        {selectedCountry && (
          <Card title="2. Choisissez votre ville" onBack={() => setSelectedCountry("")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locationData[selectedCountry as CountryCode].cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition group ${
                    selectedCity === city
                      ? "bg-[#E8F5E9] border-[#00C853]/40"
                      : "bg-white  hover:bg-[#F1F8E9] border-[#00C853]/10"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C853] to-[#009624] text-white grid place-items-center shadow">
                    <CityIcon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-left flex-1">{city}</span>
                  <ChevronRight className="w-4 h-4 text-[#00C853] opacity-70 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* ETAPA 3 — LOTERIA */}
        {selectedCity && (
          <Card title="3. Choisissez votre loterie" onBack={() => setSelectedCity("")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locationData[selectedCountry as CountryCode].lotteries.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => handleSelectLottery(lot.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition group ${
                    selectedLotteryId === lot.id
                      ? "bg-[#E8F5E9] border-[#00C853]/40"
                      : "bg-white  hover:bg-[#F1F8E9] border-[#00C853]/10"
                  }`}
                >
                  <img src={lot.logo} alt={lot.name} className="w-10 h-10 rounded-lg bg-white p-1 shadow" />
                  <span className="font-semibold text-left flex-1">{lot.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#00C853] opacity-70 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* BOTÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={generate}
            disabled={!canGenerate || loading}
            className="w-full px-4 py-4 rounded-3xl text-white font-extrabold uppercase tracking-wide shadow
              bg-gradient-to-r from-[#00C853] to-[#009624]
              hover:scale-[1.02] active:scale-[0.98] transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "GÉNÉRATION..." : "GÉNÉRER MES NUMÉROS"}
          </button>

          <button
            onClick={generate}
            disabled={!canGenerate || loading || !canGenerateMore}
            className="w-full px-4 py-4 rounded-3xl text-white font-extrabold uppercase tracking-wide shadow
              bg-gradient-to-r from-[#FFD700] to-[#FFC400]
              hover:scale-[1.02] active:scale-[0.98] transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canGenerateMore
              ? "GÉNÉRER PLUS DE NUMÉROS"
              : `Attendez ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
          </button>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full border-4 border-[#00C853]/20 border-t-[#00C853] animate-spin" />
            <p className="mt-3 text-[#00C853] font-bold">Génération de vos numéros porte-bonheur...</p>
          </div>
        )}

        {/* RESULTADOS */}
        {currentLottery && !loading && (mainNumbers.length > 0 || specialNumbers.length > 0) && (
          <div className="rounded-3xl border border-[#00C853]/20 bg-white  p-5 shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#FFD700] to-[#FFC400]" />
            <div className="text-center pb-4 mb-4 border-b border-dashed border-[#00C853]/30 relative">
              <h2 className="text-2xl font-extrabold text-[#00C853] inline-block">
                🎉 Vos Numéros Porte-Bonheur !
              </h2>
            </div>

            <div className="text-center space-y-1 mb-4">
              <p className="font-semibold">{formatNextDraw(currentLottery)}</p>
              <p className="font-semibold">
                Jackpot actuel :{" "}
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFC400] bg-clip-text text-transparent font-extrabold">
                  {lotteryPrizes[currentLottery.id] || "€0"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 my-6 relative">
              {mainNumbers.map((n, i) => (
                <Ball key={`m-${i}`} value={n} variant="gold" delay={i * 0.08} />
              ))}
              {specialNumbers.map((n, i) => (
                <Ball key={`s-${i}`} value={n} variant="green" delay={(mainNumbers.length + i) * 0.08} />
              ))}
            </div>

            {/* Links de aposta */}
            {currentLottery.links?.length > 0 && (
              <div className="rounded-2xl p-4 bg-[#FFF8E1] border border-[#FFD700]/30 mb-4">
                <h3 className="text-center font-bold text-[#FFC400] mb-2">Faites vos jeux en ligne :</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentLottery.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFC400] text-white font-semibold shadow hover:scale-[1.02] transition"
                    >
                      {l.name}
                      <ExternalLink className="w-4 h-4" />
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
                  className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-[#E8F5E9] text-[#00C853] font-semibold border border-[#00C853]/20"
                >
                  <span>Adresses de points de vente</span>
                  <ChevronDown className="w-4 h-4 transition group-open:rotate-180" />
                </button>
              </summary>
              <div className="mt-2 rounded-2xl border border-[#00C853]/10 bg-[#F1F8E9]">
                {currentLottery.addresses.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-2 border-b last:border-b-0 border-[#00C853]/10">
                    <MapPin className="w-4 h-4 text-[#00C853] mt-0.5" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* OVERLAY DE SORTE */}
      {luckOverlay && (
        <div className="fixed inset-0 z-[60] bg-black/80 grid place-items-center">
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4 animate-bounce">🍀</div>
            <div className="text-white text-2xl font-extrabold">Chargement de votre chance...</div>
            <Loader2 className="w-10 h-10 text-white mt-6 animate-spin" />
          </div>
        </div>
      )}
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
    <div className="rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#00C853]/15 shadow p-5">
      <div className="flex items-center gap-3 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-bold text-[#00C853]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Steps({ step }: { step: number }) {
  // 1..3 e barra preenchendo 0/50/100%
  const width = step === 1 ? "0%" : step === 2 ? "50%" : "100%";
  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="h-1 bg-[#00C853]/15 rounded-full" />
      <div
        className="h-1 bg-gradient-to-r from-[#00C853] to-[#009624] rounded-full absolute top-0 left-0 transition-all"
        style={{ width }}
      />
      <div className="flex justify-between -mt-3">
        {[1, 2, 3].map((i) => {
          const state = i < step ? "completed" : i === step ? "active" : "idle";
          return (
            <div
              key={i}
              className={`w-10 h-10 grid place-items-center rounded-full border-2 font-bold z-10 relative
                ${state === "completed" ? "bg-[#00C853] text-white border-[#00C853]" : ""}
                ${state === "active" ? "bg-[#E8F5E9] text-[#00C853] border-[#00C853]" : ""}
                ${state === "idle" ? "bg-white dark:bg-[#1a1a1a] text-[#00C853] border-[#00C853]/40" : ""}`}
            >
              {i}
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
    "w-14 h-14 rounded-full grid place-items-center font-extrabold text-white shadow relative";
  const theme =
    variant === "gold"
      ? "bg-gradient-to-br from-[#FFD700] to-[#FFC400] border-4 border-[#00C853]"
      : "bg-gradient-to-br from-[#00C853] to-[#009624] border-4 border-[#FFD700]";

  // classe do brilho/halo sem interpolação inválida no JSX
  const glowClass =
    variant === "gold"
      ? "bg-gradient-to-br from-[#FFD700] to-[#FFC400]"
      : "bg-gradient-to-br from-[#00C853] to-[#009624]";

  return (
    <div
      className={`${base} ${theme}`}
      style={{
        animation: `popIn .5s cubic-bezier(.175,.885,.32,1.275) ${delay}s both`,
      }}
    >
      <style>{`
        @keyframes popIn {
          0% { opacity:0; transform: scale(.5) }
          80% { opacity:1; transform: scale(1.1) }
          100% { opacity:1; transform: scale(1) }
        }
      `}</style>
      <span className="text-xl">{value}</span>
      <div
        className={`absolute -inset-1 rounded-full blur-md opacity-0 hover:opacity-50 transition ${glowClass}`}
      />
    </div>
  );
}
