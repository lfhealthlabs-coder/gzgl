import { useState } from 'react';
import CustomCursor from './components/CustomCursor';
import LoginPage from './pages/LoginPage';
import AccueilPage from './pages/AccueilPage';
import ActualitePage from './pages/ActualitePage';
import CommunautePage from './pages/CommunautePage';
import ProfilPage from './pages/ProfilPage';
import VideoDetailPage from './pages/VideoDetailPage';
import BottomNav, { TabType } from './components/BottomNav';
import FloatingSupportButton from './components/FloatingSupportButton';
import IAPage from './pages/AI';
import TurboPage from './pages/TurboPage';
import BonusPage from './pages/BonusPage';
import LotoGains10xPage from './pages/LotoGains10xPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const handleLogin = () => setIsLoggedIn(true);

  const handleFeatureClick = (feature: string) => {
    setSelectedFeature(feature);
  };

  const handleBackToHome = () => {
    setSelectedFeature(null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <CustomCursor />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  if (selectedFeature) {
    if (selectedFeature === 'ai') {
      return (
        <>
          <CustomCursor />
          <IAPage onBack={handleBackToHome} />
        </>
      );
    }

    if (selectedFeature === 'turbo') {
      return (
        <>
          <CustomCursor />
          <TurboPage onBack={handleBackToHome} />
        </>
      );
    }

    if (selectedFeature === 'bonus') {
      return (
        <>
          <CustomCursor />
          <BonusPage onBack={handleBackToHome} />
        </>
      );
    }

    if (selectedFeature === '10x') {
      return (
        <>
          <CustomCursor />
          <LotoGains10xPage onBack={handleBackToHome} />
        </>
      );
    }

    return (
      <>
        <CustomCursor />
        <VideoDetailPage featureName={selectedFeature} onBack={handleBackToHome} />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen">
        {activeTab === 'accueil' && <AccueilPage onFeatureClick={handleFeatureClick} />}
        {activeTab === 'actualite' && <ActualitePage />}
        {activeTab === 'communaute' && <CommunautePage />}
        {activeTab === 'profil' && <ProfilPage />}

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <FloatingSupportButton />
      </div>
    </>
  );
}

export default App;
