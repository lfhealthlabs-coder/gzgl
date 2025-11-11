import Header from '../components/Header';
import BannerCarousel from '../components/BannerCarousel';
import FeatureCards from '../components/FeatureCards';

interface AccueilPageProps {
  onFeatureClick: (feature: string) => void;
}

export default function AccueilPage({ onFeatureClick }: AccueilPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-8 space-y-8">
        <BannerCarousel />
        <FeatureCards onCardClick={onFeatureClick} /> {/* <<< CORREÇÃO AQUI */}
      </main>
    </div>
  );
}
